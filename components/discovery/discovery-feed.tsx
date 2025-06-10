'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Heart, 
  X, 
  Users, 
  Star, 
  MapPin, 
  Github, 
  Linkedin,
  RefreshCw
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface DiscoveryFeedProps {
  type: 'projects' | 'developers';
}

interface MatchDetails {
  skillMatches: string[];
  skillMisses: string[];
  userSkills?: string[];
  developerSkills?: string[];
  requiredSkills: string[];
  matchedCount: number;
  totalRequired: number;
  boostScore?: number;
}

interface Project {
  _id: string;
  title: string;
  description: string;
  technologies: string[];
  plannedTechnologies?: string[];
  category: string;
  difficulty: string;
  rolesNeeded: Array<{
    title: string;
    description: string;
    skills: string[];
  }>;
  owner: {
    name: string;
    image?: string;
    githubData?: {
      username: string;
    };
  };
  matchScore: number;
  matchDetails: MatchDetails;
  createdAt: string;
}

interface Developer {
  _id: string;
  name: string;
  image?: string;
  bio?: string;
  location?: string;
  skills: Array<{
    name: string;
    level: string;
  }>;
  preferredRoles: string[];
  githubData?: {
    username: string;
    publicRepos: number;
    followers: number;
  };
  socialLinks?: {
    github?: string;
    linkedin?: string;
  };
  matchScore: number;
  matchDetails: MatchDetails;
}

