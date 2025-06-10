import mongoose from 'mongoose';

export interface IMessage {
  _id: mongoose.Types.ObjectId;
  matchId?: mongoose.Types.ObjectId; // For backward compatibility
  conversationId?: mongoose.Types.ObjectId; // For new conversation system
  senderId: mongoose.Types.ObjectId;
  content: string;
  messageType: 'text' | 'image' | 'file' | 'system';
  reactions?: {
    emoji: string;
    userId: mongoose.Types.ObjectId;
    userName: string;
  }[];
  readBy: {
    userId: mongoose.Types.ObjectId;
    readAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new mongoose.Schema({
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: false // For backward compatibility
  },
  conversationId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Conversation',
    required: false // For new conversation system
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxLength: 2000
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text'
  },
  reactions: [{
    emoji: { type: String, required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true }
  }],
  readBy: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
MessageSchema.index({ matchId: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1 });

export default mongoose.models.Message || mongoose.model('Message', MessageSchema);
