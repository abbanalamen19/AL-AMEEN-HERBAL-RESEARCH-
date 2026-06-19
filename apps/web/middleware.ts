import { NextResponse, type NextRequest } from 'next/server';

/**
 * Edge middleware: attaches a request id and forwards the session presence.
 * Deep verification happens in Route Handlers (Node runtime) via the Admin SDK,
 * since the Edge runtime cannot run firebase-admin.
 */
export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  res.headers.set('x-request-id', crypto.randomUUID());
  res.headers.set('x-has-session', req.cookies.has('__session') ? '1' : '0');
  return res;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest).*)'],
};
