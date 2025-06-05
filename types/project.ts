export interface SerializedProject {
  _id: string;
  title: string;
  description: string;
  currentStatus: string;
  goals: string[];
  technologies: string[];
  plannedTechnologies?: string[];
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedDuration: string;
  owner: {
    _id: string;
    name: string;
    email: string;
    githubData?: {
      username: string;
      avatar_url: string;
    };
  };
  rolesNeeded: {
    title: string;
    description: string;
    skills: string[];
    experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced';
    commitmentExpected: string;
    isActive: boolean;
  }[];
  collaborators: {
    user: string;
    role: string;
    joinedAt: string;
    status: 'Active' | 'Inactive';
  }[];
  applicants: {
    user: string;
    roleAppliedFor: string;
    message: string;
    appliedAt: string;
    status: 'Pending' | 'Accepted' | 'Rejected';
  }[];
  status: 'Planning' | 'In Progress' | 'Completed' | 'On Hold' | 'Cancelled';
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectFormData {
  title: string;
  description: string;
  currentStatus: string;
  goals: string[];
  technologies: string[];
  plannedTechnologies: string[];
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedDuration: string;
  rolesNeeded: {
    title: string;
    description: string;
    skills: string[];
    experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced';
    commitmentExpected: string;
    isActive: boolean;
  }[];
  isPublic: boolean;
}
