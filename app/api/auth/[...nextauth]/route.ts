import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authRepository } from "@/lib/data-repo/auth";
import { LoginRequest } from "@/types/auth";
import { User } from "next-auth";

export const authOptions: NextAuthOptions = {
  // 1. Configure session strategy to use JSON Web Tokens
  session: {
    strategy: "jwt",
  },
  // 2. Define authentication providers
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      // Define the fields for your login form
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      // 3. The authorization logic
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.username || !credentials?.password) {
          throw new Error("Username and password are required.");
        }

        try {
          const loginRequest: LoginRequest = {
            username: credentials.username,
            password: credentials.password,
          };

          // Use the repository to login (works for both local and remote)
          const loginResponse = await authRepository.login(loginRequest);

          if (loginResponse && loginResponse.user) {
            // If login is successful, map the response to the NextAuth User object
            // You can add any properties from your API response here
            return {
              id: loginResponse.user.id,
              name: `${loginResponse.user.first_name} ${loginResponse.user.last_name}`,
              email: loginResponse.user.email,
              accessToken: loginResponse.access_token, // Custom property
              roles: loginResponse.user.roles, // Custom property
              permissions: loginResponse.user.permissions, // Custom property
            };
          } else {
            // If login fails, return null
            return null;
          }
        } catch (error: any) {
          // You can log the error and customize the message
          console.error("Authorize Error:", error);
          throw new Error(error.message || "Invalid credentials");
        }
      },
    }),
  ],
  // 4. Callbacks for JWT and Session management
  callbacks: {
    // This callback is called whenever a JWT is created or updated.
    // The `user` object is only passed on initial sign in.
    async jwt({ token, user, account }) {
      if (account && user) {
        // Persist the custom properties from the User object to the token
        token.accessToken = user.accessToken;
        token.roles = user.roles;
        token.permissions = user.permissions;
        token.id = user.id;
      }
      return token;
    },
    // This callback is called whenever a session is checked.
    async session({ session, token }) {
      // Pass the properties from the token to the client-side session object
      session.user.accessToken = token.accessToken as string;
      session.user.roles = token.roles as string[];
      session.user.permissions = token.permissions as string[];
      session.user.id = token.id as string;

      return session;
    },
  },
  // 5. Define custom pages
  pages: {
    signIn: "/login",
    error: "/login", // Redirect to login page on error
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };