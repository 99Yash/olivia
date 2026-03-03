import { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '~/lib/auth/server';
import { getJobsByUser } from '~/lib/services/job.service';
import { getBaseResume } from '~/lib/services/resume.service';
import { DashboardClient } from './dashboard-client';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Manage your tailored resumes',
};

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/signin');
  }

  const [baseResume, jobs] = await Promise.all([
    getBaseResume(session.user.id),
    getJobsByUser(session.user.id),
  ]);

  return <DashboardClient baseResume={baseResume} initialJobs={jobs} />;
}
