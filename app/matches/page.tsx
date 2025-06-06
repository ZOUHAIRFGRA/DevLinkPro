import React from 'react';
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import MatchesList from '@/components/matches/matches-list';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function MatchesPage() {
  const session = await auth();
  
  if (!session) {
    redirect('/auth/sign-in');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Your Matches</h1>
        <p className="text-muted-foreground mt-2">
          Connect with projects and developers you&apos;ve matched with
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Recent Matches</CardTitle>
          <CardDescription>
            Start conversations with your matches
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MatchesList />
        </CardContent>
      </Card>
    </div>
  );
}
