import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || 'dev-secret-change-me'
);

export async function middleware(request: NextRequest) {
    const token = request.cookies.get('token')?.value;
    const { pathname } = request.nextUrl;

    // Public routes that don't need auth
    const isPublicRoute =
        pathname === '/' ||
        pathname.startsWith('/login') ||
        pathname.startsWith('/api/auth');

    if (isPublicRoute) {
        // If user is authenticated and trying to access login, redirect to dashboard
        if (pathname.startsWith('/login') && token) {
            try {
                const { payload } = await jwtVerify(token, JWT_SECRET);
                const role = (payload as { role?: string }).role;
                const url = request.nextUrl.clone();
                url.pathname = role === 'FACULTY' ? '/faculty' : '/student';
                return NextResponse.redirect(url);
            } catch {
                // Token invalid, let them go to login
            }
        }
        return NextResponse.next();
    }

    // Protected routes — verify JWT
    if (!token) {
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        return NextResponse.redirect(url);
    }

    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const role = (payload as { role?: string }).role;

        // Role-based route protection
        if (pathname.startsWith('/faculty') && role !== 'FACULTY') {
            const url = request.nextUrl.clone();
            url.pathname = '/student';
            return NextResponse.redirect(url);
        }

        if (pathname.startsWith('/student') && role !== 'STUDENT') {
            const url = request.nextUrl.clone();
            url.pathname = '/faculty';
            return NextResponse.redirect(url);
        }

        return NextResponse.next();
    } catch {
        // Token invalid or expired — redirect to login
        const url = request.nextUrl.clone();
        url.pathname = '/login';
        const response = NextResponse.redirect(url);
        response.cookies.delete('token');
        response.cookies.delete('refreshToken');
        return response;
    }
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
