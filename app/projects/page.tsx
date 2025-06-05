import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { auth } from '@/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Users, Target } from 'lucide-react';
import connectDB from '@/lib/mongodb';
import Project from '@/models/project';
import { SerializedProject } from '@/types/project';

export default async function ProjectsPage() {
  const session = await auth();

  await connectDB();

  // Fetch recent public projects
  const projects = await Project.find({ isPublic: true })
    .populate('owner', 'name email githubData.username githubData.avatar_url')
    .sort({ createdAt: -1 })
    .limit(12)
    .lean();

  const serializedProjects: SerializedProject[] = JSON.parse(JSON.stringify(projects));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-2">
            Discover and collaborate on exciting projects
          </p>
        </div>
        {session && (
          <Link href="/projects/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </Link>
        )}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {serializedProjects.map((project: SerializedProject) => (
          <Card key={project._id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <Badge variant="secondary">{project.category}</Badge>
                <Badge 
                  variant={project.difficulty === 'Beginner' ? 'default' : 
                          project.difficulty === 'Intermediate' ? 'secondary' : 'destructive'}
                >
                  {project.difficulty}
                </Badge>
              </div>
              <CardTitle className="line-clamp-2">
                <Link href={`/projects/${project._id}`} className="hover:underline">
                  {project.title}
                </Link>
              </CardTitle>
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
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{project.rolesNeeded.filter((role) => role.isActive).length} roles</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Target className="h-4 w-4" />
                    <span>{project.status}</span>
                  </div>
                </div>

                {/* Owner */}
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Image
                    src={project.owner.githubData?.avatar_url || '/placeholder-avatar.png'}
                    alt={project.owner.name}
                    width={24}
                    height={24}
                    className="rounded-full"
                  />
                  <span className="text-sm text-muted-foreground">
                    by {project.owner.name}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {serializedProjects.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
          <p className="text-muted-foreground mb-4">
            Be the first to share your project idea!
          </p>
          {session && (
            <Link href="/projects/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create First Project
              </Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
