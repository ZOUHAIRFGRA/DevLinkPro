import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import DiscoveryFeed from '@/components/discovery/discovery-feed';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default async function DiscoveryPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/auth/sign-in');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Discovery</h1>
      
      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="projects">Find Projects</TabsTrigger>
          <TabsTrigger value="developers">Find Developers</TabsTrigger>
        </TabsList>
        
        <TabsContent value="projects" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Project Discovery</CardTitle>
              <CardDescription>
                Swipe through projects that match your skills and interests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DiscoveryFeed type="projects" />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="developers" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Developer Discovery</CardTitle>
              <CardDescription>
                Find developers for your projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DiscoveryFeed type="developers" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