export default function DiscoveryFeed({ type }: DiscoveryFeedProps) {
  const [items, setItems] = useState<(Project | Developer)[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [swiping, setSwiping] = useState(false);
  const [userProjects, setUserProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [filters, setFilters] = useState({
    technologies: '',
    difficulty: '',
    category: '',
    skills: '',
    projectId: ''
  });

  // Helper component for match details tooltip
  const MatchTooltip = ({ matchDetails, matchScore, type }: { 
    matchDetails: MatchDetails; 
    matchScore: number; 
    type: 'project' | 'developer' 
  }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="secondary" className="cursor-help">
            {matchScore}% match
          </Badge>
        </TooltipTrigger>
        <TooltipContent className="max-w-sm p-4">
          <div className="space-y-3">
            <div className="font-semibold text-sm">Match Breakdown</div>
            
            <div className="space-y-2 text-xs">
              <div>
                <span className="font-medium">Skills Match: </span>
                <span className="text-green-600">{matchDetails.matchedCount}</span>
                <span className="text-muted-foreground"> / {matchDetails.totalRequired}</span>
              </div>
              
              {matchDetails.skillMatches.length > 0 && (
                <div>
                  <div className="font-medium text-green-600 mb-1">✓ Matching Skills:</div>
                  <div className="flex flex-wrap gap-1">
                    {matchDetails.skillMatches.slice(0, 8).map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        {skill}
                      </Badge>
                    ))}
                    {matchDetails.skillMatches.length > 8 && (
                      <span className="text-xs text-muted-foreground">+{matchDetails.skillMatches.length - 8} more</span>
                    )}
                  </div>
                </div>
              )}
              
              {matchDetails.skillMisses.length > 0 && (
                <div>
                  <div className="font-medium text-orange-600 mb-1">! Missing Skills:</div>
                  <div className="flex flex-wrap gap-1">
                    {matchDetails.skillMisses.slice(0, 6).map((skill, index) => (
                      <Badge key={index} variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                        {skill}
                      </Badge>
                    ))}
                    {matchDetails.skillMisses.length > 6 && (
                      <span className="text-xs text-muted-foreground">+{matchDetails.skillMisses.length - 6} more</span>
                    )}
                  </div>
                </div>
              )}

              {type === 'developer' && matchDetails.boostScore && matchDetails.boostScore > 0 && (
                <div className="pt-1 border-t">
                  <span className="font-medium text-blue-600">Profile Boost: +{matchDetails.boostScore}%</span>
                  <div className="text-xs text-muted-foreground mt-1">
                    Extra points for GitHub activity and complete profile
                  </div>
                </div>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  const fetchItems = useCallback(async () => {
    // For developers, don't fetch if no project is selected
    if (type === 'developers' && !filters.projectId) {
      setLoading(false);
      setItems([]);
      return;
    }

    setLoading(true);
    try {
      let url = '';
      const params = new URLSearchParams();
      
      if (type === 'projects') {
        url = '/api/discovery/projects';
        if (filters.technologies) params.append('technologies', filters.technologies);
        if (filters.difficulty) params.append('difficulty', filters.difficulty);
        if (filters.category) params.append('category', filters.category);
      } else {
        url = '/api/discovery/developers';
        if (filters.projectId) params.append('projectId', filters.projectId);
        if (filters.skills) params.append('skills', filters.skills);
      }

      const response = await fetch(`${url}?${params.toString()}`);
      const data = await response.json();
      
      if (response.ok) {
        setItems(type === 'projects' ? data.projects : data.developers);
        setCurrentIndex(0);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to fetch items',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error fetching items:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch items',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  }, [type, filters]);

  const fetchUserProjects = useCallback(async () => {
    if (type !== 'developers') return;
    
    setLoadingProjects(true);
    try {
      const response = await fetch('/api/projects?owner=me');
      const data = await response.json();
      
      if (response.ok) {
        setUserProjects(data.data || []);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to fetch your projects',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error fetching user projects:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch your projects',
        variant: 'destructive'
      });
    } finally {
      setLoadingProjects(false);
    }
  }, [type]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    fetchUserProjects();
  }, [fetchUserProjects]);

  const handleSwipe = async (swipeType: 'like' | 'dislike') => {
    if (swiping || currentIndex >= items.length) return;
    
    setSwiping(true);
    const currentItem = items[currentIndex];
    
    try {
      const response = await fetch('/api/swipe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetId: currentItem._id,
          targetType: type === 'projects' ? 'project' : 'user',
          swipeType
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        if (data.match) {
          toast({
            title: '🎉 It\'s a Match!',
            description: `You matched with ${type === 'projects' ? (currentItem as Project).title : (currentItem as Developer).name}!`,
          });
        } else if (swipeType === 'like') {
          toast({
            title: '👍 Liked!',
            description: `You liked ${type === 'projects' ? (currentItem as Project).title : (currentItem as Developer).name}`,
          });
        }
        
        setCurrentIndex(prev => prev + 1);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to process swipe',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error swiping:', error);
      toast({
        title: 'Error',
        description: 'Failed to process swipe',
        variant: 'destructive'
      });
    } finally {
      setSwiping(false);
    }
  };

  const renderProjectCard = (project: Project) => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar>
              <AvatarImage src={project.owner.image} />
              <AvatarFallback>{project.owner.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{project.owner.name}</p>
              {project.owner.githubData?.username && (
                <p className="text-sm text-muted-foreground">@{project.owner.githubData.username}</p>
              )}
            </div>
          </div>
          <MatchTooltip 
            matchDetails={project.matchDetails} 
            matchScore={project.matchScore} 
            type="project" 
          />
        </div>
        <CardTitle className="text-xl">{project.title}</CardTitle>
        <CardDescription className="line-clamp-3">{project.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Technologies</Label>
            <div className="flex flex-wrap gap-1 mt-1">
              {project.technologies.map((tech) => (
                <Badge key={tech} variant="outline" className="text-xs">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4" />
              {project.difficulty}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {project.rolesNeeded.length} roles needed
            </span>
          </div>

          {project.rolesNeeded.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Roles Needed</Label>
              <div className="mt-1 space-y-1">
                {project.rolesNeeded.slice(0, 2).map((role, index) => (
                  <p key={index} className="text-sm text-muted-foreground">
                    • {role.title}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderDeveloperCard = (developer: Developer) => (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Avatar className="h-16 w-16">
              <AvatarImage src={developer.image} />
              <AvatarFallback className="text-lg">{developer.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{developer.name}</h3>
              {developer.location && (
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {developer.location}
                </p>
              )}
            </div>
          </div>
          <MatchTooltip 
            matchDetails={developer.matchDetails} 
            matchScore={developer.matchScore} 
            type="developer" 
          />
        </div>
        {developer.bio && (
          <CardDescription className="line-clamp-3">{developer.bio}</CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Skills</Label>
            <div className="flex flex-wrap gap-1 mt-1">
              {developer.skills.slice(0, 8).map((skill) => (
                <Badge 
                  key={skill.name} 
                  variant={developer.matchDetails?.skillMatches?.includes(skill.name.toLowerCase()) ? "default" : "outline"}
                  className="text-xs"
                >
                  {skill.name}
                </Badge>
              ))}
            </div>
          </div>

          {developer.preferredRoles.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Preferred Roles</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {developer.preferredRoles.map((role) => (
                  <Badge key={role} variant="outline" className="text-xs">
                    {role}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            {developer.githubData && (
              <span className="flex items-center gap-1">
                <Github className="h-4 w-4" />
                {developer.githubData.publicRepos} repos
              </span>
            )}
            {developer.socialLinks?.linkedin && (
              <span className="flex items-center gap-1">
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  // Show project selection message for developers when no project is selected
  if (type === 'developers' && !filters.projectId) {
    return (
      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="projectId">Select Your Project</Label>
              <Select value={filters.projectId} onValueChange={(value) => setFilters(prev => ({ ...prev, projectId: value }))}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder={loadingProjects ? "Loading projects..." : "Choose a project"} />
                </SelectTrigger>
                <SelectContent>
                  {userProjects.length === 0 && !loadingProjects ? (
                    <SelectItem value="no-projects" disabled>No projects found</SelectItem>
                  ) : (
                    userProjects.map(project => (
                      <SelectItem key={project._id} value={project._id}>
                        {project.title}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">Select a Project to Find Developers</h3>
          <p className="text-muted-foreground mb-4">
            Choose one of your projects above to discover developers who can help bring your vision to life.
          </p>
          {userProjects.length === 0 && !loadingProjects && (
            <p className="text-sm text-muted-foreground">
              You don&apos;t have any projects yet. Create a project first to find developers.
            </p>
          )}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">No items found</h3>
        <p className="text-muted-foreground mb-4">
          Try adjusting your filters or check back later
        </p>
        <Button onClick={fetchItems} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    );
  }

  if (currentIndex >= items.length) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">You&apos;re all caught up!</h3>
        <p className="text-muted-foreground mb-4">
          You&apos;ve seen all available {type}. Check back later for more.
        </p>
        <Button onClick={fetchItems} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>
    );
  }

  const currentItem = items[currentIndex];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        {type === 'projects' ? (
          <>
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="technologies">Technologies</Label>
              <Input
                id="technologies"
                placeholder="React, Node.js, Python..."
                value={filters.technologies}
                onChange={(e) => setFilters(prev => ({ ...prev, technologies: e.target.value }))}
              />
            </div>
            <div className="min-w-[150px]">
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={filters.difficulty || 'any'} onValueChange={(value) => setFilters(prev => ({ ...prev, difficulty: value === 'any' ? '' : value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Any" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Any</SelectItem>
                  <SelectItem value="Beginner">Beginner</SelectItem>
                  <SelectItem value="Intermediate">Intermediate</SelectItem>
                  <SelectItem value="Advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        ) : (
          <>
            <div className="flex-1 min-w-[200px]">
              <Label htmlFor="skills">Skills Filter</Label>
              <Input
                id="skills"
                placeholder="React, Node.js, Python..."
                value={filters.skills}
                onChange={(e) => setFilters(prev => ({ ...prev, skills: e.target.value }))}
              />
            </div>
          </>
        )}
      </div>

      {/* Card Display */}
      <div className="relative">
        {type === 'projects' ? renderProjectCard(currentItem as Project) : renderDeveloperCard(currentItem as Developer)}
        
        {/* Action Buttons */}
        <div className="flex justify-center gap-6 mt-6">
          <Button
            size="lg"
            variant="outline"
            onClick={() => handleSwipe('dislike')}
            disabled={swiping}
            className="h-16 w-16 rounded-full border-2 border-red-200 hover:border-red-400 hover:bg-red-50"
          >
            <X className="h-8 w-8 text-red-500" />
          </Button>
          <Button
            size="lg"
            onClick={() => handleSwipe('like')}
            disabled={swiping}
            className="h-16 w-16 rounded-full bg-green-500 hover:bg-green-600"
          >
            <Heart className="h-8 w-8 text-white" />
          </Button>
        </div>

        {/* Progress Indicator */}
        <div className="mt-4 text-center text-sm text-muted-foreground">
          {currentIndex + 1} of {items.length}
        </div>
      </div>
    </div>
  );
}
