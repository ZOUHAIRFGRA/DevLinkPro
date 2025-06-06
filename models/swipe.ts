import mongoose from 'mongoose';

export interface ISwipe {
  _id?: string;
  userId: mongoose.Types.ObjectId;
  targetId: mongoose.Types.ObjectId;
  targetType: 'project' | 'user';
  swipeType: 'like' | 'dislike';
  createdAt: Date;
}

const SwipeSchema = new mongoose.Schema<ISwipe>({
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
  swipeType: {
    type: String,
    enum: ['like', 'dislike'],
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure unique swipes per user-target pair
SwipeSchema.index({ userId: 1, targetId: 1, targetType: 1 }, { unique: true });

export default mongoose.models.Swipe || mongoose.model<ISwipe>('Swipe', SwipeSchema);
