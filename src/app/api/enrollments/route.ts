// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// POST: Enroll in a course by code (student only)
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        if (user.role !== 'STUDENT') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const body = await request.json();
        const { code } = body;

        if (!code?.trim()) {
            return NextResponse.json({ error: 'Course code is required' }, { status: 400 });
        }

        const course = await prisma.course.findUnique({
            where: { code: code.trim().toUpperCase() },
            include: {
                faculty: { select: { firstName: true, lastName: true } },
                _count: { select: { enrollments: true } },
            },
        });

        if (!course || !course.isActive || course.deletedAt) {
            return NextResponse.json({ error: 'Invalid class code. Please check with your faculty and try again.' }, { status: 404 });
        }

        // Check if already enrolled
        const existing = await prisma.enrollment.findFirst({
            where: { courseId: course.id, studentId: user.id },
        });

        if (existing && !existing.droppedAt) {
            return NextResponse.json({ error: 'Already enrolled in this course' }, { status: 409 });
        }

        // Re-enroll if previously dropped
        if (existing && existing.droppedAt) {
            await prisma.enrollment.update({
                where: { id: existing.id },
                data: { droppedAt: null, enrolledAt: new Date() },
            });
        } else {
            await prisma.enrollment.create({
                data: {
                    courseId: course.id,
                    studentId: user.id,
                },
            });
        }

        return NextResponse.json({
            message: 'Enrolled successfully',
            course: {
                id: course.id,
                code: course.code,
                name: course.name,
                description: course.description,
                faculty: `${course.faculty.firstName} ${course.faculty.lastName}`,
                students: course._count.enrollments + 1,
            },
        }, { status: 201 });
    } catch (error) {
        console.error('Enrollment error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// DELETE: Drop enrollment (student only)
export async function DELETE(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        if (user.role !== 'STUDENT') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const { searchParams } = new URL(request.url);
        const courseId = searchParams.get('courseId');

        if (!courseId) {
            return NextResponse.json({ error: 'courseId is required' }, { status: 400 });
        }

        const enrollment = await prisma.enrollment.findFirst({
            where: { courseId, studentId: user.id, droppedAt: null },
        });

        if (!enrollment) {
            return NextResponse.json({ error: 'Not enrolled in this course' }, { status: 404 });
        }

        await prisma.enrollment.update({
            where: { id: enrollment.id },
            data: { droppedAt: new Date() },
        });

        return NextResponse.json({ message: 'Dropped from course' });
    } catch (error) {
        console.error('Drop enrollment error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
