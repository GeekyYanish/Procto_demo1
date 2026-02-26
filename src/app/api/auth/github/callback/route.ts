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
        const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: 'application/json',
            },
            body: JSON.stringify({
                client_id: process.env.GITHUB_CLIENT_ID || '',
                client_secret: process.env.GITHUB_CLIENT_SECRET || '',
                code,
                redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/github/callback`,
            }),
        });

        const tokens = await tokenResponse.json();

        if (!tokenResponse.ok || tokens.error) {
            console.error('GitHub token error:', tokens);
            throw new Error(tokens.error_description || 'Failed to exchange token');
        }

        // Fetch user profile
        const profileResponse = await fetch('https://api.github.com/user', {
            headers: {
                Authorization: `Bearer ${tokens.access_token}`,
                Accept: 'application/json',
            },
        });

        const profile = await profileResponse.json();

        if (!profileResponse.ok) {
            console.error('GitHub profile error:', profile);
            throw new Error('Failed to fetch user profile');
        }

        // GitHub doesn't always return email in the profile if it's private,
        // so we have to explicitly fetch the emails array
        let email = profile.email;
        if (!email) {
            const emailResponse = await fetch('https://api.github.com/user/emails', {
                headers: {
                    Authorization: `Bearer ${tokens.access_token}`,
                    Accept: 'application/json',
                },
            });

            if (emailResponse.ok) {
                const emails = await emailResponse.json();
                const primaryEmail = emails.find((e: any) => e.primary);
                email = primaryEmail?.email || emails[0]?.email;
            }
        }

        if (!email) {
            throw new Error('Could not retrieve email from GitHub');
        }

        // Decode state to get desired role
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
                    { email: email },
                    { providerId: profile.id.toString(), authProvider: 'GITHUB' }
                ]
            }
        });

        if (user) {
            // Update to GitHub provider if it was originally local
            if (user.authProvider === 'LOCAL' && !user.providerId) {
                user = await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        authProvider: 'GITHUB',
                        providerId: profile.id.toString(),
                        isVerified: true,
                        profilePhotoUrl: profile.avatar_url || user.profilePhotoUrl,
                    }
                });
            }
        } else {
            const baseUsername = profile.login || email.split('@')[0].replace(/[^a-zA-Z0-9]/g, '');
            const randomSuffix = Math.floor(Math.random() * 10000).toString().padStart(4, '0');

            // Try to split name if available
            let firstName = profile.name || baseUsername;
            let lastName = 'User';
            if (profile.name && profile.name.includes(' ')) {
                const nameParts = profile.name.split(' ');
                firstName = nameParts[0];
                lastName = nameParts.slice(1).join(' ');
            }

            user = await prisma.user.create({
                data: {
                    email: email,
                    username: `${baseUsername}${randomSuffix}`,
                    firstName,
                    lastName,
                    role: targetRole as 'STUDENT' | 'FACULTY',
                    authProvider: 'GITHUB',
                    providerId: profile.id.toString(),
                    isVerified: true,
                    profilePhotoUrl: profile.avatar_url,
                },
            });
        }

        // Generate custom JWT
        const accessToken = signAccessToken({
            userId: user.id,
            role: user.role,
        });
        const refreshToken = signRefreshToken(user.id);

        const response = NextResponse.redirect(
            new URL(user.role === 'FACULTY' ? '/faculty' : '/student', request.url)
        );

        await setAuthCookies(accessToken, refreshToken);

        return response;

    } catch (error) {
        console.error('GitHub OAuth callback error:', error);
        return NextResponse.redirect(new URL('/login?error=Authentication+failed', request.url));
    }
}
