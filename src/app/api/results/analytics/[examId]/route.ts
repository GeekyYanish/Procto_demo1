// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET: Class analytics for a specific exam
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ examId: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user || user.role !== 'FACULTY') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { examId } = await params;

        const exam = await prisma.exam.findUnique({
            where: { id: examId },
            include: {
                course: { select: { name: true } },
                examQuestions: {
                    include: { question: true },
                    orderBy: { orderIndex: 'asc' },
                },
                examSessions: {
                    where: { status: 'SUBMITTED' },
                    include: {
                        student: { select: { id: true, firstName: true, lastName: true, email: true } },
                        result: true,
                        answers: true,
                    },
                },
            },
        });

        if (!exam) {
            return NextResponse.json({ error: 'Exam not found' }, { status: 404 });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const results = exam.examSessions
            .filter((s: any) => s.result)
            .map((s: any) => ({
                studentId: s.student.id,
                studentName: `${s.student.firstName} ${s.student.lastName}`,
                email: s.student.email,
                totalScore: s.result!.totalScore,
                percentage: s.result!.percentage,
                passStatus: s.result!.passStatus,
            }));

        const scores = results.map((r) => r.percentage);
        const totalSubmissions = results.length;
        const avgScore = totalSubmissions > 0 ? scores.reduce((a, b) => a + b, 0) / totalSubmissions : 0;
        const highestScore = totalSubmissions > 0 ? Math.max(...scores) : 0;
        const lowestScore = totalSubmissions > 0 ? Math.min(...scores) : 0;
        const passCount = results.filter((r) => r.passStatus).length;
        const passRate = totalSubmissions > 0 ? (passCount / totalSubmissions) * 100 : 0;

        // Score distribution (buckets of 10%)
        const distribution = Array(10).fill(0);
        scores.forEach((s) => {
            const bucket = Math.min(Math.floor(s / 10), 9);
            distribution[bucket]++;
        });

        // Per-question stats
        const questionStats = exam.examQuestions.map((eq) => {
            const answers = exam.examSessions.flatMap((s) =>
                s.answers.filter((a) => a.questionId === eq.questionId)
            );
            const autoScores = answers.map((a) => a.autoScore ?? a.manualScore ?? 0);
            const avgQScore =
                autoScores.length > 0
                    ? autoScores.reduce((a, b) => a + b, 0) / autoScores.length
                    : 0;
            const correctCount = autoScores.filter((s) => s >= eq.question.points).length;
            return {
                questionId: eq.questionId,
                type: eq.question.type,
                points: eq.question.points,
                avgScore: Math.round(avgQScore * 100) / 100,
                correctRate:
                    autoScores.length > 0
                        ? Math.round((correctCount / autoScores.length) * 100)
                        : 0,
                totalAttempts: autoScores.length,
            };
        });

        return NextResponse.json({
            exam: {
                id: exam.id,
                title: exam.title,
                courseName: exam.course.name,
            },
            analytics: {
                totalSubmissions,
                avgScore: Math.round(avgScore * 100) / 100,
                highestScore,
                lowestScore,
                passRate: Math.round(passRate * 100) / 100,
                passCount,
                failCount: totalSubmissions - passCount,
                distribution,
            },
            questionStats,
            results,
        });
    } catch (error) {
        console.error('Analytics error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
