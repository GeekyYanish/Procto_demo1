// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { signAccessToken, signRefreshToken, setAuthCookies } from '@/lib/auth';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
        return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(error)}`, request.url));
    }

    if (!code) {
        return NextResponse.redirect(new URL('/login?error=No+authorization+code', request.url));
    }

    try {
        // Exchange code for tokens
        const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: process.env.GOOGLE_CLIENT_ID || '',
                client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
                redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
                grant_type: 'authorization_code',
            }),
        });

        const tokens = await tokenResponse.json();

        if (!tokenResponse.ok) {
            console.error('Google token error:', tokens);
            throw new Error('Failed to exchange token');
        }

        // Fetch user profile
        const profileResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
        });

        const profile = await profileResponse.json();

        if (!profileResponse.ok || !profile.email) {
            console.error('Google profile error:', profile);
            throw new Error('Failed to fetch user profile');
        }

        // Decode state to get desired role for new signups
        let targetRole = 'STUDENT';
        if (state) {
            try {
                const decodedState = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
                if (decodedState.role === 'FACULTY') targetRole = 'FACULTY';
            } catch (e) {
                console.error('Failed to parse state', e);
            }
        }

        // Find or create user
        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: profile.email },
                    { providerId: profile.id, authProvider: 'GOOGLE' }
                ]
            }
        });

        // If user exists with same email but Local auth, we'll link it later or just log them in
        // for now we'll just log them in and update their provider info if it's missing
        if (user) {
            if (user.authProvider === 'LOCAL' && !user.providerId) {
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        authProvider: 'GOOGLE',
                        providerId: profile.id,
                        isVerified: true,
                        profilePhotoUrl: profile.picture || user.profilePhotoUrl,
                    }
                });
            }
        } else {
            // Generate a random username base since OAuth doesn't provide one
            const baseUsername = profile.email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
            const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

            user = await prisma.user.create({
                data: {
                    email: profile.email,
                    username: `${baseUsername}${randomSuffix}`,
                    firstName: profile.given_name || profile.email.split('@')[0],
                    lastName: profile.family_name || 'User',
                    role: targetRole as 'STUDENT' | 'FACULTY',
                    authProvider: 'GOOGLE',
                    providerId: profile.id,
                    isVerified: true,
                    profilePhotoUrl: profile.picture,
                },
            });
        }

        // Generate JWT
        const accessToken = signAccessToken({
            userId: user.id,
            role: user.role,
        });
        const refreshToken = signRefreshToken(user.id);

        // Set cookie and redirect
        const response = NextResponse.redirect(
            new URL(user.role === 'FACULTY' ? '/faculty' : '/student', request.url)
        );

        await setAuthCookies(accessToken, refreshToken);

        return response;

    } catch (error) {
        console.error('Google OAuth callback error:', error);
        return NextResponse.redirect(new URL('/login?error=Authentication+failed', request.url));
    }
}
