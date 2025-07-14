import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    // If no specific rules, just let authorized users pass
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Allow if token exists (user is logged in)
    },
    // Redirect users to custom login page if `authorized` callback fails
    pages: {
      signIn: "/login",
    },
  }
);

// Configure which paths are protected by this middleware
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|svg|login|auth|signup|data|forgot-password|$).*)", 
  ],
};