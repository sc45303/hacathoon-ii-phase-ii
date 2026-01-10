import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// This middleware runs on the edge before requests reach pages
// Note: Since auth tokens are stored in localStorage (client-side),
// we can't do full auth checks here. Client-side protection remains primary.
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow all requests to pass through
  // Client-side auth checks in pages will handle protection
  return NextResponse.next();
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
