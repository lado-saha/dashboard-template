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

            // **NEW LOGIC**: Check if user is a Business Actor
            let businessActorProfile = null;
            try {
              businessActorProfile = await organizationRepository.getBusinessActorById(userId);
            } catch (error: any) {
              // A 404 is expected for normal users, so we ignore it.
              // Any other error should be logged but not block login.
              if (error.status !== 404) {
                console.error("Error fetching Business Actor profile during login:", error.message);
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
              // **"POISON" THE SESSION HERE**
              businessActorId: businessActorProfile?.business_actor_id || null,
            };
          }
          return null;
        } catch (error: any) {
          console.error("Authorize Error:", error);
          throw new Error(error.message || "Invalid credentials");
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
        // **Pass the new property to the token**
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
        // **Pass the new property to the session**
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