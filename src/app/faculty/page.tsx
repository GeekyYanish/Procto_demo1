// app/faculty/page.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export default function FacultyPage() {
    const [user, setUser] = useState<User | null>(null);
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

    // Get user initials for avatar
    const getInitials = () => {
        if (!user?.email) return 'FC';
        const parts = user.email.split('@')[0].split('.');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return user.email.substring(0, 2).toUpperCase();
    };

    // Get display name
    const getDisplayName = () => {
        if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
        if (!user?.email) return 'Faculty';
        return user.email.split('@')[0].replace('.', ' ').replace(/\b\w/g, c => c.toUpperCase());
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
            {/* Glow background */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -left-40 top-0 h-80 w-80 rounded-full bg-violet-500/30 blur-3xl" />
                <div className="absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-cyan-500/25 blur-3xl" />
            </div>

            {/* Outer container */}
            <div className="relative mx-auto flex min-h-screen w-full flex-col px-6 py-8 sm:px-8 lg:px-12 xl:px-20 xl:py-12">
                {/* Top bar */}
                <header className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900/70 ring-1 ring-cyan-400/40 shadow-lg shadow-cyan-500/30">
                            <span className="text-lg font-semibold tracking-tight text-cyan-300">
                                P
                            </span>
                        </div>
                        <div className="flex flex-col leading-tight">
                            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">
                                Procto
                            </span>
                            <span className="text-xs text-slate-500">
                                Intelligent exam proctoring
                            </span>
                        </div>
                    </Link>

                    {/* Profile Section */}
                    <div className="relative group">
                        <button className="flex items-center gap-3 rounded-full border border-slate-700/60 bg-slate-900/70 px-3 py-1.5 hover:border-cyan-400/40 transition-all duration-300">
                            {/* Avatar */}
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white font-semibold text-sm">
                                {getInitials()}
                            </div>
                            <div className="hidden sm:flex flex-col items-start leading-tight">
                                <span className="text-sm font-medium text-slate-200">
                                    {getDisplayName()}
                                </span>
                                <span className="text-[0.65rem] text-slate-500">
                                    Faculty
                                </span>
                            </div>
                            <svg
                                className="w-4 h-4 text-slate-400 group-hover:text-cyan-400 transition-colors"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </button>

                        {/* Dropdown Menu */}
                        <div className="absolute right-0 mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                            <div className="rounded-xl border border-slate-700/60 bg-slate-900/95 backdrop-blur-xl shadow-xl p-2">
                                <a
                                    href="#"
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 rounded-lg hover:bg-slate-800/60 hover:text-cyan-300 transition-colors"
                                >
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                        />
                                    </svg>
                                    My Profile
                                </a>
                                <a
                                    href="#"
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 rounded-lg hover:bg-slate-800/60 hover:text-cyan-300 transition-colors"
                                >
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                    </svg>
                                    Settings
                                </a>
                                {user?.email && (
                                    <div className="px-3 py-2 text-xs text-slate-500 truncate border-t border-slate-700/60 mt-1 pt-2">
                                        {user.email}
                                    </div>
                                )}
                                <button
                                    onClick={handleLogout}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
                                >
                                    <svg
                                        className="w-4 h-4"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                                        />
                                    </svg>
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Hero Section */}
                <section className="mt-12 flex flex-1 items-center justify-center lg:mt-16 xl:mt-20">
                    <div className="flex w-full max-w-6xl flex-col gap-12 lg:flex-row lg:items-center">
                        {/* Left: text */}
                        <div className="flex w-full flex-1 flex-col justify-center">
                            <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-xs text-slate-300 shadow-sm shadow-violet-500/30 backdrop-blur">
                                <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                                Designed for Educators & Administrators
                            </div>

                            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl lg:text-6xl xl:text-7xl">
                                Administer{' '}
                                <span className="bg-gradient-to-r from-violet-300 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                                    Secure Exams
                                </span>{' '}
                                with Confidence.
                            </h1>

                            <p className="mt-5 max-w-2xl text-base text-slate-300 sm:text-lg lg:text-xl">
                                Create exams in minutes and monitor integrity
                                with AI-powered insights. Get real-time alerts,
                                detailed reports, and complete control over your
                                assessments.
                            </p>

                            {/* CTAs */}
                            <div className="mt-6 flex flex-wrap items-center gap-3">
                                <button className="group inline-flex items-center justify-center rounded-full bg-violet-500 px-6 py-2.5 text-sm font-medium text-white shadow-lg shadow-violet-500/40 transition hover:bg-violet-400">
                                    Create Quiz
                                </button>

                            </div>

                            {/* Small feature list */}
                            <div className="mt-5 flex flex-wrap gap-4 text-xs text-slate-400 sm:text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                                    AI-powered monitoring
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                                    Instant violation alerts
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                    Comprehensive reports
                                </div>
                            </div>
                        </div>

                        {/* Right: Action Buttons */}
                        <div className="flex w-full flex-1 items-center justify-center">
                            <div className="relative w-full max-w-md lg:max-w-xl xl:max-w-2xl">
                                <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-tr from-violet-500/40 via-purple-500/30 to-cyan-500/40 opacity-60 blur-xl" />
                                <div className="relative rounded-3xl border border-slate-700/80 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl sm:p-7 lg:p-8">
                                    <div className="text-center mb-6">
                                        <h3 className="text-xl font-semibold text-slate-100 mb-2">
                                            Faculty Dashboard
                                        </h3>
                                        <p className="text-sm text-slate-400">
                                            Manage your classrooms and
                                            assessments
                                        </p>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-col gap-4">
                                        {/* Create new Classroom Button */}
                                        <Link href="/faculty/create-classroom" className="group relative w-full flex items-center gap-4 rounded-xl border border-slate-700/60 bg-slate-900/60 p-4 hover:border-cyan-400/50 hover:bg-slate-800/60 transition-all duration-300">
                                            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center group-hover:bg-cyan-500/30 transition-colors">
                                                <svg
                                                    className="w-6 h-6 text-cyan-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                                    />
                                                </svg>
                                            </div>
                                            <div className="flex-1 text-left">
                                                <h4 className="text-base font-semibold text-slate-100">
                                                    Create Classroom
                                                </h4>
                                                <p className="text-xs text-slate-400">
                                                    Set up a new classroom for
                                                    your course
                                                </p>
                                            </div>
                                            <svg
                                                className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 5l7 7-7 7"
                                                />
                                            </svg>
                                        </Link>

                                        {/* Manage Classroom Button */}
                                        <button className="group relative w-full flex items-center gap-4 rounded-xl border border-slate-700/60 bg-slate-900/60 p-4 hover:border-violet-400/50 hover:bg-slate-800/60 transition-all duration-300">
                                            <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center group-hover:bg-violet-500/30 transition-colors">
                                                <svg
                                                    className="w-6 h-6 text-violet-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                                                    />
                                                </svg>
                                            </div>
                                            <div className="flex-1 text-left">
                                                <h4 className="text-base font-semibold text-slate-100">
                                                    Manage Classroom
                                                </h4>
                                                <p className="text-xs text-slate-400">
                                                    View and edit your existing
                                                    classrooms
                                                </p>
                                            </div>
                                            <svg
                                                className="w-5 h-5 text-slate-500 group-hover:text-violet-400 group-hover:translate-x-1 transition-all"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 5l7 7-7 7"
                                                />
                                            </svg>
                                        </button>



                                        {/* Reports Button */}
                                        <button className="group relative w-full flex items-center gap-4 rounded-xl border border-slate-700/60 bg-slate-900/60 p-4 hover:border-emerald-400/50 hover:bg-slate-800/60 transition-all duration-300">
                                            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center group-hover:bg-emerald-500/30 transition-colors">
                                                <svg
                                                    className="w-6 h-6 text-emerald-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                    />
                                                </svg>
                                            </div>
                                            <div className="flex-1 text-left">
                                                <h4 className="text-base font-semibold text-slate-100">
                                                    Reports
                                                </h4>
                                                <p className="text-xs text-slate-400">
                                                    View analytics and exam
                                                    reports
                                                </p>
                                            </div>
                                            <svg
                                                className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M9 5l7 7-7 7"
                                                />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Grid Section */}
                <section className="mt-20 mb-12">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-semibold text-slate-50 sm:text-4xl">
                            Why Faculty{' '}
                            <span className="bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">
                                Love Procto
                            </span>
                        </h2>
                        <p className="mt-3 text-slate-400 max-w-2xl mx-auto">
                            Everything you need to conduct secure, fair, and
                            efficient online assessments.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {/* Feature 1: Effortless Setup */}
                        <div className="group relative rounded-2xl border border-slate-700/60 bg-slate-900/60 p-6 backdrop-blur-sm hover:border-violet-400/50 transition-all duration-300">
                            <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-violet-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
                            <div className="relative">
                                <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center mb-4">
                                    <svg
                                        className="w-6 h-6 text-violet-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M13 10V3L4 14h7v7l9-11h-7z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-slate-100 mb-2">
                                    Effortless Setup
                                </h3>
                                <p className="text-sm text-slate-400">
                                    One-click exam generation. Create proctored
                                    assessments in under 60 seconds with our
                                    intuitive interface.
                                </p>
                            </div>
                        </div>

                        {/* Feature 2: Live Proctoring */}
                        <div className="group relative rounded-2xl border border-slate-700/60 bg-slate-900/60 p-6 backdrop-blur-sm hover:border-cyan-400/50 transition-all duration-300">
                            <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
                            <div className="relative">
                                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-4">
                                    <svg
                                        className="w-6 h-6 text-cyan-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                        />
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-slate-100 mb-2">
                                    Live Proctoring
                                </h3>
                                <p className="text-sm text-slate-400">
                                    Real-time violation alerts. AI monitors
                                    camera, audio, and screen for suspicious
                                    behavior instantly.
                                </p>
                            </div>
                        </div>

                        {/* Feature 3: Detailed Reports */}
                        <div className="group relative rounded-2xl border border-slate-700/60 bg-slate-900/60 p-6 backdrop-blur-sm hover:border-emerald-400/50 transition-all duration-300">
                            <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
                            <div className="relative">
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4">
                                    <svg
                                        className="w-6 h-6 text-emerald-400"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-slate-100 mb-2">
                                    Detailed Reports
                                </h3>
                                <p className="text-sm text-slate-400">
                                    Instant evidence logs & grading. Download
                                    comprehensive integrity reports with
                                    timestamped incidents.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="mt-8 flex items-center justify-between border-t border-slate-800/80 pt-4 text-[0.7rem] text-slate-500 sm:text-xs">
                    <span>
                        © {new Date().getFullYear()} Procto. Built for secure
                        online exams.
                    </span>
                    <span className="hidden sm:inline">
                        Designed for modern browsers · Next.js · Tailwind CSS
                    </span>
                </footer>
            </div>
        </main>
    );
}
