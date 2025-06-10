import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import Message from '@/models/message';
import Match from '@/models/match';
import User from '@/models/user';
import mongoose from 'mongoose';
import { pusherServer } from '@/lib/pusher';

// GET - Get messages for a match
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get('matchId');
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');

    if (!matchId) {
      return NextResponse.json({ error: 'Match ID is required' }, { status: 400 });
    }

    await connectDB();

    // Get current user
    const currentUser = await User.findOne({ email: session.user.email }).lean() as { _id: mongoose.Types.ObjectId; [key: string]: unknown } | null;
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify user is part of this match (either as developer or project owner)
    const match = await Match.findOne({
      _id: new mongoose.Types.ObjectId(matchId),
      $or: [
        { userId: currentUser._id }, // User is the developer
        { projectOwnerId: currentUser._id } // User is the project owner
      ]
    });

    if (!match) {
      return NextResponse.json({ error: 'Match not found or access denied' }, { status: 404 });
    }

    // Populate target data - determine who the "other person" is
    let otherPersonData = null;
    let otherPersonType = null;

    // Determine the other person based on current user's role
    const isProjectOwner = match.projectOwnerId?.toString() === currentUser._id.toString();
    
    if (isProjectOwner) {
      // Current user is project owner, other person is the developer
      otherPersonData = await User.findById(match.userId)
        .select('name email image githubData.username bio location')
        .lean();
      otherPersonType = 'user';
    } else {
      // Current user is developer, other person is represented by the project
      const Project = (await import('@/models/project')).default;
      otherPersonData = await Project.findById(match.targetId)
        .populate('owner', 'name email image githubData.username')
        .lean();
      otherPersonType = 'project';
    }

    const populatedMatch = {
      ...match,
      targetData: otherPersonData,
      targetType: otherPersonType
    };

    // Get messages
    const messages = await Message.find({ matchId: new mongoose.Types.ObjectId(matchId) })
      .populate('senderId', 'name image')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    // Mark messages as read
    await Message.updateMany(
      {
        matchId: new mongoose.Types.ObjectId(matchId),
        senderId: { $ne: currentUser._id },
        'readBy.userId': { $ne: currentUser._id }
      },
      {
        $push: {
          readBy: {
            userId: currentUser._id,
            readAt: new Date()
          }
        }
      }
    );

    return NextResponse.json({ 
      messages: messages.reverse(),
      match: populatedMatch 
    });
  } catch (error) {
    console.error('Error in messages API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST - Send a message
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { matchId, content, messageType = 'text' } = await request.json();

    if (!matchId || !content) {
      return NextResponse.json({ error: 'Match ID and content are required' }, { status: 400 });
    }

    if (content.length > 2000) {
      return NextResponse.json({ error: 'Message too long' }, { status: 400 });
    }

    await connectDB();

    // Get current user
    const currentUser = await User.findOne({ email: session.user.email }).lean() as { _id: mongoose.Types.ObjectId; [key: string]: unknown } | null;
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify user is part of this match (either as developer or project owner)
    const match = await Match.findOne({
      _id: new mongoose.Types.ObjectId(matchId),
      $or: [
        { userId: currentUser._id }, // User is the developer
        { projectOwnerId: currentUser._id } // User is the project owner
      ]
    });

    if (!match) {
      return NextResponse.json({ error: 'Match not found or access denied' }, { status: 404 });
    }

    // Create message
    const message = await Message.create({
      matchId: new mongoose.Types.ObjectId(matchId),
      senderId: currentUser._id,
      content,
      messageType,
      readBy: [{
        userId: currentUser._id,
        readAt: new Date()
      }]
    });

    // Populate sender info
    await message.populate('senderId', 'name image');

    // Trigger real-time notification via Pusher
    const channelName = `match-${matchId}`;
    await pusherServer.trigger(channelName, 'new-message', {
      message: message,
      matchId: matchId
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Error in send message API:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}
