import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { publicPaths } from '@/lib/config';
import { getSession } from './actions/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is public
  const isPublicPath = publicPaths.some(path => {
    if (path.endsWith('*')) {
      return pathname.startsWith(path.slice(0, -1));
    }
    return pathname === path;
  });

  if (isPublicPath) {
    return NextResponse.next();
  }

  // Get session token from cookie
  const session = await getSession();

  // If no session and trying to access protected route, redirect to login
  if (!session && !isPublicPath) {
    const url = new URL('/login', request.url);
    url.searchParams.set('from', pathname);
    return NextResponse.redirect(url);
  }

  // If has session and trying to access auth pages, redirect to dashboard
  if (session && (pathname === '/login' || pathname === '/register')) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // For protected routes with valid session
  if (session && pathname.startsWith('/dashboard')) {
    try {
      // Get user ID from session cookie (handled by iron-session in the route handlers)
      const response = NextResponse.next();

      // Check subscription status in the API routes instead of middleware
      // This avoids database calls in the edge runtime
      return response;
    } catch (error) {
      console.error('Session validation failed:', error);
      // Clear invalid session
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('gtd_session');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};