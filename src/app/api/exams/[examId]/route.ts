// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET: Get exam details including questions (for exam room)
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ examId: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { examId } = await params;

        const exam = await prisma.exam.findUnique({
            where: { id: examId },
            include: {
                course: {
                    select: { id: true, code: true, name: true, facultyId: true },
                },
                examQuestions: {
                    orderBy: { orderIndex: 'asc' },
                    include: {
                        question: {
                            select: {
                                id: true,
                                type: true,
                                content: true,
                                points: true,
                            },
                        },
                    },
                },
                examRules: true,
                _count: { select: { examSessions: true } },
            },
        });

        if (!exam || exam.deletedAt) {
            return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
        }

        // Strip correct answers for students
        const questions = exam.examQuestions.map((eq) => {
            const content = eq.question.content as Record<string, unknown>;
            const safeContent = { ...content };

            if (user.role === 'STUDENT') {
                delete safeContent.correctAnswer;
            }

            return {
                id: eq.question.id,
                type: eq.question.type,
                content: safeContent,
                points: eq.question.points,
                orderIndex: eq.orderIndex,
            };
        });

        return NextResponse.json({
            exam: {
                id: exam.id,
                title: exam.title,
                instructions: exam.instructions,
                durationMinutes: exam.durationMinutes,
                startAt: exam.startAt.toISOString(),
                endAt: exam.endAt.toISOString(),
                status: exam.status,
                isPublished: exam.isPublished,
                course: exam.course,
                rules: exam.examRules,
                questions,
                sessionsCount: exam._count.examSessions,
            },
        });
    } catch (error) {
        console.error('Get exam error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE: Delete an exam (faculty only, soft delete)
export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ examId: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        if (user.role !== 'FACULTY') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const { examId } = await params;

        const exam = await prisma.exam.findUnique({
            where: { id: examId },
            include: { course: { select: { facultyId: true } } },
        });

        if (!exam || exam.deletedAt) {
            return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
        }
        if (exam.course.facultyId !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await prisma.exam.update({
            where: { id: examId },
            data: { deletedAt: new Date() },
        });

        return NextResponse.json({ message: 'Exam deleted' });
    } catch (error) {
        console.error('Delete exam error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
