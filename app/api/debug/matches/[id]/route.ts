import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import Match from '@/models/match';
import User from '@/models/user';
import Project from '@/models/project';

// Type definitions for the debug response
interface DebugUser {
  _id: string;
  name?: string;
  email?: string;
}

interface DebugMatch {
  _id: string;
  userId: string;
  targetId: string;
  targetType: 'project' | 'user';
  matchedAt: Date;
}

interface DebugProject {
  _id: string;
  title?: string;
  owner?: DebugUser;
  [key: string]: unknown;
}

// Debug endpoint to check match data
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: matchId } = params;

    await connectDB();

    // Get current user
    const currentUser = await User.findOne({ email: session.user.email }).lean() as DebugUser | null;
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Find the specific match
    const match = await Match.findById(matchId).lean() as DebugMatch | null;
    if (!match) {
      return NextResponse.json({ error: 'Match not found' }, { status: 404 });
    }

    // Get all related data
    const matchUser = await User.findById(match.userId).select('name email').lean() as DebugUser | null;
    let targetData: DebugUser | DebugProject | null = null;
    
    if (match.targetType === 'project') {
      targetData = await Project.findById(match.targetId)
        .populate('owner', 'name email')
        .lean() as DebugProject | null;
    } else {
      targetData = await User.findById(match.targetId).select('name email').lean() as DebugUser | null;
    }

    // Find reverse match if it exists
    const reverseMatchQuery: {
      userId?: string;
      targetId?: string;
      targetType: 'user' | 'project';
    } = {
      targetType: match.targetType === 'user' ? 'user' : 'project'
    };

    if (match.targetType === 'user') {
      reverseMatchQuery.userId = match.targetId;
      reverseMatchQuery.targetId = match.userId;
    } else {
      const projectData = targetData as DebugProject;
      reverseMatchQuery.userId = projectData?.owner?._id;
      reverseMatchQuery.targetId = match.targetId;
    }

    const reverseMatch = await Match.findOne(reverseMatchQuery).lean() as DebugMatch | null;

    return NextResponse.json({
      debug: {
        currentUser: {
          id: currentUser._id,
          email: currentUser.email,
          name: currentUser.name
        },
        match: {
          id: match._id,
          userId: match.userId,
          targetId: match.targetId,
          targetType: match.targetType,
          matchedAt: match.matchedAt
        },
        matchUser: matchUser,
        targetData: targetData,
        reverseMatch: reverseMatch ? {
          id: reverseMatch._id,
          userId: reverseMatch.userId,
          targetId: reverseMatch.targetId,
          targetType: reverseMatch.targetType
        } : null,
        userIsMatchOwner: match.userId === currentUser._id,
        userIsTarget: match.targetId === currentUser._id,
        userOwnsTargetProject: match.targetType === 'project' && 
          (targetData as DebugProject)?.owner?._id === currentUser._id
      }
    });

  } catch (error) {
    console.error('Error in match debug API:', error);
    return NextResponse.json(
      { error: 'Failed to debug match' },
      { status: 500 }
    );
  }
}
