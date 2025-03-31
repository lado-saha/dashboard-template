// FILE: app/api/auth/[...nextauth]/route.ts
import NextAuth, { type NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
// bcrypt is no longer needed for this temporary logic
// import bcrypt from "bcryptjs";

// Placeholder user data - NOT USED in the temporary authorize logic below
const users = [
  {
    id: "1",
    name: "Demo User",
    email: "user@example.com",
    hashedPassword: "...", // Not relevant for temp logic
  },
  // ... other users ...
];

// getUserByEmail is NOT USED in the temporary authorize logic below
async function getUserByEmail(email: string) {
  return users.find((user) => user.email === email) || null;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email or Phone", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // --- TEMPORARY DEVELOPMENT LOGIN ---
        // WARNING: Allows any non-empty email/password. FOR DEV ONLY!

        if (credentials?.email && credentials.email.length > 0 && credentials?.password && credentials.password.length > 0) {
          console.warn(
            `[DEV AUTH] Bypassing password check for: ${credentials.email}`
          );
          // Return a dummy user object.
          // Use the provided email if possible, otherwise default.
          return {
            id: "dev-user-123", // Static ID for dev user
            name: "Dev User",
            email: credentials.email, // Use the email they entered
            // You can add a role here if needed for testing role-based UI
            // role: 'admin',
          };
        }

        // If email or password is empty, deny login
        console.error("Missing credentials for DEV AUTH");
        return null;

        // --- END OF TEMPORARY DEVELOPMENT LOGIN ---

        /* --- ORIGINAL LOGIC (Commented Out) ---
        if (!credentials?.email || !credentials?.password) {
          console.error("Missing credentials");
          return null;
        }
        const user = await getUserByEmail(credentials.email);
        if (!user || !user.hashedPassword) {
          console.log("No user found or user has no password set.");
          return null;
        }
        const isValidPassword = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );
        if (!isValidPassword) {
          console.log("Password mismatch for user:", user.email);
          return null;
        }
        console.log("Authorization successful for:", user.email);
        return {
          id: user.id,
          name: user.name,
          email: user.email,
        };
        */
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    // Keep other pages definitions if needed
    // signOut: '/auth/signout',
    // error: '/auth/error',
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.sub ?? session.user.id;
        // If you added a role in the dummy user above, pass it here
        // session.user.role = token.role;
      }
      return session;
    },
    async jwt({ token, user, account, profile, isNewUser }) {
      if (user) {
        token.sub = user.id;
        // If you added a role in the dummy user above, pass it here
        // token.role = user.role;
      }
      return token;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };