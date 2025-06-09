import mongoose from 'mongoose';

export interface IApplication {
  _id: mongoose.Types.ObjectId;
  projectId: mongoose.Types.ObjectId;
  developerId: mongoose.Types.ObjectId;
  projectOwnerId: mongoose.Types.ObjectId;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string; // Optional message from developer
  appliedAt: Date;
  respondedAt?: Date;
}

const ApplicationSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true
  },
  developerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  projectOwnerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  message: {
    type: String,
    maxLength: 500
  },
  appliedAt: {
    type: Date,
    default: Date.now
  },
  respondedAt: {
    type: Date
  }
});

// Compound index to prevent duplicate applications
ApplicationSchema.index({ projectId: 1, developerId: 1 }, { unique: true });

export default mongoose.models.Application || mongoose.model('Application', ApplicationSchema);
