import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import Message from '@/models/message';
import Conversation from '@/models/conversation';
import User from '@/models/user';
import mongoose from 'mongoose';
import { pusherServer } from '@/lib/pusher';

// GET - Get messages for a conversation
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: conversationId } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const page = parseInt(searchParams.get('page') || '1');

    if (!conversationId) {
      return NextResponse.json({ error: 'Conversation ID is required' }, { status: 400 });
    }

    await connectDB();

    // Get current user
    const currentUser = await User.findOne({ email: session.user.email }).lean() as { _id: mongoose.Types.ObjectId; [key: string]: unknown } | null;
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify user is part of this conversation
    const conversation = await Conversation.findOne({
      _id: new mongoose.Types.ObjectId(conversationId),
      participants: currentUser._id
    })
    .populate('participants', 'name image email')
    .populate('projectId', 'title description')
    .lean();

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found or access denied' }, { status: 404 });
    }

    // Get messages
    const messages = await Message.find({ conversationId: new mongoose.Types.ObjectId(conversationId) })
      .populate('senderId', 'name image')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    // Mark messages as read
    await Message.updateMany(
      {
        conversationId: new mongoose.Types.ObjectId(conversationId),
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
      conversation,
      currentUserId: currentUser._id.toString()
    });
  } catch (error) {
    console.error('Error in conversation messages API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST - Send a message to a conversation
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: conversationId } = await params;
    const { content, messageType = 'text' } = await request.json();

    if (!conversationId || !content) {
      return NextResponse.json({ error: 'Conversation ID and content are required' }, { status: 400 });
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

    // Verify user is part of this conversation
    const conversation = await Conversation.findOne({
      _id: new mongoose.Types.ObjectId(conversationId),
      participants: currentUser._id
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found or access denied' }, { status: 404 });
    }

    // Create message
    const message = await Message.create({
      conversationId: new mongoose.Types.ObjectId(conversationId),
      senderId: currentUser._id,
      content,
      messageType,
      readBy: [{
        userId: currentUser._id,
        readAt: new Date()
      }]
    });

    // Update conversation's last activity and message
    await Conversation.findByIdAndUpdate(conversationId, {
      lastActivity: new Date(),
      lastMessage: {
        content,
        senderId: currentUser._id,
        createdAt: new Date()
      }
    });

    // Populate sender info
    await message.populate('senderId', 'name image');

    // Trigger real-time notification via Pusher
    const channelName = `conversation-${conversationId}`;
    await pusherServer.trigger(channelName, 'new-message', {
      message: message,
      conversationId: conversationId
    });

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Error in send conversation message API:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}