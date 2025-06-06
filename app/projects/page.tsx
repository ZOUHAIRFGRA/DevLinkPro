import React from 'react';
import { auth } from '@/auth';
import ProjectsListing from '@/components/projects/projects-listing';

export default async function ProjectsPage() {
  const session = await auth();

  return (
    <div className="container mx-auto px-4 py-8">
      <ProjectsListing isAuthenticated={!!session} />
    </div>
  );
}
