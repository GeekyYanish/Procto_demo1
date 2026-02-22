'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

// Mock enrolled classrooms data
const INITIAL_CLASSROOMS = [
    {
        code: 'PROCTO-1234',
        name: 'Data Structures & Algorithms',
        subject: 'CS201',
        faculty: 'Dr. Sharma',
        semester: 'Spring 2026',
        studentsEnrolled: 48,
        upcomingExams: 2,
        color: 'emerald' as const,
    },
    {
        code: 'PROCTO-5678',
        name: 'Database Management Systems',
        subject: 'CS301',
        faculty: 'Prof. Mehta',
        semester: 'Spring 2026',
        studentsEnrolled: 35,
        upcomingExams: 1,
        color: 'cyan' as const,
    },
    {
        code: 'PROCTO-9012',
        name: 'Operating Systems',
        subject: 'CS202',
        faculty: 'Dr. Patel',
        semester: 'Spring 2026',
        studentsEnrolled: 52,
        upcomingExams: 0,
        color: 'violet' as const,
    },
];

const colorMap = {
    emerald: {
        border: 'border-emerald-500/30',
        hoverBorder: 'hover:border-emerald-500/60',
        shadow: 'hover:shadow-emerald-500/10',
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        dot: 'bg-emerald-400',
        badge: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
    },
    cyan: {
        border: 'border-cyan-500/30',
        hoverBorder: 'hover:border-cyan-500/60',
        shadow: 'hover:shadow-cyan-500/10',
        bg: 'bg-cyan-500/10',
        text: 'text-cyan-400',
        dot: 'bg-cyan-400',
        badge: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400',
    },
    violet: {
        border: 'border-violet-500/30',
        hoverBorder: 'hover:border-violet-500/60',
        shadow: 'hover:shadow-violet-500/10',
        bg: 'bg-violet-500/10',
        text: 'text-violet-400',
        dot: 'bg-violet-400',
        badge: 'border-violet-500/40 bg-violet-500/10 text-violet-400',
    },
};

export default function ManageClassroomsPage() {
    const [user, setUser] = useState<User | null>(null);
    const [classrooms, setClassrooms] = useState(INITIAL_CLASSROOMS);
    const [confirmLeave, setConfirmLeave] = useState<string | null>(null);
    const router = useRouter();

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

    const handleLeave = (code: string) => {
        setClassrooms((prev) => prev.filter((c) => c.code !== code));
        setConfirmLeave(null);
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

                {/* Back Link + Title */}
                <div className="mt-8">
                    <Link
                        href="/student"
                        className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-emerald-400 transition-colors group"
                    >
                        <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to dashboard
                    </Link>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-white">My Classrooms</h1>
                            <p className="mt-1 text-sm text-neutral-500">
                                {classrooms.length} {classrooms.length === 1 ? 'classroom' : 'classrooms'} enrolled
                            </p>
                        </div>
                        <Link
                            href="/student/join-classroom"
                            className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-black shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 hover:shadow-emerald-500/40 hover:scale-105 w-fit"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                            </svg>
                            Join a Classroom
                        </Link>
                    </div>
                </div>

                {/* Classrooms Grid */}
                {classrooms.length > 0 ? (
                    <section className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-5 flex-1">
                        {classrooms.map((cls) => {
                            const c = colorMap[cls.color];
                            return (
                                <div key={cls.code} className="relative group">
                                    {/* Leave Confirmation Overlay */}
                                    {confirmLeave === cls.code && (
                                        <div className="absolute inset-0 z-10 rounded-2xl bg-neutral-950/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4 p-6">
                                            <p className="text-sm text-neutral-300 text-center">
                                                Leave <span className="font-semibold text-white">{cls.name}</span>?
                                            </p>
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => handleLeave(cls.code)}
                                                    className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-400 transition-colors"
                                                >
                                                    Yes, Leave
                                                </button>
                                                <button
                                                    onClick={() => setConfirmLeave(null)}
                                                    className="rounded-lg border border-neutral-700 bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-300 hover:bg-neutral-700 transition-colors"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    <div className={`rounded-2xl border ${c.border} ${c.hoverBorder} bg-neutral-900/60 p-6 backdrop-blur-sm transition-all duration-300 hover:shadow-lg ${c.shadow} h-full flex flex-col`}>
                                        {/* Top row: badges */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${c.badge}`}>
                                                    <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
                                                    {cls.subject}
                                                </span>
                                                <span className="inline-flex items-center rounded-full border border-neutral-700/60 bg-neutral-800/60 px-2.5 py-0.5 text-[0.65rem] font-mono text-neutral-500">
                                                    {cls.code}
                                                </span>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setConfirmLeave(cls.code);
                                                }}
                                                className="p-1.5 rounded-lg text-neutral-600 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                                                title="Leave classroom"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                </svg>
                                            </button>
                                        </div>

                                        {/* Class name */}
                                        <h3 className="text-lg font-semibold text-white mb-1">{cls.name}</h3>

                                        {/* Faculty */}
                                        <p className="text-sm text-neutral-500 flex items-center gap-1.5 mb-4">
                                            <svg className={`w-3.5 h-3.5 ${c.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            {cls.faculty} · {cls.semester}
                                        </p>

                                        {/* Stats row */}
                                        <div className="flex items-center gap-5 text-xs text-neutral-500 mb-5 mt-auto">
                                            <span className="flex items-center gap-1.5">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                {cls.studentsEnrolled} students
                                            </span>
                                            <span className="flex items-center gap-1.5">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                                {cls.upcomingExams} upcoming {cls.upcomingExams === 1 ? 'exam' : 'exams'}
                                            </span>
                                        </div>

                                        {/* Navigate button */}
                                        <Link
                                            href={`/student/classroom/${cls.code}`}
                                            className={`inline-flex items-center justify-center gap-2 rounded-xl border ${c.border} ${c.bg} px-4 py-2.5 text-sm font-medium ${c.text} transition-all hover:brightness-125 w-full`}
                                        >
                                            Open Classroom
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </section>
                ) : (
                    /* Empty State */
                    <section className="flex flex-1 items-center justify-center mt-12">
                        <div className="text-center max-w-md">
                            <div className="mx-auto w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-semibold text-white mb-2">No Classrooms Yet</h2>
                            <p className="text-sm text-neutral-500 mb-6">
                                Join your first classroom to get started with exams and assessments.
                            </p>
                            <Link
                                href="/student/join-classroom"
                                className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-black shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 hover:shadow-emerald-500/40 hover:scale-105"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Join a Classroom
                            </Link>
                        </div>
                    </section>
                )}

                {/* Footer */}
                <footer className="mt-12 flex items-center justify-between border-t border-neutral-800 pt-4 text-[0.7rem] text-neutral-600 sm:text-xs">
                    <span>© {new Date().getFullYear()} Procto. Built for secure online exams.</span>
                    <span className="hidden sm:inline">Designed for performance · Next.js · Tailwind CSS</span>
                </footer>
            </div>
        </main>
    );
}
