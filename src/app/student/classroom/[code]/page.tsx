'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

// Mock classroom data
const MOCK_CLASSROOMS: Record<string, {
    name: string;
    subject: string;
    faculty: string;
    facultyEmail: string;
    semester: string;
    studentsEnrolled: number;
    exams: { id: string; title: string; date: string; duration: string; status: 'upcoming' | 'live' | 'completed' }[];
    announcements: { id: string; title: string; message: string; date: string; priority: 'normal' | 'important' }[];
}> = {
    'PROCTO-1234': {
        name: 'Data Structures & Algorithms',
        subject: 'CS201',
        faculty: 'Dr. Sharma',
        facultyEmail: 'sharma@university.edu',
        semester: 'Spring 2026',
        studentsEnrolled: 48,
        exams: [
            { id: '1', title: 'Mid-Semester Exam', date: '2026-03-15T10:00:00', duration: '2 hours', status: 'upcoming' },
            { id: '2', title: 'Quiz 3 — Trees & Graphs', date: '2026-03-05T14:00:00', duration: '30 min', status: 'upcoming' },
            { id: '3', title: 'Quiz 2 — Sorting Algorithms', date: '2026-02-20T14:00:00', duration: '30 min', status: 'completed' },
        ],
        announcements: [
            { id: '1', title: 'Mid-sem syllabus released', message: 'The mid-semester exam will cover Units 1–4. Please revise linked lists, stacks, queues, trees, and graphs.', date: '2026-02-22T09:00:00', priority: 'important' },
            { id: '2', title: 'Lab session rescheduled', message: 'This week\'s lab session has been moved from Thursday to Friday 3:00 PM. Please plan accordingly.', date: '2026-02-20T11:30:00', priority: 'normal' },
            { id: '3', title: 'Assignment 3 deadline extended', message: 'The deadline for Assignment 3 (Binary Search Trees) has been extended to March 1st. Submit via the portal.', date: '2026-02-18T16:00:00', priority: 'normal' },
        ],
    },
};

