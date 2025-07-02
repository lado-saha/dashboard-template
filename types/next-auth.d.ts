// types/next-auth.d.ts
import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

// Extend the User object that NextAuth uses in callbacks (authorize, jwt)
interface ExtendedUser extends DefaultUser {
  // Fields from your backend UserInfo/LoginResponse that you add in authorize
  username?: string;
  first_name?: string;
  last_name?: string;
  phone_number?: string;
  email_verified?: boolean;
  phone_number_verified?: boolean;
  accessToken?: string; // Store the access token from your backend
  roles?: string[];
  permissions?: string[];
  // Ensure 'id' is string if it always present from your backend
  id: string;
}

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: ExtendedUser & DefaultSession["user"]; // Merge ExtendedUser with DefaultSession["user"]
    accessToken?: string; // Also add accessToken directly to session for easier access
    error?: "RefreshAccessTokenError"; // For refresh token rotation error handling
  }

  /** The OAuth profile returned from your provider */
  interface User extends ExtendedUser {}
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and GSSP functions */
  interface JWT extends DefaultJWT {
    // Add all fields from ExtendedUser that you want in the JWT token
    id?: string;
    username?: string;
    accessToken?: string;
    roles?: string[];
    permissions?: string[];
    first_name?: string;
    last_name?: string;
    // email and name are already part of DefaultJWT if present on user
    phone_number?: string;
    email_verified?: boolean;
    phone_number_verified?: boolean;
    error?: "RefreshAccessTokenError";
  }
}