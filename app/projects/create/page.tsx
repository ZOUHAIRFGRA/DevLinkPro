import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import CreateProjectForm from '@/components/projects/create-project-form';

export default async function CreateProjectPage() {
  const session = await auth();

  if (!session) {
    redirect('/auth/sign-in');
  }

  return (
    <div className="container mx-auto">
      <CreateProjectForm />
    </div>
  );
}
