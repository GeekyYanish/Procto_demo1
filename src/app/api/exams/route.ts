// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET: List exams (faculty sees their course exams, students see enrolled course exams)
export async function GET(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(request.url);
        const courseId = searchParams.get('courseId');

        if (user.role === 'FACULTY') {
            const where: Record<string, unknown> = {
                deletedAt: null,
                course: { facultyId: user.id },
            };
            if (courseId) where.courseId = courseId;

            const exams = await prisma.exam.findMany({
                where,
                include: {
                    course: { select: { code: true, name: true } },
                    _count: { select: { examQuestions: true, examSessions: true } },
                },
                orderBy: { createdAt: 'desc' },
            });

            return NextResponse.json({
                exams: exams.map((e) => ({
                    id: e.id,
                    title: e.title,
                    instructions: e.instructions,
                    durationMinutes: e.durationMinutes,
                    startAt: e.startAt.toISOString(),
                    endAt: e.endAt.toISOString(),
                    status: e.status,
                    isPublished: e.isPublished,
                    course: e.course,
                    questionsCount: e._count.examQuestions,
                    sessionsCount: e._count.examSessions,
                    createdAt: e.createdAt.toISOString(),
                })),
            });
        }

        // STUDENT: exams from enrolled courses
        const enrollments = await prisma.enrollment.findMany({
            where: { studentId: user.id, droppedAt: null },
            select: { courseId: true },
        });
        const courseIds = enrollments.map((e) => e.courseId);

        const exams = await prisma.exam.findMany({
            where: {
                courseId: { in: courseIds },
                isPublished: true,
                deletedAt: null,
            },
            include: {
                course: { select: { code: true, name: true } },
                _count: { select: { examQuestions: true } },
            },
            orderBy: { startAt: 'asc' },
        });

        return NextResponse.json({
            exams: exams.map((e) => ({
                id: e.id,
                title: e.title,
                instructions: e.instructions,
                durationMinutes: e.durationMinutes,
                startAt: e.startAt.toISOString(),
                endAt: e.endAt.toISOString(),
                status: e.status,
                course: e.course,
                questionsCount: e._count.examQuestions,
            })),
        });
    } catch (error) {
        console.error('Get exams error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST: Create a new exam with questions (faculty only)
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        if (user.role !== 'FACULTY') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const body = await request.json();
        const { courseId, title, description, durationMinutes, startAt, endAt, questions } = body;

        if (!courseId || !title?.trim() || !durationMinutes || !questions?.length) {
            return NextResponse.json(
                { error: 'courseId, title, durationMinutes, and at least one question are required' },
                { status: 400 }
            );
        }

        // Verify faculty owns the course
        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (!course || course.facultyId !== user.id) {
            return NextResponse.json({ error: 'Course not found or forbidden' }, { status: 404 });
        }

        // Determine start/end times
        const examStartAt = startAt ? new Date(startAt) : new Date();
        const examEndAt = endAt
            ? new Date(endAt)
            : new Date(examStartAt.getTime() + durationMinutes * 60 * 1000);

        // Create exam + questions in a transaction
        const exam = await prisma.$transaction(async (tx) => {
            const newExam = await tx.exam.create({
                data: {
                    courseId,
                    title: title.trim(),
                    instructions: description?.trim() || null,
                    durationMinutes: Number(durationMinutes),
                    startAt: examStartAt,
                    endAt: examEndAt,
                    status: 'SCHEDULED',
                    isPublished: true,
                },
            });

            // Create questions and link them to the exam
            for (let i = 0; i < questions.length; i++) {
                const q = questions[i];
                const questionType = q.type === 'mcq' ? 'MULTIPLE_CHOICE'
                    : q.type === 'descriptive' ? 'ESSAY'
                        : q.type === 'true_false' ? 'TRUE_FALSE'
                            : q.type?.toUpperCase() || 'MULTIPLE_CHOICE';

                const content: Record<string, unknown> = {
                    questionText: q.questionText,
                };

                if (q.type === 'mcq') {
                    content.options = q.options;
                    content.correctAnswer = q.options?.[q.correctOption];
                } else if (q.type === 'descriptive') {
                    content.maxWords = q.maxWords;
                }

                const question = await tx.question.create({
                    data: {
                        courseId,
                        type: questionType,
                        content,
                        points: q.points || 1,
                        difficulty: q.difficulty || 'MEDIUM',
                        topicTags: q.tags || [],
                    },
                });

                await tx.examQuestion.create({
                    data: {
                        examId: newExam.id,
                        questionId: question.id,
                        orderIndex: i,
                    },
                });
            }

            return newExam;
        });

        // Generate a human-readable exam code
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let examCode = 'EXAM-';
        for (let i = 0; i < 4; i++) {
            examCode += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        return NextResponse.json({
            exam: {
                id: exam.id,
                code: examCode,
                title: exam.title,
                durationMinutes: exam.durationMinutes,
                startAt: exam.startAt.toISOString(),
                endAt: exam.endAt.toISOString(),
                questionsCount: questions.length,
            },
        }, { status: 201 });
    } catch (error) {
        console.error('Create exam error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
