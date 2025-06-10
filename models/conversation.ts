import mongoose from 'mongoose';

export interface IConversation {
  _id?: string;
  type: 'project_group' | 'private_chat';
  participants: mongoose.Types.ObjectId[];
  projectId?: mongoose.Types.ObjectId; // For project group chats
  lastMessage?: {
    content: string;
    senderId: mongoose.Types.ObjectId;
    createdAt: Date;
  };
  lastActivity: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ConversationSchema = new mongoose.Schema<IConversation>({
  type: {
    type: String,
    enum: ['project_group', 'private_chat'],
    required: true
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: false // Only for project group chats
  },
  lastMessage: {
    content: { type: String },
    senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    createdAt: { type: Date }
  },
  lastActivity: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ type: 1, projectId: 1 });
ConversationSchema.index({ lastActivity: -1 });

export default mongoose.models.Conversation || mongoose.model<IConversation>('Conversation', ConversationSchema);