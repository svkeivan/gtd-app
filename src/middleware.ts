import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getIronSession } from 'iron-session';
import { ironOptions } from '@/lib/config';
import type { IronSessionData } from 'iron-session';

// Create a cookie store adapter for middleware
const createCookieStore = (cookies: NextRequest['cookies']) => {
  return {
    get: (name: string) => {
      const cookie = cookies.get(name);
      if (!cookie) return undefined;
      return {
        name: cookie.name,
        value: cookie.value
      };
    },
    // Implement set with overloads
    set: function(
      nameOrOptions: string | { name: string; value: string },
      value?: string,
      options?: { [key: string]: any }
    ) {
      // This is just for type compatibility, actual setting happens in response
      return;
    },
    delete: (name: string) => {
      // This is just for type compatibility, actual deletion happens in response
      return;
    },
  };
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip public paths
  if (pathname.startsWith('/_next') || 
      pathname.startsWith('/public') || 
      pathname === '/login' ||
      pathname === '/register' ||
      pathname === '/' ||
      pathname === '/favicon.ico') {
    return NextResponse.next();
  }

  // Protect all other routes
  try {
    const session = await getIronSession<IronSessionData>(
      createCookieStore(request.cookies),
      ironOptions
    );

    // Check if user is logged in
    if (!session.user?.isLoggedIn) {
      const url = new URL('/login', request.url);
      url.searchParams.set('from', pathname);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Session validation failed:', error);
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('gtd_session');
    return response;
  }
}

// Update matcher to be more specific about protected routes
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