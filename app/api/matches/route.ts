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

    // Get user's matches
    const matches = await Match.find({
      userId: currentUser._id,
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

        if (match.targetType === 'project') {
          targetData = await Project.findById(match.targetId)
            .populate('owner', 'name email image githubData.username')
            .lean();
        } else {
          targetData = await User.findById(match.targetId)
            .select('-password -email')
            .lean();
        }

        return {
          ...match,
          targetData
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
