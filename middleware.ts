import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Log all requests for debugging
    console.log('🔍 Middleware - Request:', {
        path: request.nextUrl.pathname,
        method: request.method,
        hasSessionCookie: !!request.cookies.get('sessionToken'),
        userAgent: request.headers.get('user-agent')?.includes('Next.js') ? 'NextJS-RSC' : 'Browser'
    });

    // For now, allow all requests through
    // This disables authentication checking temporarily
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/api/transaction-history/:path*',
    ],
};