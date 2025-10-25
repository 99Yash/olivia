import { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '~/lib/auth/server';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Dashboard',
};

export default async function DashboardPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect('/signin');
  }

  return <div>Dashboard</div>;
}
