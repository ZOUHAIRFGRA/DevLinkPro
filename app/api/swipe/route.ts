import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import Swipe from '@/models/swipe';
import Match from '@/models/match';
import Project from '@/models/project';
import User from '@/models/user';
import mongoose from 'mongoose';

// POST - Record a swipe and check for matches
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { targetId, targetType, swipeType } = await request.json();

    if (!targetId || !targetType || !swipeType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!['project', 'user'].includes(targetType)) {
      return NextResponse.json({ error: 'Invalid target type' }, { status: 400 });
    }

    if (!['like', 'dislike'].includes(swipeType)) {
      return NextResponse.json({ error: 'Invalid swipe type' }, { status: 400 });
    }

    await connectDB();

    // Get current user by email to get their ObjectId
    const currentUser = await User.findOne({ email: session.user.email }).lean() as { _id: mongoose.Types.ObjectId; [key: string]: unknown } | null;
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if target exists
    let targetExists = false;
    if (targetType === 'project') {
      const project = await Project.findById(targetId);
      targetExists = !!project;
    } else {
      const user = await User.findById(targetId);
      targetExists = !!user;
    }

    if (!targetExists) {
      return NextResponse.json({ error: 'Target not found' }, { status: 404 });
    }

    // Record the swipe (upsert to handle duplicates)
    await Swipe.findOneAndUpdate(
      {
        userId: currentUser._id,
        targetId: new mongoose.Types.ObjectId(targetId),
        targetType
      },
      {
        swipeType,
        createdAt: new Date()
      },
      { upsert: true }
    );

    let match = null;

    // Check for mutual match if this was a like
    if (swipeType === 'like') {
      let mutualSwipe = null;

      if (targetType === 'project') {
        // Check if project owner liked this user
        const project = await Project.findById(targetId);
        if (project) {
          mutualSwipe = await Swipe.findOne({
            userId: project.owner,
            targetId: currentUser._id,
            targetType: 'user',
            swipeType: 'like'
          });
        }
      } else {
        // Check if the user liked a project owned by the target user
        const userProjects = await Project.find({ owner: new mongoose.Types.ObjectId(targetId) });
        for (const project of userProjects) {
          const projectSwipe = await Swipe.findOne({
            userId: currentUser._id,
            targetId: project._id,
            targetType: 'project',
            swipeType: 'like'
          });
          if (projectSwipe) {
            mutualSwipe = projectSwipe;
            break;
          }
        }
      }

      // Create match if mutual interest exists
      if (mutualSwipe) {
        match = await Match.findOneAndUpdate(
          {
            userId: currentUser._id,
            targetId: new mongoose.Types.ObjectId(targetId),
            targetType
          },
          {
            matchedAt: new Date(),
            status: 'active'
          },
          { upsert: true, new: true }
        );

        // Also create the reverse match
        const reverseTargetType = targetType === 'project' ? 'user' : 'project';
        const reverseTargetId = targetType === 'project' ? currentUser._id : targetId;
        
        await Match.findOneAndUpdate(
          {
            userId: new mongoose.Types.ObjectId(targetType === 'project' ? targetId : currentUser._id),
            targetId: new mongoose.Types.ObjectId(reverseTargetId),
            targetType: reverseTargetType
          },
          {
            matchedAt: new Date(),
            status: 'active'
          },
          { upsert: true }
        );
      }
    }

    return NextResponse.json({ 
      success: true, 
      match: !!match,
      matchId: match?._id 
    });
  } catch (error) {
    console.error('Error in swipe API:', error);
    return NextResponse.json(
      { error: 'Failed to process swipe' },
      { status: 500 }
    );
  }
}
