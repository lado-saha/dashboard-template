// FILE: middleware.ts
import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(req) {
    // console.log("Token in middleware: ", req.nextauth.token);

    // Example: Role-based access (implement later)
    // if (req.nextUrl.pathname.startsWith("/admin") && req.nextauth.token?.role !== "admin") {
    //   return NextResponse.rewrite(new URL("/denied", req.url));
    // }

    // If no specific rules, just let authorized users pass
    return NextResponse.next();
  },
  {
    callbacks: {
      // This callback determines if the user is authorized *at all*.
      // If it returns false, the user is redirected to the login page.
      authorized: ({ token }) => !!token, // Allow if token exists (user is logged in)
    },
    // Redirect users to custom login page if `authorized` callback fails
    pages: {
      signIn: "/login",
      // error: "/auth-error", // Optional error page
    },
  }
);

// Configure which paths are protected by this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login, signup, forgot-password (auth pages)
     * - The root landing page '/'
     */
    "/((?!api|_next/static|_next/image|favicon.ico|login|signup|forgot-password|$).*)", // Protects everything else including dashboard routes
    // Or be more specific:
    // "/business-actor/:path*",
    // "/customer/:path*",
    // "/super-admin/:path*",
    // "/settings/:path*" // Assuming settings is also protected
  ],
};