export default function ClassroomPage() {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();
    const params = useParams();
    const code = (params.code as string)?.toUpperCase();

    const classroom = MOCK_CLASSROOMS[code];

    useEffect(() => {
        const supabase = createClient();
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();
    }, []);

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    const getInitials = () => {
        if (!user?.email) return 'ST';
        const parts = user.email.split('@')[0].split('.');
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
        return user.email.substring(0, 2).toUpperCase();
    };

    const getDisplayName = () => {
        if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
        if (!user?.email) return 'Student';
        return user.email.split('@')[0].replace('.', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    // If classroom not found
    if (!classroom) {
        return (
            <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
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
                    <p className="text-neutral-500 mb-6">The class code <span className="font-mono text-red-400">{code}</span> doesn&apos;t match any classroom.</p>
                    <Link
                        href="/student/join-classroom"
                        className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-black hover:bg-emerald-400 transition-colors"
                    >
                        ← Try Another Code
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-neutral-950 text-white">
            {/* Background */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
                <div className="absolute -right-32 bottom-20 h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl" />
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
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 ring-1 ring-emerald-500/40 shadow-lg shadow-emerald-500/20">
                            <span className="text-lg font-semibold tracking-tight text-emerald-400">P</span>
                        </div>
                        <div className="flex flex-col leading-tight">
                            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-400">Procto</span>
                            <span className="text-xs text-neutral-600">Student Portal</span>
                        </div>
                    </Link>

                    {/* Profile */}
                    <div className="relative group">
                        <button className="flex items-center gap-3 rounded-full border border-neutral-700/60 bg-neutral-900/70 px-3 py-1.5 hover:border-emerald-400/40 transition-all duration-300">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-semibold text-sm">
                                {getInitials()}
                            </div>
                            <div className="hidden sm:flex flex-col items-start leading-tight">
                                <span className="text-sm font-medium text-neutral-200">{getDisplayName()}</span>
                                <span className="text-[0.65rem] text-neutral-500">Student</span>
                            </div>
                            <svg className="w-4 h-4 text-neutral-400 group-hover:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>
                        <div className="absolute right-0 mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                            <div className="rounded-xl border border-neutral-700/60 bg-neutral-900/95 backdrop-blur-xl shadow-xl p-2">
                                <a href="#" className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-300 rounded-lg hover:bg-neutral-800/60 hover:text-emerald-400 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    My Profile
                                </a>
                                {user?.email && (
                                    <div className="px-3 py-2 text-xs text-neutral-500 truncate border-t border-neutral-700/60 mt-1 pt-2">{user.email}</div>
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
                    href="/student"
                    className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-emerald-400 transition-colors mt-8 group w-fit"
                >
                    <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to dashboard
                </Link>

                {/* Classroom Header */}
                <section className="mt-6">
                    <div className="relative">
                        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-emerald-500/20 via-transparent to-emerald-500/20 opacity-60 blur-xl" />
                        <div className="relative rounded-3xl border border-emerald-500/30 bg-neutral-900/90 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                            {classroom.subject}
                                        </span>
                                        <span className="inline-flex items-center rounded-full border border-neutral-700/60 bg-neutral-800/60 px-3 py-1 text-xs font-mono text-neutral-400">
                                            {code}
                                        </span>
                                    </div>
                                    <h1 className="text-2xl sm:text-3xl font-bold text-white">{classroom.name}</h1>
                                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-neutral-400">
                                        <span className="flex items-center gap-1.5">
                                            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                            {classroom.faculty}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            {classroom.semester}
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                            {classroom.studentsEnrolled} students
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Content Grid */}
                <section className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
                    {/* Exams — takes 2 columns */}
                    <div className="lg:col-span-2 space-y-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                            Exams & Quizzes
                        </h2>

                        {classroom.exams.map((exam) => (
                            <div
                                key={exam.id}
                                className={`relative rounded-2xl border bg-neutral-900/60 p-5 backdrop-blur-sm transition-all duration-300 hover:shadow-lg ${exam.status === 'upcoming'
                                        ? 'border-emerald-500/30 hover:border-emerald-500/50 hover:shadow-emerald-500/10'
                                        : 'border-neutral-800 hover:border-neutral-700'
                                    }`}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="text-base font-semibold text-white">{exam.title}</h3>
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wider ${exam.status === 'upcoming'
                                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                                    : exam.status === 'live'
                                                        ? 'bg-red-500/10 text-red-400 border border-red-500/30'
                                                        : 'bg-neutral-800 text-neutral-500 border border-neutral-700'
                                                }`}>
                                                {exam.status}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-500">
                                            <span className="flex items-center gap-1">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                {formatDate(exam.date)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                {formatTime(exam.date)} · {exam.duration}
                                            </span>
                                        </div>
                                    </div>

                                    {exam.status === 'upcoming' && (
                                        <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-black shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 hover:shadow-emerald-500/40 hover:scale-105">
                                            Join Exam
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
                                        </button>
                                    )}
                                    {exam.status === 'completed' && (
                                        <button className="inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-700 bg-neutral-800/60 px-5 py-2.5 text-sm font-medium text-neutral-400 transition-all hover:border-neutral-600 hover:text-neutral-300">
                                            View Results
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Announcements — 1 column */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" /></svg>
                            Announcements
                        </h2>

                        {classroom.announcements.map((announcement) => (
                            <div
                                key={announcement.id}
                                className={`rounded-2xl border bg-neutral-900/60 p-5 backdrop-blur-sm transition-all duration-300 hover:shadow-lg ${announcement.priority === 'important'
                                        ? 'border-amber-500/30 hover:border-amber-500/50 hover:shadow-amber-500/10'
                                        : 'border-neutral-800 hover:border-neutral-700'
                                    }`}
                            >
                                <div className="flex items-start gap-2 mb-2">
                                    {announcement.priority === 'important' && (
                                        <span className="mt-0.5 flex-shrink-0 h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                                    )}
                                    <h3 className="text-sm font-semibold text-white">{announcement.title}</h3>
                                </div>
                                <p className="text-xs text-neutral-500 leading-relaxed mb-3">{announcement.message}</p>
                                <span className="text-[0.65rem] text-neutral-600">{formatDate(announcement.date)}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Footer */}
                <footer className="mt-12 flex items-center justify-between border-t border-neutral-800 pt-4 text-[0.7rem] text-neutral-600 sm:text-xs">
                    <span>© {new Date().getFullYear()} Procto. Built for secure online exams.</span>
                    <span className="hidden sm:inline">Designed for performance · Next.js · Tailwind CSS</span>
                </footer>
            </div>
        </main>
    );
}
