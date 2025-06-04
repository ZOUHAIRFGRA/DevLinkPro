import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends mongoose.Document {
  email: string;
  password?: string;
  name: string;
  image?: string;
  githubId?: string;
  bio?: string;
  location?: string;
  preferredRoles: string[];
  skills: Array<{
    name: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert';
  }>;
  experience: Array<{
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate?: string;
    description: string;
  }>;
  education: Array<{
    degree: string;
    school: string;
    location: string;
    startDate: string;
    endDate: string;
    description?: string;
  }>;
  socialLinks: {
    github?: string;
    linkedin?: string;
    portfolio?: string;
    twitter?: string;
  };
  githubData?: {
    username: string;
    url: string;
    publicRepos: number;
    followers: number;
    following: number;
    company?: string;
    createdAt: string;
    profileReadme?: string;
    contributions?: Record<string, unknown>;
    organizations?: Record<string, unknown>[];
    repositories?: Record<string, unknown>[];
    pinnedRepositories?: Record<string, unknown>[];
    lastUpdated: Date;
  };
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  name: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  githubId: {
    type: String,
  },
  bio: {
    type: String,
  },
  location: {
    type: String,
  },
  preferredRoles: [{
    type: String,
  }],
  skills: [{
    name: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced', 'Expert'],
      required: true,
    },
  }],
  experience: [{
    title: {
      type: String,
      required: true,
    },
    company: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
    },
    description: {
      type: String,
      required: true,
    },
  }],
  education: [{
    degree: {
      type: String,
      required: true,
    },
    school: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    startDate: {
      type: String,
      required: true,
    },
    endDate: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
  }],
  socialLinks: {
    github: {
      type: String,
    },
    linkedin: {
      type: String,
    },
    portfolio: {
      type: String,
    },
    twitter: {
      type: String,
    },
  },
  githubData: {
    username: String,
    url: String,
    publicRepos: Number,
    followers: Number,
    following: Number,
    company: String,
    createdAt: String,
    profileReadme: String,
    contributions: mongoose.Schema.Types.Mixed,
    organizations: [mongoose.Schema.Types.Mixed],
    repositories: [mongoose.Schema.Types.Mixed],
    pinnedRepositories: [mongoose.Schema.Types.Mixed],
    lastUpdated: Date,
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password!, salt);
  }
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);

export default User;
