import { NextResponse } from 'next/server';

const ALLOWED_IPS = new Set(
  ['127.0.0.1', '::1', '::ffff:127.0.0.1'].concat(
    (process.env.ALLOWED_IPS || '').split(',').map(s => s.trim()).filter(Boolean)
  )
);

export function middleware(request) {
  const raw = request.ip || request.headers.get('x-forwarded-for') || '';
  const ip = raw.split(',')[0].trim().replace(/^::ffff:/, '');

  if (ALLOWED_IPS.has(ip) || ALLOWED_IPS.has(raw.split(',')[0].trim())) {
    return NextResponse.next();
  }

  return new NextResponse('Access denied', { status: 403 });
}

export const config = {
  matcher: '/((?!_next/static|_next/image|favicon\\.ico).*)',
};
