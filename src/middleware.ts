import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAuth } from './lib/auth';

export async function middleware(request: NextRequest) {
  // Only protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    // Skip middleware for login page
    if (request.nextUrl.pathname === '/admin/login') {
      return NextResponse.next();
    }

    const token = request.cookies.get('adminToken')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }

    try {
      const decoded = await verifyAuth(token);
      if (!decoded || decoded.role !== 'admin') {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    } catch (error) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

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
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)', '/admin/:path*'],
}; 