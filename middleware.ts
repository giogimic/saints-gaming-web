import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuthPage = request.nextUrl.pathname.startsWith('/auth');
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');
  const isPublicRoute = request.nextUrl.pathname === '/' || 
                       request.nextUrl.pathname.startsWith('/_next') ||
                       request.nextUrl.pathname.startsWith('/static');

  // Allow public routes and API routes
  if (isPublicRoute || isApiRoute) {
    return NextResponse.next();
  }

  // Redirect authenticated users away from auth pages
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Protect dashboard and admin routes
  if ((request.nextUrl.pathname.startsWith('/dashboard') || 
       request.nextUrl.pathname.startsWith('/admin')) && 
      !token) {
    const signInUrl = new URL('/auth/signin', request.url);
    signInUrl.searchParams.set('callbackUrl', request.url);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
}; 