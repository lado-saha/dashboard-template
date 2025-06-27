import NextAuth, { type NextAuthOptions, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authRepository } from '@/lib/data-repo/auth'; // Updated import path
import { AuthRequest, LoginResponse } from "@/types/auth";

interface ExtendedUser extends Omit<NextAuthUser, 'id' | 'name' | 'email'> {
  id: string;
  username?: string;
  first_name?: string;
  last_name?: string;
  name?: string | null;
  email?: string | null;
  phone_number?: string;
  email_verified?: boolean;
  phone_number_verified?: boolean;
  accessToken: string;
  roles?: string[];
  permissions?: string[];
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username, Email or Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<ExtendedUser | null> {
        if (!credentials?.username || !credentials?.password) {
          console.error("[NextAuth] Missing credentials in authorize callback");
          throw new Error("Missing username or password.");
        }

        const authRequest: AuthRequest = {
          username: credentials.username,
          password: credentials.password,
        };

        try {
          console.log(`[NextAuth] Attempting login via authRepository for: ${authRequest.username}`);
          // Use the authRepository to call either local mock API or remote Yowyob API
          const loginResponse: LoginResponse = await authRepository.login(authRequest);

          if (loginResponse && loginResponse.access_token?.token && loginResponse.user) {
            const backendUser = loginResponse.user;
            console.log(`[NextAuth] Login via authRepository successful for: ${backendUser.username}`);

            const user: ExtendedUser = {
              id: backendUser.id || `fallback-id-${Date.now()}`,
              name: `${backendUser.first_name || ""} ${backendUser.last_name || ""}`.trim() || backendUser.username || null,
              email: backendUser.email || null,
              username: backendUser.username,
              first_name: backendUser.first_name,
              last_name: backendUser.last_name,
              phone_number: backendUser.phone_number,
              email_verified: backendUser.email_verified,
              phone_number_verified: backendUser.phone_number_verified,
              accessToken: loginResponse.access_token.token,
              roles: loginResponse.roles,
              permissions: loginResponse.permissions,
            };
            return user;
          } else {
            console.warn(`[NextAuth] Login via authRepository failed or response malformed for: ${authRequest.username}`, loginResponse);
            throw new Error("Invalid credentials or malformed response from authentication service.");
          }
        } catch (error: any)  {
          console.error("[NextAuth] Error during login via authRepository:", error.message || error);
          throw new Error(error.message || "Authentication failed.");
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  jwt: {}, // secret handled by NEXTAUTH_SECRET
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) {
        const extendedUser = user as ExtendedUser;
        token.accessToken = extendedUser.accessToken;
        token.id = extendedUser.id;
        token.username = extendedUser.username;
        token.roles = extendedUser.roles;
        token.permissions = extendedUser.permissions;
        token.first_name = extendedUser.first_name;
        token.last_name = extendedUser.last_name;
        token.email = extendedUser.email;
        token.name = extendedUser.name;
        token.phone_number = extendedUser.phone_number;
        token.email_verified = extendedUser.email_verified;
        token.phone_number_verified = extendedUser.phone_number_verified;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        (session.user as ExtendedUser).id = token.id as string;
        (session.user as ExtendedUser).username = token.username as string;
        (session.user as ExtendedUser).accessToken = token.accessToken as string;
        (session.user as ExtendedUser).roles = token.roles as string[];
        (session.user as ExtendedUser).permissions = token.permissions as string[];
        (session.user as ExtendedUser).first_name = token.first_name as string;
        (session.user as ExtendedUser).last_name = token.last_name as string;
        session.user.email = token.email as string | null | undefined;
        session.user.name = token.name as string | null | undefined;
        (session.user as ExtendedUser).phone_number = token.phone_number as string;
        (session.user as ExtendedUser).email_verified = token.email_verified as boolean;
        (session.user as ExtendedUser).phone_number_verified = token.phone_number_verified as boolean;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };