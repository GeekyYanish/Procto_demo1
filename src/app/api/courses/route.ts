// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET: List courses (faculty sees their own, students see enrolled)
export async function GET() {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        if (user.role === 'FACULTY') {
            const courses = await prisma.course.findMany({
                where: { facultyId: user.id, isActive: true, deletedAt: null },
                include: {
                    _count: { select: { enrollments: true, exams: true } },
                },
                orderBy: { createdAt: 'desc' },
            });

            return NextResponse.json({
                courses: courses.map((c) => ({
                    id: c.id,
                    code: c.code,
                    name: c.name,
                    description: c.description,
                    createdAt: c.createdAt.toISOString(),
                    students: c._count.enrollments,
                    exams: c._count.exams,
                })),
            });
        }

        // STUDENT: return enrolled courses
        const enrollments = await prisma.enrollment.findMany({
            where: { studentId: user.id, droppedAt: null },
            include: {
                course: {
                    include: {
                        faculty: { select: { firstName: true, lastName: true } },
                        _count: { select: { enrollments: true, exams: true } },
                    },
                },
            },
            orderBy: { enrolledAt: 'desc' },
        });

        return NextResponse.json({
            courses: enrollments.map((e) => ({
                id: e.course.id,
                code: e.course.code,
                name: e.course.name,
                description: e.course.description,
                faculty: `${e.course.faculty.firstName} ${e.course.faculty.lastName}`,
                students: e.course._count.enrollments,
                upcomingExams: e.course._count.exams,
                enrolledAt: e.enrolledAt.toISOString(),
                enrollmentId: e.id,
            })),
        });
    } catch (error) {
        console.error('Get courses error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST: Create a new course (faculty only)
export async function POST(request: NextRequest) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        if (user.role !== 'FACULTY') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const body = await request.json();
        const { name, description } = body;

        if (!name?.trim()) {
            return NextResponse.json({ error: 'Course name is required' }, { status: 400 });
        }

        // Generate unique code like PROCTO-XXXX
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code: string;
        let exists = true;
        do {
            let suffix = '';
            for (let i = 0; i < 4; i++) {
                suffix += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            code = `PROCTO-${suffix}`;
            const found = await prisma.course.findUnique({ where: { code } });
            exists = !!found;
        } while (exists);

        const course = await prisma.course.create({
            data: {
                code,
                name: name.trim(),
                description: description?.trim() || null,
                facultyId: user.id,
            },
        });

        return NextResponse.json({
            course: {
                id: course.id,
                code: course.code,
                name: course.name,
                description: course.description,
                createdAt: course.createdAt.toISOString(),
                students: 0,
            },
        }, { status: 201 });
    } catch (error) {
        console.error('Create course error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
