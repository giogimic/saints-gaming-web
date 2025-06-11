import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { UserRole } from "@/lib/permissions";

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
  ],
  runtime: 'experimental-edge',
};

export default withAuth(
  function middleware(req: NextRequest) {
    const token = req.cookies.get('next-auth.session-token')?.value;
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
    const isApiRoute = req.nextUrl.pathname.startsWith("/api/admin");
    const isContentPage = req.nextUrl.pathname.startsWith("/api/admin/content/pages");
    const isGetRequest = req.method === "GET";

    // Allow public access to GET requests for content pages
    if (isContentPage && isGetRequest) {
      return NextResponse.next();
    }

    // Check if user is trying to access admin routes
    if ((isAdminRoute || isApiRoute) && !isContentPage) {
      if (!token) {
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
      authorized: ({ token, req }) => {
        const isContentPage = req.nextUrl.pathname.startsWith("/api/admin/content/pages");
        const isGetRequest = req.method === "GET";
        
        // Allow public access to GET requests for content pages
        if (isContentPage && isGetRequest) {
          return true;
        }
        
        return !!token;
      },
    },
  }
); 