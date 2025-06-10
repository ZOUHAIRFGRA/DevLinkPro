'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  MessageCircle, 
  ExternalLink, 
  Clock,
  RefreshCw
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Match {
  _id: string;
  targetType: 'project' | 'user';
  userRole?: 'project_owner' | 'developer'; // Add userRole field
  matchedAt: string;
  targetData: {
    _id: string;
    title?: string; // for projects
    name?: string; // for users
    description?: string;
    bio?: string;
    image?: string;
    technologies?: string[];
    skills?: Array<{
      name: string;
      level: string;
    }>;
    owner?: {
      name: string;
      image?: string;
      githubData?: {
        username: string;
      };
    };
    githubData?: {
      username: string;
    };
  };
}

export default function MatchesList() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/matches');
      const data = await response.json();
      
      if (response.ok) {
        setMatches(data.matches);
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to fetch matches',
          variant: 'destructive'
        });
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch matches',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">No matches yet</h3>
        <p className="text-muted-foreground mb-4">
          Start swiping in the discovery section to find matches!
        </p>
        <Link href="/discovery">
          <Button>
            <ExternalLink className="h-4 w-4 mr-2" />
            Go to Discovery
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {matches.map((match) => {
        // Determine what to display based on user's role in the match
        const isViewingProject = match.userRole === 'developer'; // Developer views project
        
        const targetData = match.targetData;
        let displayName, displayDescription, displayImage, displayType;
        
        if (isViewingProject) {
          // Developer viewing project
          displayName = targetData.title;
          displayDescription = targetData.description;
          displayImage = targetData.owner?.image;
          displayType = 'Project';
        } else {
          // Project owner viewing developer
          displayName = targetData.name;
          displayDescription = targetData.bio;
          displayImage = targetData.image;
          displayType = 'Developer';
        }
        
        return (
          <Card key={match._id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={displayImage} />
                    <AvatarFallback>
                      {displayName?.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{displayName}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary">
                        {displayType}
                      </Badge>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(match.matchedAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
                <Link href={`/matches/${match._id}`}>
                  <Button size="sm" variant="outline">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Message
                  </Button>
                </Link>
              </div>
              {displayDescription && (
                <CardDescription className="line-clamp-2">
                  {displayDescription}
                </CardDescription>
              )}
            </CardHeader>
            
            {(isViewingProject ? targetData.technologies : targetData.skills) && (
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {isViewingProject ? 
                    targetData.technologies?.slice(0, 6).map((tech) => (
                      <Badge key={tech} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    )) :
                    targetData.skills?.slice(0, 6).map((skill) => (
                      <Badge key={skill.name} variant="outline" className="text-xs">
                        {skill.name}
                      </Badge>
                    ))
                  }
                </div>
                
                <div className="mt-4 flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    {isViewingProject && targetData.owner && (
                      <span>by {targetData.owner.name}</span>
                    )}
                    {!isViewingProject && targetData.githubData?.username && (
                      <span>@{targetData.githubData.username}</span>
                    )}
                  </div>
                  
                  <Link 
                    href={isViewingProject ? `/projects/${targetData._id}` : `/profile/${targetData.githubData?.username || targetData._id}`}
                  >
                    <Button variant="ghost" size="sm">
                      View Profile
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
}
