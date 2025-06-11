import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Target, 
  Clock, 
  Calendar,
  Edit,
  UserPlus,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import connectDB from '@/lib/mongodb';
import Project from '@/models/project';
import User from '@/models/user';

interface SerializedUser {
  _id: string;
  name: string;
  email: string;
  image?: string;
  githubData?: {
    username: string;
  };
}

interface ProjectWithDetails {
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
  owner: SerializedUser;
  rolesNeeded: {
    title: string;
    description: string;
    skills: string[];
    experienceLevel: 'Beginner' | 'Intermediate' | 'Advanced';
    commitmentExpected: string;
    isActive: boolean;
  }[];
  collaborators: {
    user: SerializedUser;
    role: string;
    joinedAt: string;
    status: 'Active' | 'Inactive';
  }[];
  applicants: {
    user: SerializedUser;
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

interface ProjectPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const session = await auth();
  const { id } = await params;

  await connectDB();

  // Fetch project with populated data
  const project = await Project.findById(id)
    .populate('owner', 'name email image githubData.username')
    .populate({
      path: 'applicants.user',
      model: User,
      select: 'name email image githubData.username'
    })
    .populate({
      path: 'collaborators.user',
      model: User,
      select: 'name email image githubData.username'
    })
    .lean();

  if (!project) {
    notFound();
  }

  // Check if project is public or user has access  
  const serializedProject: ProjectWithDetails = JSON.parse(JSON.stringify(project));
  if (!serializedProject.isPublic && session?.user?.id !== serializedProject.owner._id) {
    redirect('/projects');
  }
  const isOwner = session?.user?.id === serializedProject.owner._id;
  const hasApplied = serializedProject.applicants.some(
    app => app.user._id === session?.user?.id
  );
  const isCollaborator = serializedProject.collaborators.some(
    collab => collab.user._id === session?.user?.id && collab.status === 'Active'
  );

  const activeRoles = serializedProject.rolesNeeded.filter(role => role.isActive);
  console.log('serializedProject', serializedProject);
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="secondary">{serializedProject.category}</Badge>
              <Badge 
                variant={
                  serializedProject.difficulty === 'Beginner' ? 'default' : 
                  serializedProject.difficulty === 'Intermediate' ? 'secondary' : 
                  'destructive'
                }
              >
                {serializedProject.difficulty}
              </Badge>
              <Badge 
                variant={
                  serializedProject.status === 'Completed' ? 'default' :
                  serializedProject.status === 'In Progress' ? 'secondary' :
                  serializedProject.status === 'On Hold' ? 'destructive' :
                  'outline'
                }
              >
                {serializedProject.status}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold mb-2">{serializedProject.title}</h1>
            <p className="text-muted-foreground">{serializedProject.description}</p>
          </div>
          {isOwner && (
            <Link href={`/projects/${serializedProject._id}/edit`}>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Edit Project
              </Button>
            </Link>
          )}
        </div>

        {/* Owner Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Project Owner</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <Image
                src={serializedProject.owner.image || '/placeholder-avatar.svg'}
                alt={serializedProject.owner.name}
                width={48}
                height={48}
                className="rounded-full"
              />
              <div>
                <h3 className="font-semibold">{serializedProject.owner.name}</h3>
                <p className="text-sm text-muted-foreground">
                  @{serializedProject.owner.githubData?.username || 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Current Status */}
            <Card>
              <CardHeader>
                <CardTitle>Current Status</CardTitle>
              </CardHeader>
              <CardContent>
                <p>{serializedProject.currentStatus}</p>
              </CardContent>
            </Card>

            {/* Goals */}
            <Card>
              <CardHeader>
                <CardTitle>Project Goals</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {serializedProject.goals.map((goal, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <Target className="h-4 w-4 mt-1 text-muted-foreground" />
                      <span>{goal}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Technologies */}
            <Card>
              <CardHeader>
                <CardTitle>Technologies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold mb-2">Current Stack</h4>
                    <div className="flex flex-wrap gap-2">
                      {serializedProject.technologies.map((tech) => (
                        <Badge key={tech} variant="outline">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  {serializedProject.plannedTechnologies && serializedProject.plannedTechnologies.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Planned Technologies</h4>
                      <div className="flex flex-wrap gap-2">
                        {serializedProject.plannedTechnologies.map((tech) => (
                          <Badge key={tech} variant="secondary">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Roles Needed */}
            {activeRoles.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Roles Needed</CardTitle>
                  <CardDescription>
                    We&apos;re looking for talented individuals to join this project
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {activeRoles.map((role, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold">{role.title}</h4>
                          <Badge variant="outline">{role.experienceLevel}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {role.description}
                        </p>
                        <div className="space-y-2">
                          <div>
                            <span className="text-sm font-medium">Skills Required: </span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {role.skills.map((skill) => (
                                <Badge key={skill} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                          <div>
                            <span className="text-sm font-medium">Commitment: </span>
                            <span className="text-sm text-muted-foreground">
                              {role.commitmentExpected}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Application Form */}
            {session && !isOwner && !isCollaborator && activeRoles.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Apply to Join</CardTitle>
                  <CardDescription>
                    {hasApplied 
                      ? "You have already applied to this project" 
                      : "Select a role and tell us why you'd be a great fit"
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {hasApplied ? (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        Your application is being reviewed by the project owner.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-muted-foreground">
                        Application functionality will be implemented soon.
                      </p>
                      <Button disabled>
                        Apply to Join
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {!session && activeRoles.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Interested in Joining?</CardTitle>
                </CardHeader>
                <CardContent>
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Please <Link href="/auth/sign-in" className="underline">sign in</Link> to apply for this project.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Info */}
            <Card>
              <CardHeader>
                <CardTitle>Project Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{serializedProject.estimatedDuration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Created {new Date(serializedProject.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {serializedProject.collaborators.filter(c => c.status === 'Active').length} collaborators
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    {activeRoles.length} open positions
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* Collaborators */}
            {serializedProject.collaborators.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Collaborators</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {serializedProject.collaborators
                      .filter(collab => collab.status === 'Active')
                      .map((collaborator, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Image
                          src={collaborator.user.image || '/placeholder-avatar.svg'}
                          alt={collaborator.user.name}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                        <div>
                          <p className="font-medium text-sm">{collaborator.user.name}</p>
                          <p className="text-xs text-muted-foreground">{collaborator.role}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
