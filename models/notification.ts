import mongoose from 'mongoose';

export interface INotification {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: 'application' | 'match' | 'application_accepted' | 'application_rejected';
  title: string;
  message: string;
  data?: {
    projectId?: string;
    applicationId?: string;
    matchId?: string;
    fromUserId?: string;
  };
  read: boolean;
  createdAt: Date;
}

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['application', 'match', 'application_accepted', 'application_rejected'],
    required: true
  },
  title: {
    type: String,
    required: true,
    maxLength: 100
  },
  message: {
    type: String,
    required: true,
    maxLength: 300
  },
  data: {
    projectId: String,
    applicationId: String,
    matchId: String,
    fromUserId: String
  },
  read: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, read: 1 });

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);
