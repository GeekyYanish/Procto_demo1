// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET: Get a single course by ID
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { courseId } = await params;

        const course = await prisma.course.findUnique({
            where: { id: courseId },
            include: {
                faculty: { select: { id: true, firstName: true, lastName: true, email: true } },
                _count: { select: { enrollments: true, exams: true } },
                exams: {
                    where: { deletedAt: null },
                    orderBy: { startAt: 'desc' },
                    select: {
                        id: true,
                        title: true,
                        durationMinutes: true,
                        startAt: true,
                        endAt: true,
                        status: true,
                        isPublished: true,
                        _count: { select: { examQuestions: true } },
                    },
                },
                announcements: {
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        title: true,
                        body: true,
                        isPinned: true,
                        createdAt: true,
                        author: { select: { firstName: true, lastName: true } },
                    },
                },
            },
        });

        if (!course || course.deletedAt) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }

        // Access control: faculty must own the course, student must be enrolled
        if (user.role === 'FACULTY' && course.facultyId !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        if (user.role === 'STUDENT') {
            const enrollment = await prisma.enrollment.findFirst({
                where: { courseId, studentId: user.id, droppedAt: null },
            });
            if (!enrollment) {
                return NextResponse.json({ error: 'Not enrolled in this course' }, { status: 403 });
            }
        }

        return NextResponse.json({
            course: {
                id: course.id,
                code: course.code,
                name: course.name,
                description: course.description,
                faculty: course.faculty,
                students: course._count.enrollments,
                createdAt: course.createdAt.toISOString(),
                exams: course.exams.map((e) => ({
                    id: e.id,
                    title: e.title,
                    durationMinutes: e.durationMinutes,
                    startAt: e.startAt.toISOString(),
                    endAt: e.endAt.toISOString(),
                    status: e.status,
                    isPublished: e.isPublished,
                    questionsCount: e._count.examQuestions,
                })),
                announcements: course.announcements.map((a) => ({
                    id: a.id,
                    title: a.title,
                    body: a.body,
                    isPinned: a.isPinned,
                    createdAt: a.createdAt.toISOString(),
                    author: `${a.author.firstName} ${a.author.lastName}`,
                })),
            },
        });
    } catch (error) {
        console.error('Get course error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE: Delete a course (faculty only, soft delete)
export async function DELETE(
    _request: NextRequest,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        if (user.role !== 'FACULTY') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const { courseId } = await params;

        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (!course || course.deletedAt) {
            return NextResponse.json({ error: 'Course not found' }, { status: 404 });
        }
        if (course.facultyId !== user.id) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        await prisma.course.update({
            where: { id: courseId },
            data: { deletedAt: new Date(), isActive: false },
        });

        return NextResponse.json({ message: 'Course deleted' });
    } catch (error) {
        console.error('Delete course error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
