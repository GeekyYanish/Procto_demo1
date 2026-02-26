// @ts-nocheck
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET: List active exam sessions for faculty proctor dashboard
export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        if (user.role !== 'FACULTY') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const sessions = await prisma.examSession.findMany({
            where: { status: 'ACTIVE' },
            include: {
                student: {
                    select: { id: true, firstName: true, lastName: true, email: true },
                },
                exam: {
                    select: { id: true, title: true, durationMinutes: true, courseId: true },
                },
                suspiciousEvents: {
                    orderBy: { timestamp: 'desc' },
                    take: 5,
                },
                _count: { select: { suspiciousEvents: true } },
            },
            orderBy: { startedAt: 'desc' },
        });

        return NextResponse.json({ sessions });
    } catch (error) {
        console.error('Get sessions error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
