import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import Swipe from '@/models/swipe';
import Match from '@/models/match';
import Project from '@/models/project';
import User from '@/models/user';
import Application from '@/models/application';
import Notification from '@/models/notification';
import mongoose from 'mongoose';
import { pusherServer } from '@/lib/pusher';

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
    let application = null;

    // Handle different swipe types
    if (swipeType === 'like') {
      if (targetType === 'project') {
        // Create application when someone likes a project
        const project = await Project.findById(targetId);
        if (project) {
          application = await Application.findOneAndUpdate(
            {
              projectId: new mongoose.Types.ObjectId(targetId),
              developerId: currentUser._id
            },
            {
              projectOwnerId: project.owner,
              status: 'pending',
              appliedAt: new Date()
            },
            { upsert: true, new: true }
          );

          // Create notification for project owner
          const notification = await Notification.create({
            userId: project.owner,
            type: 'application',
            title: 'New Project Application',
            message: `Someone is interested in your project: ${project.title}`,
            data: {
              projectId: targetId,
              applicationId: application._id.toString(),
              fromUserId: currentUser._id.toString()
            }
          });

          // Trigger real-time notification via Pusher
          const projectOwner = await User.findById(project.owner);
          if (projectOwner?.email) {
            const channelName = `user-${projectOwner.email.replace('@', '-').replace('.', '-')}`;
            await pusherServer.trigger(channelName, 'new-notification', {
              notification: notification
            });
          }
        }
      } else {
        // For user swipes, check for mutual interest (existing logic)
        let mutualSwipe = null;

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

        // Create match if mutual interest exists
        if (mutualSwipe) {
          match = await Match.findOneAndUpdate(
            {
              userId: currentUser._id,
              targetId: new mongoose.Types.ObjectId(targetId),
              targetType: 'user'
            },
            {
              matchedAt: new Date(),
              status: 'active'
            },
            { upsert: true, new: true }
          );

          // Also create the reverse match
          await Match.findOneAndUpdate(
            {
              userId: new mongoose.Types.ObjectId(targetId),
              targetId: currentUser._id,
              targetType: 'project'
            },
            {
              matchedAt: new Date(),
              status: 'active'
            },
            { upsert: true }
          );

          // Create notification for both users
          const matchNotification = await Notification.create({
            userId: new mongoose.Types.ObjectId(targetId),
            type: 'match',
            title: 'New Match!',
            message: 'You have a new match!',
            data: {
              matchId: match._id.toString(),
              fromUserId: currentUser._id.toString()
            }
          });

          // Trigger real-time notification via Pusher
          const targetUser = await User.findById(targetId);
          if (targetUser?.email) {
            const channelName = `user-${targetUser.email.replace('@', '-').replace('.', '-')}`;
            await pusherServer.trigger(channelName, 'new-notification', {
              notification: matchNotification
            });
          }
        }
      }
    }

    return NextResponse.json({ 
      success: true, 
      match: !!match,
      application: !!application,
      matchId: match?._id,
      applicationId: application?._id
    });
  } catch (error) {
    console.error('Error in swipe API:', error);
    return NextResponse.json(
      { error: 'Failed to process swipe' },
      { status: 500 }
    );
  }
}
