import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

// Extend the User object to include all fields from our LoginResponse and authorize callback
interface ExtendedUser extends DefaultUser {
  id: string; // id is required and is a string
  username?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  email_verified?: boolean;
  phone_number_verified?: boolean;
  accessToken?: string;
  roles?: string[];
  permissions?: string[];
}

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: ExtendedUser & {
      // Ensure the user property in session is of type ExtendedUser
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
    error?: "RefreshAccessTokenError"; // For refresh token rotation error handling
  }

  /** The OAuth profile returned from your provider */
  interface User extends ExtendedUser { }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and GSSP functions */
  interface JWT extends DefaultJWT, ExtendedUser { }
}