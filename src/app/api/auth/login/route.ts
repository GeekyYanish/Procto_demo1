// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { verifyPassword, signAccessToken, signRefreshToken, setAuthCookies } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { identifier, password } = body;

        if (!identifier || !password) {
            return NextResponse.json(
                { error: 'Email/username and password are required' },
                { status: 400 }
            );
        }

        // Find user by email or username
        const isEmail = identifier.includes('@');
        const user = await prisma.user.findFirst({
            where: isEmail
                ? { email: identifier }
                : { username: identifier },
        });

        if (!user) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Check if account has a password (not OAuth-only)
        if (!user.passwordHash) {
            return NextResponse.json(
                { error: 'This account does not have a password set.' },
                { status: 401 }
            );
        }

        // Verify password
        const isValid = await verifyPassword(password, user.passwordHash);
        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Check if account is active
        if (!user.isActive) {
            return NextResponse.json({ error: 'Account is deactivated' }, { status: 403 });
        }

        // Update last login
        await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
        });

        // Generate tokens and set cookies
        const accessToken = signAccessToken({ userId: user.id, role: user.role });
        const refreshToken = signRefreshToken(user.id);
        await setAuthCookies(accessToken, refreshToken);

        return NextResponse.json({
            message: 'Login successful',
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
