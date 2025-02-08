import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from './actions/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only protect dashboard routes
  if (pathname.startsWith('/dashboard')) {
    const session = await getSession();

    if (!session) {
      const url = new URL('/login', request.url);
      url.searchParams.set('from', pathname);
      return NextResponse.redirect(url);
    }

    try {
      return NextResponse.next();
    } catch (error) {
      console.error('Session validation failed:', error);
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