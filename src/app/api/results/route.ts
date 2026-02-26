// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET: Results list — students see their results, faculty see pending grading
export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        if (user.role === 'STUDENT') {
            const results = await prisma.result.findMany({
                where: {
                    session: { studentId: user.id },
                    isPublished: true,
                },
                include: {
                    session: {
                        include: {
                            exam: { select: { id: true, title: true, durationMinutes: true } },
                            _count: { select: { suspiciousEvents: true } },
                        },
                    },
                },
                orderBy: { finalizedAt: 'desc' },
            });
            return NextResponse.json({ results });
        }

        // Faculty: list exams with pending grading
        const exams = await prisma.exam.findMany({
            where: {
                course: { facultyId: user.id },
            },
            include: {
                course: { select: { name: true } },
                examSessions: {
                    include: {
                        result: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        const examSummaries = exams.map((exam) => {
            const totalSessions = exam.examSessions.length;
            const gradedSessions = exam.examSessions.filter((s) => s.result).length;
            const publishedSessions = exam.examSessions.filter((s) => s.result?.isPublished).length;
            return {
                id: exam.id,
                title: exam.title,
                courseName: exam.course.name,
                totalSessions,
                gradedSessions,
                publishedSessions,
                pendingGrading: totalSessions - gradedSessions,
            };
        });

        return NextResponse.json({ exams: examSummaries });
    } catch (error) {
        console.error('Results error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST: Publish/unpublish results for an exam
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'FACULTY') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await request.json();
        const { examId, publish } = body;

        await prisma.result.updateMany({
            where: {
                session: { examId },
            },
            data: {
                isPublished: publish ?? true,
                finalizedAt: new Date(),
            },
        });

        return NextResponse.json({ message: publish ? 'Results published' : 'Results unpublished' });
    } catch (error) {
        console.error('Publish error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
