import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';
import type { NextAuthConfig } from 'next-auth';

// Validate required environment variables (skip in CI without secrets)
const googleClientId = process.env.GOOGLE_CLIENT_ID || 'dummy-client-id';
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET || 'dummy-client-secret';

// Only validate in production or when we have real secrets
if (process.env.NODE_ENV === 'production' && googleClientId === 'dummy-client-id') {
  throw new Error('GOOGLE_CLIENT_ID is required in production environment');
}

if (process.env.NODE_ENV === 'production' && googleClientSecret === 'dummy-client-secret') {
  throw new Error('GOOGLE_CLIENT_SECRET is required in production environment');
}

export const authConfig: NextAuthConfig = {
  providers: [
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60, // 24 hours
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);