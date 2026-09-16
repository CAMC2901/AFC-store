import { NextRequest, NextResponse } from 'next/server';

const AUTH_REQUIRED = ['/account', '/checkout'];
const ADMIN_ONLY = ['/admin'];

const decodeToken = (token: string): { sub: string; role: string } | null => {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json) as { sub: string; role: string };
  } catch {
    return null;
  }
};

/**
 * Lightweight route protection at the edge.
 * - /account, /checkout, /wishlist → require the access token cookie.
 * - /admin → require an ADMIN role in the token.
 *
 * NOTE: real authorization always happens server-side in the API (requireAuth /
 * requireRole middlewares). This only improves UX by redirecting early.
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('afc_access_token')?.value;

  if (pathname.startsWith(ADMIN_ONLY[0])) {
    const payload = token ? decodeToken(token) : null;
    if (!payload || payload.role !== 'ADMIN') {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.search = `?next=${pathname}`;
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  if (AUTH_REQUIRED.some((p) => pathname === p || pathname.startsWith(`${p}/`))) {
    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = '/login';
      url.search = `?next=${pathname}`;
      return NextResponse.redirect(url);
    }
    // Keep expired-token UX handled by the client (silent refresh).
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/account/:path*', '/checkout', '/admin/:path*'],
};
