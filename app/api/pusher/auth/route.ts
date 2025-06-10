import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { pusherServer } from '@/lib/pusher';
import connectDB from '@/lib/mongodb';
import User from '@/models/user';
import Match from '@/models/match';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.text();
    const params = new URLSearchParams(body);
    const socketId = params.get('socket_id');
    const channelName = params.get('channel_name');

    if (!socketId || !channelName) {
      return NextResponse.json({ error: 'Missing socket_id or channel_name' }, { status: 400 });
    }

    // Extract match ID from channel name (format: match-{matchId})
    const matchIdMatch = channelName.match(/^match-(.+)$/);
    if (!matchIdMatch) {
      return NextResponse.json({ error: 'Invalid channel name' }, { status: 400 });
    }

    const matchId = matchIdMatch[1];

    await connectDB();

    // Get current user
    const currentUser = await User.findOne({ email: session.user.email }).lean() as { _id: mongoose.Types.ObjectId; [key: string]: unknown } | null;
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify user is part of this match
    const match = await Match.findOne({
      _id: new mongoose.Types.ObjectId(matchId),
      $or: [
        { userId: currentUser._id }, // User is the one who has the match
        { targetId: currentUser._id, targetType: 'user' }, // User is the target of the match
        { 
          targetType: 'project',
          targetId: { $in: await getProjectIds(currentUser._id) }
        } // User owns the project that is the target
      ]
    });

    if (!match) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Authorize the user for this channel
    const authResponse = pusherServer.authorizeChannel(socketId, channelName, {
      user_id: currentUser._id.toString(),
      user_info: {
        name: session.user.name,
        email: session.user.email
      }
    });

    return NextResponse.json(authResponse);
  } catch (error) {
    console.error('Error in Pusher auth:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}

// Helper function to get project IDs owned by user
async function getProjectIds(userId: mongoose.Types.ObjectId) {
  const Project = (await import('@/models/project')).default;
  const projects = await Project.find({ owner: userId }).select('_id').lean();
  return projects.map(p => p._id);
}
