import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);
  return Response.json({ accessToken: (session as { accessToken?: string })?.accessToken ?? null });
}
