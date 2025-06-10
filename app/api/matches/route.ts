import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import Match from '@/models/match';
import Project from '@/models/project';
import User from '@/models/user';
import mongoose from 'mongoose';

// GET - Get user's matches
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const page = parseInt(searchParams.get('page') || '1');

    await connectDB();

    // Get current user by email to get their ObjectId
    const currentUser = await User.findOne({ email: session.user.email }).lean() as { _id: mongoose.Types.ObjectId; [key: string]: unknown } | null;
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get user's matches - either as the developer or as the project owner
    const matches = await Match.find({
      $or: [
        { userId: currentUser._id }, // User is the developer
        { projectOwnerId: currentUser._id } // User is the project owner
      ],
      status: 'active'
    })
    .sort({ matchedAt: -1 })
    .limit(limit)
    .skip((page - 1) * limit)
    .lean();

    // Populate match details
    const populatedMatches = await Promise.all(
      matches.map(async (match) => {
        let targetData = null;
        
        // Determine what to show based on current user's role in the match
        const isProjectOwner = match.projectOwnerId?.toString() === currentUser._id.toString();

        if (isProjectOwner) {
          // Project owner sees the developer
          targetData = await User.findById(match.userId)
            .select('name email image bio location skills githubData')
            .lean();
        } else {
          // Developer sees the project
          targetData = await Project.findById(match.targetId)
            .populate('owner', 'name email image githubData.username')
            .lean();
        }

        return {
          ...match,
          targetData,
          // Add a flag to help the frontend understand the user's role
          userRole: isProjectOwner ? 'project_owner' : 'developer'
        };
      })
    );

    return NextResponse.json({ matches: populatedMatches });
  } catch (error) {
    console.error('Error in matches API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch matches' },
      { status: 500 }
    );
  }
}
