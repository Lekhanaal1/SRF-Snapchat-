import { NextResponse, NextRequest } from 'next/server';
import { verifyAuth } from './lib/auth';
import { Ratelimit } from '@upstash/ratelimit';
import { redis } from './lib/redis';

// Create a new ratelimiter that allows 10 requests per 10 seconds
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
  prefix: '@upstash/ratelimit',
});

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
  const publicRoutes = ['/signin', '/', '/global-map', '/registration-success', '/register/'];
  
  // If the user is not authenticated and trying to access a protected route
  if (!isAuthenticated && !publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/signin', request.url));
  }

  // If the user is authenticated and trying to access the sign-in page
  if (isAuthenticated && pathname === '/signin') {
    return NextResponse.redirect(new URL('/global-map', request.url));
  }

  try {
    // Get the IP address from the request headers
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : '127.0.0.1';
    
    // Rate limit the request
    const { success, limit, reset, remaining } = await ratelimit.limit(ip);
    
    // Add rate limit headers to the response
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Limit', limit.toString());
    response.headers.set('X-RateLimit-Remaining', remaining.toString());
    response.headers.set('X-RateLimit-Reset', reset.toString());
    
    // Add security headers
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: https://maps.googleapis.com https://api.mapbox.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://api.mapbox.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://*.googleapis.com https://*.gstatic.com https://api.mapbox.com https://docs.mapbox.com; connect-src 'self' https://*.googleapis.com https://*.gstatic.com https://api.mapbox.com https://events.mapbox.com; worker-src 'self' blob:; child-src 'self' blob:;"
    );
    
    // If rate limit is exceeded, return a 429 response
    if (!success) {
      return new NextResponse('Too Many Requests', {
        status: 429,
        headers: {
          'Retry-After': reset.toString(),
          ...Object.fromEntries(response.headers),
        },
      });
    }
    
    return response;
  } catch (error) {
    console.error('Rate limiting error:', error);
    // If Redis is not available, allow the request to proceed without rate limiting
    const response = NextResponse.next();
    
    // Still add security headers even if rate limiting fails
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' blob: https://maps.googleapis.com https://api.mapbox.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://api.mapbox.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://*.googleapis.com https://*.gstatic.com https://api.mapbox.com https://docs.mapbox.com; connect-src 'self' https://*.googleapis.com https://*.gstatic.com https://api.mapbox.com https://events.mapbox.com; worker-src 'self' blob:; child-src 'self' blob:;"
    );
    
    return response;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 