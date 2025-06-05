import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Users, 
  Target, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Edit,
  Eye,
  AlertCircle
} from 'lucide-react';
import connectDB from '@/lib/mongodb';
import Project from '@/models/project';
import User from '@/models/user';
import { SerializedProject } from '@/types/project';

interface SerializedUser {
  _id: string;
  name: string;
  email: string;
  githubData?: {
    username: string;
    avatar_url: string;
  };
}

interface ProjectWithApplicants extends Omit<SerializedProject, 'applicants' | 'collaborators'> {
  applicants: {
    user: SerializedUser;
    roleAppliedFor: string;
    message: string;
    appliedAt: string;
    status: 'Pending' | 'Accepted' | 'Rejected';
  }[];
  collaborators: {
    user: SerializedUser;
    role: string;
    joinedAt: string;
    status: 'Active' | 'Inactive';
  }[];
}

export default async function ProjectDashboard() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/auth/sign-in');
  }

  await connectDB();

  // Fetch user's projects with populated applicants and collaborators
  const projects = await Project.find({ owner: session.user.id })
    .populate({
      path: 'applicants.user',
      model: User,
      select: 'name email githubData.username githubData.avatar_url'
    })
    .populate({
      path: 'collaborators.user', 
      model: User,
      select: 'name email githubData.username githubData.avatar_url'
    })
    .sort({ createdAt: -1 })
    .lean();

  const serializedProjects: ProjectWithApplicants[] = JSON.parse(JSON.stringify(projects));

  const pendingApplicationsCount = serializedProjects.reduce(
    (count, project) => count + project.applicants.filter(app => app.status === 'Pending').length,
    0
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Project Dashboard</h1>
          <p className="text-muted-foreground mt-2">
            Manage your projects, collaborators, and applications
          </p>
        </div>
        <Link href="/projects/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Project
          </Button>
        </Link>
      </div>

      {pendingApplicationsCount > 0 && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You have {pendingApplicationsCount} pending application{pendingApplicationsCount !== 1 ? 's' : ''} to review.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="projects" className="space-y-6">
        <TabsList>
          <TabsTrigger value="projects">My Projects ({serializedProjects.length})</TabsTrigger>
          <TabsTrigger value="applications">
            Applications ({pendingApplicationsCount})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="space-y-6">
          {serializedProjects.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by creating your first project to collaborate with others.
              </p>
              <Link href="/projects/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Project
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {serializedProjects.map((project) => (
                <Card key={project._id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <Badge variant="secondary">{project.category}</Badge>
                      <Badge 
                        variant={
                          project.status === 'Completed' ? 'default' :
                          project.status === 'In Progress' ? 'secondary' :
                          project.status === 'On Hold' ? 'destructive' :
                          'outline'
                        }
                      >
                        {project.status}
                      </Badge>
                    </div>
                    <CardTitle className="line-clamp-2">{project.title}</CardTitle>
                    <CardDescription className="line-clamp-3">
                      {project.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Technologies */}
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.slice(0, 3).map((tech) => (
                          <Badge key={tech} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                        {project.technologies.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{project.technologies.length - 3}
                          </Badge>
                        )}
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{project.collaborators.length}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{project.applicants.filter(app => app.status === 'Pending').length}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Target className="h-4 w-4" />
                          <span>{project.rolesNeeded.filter(role => role.isActive).length}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 pt-2 border-t">
                        <Link href={`/projects/${project._id}`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                        <Link href={`/projects/${project._id}/edit`} className="flex-1">
                          <Button variant="outline" size="sm" className="w-full">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="applications" className="space-y-6">
          {pendingApplicationsCount === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-lg font-semibold mb-2">No pending applications</h3>
              <p className="text-muted-foreground">
                Applications for your projects will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {serializedProjects.map((project) => {
                const pendingApplicants = project.applicants.filter(app => app.status === 'Pending');
                if (pendingApplicants.length === 0) return null;

                return (
                  <Card key={project._id}>
                    <CardHeader>
                      <CardTitle>{project.title}</CardTitle>
                      <CardDescription>
                        {pendingApplicants.length} pending application{pendingApplicants.length !== 1 ? 's' : ''}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {pendingApplicants.map((applicant, index) => (
                          <div key={index} className="flex items-start gap-4 p-4 border rounded-lg">
                            <Image
                              src={applicant.user.githubData?.avatar_url || '/placeholder-avatar.png'}
                              alt={applicant.user.name}
                              width={40}
                              height={40}
                              className="rounded-full"
                            />
                            <div className="flex-1 space-y-2">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h4 className="font-semibold">{applicant.user.name}</h4>
                                  <p className="text-sm text-muted-foreground">
                                    Applied for: {applicant.roleAppliedFor}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {new Date(applicant.appliedAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <form action={`/api/projects/${project._id}/apply`} method="POST">
                                    <input type="hidden" name="applicantId" value={applicant.user._id} />
                                    <input type="hidden" name="action" value="accept" />
                                    <Button type="submit" size="sm" variant="default">
                                      <CheckCircle className="h-4 w-4 mr-1" />
                                      Accept
                                    </Button>
                                  </form>
                                  <form action={`/api/projects/${project._id}/apply`} method="POST">
                                    <input type="hidden" name="applicantId" value={applicant.user._id} />
                                    <input type="hidden" name="action" value="reject" />
                                    <Button type="submit" size="sm" variant="destructive">
                                      <XCircle className="h-4 w-4 mr-1" />
                                      Reject
                                    </Button>
                                  </form>
                                </div>
                              </div>
                              {applicant.message && (
                                <p className="text-sm bg-muted p-2 rounded">
                                  {applicant.message}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
