'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Users, 
  Target, 
  Calendar, 
  Star, 
  Plus, 
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import ProjectFilters, { ProjectFilters as IProjectFilters } from '@/components/projects/project-filters';
import { formatDistanceToNow } from 'date-fns';

interface Project {
  _id: string;
  title: string;
  description: string;
  technologies: string[];
  plannedTechnologies?: string[];
  category: string;
  difficulty: string;
  status: string;
  rolesNeeded: Array<{
    title: string;
    description: string;
    skills: string[];
    isActive: boolean;
  }>;
  owner: {
    name: string;
    image?: string;
    githubData?: {
      username: string;
    };
  };
  createdAt: string;
  estimatedDuration: string;
}

interface ProjectsListingProps {
  isAuthenticated: boolean;
}

export default function ProjectsListing({ isAuthenticated }: ProjectsListingProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<IProjectFilters>({
    search: '',
    technologies: [],
    category: '',
    difficulty: '',
    status: ''
  });

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.technologies.length > 0) params.append('technologies', filters.technologies.join(','));
      if (filters.category) params.append('category', filters.category);
      if (filters.difficulty) params.append('difficulty', filters.difficulty);
      if (filters.status) params.append('status', filters.status);
      params.append('limit', '20');

      const response = await fetch(`/api/projects?${params.toString()}`);
      const data = await response.json();
      
      if (response.ok) {
        setProjects(data.data || []);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to fetch projects',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch projects',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [filters]); // fetchProjects is stable and doesn't need to be in dependencies

  const handleFiltersChange = (newFilters: IProjectFilters) => {
    setFilters(newFilters);
  };

  const activeRoles = (project: Project) => 
    project.rolesNeeded.filter(role => role.isActive);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-2">
            Discover and collaborate on exciting projects
          </p>
        </div>
        {isAuthenticated && (
          <Link href="/projects/create">
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <ProjectFilters onFiltersChange={handleFiltersChange} />

      {/* Results */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin" />
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium mb-2">No projects found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your filters or create a new project
          </p>
          {isAuthenticated && (
            <Link href="/projects/create">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="text-sm text-muted-foreground mb-4">
            Found {projects.length} project{projects.length !== 1 ? 's' : ''}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <Card key={project._id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={project.owner.image} />
                        <AvatarFallback>{project.owner.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{project.owner.name}</p>
                        {project.owner.githubData?.username && (
                          <p className="text-xs text-muted-foreground">
                            @{project.owner.githubData.username}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {project.status}
                    </Badge>
                  </div>
                  
                  <CardTitle className="text-xl line-clamp-2">
                    {project.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {project.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    {/* Project Info */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4" />
                        {project.difficulty}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {activeRoles(project).length} roles
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {formatDistanceToNow(new Date(project.createdAt), { addSuffix: true })}
                      </span>
                    </div>

                    {/* Technologies */}
                    <div>
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.slice(0, 6).map((tech) => (
                          <Badge key={tech} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                        {project.technologies.length > 6 && (
                          <Badge variant="outline" className="text-xs">
                            +{project.technologies.length - 6} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Active Roles */}
                    {activeRoles(project).length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-1">Open Roles:</p>
                        <div className="space-y-1">
                          {activeRoles(project).slice(0, 2).map((role, index) => (
                            <p key={index} className="text-sm text-muted-foreground">
                              • {role.title}
                            </p>
                          ))}
                          {activeRoles(project).length > 2 && (
                            <p className="text-sm text-muted-foreground">
                              • +{activeRoles(project).length - 2} more roles
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    <Separator />

                    {/* Actions */}
                    <div className="flex justify-between items-center">
                      <Badge variant="outline">
                        {project.category}
                      </Badge>
                      
                      <div className="flex gap-2">
                        <Link href={`/projects/${project._id}`}>
                          <Button variant="outline" size="sm">
                            View Details
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </Button>
                        </Link>
                        {isAuthenticated && activeRoles(project).length > 0 && (
                          <Link href={`/projects/${project._id}/apply`}>
                            <Button size="sm">
                              <Target className="h-3 w-3 mr-1" />
                              Apply
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
