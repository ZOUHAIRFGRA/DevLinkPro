import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import Conversation from '@/models/conversation';
import User from '@/models/user';
import mongoose from 'mongoose';

// POST - Create or get conversation with a user
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    await connectDB();

    // Get current user
    const currentUser = await User.findOne({ email: session.user.email }).lean() as { _id: mongoose.Types.ObjectId; [key: string]: unknown } | null;
    if (!currentUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Check if conversation already exists
    const existingConversation = await Conversation.findOne({
      type: 'private_chat',
      participants: { 
        $all: [currentUser._id, new mongoose.Types.ObjectId(userId)], 
        $size: 2 
      }
    }).populate('participants', 'name image email');

    if (existingConversation) {
      return NextResponse.json({ conversation: existingConversation });
    }

    // Create new private conversation
    const conversation = await Conversation.create({
      type: 'private_chat',
      participants: [currentUser._id, new mongoose.Types.ObjectId(userId)],
      lastActivity: new Date()
    });

    const populatedConversation = await Conversation.findById(conversation._id)
      .populate('participants', 'name image email');

    return NextResponse.json({ conversation: populatedConversation });
  } catch (error) {
    console.error('Error creating private conversation:', error);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}