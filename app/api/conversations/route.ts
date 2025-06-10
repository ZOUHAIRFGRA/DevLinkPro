import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import Conversation from '@/models/conversation';
import User from '@/models/user';
import mongoose from 'mongoose';

// GET - Get user's conversations
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    // Get current user
    const currentUser = await User.findOne({ email: session.user.email }).lean() as { _id: mongoose.Types.ObjectId; [key: string]: unknown } | null;
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get conversations where user is a participant
    const conversations = await Conversation.find({
      participants: currentUser._id
    })
    .populate('participants', 'name image email')
    .populate('projectId', 'title description')
    .sort({ lastActivity: -1 })
    .lean();

    // Filter out current user from participants for private chats
    const processedConversations = conversations.map(conv => ({
      ...conv,
      participants: conv.participants.filter((p: { _id: mongoose.Types.ObjectId }) => p._id.toString() !== currentUser._id.toString())
    }));

    return NextResponse.json({ conversations: processedConversations });
  } catch (error) {
    console.error('Error in conversations API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

// POST - Create a new conversation
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type, participantIds, projectId } = await request.json();

    if (!type || !participantIds || !Array.isArray(participantIds)) {
      return NextResponse.json({ error: 'Invalid conversation data' }, { status: 400 });
    }

    await connectDB();

    // Get current user
    const currentUser = await User.findOne({ email: session.user.email }).lean() as { _id: mongoose.Types.ObjectId; [key: string]: unknown } | null;
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Add current user to participants if not already included
    const allParticipants = [...new Set([currentUser._id.toString(), ...participantIds])];

    // Check if conversation already exists
    let existingConversation = null;
    if (type === 'project_group' && projectId) {
      existingConversation = await Conversation.findOne({
        type: 'project_group',
        projectId: new mongoose.Types.ObjectId(projectId)
      });
    } else if (type === 'private_chat' && allParticipants.length === 2) {
      existingConversation = await Conversation.findOne({
        type: 'private_chat',
        participants: { $all: allParticipants, $size: 2 }
      });
    }

    if (existingConversation) {
      return NextResponse.json({ conversation: existingConversation });
    }

    // Create new conversation
    const conversation = await Conversation.create({
      type,
      participants: allParticipants.map(id => new mongoose.Types.ObjectId(id)),
      projectId: projectId ? new mongoose.Types.ObjectId(projectId) : undefined,
      lastActivity: new Date()
    });

    const populatedConversation = await Conversation.findById(conversation._id)
      .populate('participants', 'name image email')
      .populate('projectId', 'title description')
      .lean();

    return NextResponse.json({ conversation: populatedConversation });
  } catch (error) {
    console.error('Error creating conversation:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}