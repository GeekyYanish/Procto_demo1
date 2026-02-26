// app/faculty/classroom/[code]/page.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';



interface Classroom {
    id: string;
    code: string;
    name: string;
    courseCode: string;
    subject: string;
    section?: string;
    description?: string;
    createdAt: string;
    students: number;
}

interface Exam {
    id: string;
    title: string;
    date: string;
    duration: string;
    status: 'upcoming' | 'live' | 'completed';
    type: 'exam' | 'quiz';
    questionsCount: number;
}

interface Announcement {
    id: string;
    title: string;
    message: string;
    date: string;
    priority: 'normal' | 'important';
}

export default function FacultyClassroomPage() {
    const [user, setUser] = useState<Record<string, unknown> | null>(null);
    const router = useRouter();
    const params = useParams();
    const code = (params.code as string)?.toUpperCase();

    const [classroom, setClassroom] = useState<Classroom | null>(null);
    const [loading, setLoading] = useState(true);
    const [exams, setExams] = useState<Exam[]>([]);
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);

    // Announcement modal state
    const [showAnnouncementModal, setShowAnnouncementModal] = useState(false);
    const [announcementTitle, setAnnouncementTitle] = useState('');
    const [announcementMessage, setAnnouncementMessage] = useState('');
    const [announcementPriority, setAnnouncementPriority] = useState<'normal' | 'important'>('normal');

    useEffect(() => {
        
        const getUser = async () => {
            const res = await fetch('/api/auth/me'); const data = await res.json(); const user = data.user;
            setUser(user);
        };
        getUser();
    }, []);

    // Load classroom from API by code
    useEffect(() => {
        if (!code) return;
        const fetchClassroom = async () => {
            try {
                // First get all courses to find by code
                const res = await fetch('/api/courses');
                if (res.ok) {
                    const data = await res.json();
                    const found = data.courses.find((c: Record<string, string>) => c.code === code);
                    if (found) {
                        setClassroom({
                            id: found.id,
                            code: found.code,
                            name: found.name,
                            courseCode: found.code,
                            subject: found.name,
                            description: found.description || undefined,
                            createdAt: found.createdAt,
                            students: found.students || 0,
                        });

                        // Fetch exams for this course
                        const examsRes = await fetch(`/api/exams?courseId=${found.id}`);
                        if (examsRes.ok) {
                            const examsData = await examsRes.json();
                            setExams(examsData.exams.map((e: Record<string, unknown>) => {
                                const now = new Date();
                                const startAt = new Date(e.startAt as string);
                                const endAt = new Date(e.endAt as string);
                                let status: 'upcoming' | 'live' | 'completed' = 'upcoming';
                                if (now >= startAt && now <= endAt) status = 'live';
                                else if (now > endAt) status = 'completed';
                                return {
                                    id: e.id as string,
                                    title: e.title as string,
                                    date: e.startAt as string,
                                    duration: `${e.durationMinutes} min`,
                                    status,
                                    type: (e.durationMinutes as number) <= 30 ? 'quiz' : 'exam',
                                    questionsCount: (e.questionsCount as number) || 0,
                                };
                            }));
                        }

                        // Fetch announcements for this course
                        const annRes = await fetch(`/api/courses/${found.id}/announcements`);
                        if (annRes.ok) {
                            const annData = await annRes.json();
                            setAnnouncements(annData.announcements.map((a: Record<string, unknown>) => ({
                                id: a.id as string,
                                title: a.title as string,
                                message: a.body as string,
                                date: a.createdAt as string,
                                priority: (a.isPinned ? 'important' : 'normal') as 'normal' | 'important',
                            })));
                        }
                    } else {
                        setClassroom(null);
                    }
                }
            } catch {
                setClassroom(null);
            }
            setLoading(false);
        };
        fetchClassroom();
    }, [code]);

    const handleLogout = async () => {
        
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/');
        router.refresh();
    };

    const getInitials = () => {
        const u = user as Record<string, string> | null;
        if (u?.firstName && u?.lastName) return (u.firstName[0] + u.lastName[0]).toUpperCase();
        if (!u?.email) return 'FC';
        return u.email.substring(0, 2).toUpperCase();
    };

    const getDisplayName = () => {
        const u = user as Record<string, string> | null;
        if (u?.firstName) return `${u.firstName} ${u.lastName}`;
        if (!u?.email) return 'Faculty';
        return u.email.split('@')[0];
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    const handleAddAnnouncement = async () => {
        if (!announcementTitle.trim() || !announcementMessage.trim() || !classroom) return;

        try {
            const res = await fetch(`/api/courses/${classroom.id}/announcements`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: announcementTitle.trim(),
                    body: announcementMessage.trim(),
                    isPinned: announcementPriority === 'important',
                }),
            });

            if (res.ok) {
                const data = await res.json();
                const newAnnouncement: Announcement = {
                    id: data.announcement.id,
                    title: data.announcement.title,
                    message: data.announcement.body,
                    date: data.announcement.createdAt,
                    priority: data.announcement.isPinned ? 'important' : 'normal',
                };
                setAnnouncements((prev) => [newAnnouncement, ...prev]);
            }
        } catch { /* ignore */ }

        // Reset form
        setAnnouncementTitle('');
        setAnnouncementMessage('');
        setAnnouncementPriority('normal');
        setShowAnnouncementModal(false);
    };

    // Loading state
    if (loading) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex items-center justify-center">
                <div className="flex items-center gap-3 text-slate-400">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Loading classroom...
                </div>
            </main>
        );
    }

    // Classroom not found
    if (!classroom) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex items-center justify-center">
                <div className="pointer-events-none fixed inset-0 overflow-hidden">
                    <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-red-500/10 blur-3xl" />
                </div>
                <div className="relative text-center max-w-md px-6">
                    <div className="mx-auto w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-6">
                        <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Classroom Not Found</h1>
                    <p className="text-neutral-500 mb-6">The class code <span className="font-mono text-red-400">{code}</span> doesn&apos;t match any of your classrooms.</p>
                    <Link
                        href="/faculty/manage-classrooms"
                        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 px-6 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 hover:shadow-violet-500/50 transition-all"
                    >
                        ← Back to Classrooms
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
            {/* Background */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />
                <div className="absolute -right-32 bottom-20 h-80 w-80 rounded-full bg-cyan-500/15 blur-3xl" />
            </div>
            <div
                className="pointer-events-none fixed inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)`,
                }}
            />

            <div className="relative mx-auto flex min-h-screen w-full flex-col px-6 py-8 sm:px-8 lg:px-12 xl:px-20 xl:py-12">
                {/* Header */}
                <header className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900/70 ring-1 ring-cyan-400/40 shadow-lg shadow-cyan-500/30">
                            <span className="text-lg font-semibold tracking-tight text-cyan-300">P</span>
                        </div>
                        <div className="flex flex-col leading-tight">
                            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Procto</span>
                            <span className="text-xs text-slate-500">Faculty Portal</span>
                        </div>
                    </Link>

                    {/* Profile */}
                    <div className="relative group">
                        <button className="flex items-center gap-3 rounded-full border border-slate-700/60 bg-slate-900/70 px-3 py-1.5 hover:border-cyan-400/40 transition-all duration-300">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm">
                                {getInitials()}
                            </div>
                            <div className="hidden sm:flex flex-col items-start leading-tight">
                                <span className="text-sm font-medium text-slate-200">{getDisplayName()}</span>
                                <span className="text-[0.65rem] text-slate-500">Faculty</span>
                            </div>
                            <svg className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        <div className="absolute right-0 mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                            <div className="rounded-xl border border-slate-700/60 bg-slate-900/95 backdrop-blur-xl shadow-xl p-2">
                                <a href="#" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 rounded-lg hover:bg-slate-800/60 hover:text-cyan-300 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    My Profile
                                </a>
                                {!!user?.email && (
                                    <div className="px-3 py-2 text-xs text-slate-500 truncate border-t border-slate-700/60 mt-1 pt-2">{String(user.email)}</div>
                                )}
                                <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 rounded-lg hover:bg-red-500/10 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Back Link */}
                <Link
                    href="/faculty/manage-classrooms"
                    className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-cyan-400 transition-colors mt-8 group w-fit"
                >
                    <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Manage Classrooms
                </Link>

                {/* Classroom Header Banner */}
                <section className="mt-6">
                    <div className="relative">
                        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-violet-500/20 via-cyan-500/10 to-violet-500/20 opacity-60 blur-xl" />
                        <div className="relative rounded-3xl border border-violet-500/30 bg-slate-900/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/40 bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-400">
                                            <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                                            {classroom.courseCode}
                                        </span>
                                        <span className="inline-flex items-center rounded-full border border-cyan-500/40 bg-cyan-500/10 px-3 py-1 text-xs font-mono font-semibold text-cyan-400 tracking-wider">
                                            {code}
                                        </span>
                                    </div>
                                    <h1 className="text-2xl sm:text-3xl font-bold text-white">{classroom.name}</h1>
                                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-400">
                                        <span className="flex items-center gap-1.5">
                                            <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                            {classroom.subject}
                                        </span>
                                        {classroom.section && (
                                            <span className="flex items-center gap-1.5">
                                                <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                                                {classroom.section}
                                            </span>
                                        )}
                                        <span className="flex items-center gap-1.5">
                                            <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                            {classroom.students} students
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            Created {formatDate(classroom.createdAt)}
                                        </span>
                                    </div>
                                    {classroom.description && (
                                        <p className="mt-3 text-sm text-slate-500 max-w-xl">{classroom.description}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Content Grid */}
                <section className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
                    {/* Exams & Quizzes — takes 2 columns */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                Exams & Quizzes
                            </h2>
                            <div className="flex items-center gap-2">
                                <Link
                                    href="/faculty/create-quiz"
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-violet-500/10 border border-violet-500/30 px-4 py-2 text-xs font-semibold text-violet-400 hover:bg-violet-500/20 hover:border-violet-500/50 transition-all duration-300"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                    Create Quiz
                                </Link>
                                <button
                                    className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 px-4 py-2 text-xs font-semibold text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300"
                                >
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                    Create Exam
                                </button>
                            </div>
                        </div>

                        {exams.map((exam) => (
                            <div
                                key={exam.id}
                                className={`relative rounded-2xl border bg-slate-900/60 p-5 backdrop-blur-sm transition-all duration-300 hover:shadow-lg ${exam.status === 'upcoming'
                                    ? 'border-violet-500/30 hover:border-violet-500/50 hover:shadow-violet-500/10'
                                    : exam.status === 'live'
                                        ? 'border-red-500/30 hover:border-red-500/50 hover:shadow-red-500/10'
                                        : 'border-slate-800 hover:border-slate-700'
                                    }`}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-base font-semibold text-white">{exam.title}</h3>
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wider ${exam.status === 'upcoming'
                                                ? 'bg-violet-500/10 text-violet-400 border border-violet-500/30'
                                                : exam.status === 'live'
                                                    ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                                                    : 'bg-slate-800 text-slate-500 border border-slate-700'
                                                }`}>
                                                {exam.status}
                                            </span>
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wider ${exam.type === 'quiz'
                                                ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30'
                                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                                }`}>
                                                {exam.type}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                {formatDate(exam.date)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                {formatTime(exam.date)} · {exam.duration}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                {exam.questionsCount} questions
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {exam.status === 'upcoming' && (
                                            <button className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-700/60 bg-slate-900/60 px-4 py-2.5 text-sm font-medium text-slate-300 transition-all hover:border-violet-500/50 hover:text-violet-300 hover:bg-violet-500/5">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                Edit
                                            </button>
                                        )}
                                        {exam.status === 'completed' && (
                                            <button className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-2.5 text-sm font-medium text-slate-400 transition-all hover:border-slate-600 hover:text-slate-300">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                                                View Results
                                            </button>
                                        )}
                                        {exam.status === 'live' && (
                                            <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-500/20 transition-all hover:bg-red-400 hover:shadow-red-500/40 hover:scale-105">
                                                <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
                                                Monitor Live
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Announcements — 1 column */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between mb-2">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                                Announcements
                            </h2>
                            <button
                                onClick={() => setShowAnnouncementModal(true)}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 px-3 py-1.5 text-xs font-semibold text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                New
                            </button>
                        </div>

                        {announcements.length === 0 ? (
                            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 text-center backdrop-blur-sm">
                                <svg className="w-8 h-8 text-slate-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                                <p className="text-sm text-slate-500">No announcements yet</p>
                                <p className="text-xs text-slate-600 mt-1">Click &quot;+ New&quot; to post one</p>
                            </div>
                        ) : (
                            announcements.map((announcement) => (
                                <div
                                    key={announcement.id}
                                    className={`rounded-2xl border bg-slate-900/60 p-5 backdrop-blur-sm transition-all duration-300 hover:shadow-lg ${announcement.priority === 'important'
                                        ? 'border-amber-500/30 hover:border-amber-500/50 hover:shadow-amber-500/10'
                                        : 'border-slate-800 hover:border-slate-700'
                                        }`}
                                >
                                    <div className="flex items-start gap-2 mb-2">
                                        {announcement.priority === 'important' && (
                                            <span className="mt-0.5 flex-shrink-0 h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                                        )}
                                        <h3 className="text-sm font-semibold text-white">{announcement.title}</h3>
                                    </div>
                                    <p className="text-xs text-slate-500 leading-relaxed mb-3">{announcement.message}</p>
                                    <span className="text-[0.65rem] text-slate-600">{formatDate(announcement.date)}</span>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                {/* Footer */}
                <footer className="mt-12 flex items-center justify-between border-t border-slate-800 pt-4 text-[0.7rem] text-slate-600 sm:text-xs">
                    <span>© {new Date().getFullYear()} Procto. Built for secure online exams.</span>
                    <span className="hidden sm:inline">Designed for performance · Next.js · Tailwind CSS</span>
                </footer>
            </div>

            {/* Announcement Modal */}
            {showAnnouncementModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="relative w-full max-w-md mx-4">
                        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-cyan-500/20 via-violet-500/10 to-cyan-500/20 blur-xl" />
                        <div className="relative rounded-2xl border border-slate-700/80 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">New Announcement</h3>
                                    <p className="text-xs text-slate-500">Post an announcement to this classroom</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="annTitle" className="block text-sm font-medium text-slate-300 mb-1.5">Title</label>
                                    <input
                                        type="text"
                                        id="annTitle"
                                        value={announcementTitle}
                                        onChange={(e) => setAnnouncementTitle(e.target.value)}
                                        placeholder="e.g. Assignment deadline extended"
                                        className="w-full rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-all duration-300 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label htmlFor="annMessage" className="block text-sm font-medium text-slate-300 mb-1.5">Message</label>
                                    <textarea
                                        id="annMessage"
                                        value={announcementMessage}
                                        onChange={(e) => setAnnouncementMessage(e.target.value)}
                                        placeholder="Write the announcement details..."
                                        rows={3}
                                        className="w-full rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-all duration-300 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 resize-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1.5">Priority</label>
                                    <div className="flex gap-3">
                                        <button
                                            type="button"
                                            onClick={() => setAnnouncementPriority('normal')}
                                            className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-all duration-300 ${announcementPriority === 'normal'
                                                ? 'border-cyan-500/60 bg-cyan-500/10 text-cyan-400'
                                                : 'border-slate-700/60 bg-slate-900/60 text-slate-400 hover:border-slate-600'
                                                }`}
                                        >
                                            Normal
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setAnnouncementPriority('important')}
                                            className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-all duration-300 ${announcementPriority === 'important'
                                                ? 'border-amber-500/60 bg-amber-500/10 text-amber-400'
                                                : 'border-slate-700/60 bg-slate-900/60 text-slate-400 hover:border-slate-600'
                                                }`}
                                        >
                                            ⚡ Important
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => {
                                        setShowAnnouncementModal(false);
                                        setAnnouncementTitle('');
                                        setAnnouncementMessage('');
                                        setAnnouncementPriority('normal');
                                    }}
                                    className="flex-1 rounded-xl border border-slate-700/60 bg-slate-900/60 py-2.5 text-sm font-semibold text-slate-300 transition-all hover:bg-slate-800/60"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddAnnouncement}
                                    disabled={!announcementTitle.trim() || !announcementMessage.trim()}
                                    className="flex-1 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/30 transition-all hover:shadow-cyan-500/50 disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Post Announcement
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
