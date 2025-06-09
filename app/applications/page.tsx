import { Suspense } from 'react';
import ProjectApplications from '@/components/projects/project-applications';

export default function ApplicationsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProjectApplications />
    </Suspense>
  );
}
