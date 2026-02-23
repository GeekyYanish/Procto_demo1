// app/student/page.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export default function StudentPage() {
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
        if (!user?.email) return 'ST';
        const parts = user.email.split('@')[0].split('.');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return user.email.substring(0, 2).toUpperCase();
    };

    // Get display name
    const getDisplayName = () => {
        if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
        if (!user?.email) return 'Student';
        return user.email.split('@')[0].replace('.', ' ').replace(/\b\w/g, c => c.toUpperCase());
    };

    return (
        <main className="min-h-screen bg-neutral-950 text-white">
            {/* Emerald Glow Background */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
                <div className="absolute -right-32 bottom-20 h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-emerald-500/5 blur-3xl" />
            </div>

            {/* Carbon Fiber Pattern Overlay */}
            <div
                className="pointer-events-none fixed inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `repeating-linear-gradient(
                    45deg,
                    transparent,
                    transparent 2px,
                    rgba(255,255,255,0.03) 2px,
                    rgba(255,255,255,0.03) 4px
                )`,
                }}
            />

            {/* Main Container */}
            <div className="relative mx-auto flex min-h-screen w-full flex-col px-6 py-8 sm:px-8 lg:px-12 xl:px-20 xl:py-12">
                {/* Header */}
                <header className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 ring-1 ring-emerald-500/40 shadow-lg shadow-emerald-500/20">
                            <span className="text-lg font-semibold tracking-tight text-emerald-400">
                                P
                            </span>
                        </div>
                        <div className="flex flex-col leading-tight">
                            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-neutral-400">
                                Procto
                            </span>
                            <span className="text-xs text-neutral-600">
                                Student Portal
                            </span>
                        </div>
                    </Link>


                    {/* Profile Section */}
                    <div className="relative group">
                        <button className="flex items-center gap-3 rounded-full border border-neutral-700/60 bg-neutral-900/70 px-3 py-1.5 hover:border-emerald-400/40 transition-all duration-300">
                            {/* Avatar */}
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-semibold text-sm">
                                {getInitials()}
                            </div>
                            <div className="hidden sm:flex flex-col items-start leading-tight">
                                <span className="text-sm font-medium text-neutral-200">
                                    {getDisplayName()}
                                </span>
                                <span className="text-[0.65rem] text-neutral-500">
                                    Student
                                </span>
                            </div>
                            <svg
                                className="w-4 h-4 text-neutral-400 group-hover:text-emerald-400 transition-colors"
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
                            <div className="rounded-xl border border-neutral-700/60 bg-neutral-900/95 backdrop-blur-xl shadow-xl p-2">
                                <a
                                    href="#"
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-300 rounded-lg hover:bg-neutral-800/60 hover:text-emerald-400 transition-colors"
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
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-300 rounded-lg hover:bg-neutral-800/60 hover:text-emerald-400 transition-colors"
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
                                    <div className="px-3 py-2 text-xs text-neutral-500 truncate border-t border-neutral-700/60 mt-1 pt-2">
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
                        {/* Left: Text */}
                        <div className="flex w-full flex-1 flex-col justify-center">
                            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900/70 px-3 py-1 text-xs text-neutral-400 shadow-sm backdrop-blur">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                                High-Performance Exam Environment
                            </div>

                            <h1 className="mt-6 text-5xl font-bold tracking-tight text-white sm:text-6xl lg:text-7xl xl:text-8xl">
                                Focus.{' '}
                                <span className="text-emerald-400">Speed.</span>{' '}
                                <br className="hidden sm:block" />
                                Integrity.
                            </h1>

                            <p className="mt-5 max-w-xl text-base text-neutral-400 sm:text-lg lg:text-xl">
                                Join your exam session instantly. No
                                distractions, just performance. Your path to
                                success starts here.
                            </p>

                            {/* CTA */}
                            <div className="mt-8 flex flex-wrap items-center gap-4">
                                <Link href="/student/enter-exam" className="group inline-flex items-center justify-center rounded-full bg-emerald-500 px-8 py-3.5 text-base font-semibold text-black shadow-lg shadow-emerald-500/40 transition-all hover:bg-emerald-400 hover:shadow-emerald-500/60 hover:scale-105">
                                    Enter Exam Lobby
                                    <span className="ml-2 text-lg leading-none transition-transform group-hover:translate-x-1">
                                        →
                                    </span>
                                </Link>
                            </div>

                            {/* Mini Stats */}
                            <div className="mt-8 flex flex-wrap gap-6 text-xs text-neutral-500 sm:text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                    Mobile Ready
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                    Zero Setup Required
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                    Instant Results
                                </div>
                            </div>
                        </div>

                        {/* Right: Dashboard Preview Card */}
                        <div className="flex w-full flex-1 items-center justify-center">
                            <div className="relative w-full max-w-md lg:max-w-xl">
                                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-emerald-500/30 via-emerald-500/10 to-emerald-500/30 opacity-60 blur-xl" />
                                <div className="relative rounded-3xl border border-emerald-500/30 bg-neutral-900/90 p-6 shadow-2xl backdrop-blur-xl sm:p-7 lg:p-8">
                                    {/* Header */}
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="uppercase tracking-[0.16em] text-neutral-500">
                                            Student Hub
                                        </span>
                                        <span className="flex items-center gap-1.5 text-emerald-400">
                                            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)] animate-pulse" />
                                            Online
                                        </span>
                                    </div>

                                    {/* Quick Actions */}
                                    <div className="mt-5 space-y-3">
                                        {/* Join Classroom */}
                                        <Link href="/student/join-classroom" className="w-full flex items-center gap-4 rounded-xl border border-neutral-800 bg-neutral-950/60 p-4 hover:border-emerald-500/50 hover:bg-neutral-900/80 transition-all group">
                                            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                                                <svg
                                                    className="w-5 h-5 text-emerald-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                                                    />
                                                </svg>
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
                                                    Join Classroom
                                                </p>
                                                <p className="text-xs text-neutral-500">
                                                    Enter a class code to join
                                                </p>
                                            </div>
                                            <svg
                                                className="w-5 h-5 text-neutral-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all"
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

                                        {/* Join Quiz */}
                                        <Link href="/student/join-quiz" className="w-full flex items-center gap-4 rounded-xl border border-neutral-800 bg-neutral-950/60 p-4 hover:border-emerald-500/50 hover:bg-neutral-900/80 transition-all group">
                                            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                                                <svg
                                                    className="w-5 h-5 text-emerald-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                                    />
                                                </svg>
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
                                                    Join Quiz
                                                </p>
                                                <p className="text-xs text-neutral-500">
                                                    Enter quiz code to start
                                                </p>
                                            </div>
                                            <svg
                                                className="w-5 h-5 text-neutral-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all"
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

                                        {/* Manage Classroom */}
                                        <Link href="/student/manage-classrooms" className="w-full flex items-center gap-4 rounded-xl border border-neutral-800 bg-neutral-950/60 p-4 hover:border-emerald-500/50 hover:bg-neutral-900/80 transition-all group">
                                            <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                                                <svg
                                                    className="w-5 h-5 text-emerald-400"
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
                                            </div>
                                            <div className="flex-1 text-left">
                                                <p className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
                                                    Manage Classroom
                                                </p>
                                                <p className="text-xs text-neutral-500">
                                                    View enrolled classes
                                                </p>
                                            </div>
                                            <svg
                                                className="w-5 h-5 text-neutral-600 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all"
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
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Feature Grid Section */}
                <section className="mt-20 mb-12">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-white sm:text-4xl">
                            Built for{' '}
                            <span className="text-emerald-400">
                                Performance
                            </span>
                        </h2>
                        <p className="mt-3 text-neutral-500 max-w-2xl mx-auto">
                            Everything you need for a seamless, focused exam
                            experience.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
                        {/* Feature 1: Mobile Ready */}
                        <div className="group relative rounded-2xl border border-emerald-500/30 bg-neutral-900/60 p-6 backdrop-blur-sm hover:border-emerald-500/60 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative">
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
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
                                            d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">
                                    Mobile Ready
                                </h3>
                                <p className="text-sm text-neutral-500">
                                    Take exams on any device. Fully responsive
                                    interface optimized for phones, tablets, and
                                    desktops.
                                </p>
                            </div>
                        </div>

                        {/* Feature 2: Distraction-Free */}
                        <div className="group relative rounded-2xl border border-emerald-500/30 bg-neutral-900/60 p-6 backdrop-blur-sm hover:border-emerald-500/60 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative">
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
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
                                            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">
                                    Distraction-Free
                                </h3>
                                <p className="text-sm text-neutral-500">
                                    Full-screen focus mode enabled. No
                                    interruptions, no notifications—just you and
                                    your exam.
                                </p>
                            </div>
                        </div>

                        {/* Feature 3: Instant Results */}
                        <div className="group relative rounded-2xl border border-emerald-500/30 bg-neutral-900/60 p-6 backdrop-blur-sm hover:border-emerald-500/60 hover:shadow-lg hover:shadow-emerald-500/10 transition-all duration-300">
                            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative">
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-4 group-hover:bg-emerald-500/20 transition-colors">
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
                                            d="M13 10V3L4 14h7v7l9-11h-7z"
                                        />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-white mb-2">
                                    Instant Results
                                </h3>
                                <p className="text-sm text-neutral-500">
                                    Get your performance analytics immediately.
                                    Detailed breakdown of your scores and
                                    timing.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="mt-8 flex items-center justify-between border-t border-neutral-800 pt-4 text-[0.7rem] text-neutral-600 sm:text-xs">
                    <span>
                        © {new Date().getFullYear()} Procto. Built for secure
                        online exams.
                    </span>
                    <span className="hidden sm:inline">
                        Designed for performance · Next.js · Tailwind CSS
                    </span>
                </footer>
            </div>
        </main>
    );
}
