import mongoose from 'mongoose';

export interface IProject {
  _id?: string;
  title: string;
  description: string;
  currentStatus: string;
  goals: string[];
  technologies: string[];
  plannedTechnologies?: string[];
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedDuration: string;
  owner: mongoose.Types.ObjectId;
  rolesNeeded: {
    title: string;
    description: string;
    skills: string[];
    experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced';
    commitmentExpected: string;
    isActive: boolean;
  }[];
  collaborators: {
    user: mongoose.Types.ObjectId;
    role: string;
    joinedAt: Date;
    status: 'Active' | 'Inactive';
  }[];
  applicants: {
    user: mongoose.Types.ObjectId;
    roleAppliedFor: string;
    message: string;
    appliedAt: Date;
    status: 'Pending' | 'Accepted' | 'Rejected';
  }[];
  status: 'Planning' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled';
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProjectSchema = new mongoose.Schema<IProject>({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  currentStatus: {
    type: String,
    required: true,
    maxlength: 500
  },
  goals: [{
    type: String,
    required: true,
    maxlength: 200
  }],
  technologies: [{
    type: String,
    required: true,
    trim: true
  }],
  plannedTechnologies: [{
    type: String,
    trim: true
  }],
  category: {
    type: String,
    required: true,
    enum: ['Web Development', 'Mobile Development', 'Data Science', 'Machine Learning', 'Game Development', 'Desktop Application', 'API/Backend', 'Other']
  },
  difficulty: {
    type: String,
    required: true,
    enum: ['Beginner', 'Intermediate', 'Advanced']
  },
  estimatedDuration: {
    type: String,
    required: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rolesNeeded: [{
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50
    },
    description: {
      type: String,
      required: true,
      maxlength: 500
    },
    skills: [{
      type: String,
      required: true,
      trim: true
    }],
    experienceLevel: {
      type: String,
      required: true,
      enum: ['Beginner', 'Intermediate', 'Advanced']
    },
    commitmentExpected: {
      type: String,
      required: true,
      maxlength: 200
    },
    isActive: {
      type: Boolean,
      default: true
    }
  }],
  collaborators: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    role: {
      type: String,
      required: true,
      trim: true
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Active', 'Inactive'],
      default: 'Active'
    }
  }],
  applicants: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    roleAppliedFor: {
      type: String,
      required: true,
      trim: true
    },
    message: {
      type: String,
      maxlength: 500
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Pending', 'Accepted', 'Rejected'],
      default: 'Pending'
    }
  }],
  status: {
    type: String,
    required: true,
    enum: ['Planning', 'In Progress', 'Completed', 'On Hold', 'Cancelled'],
    default: 'Planning'
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
ProjectSchema.index({ owner: 1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ category: 1 });
ProjectSchema.index({ technologies: 1 });
ProjectSchema.index({ 'rolesNeeded.isActive': 1 });
ProjectSchema.index({ createdAt: -1 });

export default mongoose.models.Project || mongoose.model<IProject>('Project', ProjectSchema);
