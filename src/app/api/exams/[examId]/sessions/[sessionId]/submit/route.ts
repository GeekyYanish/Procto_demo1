// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { gradeAnswer } from '@/lib/grading';

// POST: Submit exam answers, auto-grade, create result
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ examId: string; sessionId: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        if (user.role !== 'STUDENT') {
            return NextResponse.json({ error: 'Only students can submit exams' }, { status: 403 });
        }

        const { examId, sessionId } = await params;

        // Fetch session with exam + questions
        const session = await prisma.examSession.findUnique({
            where: { id: sessionId },
            include: {
                exam: {
                    include: {
                        examQuestions: {
                            include: { question: true },
                            orderBy: { orderIndex: 'asc' },
                        },
                        examRules: true,
                    },
                },
            },
        });

        if (!session) {
            return NextResponse.json({ error: 'Session not found' }, { status: 404 });
        }

        // Verify ownership
        if (session.studentId !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        if (session.examId !== examId) {
            return NextResponse.json({ error: 'Exam/session mismatch' }, { status: 400 });
        }

        // Prevent double submit
        if (session.status === 'SUBMITTED' || session.status === 'TERMINATED') {
            return NextResponse.json({ error: 'Session already submitted' }, { status: 409 });
        }

        const body = await request.json();
        const { answers } = body as {
            answers: { questionId: string; response: unknown }[];
        };

        if (!answers || !Array.isArray(answers)) {
            return NextResponse.json({ error: 'answers array is required' }, { status: 400 });
        }

        // Build a map of questionId → Question for quick lookup
        const questionMap = new Map(
            session.exam.examQuestions.map((eq) => [eq.questionId, eq.question])
        );

        let totalAutoScore = 0;
        let maxPossibleScore = 0;
        let needsManualGrading = false;

        // Upsert each answer
        for (const eq of session.exam.examQuestions) {
            const q = eq.question;
            maxPossibleScore += q.points;

            const studentAnswer = answers.find((a) => a.questionId === q.id);
            const response = studentAnswer?.response ?? null;

            // Auto-grade
            const gradeResult = gradeAnswer(
                q.type,
                q.content as Record<string, unknown>,
                response,
                q.points
            );

            if (gradeResult.needsManualGrading) {
                needsManualGrading = true;
            }

            totalAutoScore += gradeResult.autoScore;

            await prisma.answer.upsert({
                where: {
                    sessionId_questionId: {
                        sessionId: session.id,
                        questionId: q.id,
                    },
                },
                create: {
                    sessionId: session.id,
                    questionId: q.id,
                    response: response ?? {},
                    autoScore: gradeResult.autoScore,
                },
                update: {
                    response: response ?? {},
                    autoScore: gradeResult.autoScore,
                },
            });
        }

        const percentage =
            maxPossibleScore > 0
                ? Math.round((totalAutoScore / maxPossibleScore) * 10000) / 100
                : 0;

        const passThreshold = session.exam.examRules?.passThreshold ?? 60;
        const passStatus = percentage >= passThreshold;

        // Update session status
        await prisma.examSession.update({
            where: { id: session.id },
            data: {
                status: 'SUBMITTED',
                submittedAt: new Date(),
            },
        });

        // Create or update result
        const result = await prisma.result.upsert({
            where: { sessionId: session.id },
            create: {
                sessionId: session.id,
                totalScore: totalAutoScore,
                percentage,
                passStatus,
                finalizedAt: needsManualGrading ? null : new Date(),
            },
            update: {
                totalScore: totalAutoScore,
                percentage,
                passStatus,
                finalizedAt: needsManualGrading ? null : new Date(),
            },
        });

        return NextResponse.json({
            message: 'Exam submitted successfully',
            result: {
                id: result.id,
                totalScore: totalAutoScore,
                maxScore: maxPossibleScore,
                percentage,
                passStatus,
                needsManualGrading,
            },
        });
    } catch (error) {
        console.error('Submit exam error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
