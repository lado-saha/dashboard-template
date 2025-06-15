import NextAuth, { type NextAuthOptions, User as NextAuthUser } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { authApi } from "@/lib/apiClient"; // Import your authApi
import { AuthRequest, LoginResponse, UserInfo } from "@/lib/types/auth"; // Import DTOs

// Extend NextAuthUser to include properties from your API's UserInfo and LoginResponse
interface ExtendedUser extends Omit<NextAuthUser, 'id' | 'name' | 'email'> { // Omit to redefine or ensure our types take precedence if needed
  id: string; // From your UserInfo, making it non-optional if always present from backend
  username?: string; // From your UserInfo
  first_name?: string; // From your UserInfo
  last_name?: string; // From your UserInfo
  name?: string | null; // Re-add, ensuring compatibility. Can be constructed.
  email?: string | null; // Re-add, ensuring compatibility.
  phone_number?: string; // From your UserInfo
  email_verified?: boolean; // From your UserInfo
  phone_number_verified?: boolean; // From your UserInfo
  accessToken: string; // Explicitly add this from LoginResponse
  roles?: string[]; // From LoginResponse
  permissions?: string[]; // From LoginResponse
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        // These are the fields NextAuth expects from the login form
        username: { label: "Username, Email or Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<ExtendedUser | null> {
        if (!credentials?.username || !credentials?.password) {
          console.error("[NextAuth] Missing credentials in authorize callback");
          throw new Error("Missing username or password."); // Error will be caught by signIn
        }

        const authRequest: AuthRequest = {
          username: credentials.username,
          password: credentials.password,
        };

        try {
          console.log("[NextAuth] Attempting login with backend for:", authRequest.username);
          const loginResponse: LoginResponse = await authApi.login(authRequest);

          if (loginResponse && loginResponse.access_token?.token && loginResponse.user) {
            console.log("[NextAuth] Backend login successful for:", loginResponse.user.username);
            // Construct the user object NextAuth expects, including custom fields
            const user: ExtendedUser = {
              id: loginResponse.user.id || "", // Ensure id is a string
              name: `${loginResponse.user.first_name || ""} ${loginResponse.user.last_name || ""}`.trim() || loginResponse.user.username,
              email: loginResponse.user.email,
              // Custom properties from your backend response
              username: loginResponse.user.username,
              first_name: loginResponse.user.first_name,
              last_name: loginResponse.user.last_name,
              phone_number: loginResponse.user.phone_number,
              email_verified: loginResponse.user.email_verified,
              phone_number_verified: loginResponse.user.phone_number_verified,
              accessToken: loginResponse.access_token.token,
              roles: loginResponse.roles,
              permissions: loginResponse.permissions,
            };
            return user;
          } else {
            console.warn("[NextAuth] Backend login failed or response malformed for:", authRequest.username, loginResponse);
            throw new Error("Invalid credentials from backend or malformed response.");
          }
        } catch (error: any) {
          console.error("[NextAuth] Error during backend login:", error.message || error);
          // Use error.message if it's from apiRequest, otherwise a generic one
          // The `signIn` function in the form will catch this error message.
          throw new Error(error.message || "Authentication failed.");
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    // maxAge: 30 * 24 * 60 * 60, // 30 days (optional)
  },
  jwt: {
    // secret: process.env.NEXTAUTH_SECRET, // Already defined globally
    // maxAge: 60 * 60 * 24 * 30, // (optional)
  },
  pages: {
    signIn: "/login",
    // error: "/auth/error", // Custom error page (optional)
  },
  callbacks: {
    async jwt({ token, user, account }) {
      // Persist the access_token and other user details to the JWT
      if (account && user) { // This block runs on initial sign in
        const extendedUser = user as ExtendedUser;
        return {
          ...token,
          id: extendedUser.id,
          username: extendedUser.username,
          accessToken: extendedUser.accessToken,
          roles: extendedUser.roles,
          permissions: extendedUser.permissions,
          first_name: extendedUser.first_name,
          last_name: extendedUser.last_name,
          email: extendedUser.email, // NextAuth token already has email if available
          phone_number: extendedUser.phone_number,
          email_verified: extendedUser.email_verified,
          phone_number_verified: extendedUser.phone_number_verified,
        };
      }
      // On subsequent calls, `token` will already have these values
      return token;
    },
    async session({ session, token }) {
      // Send properties to the client, like an access_token and user details from the token
      if (token && session.user) {
        const extendedSessionUser = session.user as ExtendedUser;
        extendedSessionUser.id = token.id as string;
        extendedSessionUser.username = token.username as string;
        extendedSessionUser.accessToken = token.accessToken as string;
        extendedSessionUser.roles = token.roles as string[];
        extendedSessionUser.permissions = token.permissions as string[];
        extendedSessionUser.first_name = token.first_name as string;
        extendedSessionUser.last_name = token.last_name as string;
        extendedSessionUser.email = token.email as string; // Already on session.user.email
        extendedSessionUser.phone_number = token.phone_number as string;
        extendedSessionUser.email_verified = token.email_verified as boolean;
        extendedSessionUser.phone_number_verified = token.phone_number_verified as boolean;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };