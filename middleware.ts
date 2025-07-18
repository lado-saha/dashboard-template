import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;

    // If no specific rules, just let authorized users pass

    // REASON: Automatically redirect from the base /super-admin path
    // to its main dashboard to prevent a 404 error.
    if (pathname === "/super-admin") {
      const url = req.nextUrl.clone();
      url.pathname = "/super-admin/dashboard";
      return NextResponse.redirect(url);
    }

    // REASON: Redirect from the abstract /business-actor/org path to the main
    // organization dashboard, which is located at /business-actor/dashboard.
    // This provides a logical index for the organization management section.
    if (pathname === "/business-actor/org" || pathname === "/business-actor"  ) {
      const url = req.nextUrl.clone();
      url.pathname = "/business-actor/dashboard";
      return NextResponse.redirect(url);
    }

    // REASON: Redirect from the base /business-actor/agency path
    // to the specific agency dashboard. This provides a default view
    // when a user enters the agency context.
    if (pathname === "/business-actor/agency") {
      const url = req.nextUrl.clone();
      url.pathname = "/business-actor/agency/dashboard";
      return NextResponse.redirect(url);
    }

    // If no specific redirect rules match, let the default NextAuth
    // authorization logic and page rendering proceed.
    return NextResponse.next();

  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Allow if token exists (user is logged in)
    },
    // Redirect users to custom login page if `authorized` callback fails
    pages: {
      signIn: "/login",
      newUser: "/signup"
    },
  }
);

// Configure which paths are protected by this middleware
export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|logo.svg|login|auth|signup|data|forgot-password|$).*)",
  ],
};