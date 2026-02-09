import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from 'next-auth/providers/google';

const backendUrl = process.env.BACKEND_API_URL!;

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    }),
    CredentialsProvider({
      name: 'Email & Password',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      authorize: async credentials => {
        const response = await fetch(`${backendUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials)
        });

        if (!response.ok) return null;
        const data = await response.json();
        return { id: data.user.id, email: data.user.email, accessToken: data.token };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.userId = user.id;
        token.accessToken = (user as { accessToken?: string }).accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.userId as string;
      (session as { accessToken?: string }).accessToken = token.accessToken as string;
      return session;
    }
  }
};
