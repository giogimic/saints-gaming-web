import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
    const isApiRoute = req.nextUrl.pathname.startsWith("/api");

    // Check if user is trying to access admin routes
    if (isAdminRoute || isApiRoute) {
      if (!token || !["admin", "moderator"].includes(token.role as string)) {
        return new NextResponse(
          JSON.stringify({ error: "Unauthorized" }),
          {
            status: 401,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/:path*",
  ],
}; 