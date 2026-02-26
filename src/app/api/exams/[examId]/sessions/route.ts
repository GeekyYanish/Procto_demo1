// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// POST: Start an exam session (student only)
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ examId: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        if (user.role !== 'STUDENT') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const { examId } = await params;

        const exam = await prisma.exam.findUnique({
            where: { id: examId },
            include: {
                course: { select: { id: true } },
                examRules: true,
            },
        });

        if (!exam || exam.deletedAt) {
            return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
        }

        // Verify student is enrolled in the course
        const enrollment = await prisma.enrollment.findFirst({
            where: { courseId: exam.courseId, studentId: user.id, droppedAt: null },
        });

        if (!enrollment) {
            return NextResponse.json({ error: 'Not enrolled in this course' }, { status: 403 });
        }

        // Check max attempts
        const existingSessions = await prisma.examSession.findMany({
            where: { examId, studentId: user.id },
        });

        const maxAttempts = exam.examRules?.maxAttempts || 1;
        const completedSessions = existingSessions.filter(
            (s) => s.status === 'SUBMITTED' || s.status === 'TERMINATED'
        );

        if (completedSessions.length >= maxAttempts) {
            return NextResponse.json({ error: 'Maximum attempts reached' }, { status: 403 });
        }

        // Check for an active session — resume it
        const activeSession = existingSessions.find(
            (s) => s.status === 'ACTIVE' || s.status === 'PENDING'
        );

        if (activeSession) {
            return NextResponse.json({
                session: {
                    id: activeSession.id,
                    examId: activeSession.examId,
                    status: activeSession.status,
                    startedAt: activeSession.startedAt.toISOString(),
                },
                resumed: true,
            });
        }

        // Get client IP
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
            || request.headers.get('x-real-ip')
            || 'unknown';

        // Create new session
        const session = await prisma.examSession.create({
            data: {
                examId,
                studentId: user.id,
                status: 'ACTIVE',
                startedAt: new Date(),
                ipAddress: ip,
            },
        });

        return NextResponse.json({
            session: {
                id: session.id,
                examId: session.examId,
                status: session.status,
                startedAt: session.startedAt.toISOString(),
            },
            resumed: false,
        }, { status: 201 });
    } catch (error) {
        console.error('Start session error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// GET: List sessions for an exam (faculty: all sessions, student: own sessions)
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ examId: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { examId } = await params;

        if (user.role === 'FACULTY') {
            const sessions = await prisma.examSession.findMany({
                where: { examId },
                include: {
                    student: { select: { id: true, firstName: true, lastName: true, email: true } },
                    _count: { select: { answers: true, suspiciousEvents: true } },
                    result: { select: { totalScore: true, percentage: true, passStatus: true } },
                },
                orderBy: { startedAt: 'desc' },
            });

            return NextResponse.json({ sessions });
        }

        // Student: own sessions only
        const sessions = await prisma.examSession.findMany({
            where: { examId, studentId: user.id },
            include: {
                _count: { select: { answers: true } },
                result: { select: { totalScore: true, percentage: true, passStatus: true, isPublished: true } },
            },
            orderBy: { startedAt: 'desc' },
        });

        return NextResponse.json({ sessions });
    } catch (error) {
        console.error('Get sessions error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
