import React from 'react';
import { redirect, notFound } from 'next/navigation';
import { auth } from '@/auth';
import connectDB from '@/lib/mongodb';
import Project from '@/models/project';
import CreateProjectForm from '@/components/projects/create-project-form';

interface ProjectEditPageProps {
  params: {
    id: string;
  };
}

export default async function ProjectEditPage({ params }: ProjectEditPageProps) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/auth/sign-in');
  }

  await connectDB();

  // Fetch the project
  const project = await Project.findById(params.id).lean();
  
  if (!project) {
    notFound();
  }

  // Check if user is the owner
  const serializedProject = JSON.parse(JSON.stringify(project));
  if (serializedProject.owner.toString() !== session.user.id) {
    redirect('/projects');
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Edit Project</h1>
          <p className="text-muted-foreground mt-2">
            Update your project details and requirements
          </p>
        </div>

        <CreateProjectForm initialData={serializedProject} isEditing={true} />
      </div>
    </div>
  );
}
