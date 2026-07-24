import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import DashboardClient from './dashboard-client';

export default async function HomePage() {
  const session = await getSession();

  // Protect the dashboard route
  if (!session) {
    redirect('/login');
  }

  return <DashboardClient user={session} />;
}
