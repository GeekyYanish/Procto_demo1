import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role') || 'STUDENT';

    // Store role in state so we know what type of account to create during callback
    const state = Buffer.from(JSON.stringify({ role })).toString('base64');

    const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
    githubAuthUrl.searchParams.append('client_id', process.env.GITHUB_CLIENT_ID || '');
    githubAuthUrl.searchParams.append('redirect_uri', `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/github/callback`);
    githubAuthUrl.searchParams.append('scope', 'user:email');
    githubAuthUrl.searchParams.append('state', state);

    return NextResponse.redirect(githubAuthUrl.toString());
}
