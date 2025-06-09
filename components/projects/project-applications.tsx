'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, XCircle, User, Clock, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Developer {
  _id: string;
  name: string;
  email: string;
  image?: string;
  skills?: Array<{ name: string; level: string }>;
  githubData?: {
    username: string;
    followers: number;
    public_repos: number;
  };
}

interface Project {
  _id: string;
  title: string;
  description: string;
  technologies: string[];
}

interface Application {
  _id: string;
  status: 'pending' | 'accepted' | 'rejected';
  appliedAt: string;
  respondedAt?: string;
  message?: string;
  project: Project;
  developer: Developer;
}

export default function ProjectApplications() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  const fetchApplications = async (status: string = 'pending') => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ status });
      if (projectId) params.append('projectId', projectId);
      
      const response = await fetch(`/api/applications?${params}`);
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApplication = async (applicationId: string, action: 'accept' | 'reject') => {
    try {
      setProcessingId(applicationId);
      const response = await fetch('/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ applicationId, action })
      });

      if (response.ok) {
        // Remove from current list
        setApplications(prev => prev.filter(app => app._id !== applicationId));
      }
    } catch (error) {
      console.error('Error processing application:', error);
    } finally {
      setProcessingId(null);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [projectId]); // eslint-disable-line react-hooks/exhaustive-deps

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const ApplicationCard = ({ application }: { application: Application }) => (
    <Card className="mb-4">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <Avatar className="h-12 w-12">
              <AvatarImage src={application.developer.image} />
              <AvatarFallback>
                <User className="h-6 w-6" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{application.developer.name}</CardTitle>
              <p className="text-sm text-muted-foreground">
                Applied to: {application.project.title}
              </p>
              <div className="flex items-center space-x-2 mt-1">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {formatDate(application.appliedAt)}
                </span>
              </div>
            </div>
          </div>
          <Badge variant={
            application.status === 'pending' ? 'secondary' :
            application.status === 'accepted' ? 'default' : 'destructive'
          }>
            {application.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {application.developer.githubData && (
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <span>@{application.developer.githubData.username}</span>
              <span>{application.developer.githubData.followers} followers</span>
              <span>{application.developer.githubData.public_repos} repos</span>
            </div>
          )}
          
          {application.developer.skills && application.developer.skills.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Skills:</p>
              <div className="flex flex-wrap gap-2">
                {application.developer.skills.slice(0, 6).map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {skill.name}
                  </Badge>
                ))}
                {application.developer.skills.length > 6 && (
                  <Badge variant="outline" className="text-xs">
                    +{application.developer.skills.length - 6} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {application.message && (
            <div>
              <p className="text-sm font-medium mb-1">Message:</p>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                {application.message}
              </p>
            </div>
          )}

          {application.status === 'pending' && (
            <div className="flex space-x-2 pt-2">
              <Button
                onClick={() => handleApplication(application._id, 'accept')}
                disabled={processingId === application._id}
                size="sm"
                className="flex items-center space-x-2"
              >
                <CheckCircle className="h-4 w-4" />
                <span>Accept</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleApplication(application._id, 'reject')}
                disabled={processingId === application._id}
                size="sm"
                className="flex items-center space-x-2"
              >
                <XCircle className="h-4 w-4" />
                <span>Reject</span>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Project Applications</h1>
        <p className="text-muted-foreground">
          Manage applications from developers interested in your projects
        </p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList>
          <TabsTrigger value="pending" onClick={() => fetchApplications('pending')}>
            Pending
          </TabsTrigger>
          <TabsTrigger value="accepted" onClick={() => fetchApplications('accepted')}>
            Accepted
          </TabsTrigger>
          <TabsTrigger value="rejected" onClick={() => fetchApplications('rejected')}>
            Rejected
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="mt-6">
          {loading ? (
            <div className="text-center py-8">
              <Clock className="h-8 w-8 animate-spin mx-auto mb-4" />
              <p>Loading applications...</p>
            </div>
          ) : applications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No pending applications</h3>
                <p className="text-muted-foreground">
                  When developers show interest in your projects, they&apos;ll appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div>
              {applications.map(application => (
                <ApplicationCard key={application._id} application={application} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="accepted" className="mt-6">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : applications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No accepted applications</h3>
                <p className="text-muted-foreground">
                  Developers you&apos;ve accepted will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div>
              {applications.map(application => (
                <ApplicationCard key={application._id} application={application} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : applications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <XCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">No rejected applications</h3>
                <p className="text-muted-foreground">
                  Developers you&apos;ve rejected will appear here.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div>
              {applications.map(application => (
                <ApplicationCard key={application._id} application={application} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
