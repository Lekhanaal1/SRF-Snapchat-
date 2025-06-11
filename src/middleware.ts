import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = request.cookies.has('auth_token'); // We'll set this when user signs in

  // Public routes that don't require authentication
  const publicRoutes = ['/signin', '/'];
  
  // If the user is not authenticated and trying to access a protected route
  if (!isAuthenticated && !publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  // If the user is authenticated and trying to access the sign-in page
  if (isAuthenticated && pathname === '/signin') {
    return NextResponse.redirect(new URL('/map', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}; 