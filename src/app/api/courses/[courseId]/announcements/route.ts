// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';

// GET: List announcements for a course
export async function GET(
    _request: NextRequest,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { courseId } = await params;

        const announcements = await prisma.announcement.findMany({
            where: { courseId },
            orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
            include: {
                author: { select: { firstName: true, lastName: true } },
            },
        });

        return NextResponse.json({
            announcements: announcements.map((a) => ({
                id: a.id,
                title: a.title,
                body: a.body,
                isPinned: a.isPinned,
                createdAt: a.createdAt.toISOString(),
                author: `${a.author.firstName} ${a.author.lastName}`,
            })),
        });
    } catch (error) {
        console.error('Get announcements error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST: Create an announcement (faculty only)
export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const user = await getCurrentUser();
        if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        if (user.role !== 'FACULTY') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

        const { courseId } = await params;

        // Verify faculty owns this course
        const course = await prisma.course.findUnique({ where: { id: courseId } });
        if (!course || course.facultyId !== user.id) {
            return NextResponse.json({ error: 'Course not found or forbidden' }, { status: 404 });
        }

        const body = await request.json();
        const { title, message, isPinned } = body;

        if (!title?.trim() || !message?.trim()) {
            return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
        }

        const announcement = await prisma.announcement.create({
            data: {
                courseId,
                authorId: user.id,
                title: title.trim(),
                body: message.trim(),
                isPinned: isPinned || false,
            },
        });

        return NextResponse.json({
            announcement: {
                id: announcement.id,
                title: announcement.title,
                body: announcement.body,
                isPinned: announcement.isPinned,
                createdAt: announcement.createdAt.toISOString(),
            },
        }, { status: 201 });
    } catch (error) {
        console.error('Create announcement error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
