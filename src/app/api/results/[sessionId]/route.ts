// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET: Detailed result with question breakdown
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { sessionId } = await params;

        const session = await prisma.examSession.findUnique({
            where: { id: sessionId },
            include: {
                student: { select: { id: true, firstName: true, lastName: true, email: true } },
                exam: {
                    include: {
                        examQuestions: {
                            include: { question: true },
                            orderBy: { orderIndex: 'asc' },
                        },
                    },
                },
                answers: true,
                suspiciousEvents: { orderBy: { timestamp: 'asc' } },
                result: true,
            },
        });

        if (!session) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        // Students can only see their own results
        if (user.role === 'STUDENT' && session.studentId !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        return NextResponse.json({ session });
    } catch (error) {
        console.error('Result detail error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH: Submit manual grades for a session
export async function PATCH(
    request: NextRequest,
    { params }: { params: Promise<{ sessionId: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'FACULTY') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { sessionId } = await params;
        const body = await request.json();
        const { grades, totalScore, percentage, passStatus } = body;

        // Update individual answer grades
        if (grades && Array.isArray(grades)) {
            for (const g of grades) {
                await prisma.answer.update({
                    where: { id: g.answerId },
                    data: { manualScore: g.score, gradedBy: user.id },
                });
            }
        }

        // Upsert result
        await prisma.result.upsert({
            where: { sessionId },
            create: {
                sessionId,
                totalScore: totalScore ?? 0,
                percentage: percentage ?? 0,
                passStatus: passStatus ?? false,
            },
            update: {
                totalScore: totalScore ?? 0,
                percentage: percentage ?? 0,
                passStatus: passStatus ?? false,
                finalizedAt: new Date(),
            },
        });

        return NextResponse.json({ message: 'Grades saved' });
    } catch (error) {
        console.error('Grade submission error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
