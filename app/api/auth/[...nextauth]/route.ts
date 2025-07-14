import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authRepository } from "@/lib/data-repo/auth";
import { AuthRequest } from "@/types/auth";
import { User } from "next-auth";
import { organizationRepository } from "@/lib/data-repo/organization";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Username and password are required.");
        }
        try {
          const loginRequest: AuthRequest = {
            username: credentials.username,
            password: credentials.password,
          };
          const loginResponse = await authRepository.login(loginRequest);

          if (loginResponse && loginResponse.user && loginResponse.access_token) {
            const userId = loginResponse.user.id;
            if (!userId) {
              throw new Error("User ID is missing from login response.");
            }

            // [THE FIX] Re-introduce the check for a Business Actor profile.
            let businessActorId: string | null = null;
            try {
              // Make a single, targeted request to see if a BA profile exists for this user ID.
              const businessActorProfile = await organizationRepository.getBusinessActorById(userId);
              if (businessActorProfile) {
                // If a profile is found, the user is a Business Actor.
                businessActorId = businessActorProfile.business_actor_id || userId;
              }
            } catch (error: any) {
              // A 404 is an expected, valid outcome for a user who is not a BA.
              // We can safely ignore it and proceed with login.
              if (error.status !== 404) {
                console.error("Error checking for Business Actor profile during login:", error.message);
                // For other errors (e.g., 500), we log them but don't block login.
              }
            }

            return {
              id: userId,
              name: `${loginResponse.user.first_name} ${loginResponse.user.last_name}`,
              email: loginResponse.user.email,
              username: loginResponse.user.username,
              first_name: loginResponse.user.first_name,
              last_name: loginResponse.user.last_name,
              phone_number: loginResponse.user.phone_number,
              email_verified: loginResponse.user.email_verified,
              phone_number_verified: loginResponse.user.phone_number_verified,
              accessToken: loginResponse.access_token.token,
              roles: loginResponse.roles,
              permissions: loginResponse.permissions,
              // The businessActorId will be the user's ID if they are a BA, otherwise it will be null.
              businessActorId: businessActorId,
            };
          }
          return null;
        } catch (error: any) {
          throw new Error(error.message || "An unexpected error occurred during login.");
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.accessToken = user.accessToken;
        token.roles = user.roles;
        token.permissions = user.permissions;
        token.first_name = user.first_name;
        token.last_name = user.last_name;
        token.phone_number = user.phone_number;
        token.email_verified = user.email_verified;
        token.phone_number_verified = user.phone_number_verified;
        token.businessActorId = user.businessActorId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
        session.user.accessToken = token.accessToken as string;
        session.user.roles = token.roles as string[];
        session.user.permissions = token.permissions as string[];
        session.user.first_name = token.first_name as string;
        session.user.last_name = token.last_name as string;
        session.user.phone_number = token.phone_number as string;
        session.user.email_verified = token.email_verified as boolean;
        session.user.phone_number_verified = token.phone_number_verified as boolean;
        session.user.businessActorId = token.businessActorId as string | null;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
