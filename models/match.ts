import mongoose from 'mongoose';

export interface IMatch {
  _id?: string;
  userId: mongoose.Types.ObjectId;
  targetId: mongoose.Types.ObjectId;
  targetType: 'project' | 'user';
  matchedAt: Date;
  status: 'active' | 'archived';
  lastMessageAt?: Date;
}

const MatchSchema = new mongoose.Schema<IMatch>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  targetType: {
    type: String,
    enum: ['project', 'user'],
    required: true
  },
  matchedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active'
  },
  lastMessageAt: {
    type: Date
  }
});

// Ensure unique matches per user-target pair
MatchSchema.index({ userId: 1, targetId: 1, targetType: 1 }, { unique: true });

export default mongoose.models.Match || mongoose.model<IMatch>('Match', MatchSchema);
