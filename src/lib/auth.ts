// lib/auth.ts

import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import User from './models/User';
import { connectToDB } from './mongodb';
import { getServerSession } from 'next-auth/next';
import type { NextAuthOptions } from 'next-auth';
import { UserPermissions, DEFAULT_PERMISSIONS } from '@/lib/types/permissions';

// Erweiterte User-Typen für Session
declare module 'next-auth' {
  interface User {
    id: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
    permissions: UserPermissions;
    isActive: boolean;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      role: string;
      firstName: string;
      lastName: string;
      name: string;
      permissions: UserPermissions;
      isActive: boolean;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
    permissions: UserPermissions;
    isActive: boolean;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: {
          label: 'Email',
          type: 'email',
          placeholder: 'email@example.com',
        },
        password: { label: 'Passwort', type: 'password' },
      },
      async authorize(credentials) {
        await connectToDB();

        if (!credentials?.email || !credentials?.password) {
          throw new Error('MissingCredentials');
        }

        const user = await User.findOne({
          email: credentials.email.toLowerCase(),
        });

        if (!user) {
          throw new Error('UserNotFound');
        }

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isValid) {
          throw new Error('InvalidPassword');
        }

        if (!user.approved) {
          throw new Error('NOT_APPROVED');
        }

        if (!user.isActive) {
          throw new Error('ACCOUNT_DEACTIVATED');
        }

        // Update lastLogin
        user.lastLogin = new Date();
        await user.save();

        // Fallback für User ohne permissions (alte User)
        const permissions =
          user.permissions ||
          (user.role === 'admin'
            ? {
                marketing: true,
                management: true,
                projects: true,
                accounting: true,
                hr: true,
                admin: true,
              }
            : {
                ...DEFAULT_PERMISSIONS,
                marketing: true, // Alle bekommen erstmal Marketing
              });

        return {
          id: user._id.toString(),
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          permissions,
          isActive: user.isActive ?? true,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        return {
          ...token,
          id: user.id,
          email: user.email,
          role: user.role,
          firstName: user.firstName,
          lastName: user.lastName,
          name: `${user.firstName} ${user.lastName}`,
          permissions: user.permissions,
          isActive: user.isActive,
        };
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.email = token.email;
        session.user.firstName = token.firstName;
        session.user.lastName = token.lastName;
        session.user.name = token.name as string;
        session.user.permissions = token.permissions;
        session.user.isActive = token.isActive;
      }
      return session;
    },
  },

  pages: {
    signIn: '/login',
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,

  debug: process.env.NODE_ENV === 'development',
};

// NextAuth handler
const handler = NextAuth(authOptions);
export default handler;

// Hilfsfunktion für Server Side Session
export async function getAuthSession() {
  return await getServerSession(authOptions);
}
