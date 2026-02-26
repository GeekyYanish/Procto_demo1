// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// POST: Log a suspicious event
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const body = await request.json();
        const { sessionId, type, severity, screenshotUrl } = body;

        if (!sessionId || !type || !severity) {
            return NextResponse.json({ error: 'sessionId, type, and severity are required' }, { status: 400 });
        }

        const event = await prisma.suspiciousEvent.create({
            data: {
                sessionId,
                type,
                severity,
                screenshotUrl: screenshotUrl || null,
            },
        });

        return NextResponse.json({ event }, { status: 201 });
    } catch (error) {
        console.error('Proctor event error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// GET: Retrieve events for a session (faculty only)
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        if (user.role !== 'FACULTY') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const { searchParams } = new URL(request.url);
        const sessionId = searchParams.get('sessionId');

        if (!sessionId) {
            return NextResponse.json({ error: 'sessionId is required' }, { status: 400 });
        }

        const events = await prisma.suspiciousEvent.findMany({
            where: { sessionId },
            orderBy: { timestamp: 'desc' },
        });

        return NextResponse.json({ events });
    } catch (error) {
        console.error('Get events error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
