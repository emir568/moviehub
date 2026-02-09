import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return <p>Please sign in to see premium and purchased content.</p>;
  }

  return (
    <section>
      <h1>Welcome back</h1>
      <p>User: {session.user?.email}</p>
      <p>Use protected API routes to fetch stream URLs and enforce paywall logic.</p>
    </section>
  );
}
