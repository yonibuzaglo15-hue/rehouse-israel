import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";

export const ADMIN_GOOGLE_EMAIL = "yonibuzaglo15@gmail.com";
export const ADMIN_CREDENTIALS_USERNAME = "yoni";
export const ADMIN_CREDENTIALS_PASSWORD = "123123123";

const providers: NextAuthOptions["providers"] = [
  CredentialsProvider({
    id: "credentials",
    name: "Credentials",
    credentials: {
      username: { label: "שם משתמש", type: "text" },
      password: { label: "סיסמה", type: "password" },
    },
    async authorize(credentials) {
      if (
        credentials?.username === ADMIN_CREDENTIALS_USERNAME &&
        credentials?.password === ADMIN_CREDENTIALS_PASSWORD
      ) {
        return {
          id: "admin-yoni",
          name: "יוני",
          email: "yoni@rehouse.co.il",
          role: "admin",
        };
      }
      return null;
    },
  }),
];

const googleClientId = process.env.GOOGLE_CLIENT_ID?.trim();
if (googleClientId) {
  providers.push(
    GoogleProvider({
      clientId: googleClientId,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET?.trim() ?? "",
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        return user.email?.toLowerCase() === ADMIN_GOOGLE_EMAIL.toLowerCase();
      }
      return account?.provider === "credentials";
    },
    async jwt({ token, user, account }) {
      if (user) {
        token.role = (user as { role?: string }).role ?? "admin";
        if (user.name) token.name = user.name;
        if (user.email) token.email = user.email;
        if (user.image) token.picture = user.image;
      }
      if (
        account?.provider === "google" &&
        token.email?.toLowerCase() === ADMIN_GOOGLE_EMAIL.toLowerCase()
      ) {
        token.role = "admin";
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = (token.role as string) ?? undefined;
        session.user.name = (token.name as string) ?? session.user.name;
        session.user.email = (token.email as string) ?? session.user.email;
        session.user.image = (token.picture as string) ?? session.user.image;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET,
};

export function isNextAuthAdminRole(role: string | undefined | null): boolean {
  return role === "admin";
}

export function isGoogleAuthEnabled(): boolean {
  return Boolean(process.env.GOOGLE_CLIENT_ID?.trim());
}
