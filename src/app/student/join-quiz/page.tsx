// app/student/join-quiz/page.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

// ── Types (mirrored from create-quiz) ──
interface MCQQuestion {
    id: string;
    type: 'mcq';
    questionText: string;
    options: [string, string, string, string];
    correctOption: number;
}

interface DescriptiveQuestion {
    id: string;
    type: 'descriptive';
    questionText: string;
    maxWords?: number;
}

type Question = MCQQuestion | DescriptiveQuestion;

interface Quiz {
    id: string;
    code: string;
    title: string;
    description?: string;
    timeLimit: number;
    questions: Question[];
    createdAt: string;
    createdBy?: string;
}

export default function JoinQuizPage() {
    const [user, setUser] = useState<User | null>(null);
    const [quizCode, setQuizCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [foundQuiz, setFoundQuiz] = useState<Quiz | null>(null);
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

    // ── Helpers ──
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

    // ── Join handler ──
    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setFoundQuiz(null);

        const code = quizCode.trim().toUpperCase();
        if (!code) {
            setError('Please enter a quiz code.');
            return;
        }

        setLoading(true);

        // Simulate brief network delay
        await new Promise((r) => setTimeout(r, 600));

        // Look up quiz in localStorage
        const quizzes: Quiz[] = JSON.parse(localStorage.getItem('procto_quizzes') || '[]');
        const match = quizzes.find((q) => q.code.toUpperCase() === code);

        if (match) {
            setFoundQuiz(match);
        } else {
            setError('Invalid quiz code. Please check with your faculty and try again.');
        }

        setLoading(false);
    };

    const handleReset = () => {
        setQuizCode('');
        setFoundQuiz(null);
        setError('');
    };

    // ── Derived counts ──
    const mcqCount = foundQuiz?.questions.filter((q) => q.type === 'mcq').length ?? 0;
    const descCount = foundQuiz?.questions.filter((q) => q.type === 'descriptive').length ?? 0;

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
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* Dropdown Menu */}
                        <div className="absolute right-0 mt-2 w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                            <div className="rounded-xl border border-neutral-700/60 bg-neutral-900/95 backdrop-blur-xl shadow-xl p-2">
                                <a href="#" className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-300 rounded-lg hover:bg-neutral-800/60 hover:text-emerald-400 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    My Profile
                                </a>
                                <a href="#" className="flex items-center gap-2 px-3 py-2 text-sm text-neutral-300 rounded-lg hover:bg-neutral-800/60 hover:text-emerald-400 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <section className="flex flex-1 items-start justify-center pt-2 lg:pt-6">
                    <div className="w-full max-w-lg">
                        {/* Back Link */}
                        <Link
                            href="/student"
                            className="inline-flex items-center gap-2 text-sm text-neutral-500 hover:text-emerald-400 transition-colors mb-8 group"
                        >
                            <svg
                                className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to dashboard
                        </Link>

                        {/* Card */}
                        <div className="relative">
                            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-emerald-500/30 via-emerald-500/10 to-emerald-500/30 opacity-60 blur-xl" />
                            <div className="relative rounded-3xl border border-emerald-500/30 bg-neutral-900/90 p-8 shadow-2xl backdrop-blur-xl sm:p-10">

                                {/* ── QUIZ FOUND VIEW ── */}
                                {foundQuiz ? (
                                    <div className="flex flex-col items-center text-center">
                                        {/* Animated check icon */}
                                        <div className="relative mb-6">
                                            <div className="absolute -inset-3 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
                                            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shadow-lg shadow-emerald-500/40">
                                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        </div>

                                        <h2 className="text-2xl font-bold text-white sm:text-3xl">
                                            Quiz{' '}
                                            <span className="bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
                                                Found!
                                            </span>
                                        </h2>
                                        <p className="mt-2 text-sm text-neutral-400 max-w-sm">
                                            Review the details below before starting.
                                        </p>

                                        {/* Quiz Code Badge */}
                                        <div className="mt-6 w-full max-w-xs">
                                            <p className="text-xs font-medium text-neutral-500 uppercase tracking-wider mb-2">
                                                Quiz Code
                                            </p>
                                            <div className="rounded-xl border border-emerald-500/40 bg-neutral-950/70 px-6 py-3">
                                                <span className="font-mono text-xl font-bold tracking-[0.2em] bg-gradient-to-r from-emerald-300 to-teal-300 bg-clip-text text-transparent">
                                                    {foundQuiz.code}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Quiz Details */}
                                        <div className="mt-6 w-full rounded-xl border border-neutral-700/60 bg-neutral-950/50 p-5 text-left space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-neutral-500">Title</span>
                                                <span className="text-white font-medium text-right max-w-[60%]">{foundQuiz.title}</span>
                                            </div>
                                            {foundQuiz.description && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-neutral-500">Description</span>
                                                    <span className="text-neutral-300 text-right max-w-[60%]">{foundQuiz.description}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between text-sm">
                                                <span className="text-neutral-500">Time Limit</span>
                                                <span className="text-white font-medium">
                                                    <span className="inline-flex items-center gap-1.5">
                                                        <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        {foundQuiz.timeLimit} min
                                                    </span>
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-neutral-500">Total Questions</span>
                                                <span className="text-white font-medium">{foundQuiz.questions.length}</span>
                                            </div>
                                            {mcqCount > 0 && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-neutral-500">MCQ</span>
                                                    <span className="text-emerald-300 font-medium">{mcqCount}</span>
                                                </div>
                                            )}
                                            {descCount > 0 && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-neutral-500">Descriptive</span>
                                                    <span className="text-teal-300 font-medium">{descCount}</span>
                                                </div>
                                            )}
                                            {foundQuiz.createdBy && (
                                                <div className="flex justify-between text-sm border-t border-neutral-700/40 pt-3">
                                                    <span className="text-neutral-500">Created By</span>
                                                    <span className="text-neutral-300 font-medium">{foundQuiz.createdBy}</span>
                                                </div>
                                            )}
                                            <div className="flex justify-between text-sm border-t border-neutral-700/40 pt-3">
                                                <span className="text-neutral-500">Created</span>
                                                <span className="text-neutral-400 text-xs">
                                                    {new Date(foundQuiz.createdAt).toLocaleDateString('en-IN', {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        year: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit',
                                                    })}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full">
                                            <button
                                                type="button"
                                                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-3.5 text-base font-semibold text-black shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:bg-emerald-400 hover:shadow-emerald-500/50 hover:scale-[1.02] cursor-not-allowed opacity-80"
                                                title="Quiz room coming soon"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                Start Quiz
                                            </button>
                                            <button
                                                type="button"
                                                onClick={handleReset}
                                                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-neutral-700/60 bg-neutral-900/60 py-3.5 text-base font-semibold text-neutral-300 transition-all duration-300 hover:border-emerald-400/50 hover:text-emerald-300 hover:bg-neutral-800/60"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                                </svg>
                                                Enter Different Code
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* ── CODE ENTRY VIEW ── */
                                    <>
                                        {/* Header */}
                                        <div className="text-center mb-8">
                                            <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-5">
                                                <svg
                                                    className="w-7 h-7 text-emerald-400"
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
                                            <h1 className="text-2xl font-bold text-white sm:text-3xl">
                                                Join a Quiz
                                            </h1>
                                            <p className="mt-2 text-sm text-neutral-500">
                                                Enter the quiz code shared by your faculty to join their quiz session.
                                            </p>
                                        </div>

                                        {/* Error Message */}
                                        {error && (
                                            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 flex items-center gap-2">
                                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {error}
                                            </div>
                                        )}

                                        {/* Form */}
                                        <form onSubmit={handleJoin} className="space-y-6">
                                            <div>
                                                <label
                                                    htmlFor="quizCode"
                                                    className="block text-sm font-medium text-neutral-300 mb-2"
                                                >
                                                    Quiz Code
                                                </label>
                                                <input
                                                    type="text"
                                                    id="quizCode"
                                                    value={quizCode}
                                                    onChange={(e) => setQuizCode(e.target.value.toUpperCase())}
                                                    placeholder="e.g. QUIZ-A1B2"
                                                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-3.5 text-white text-center font-mono text-lg tracking-widest placeholder-neutral-600 outline-none transition-all duration-300 focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20"
                                                    autoComplete="off"
                                                    autoFocus
                                                />
                                                <p className="mt-2 text-xs text-neutral-600">
                                                    The code is case-insensitive and usually looks like QUIZ-XXXX
                                                </p>
                                            </div>

                                            <button
                                                type="submit"
                                                disabled={loading || !quizCode.trim()}
                                                className="w-full rounded-xl bg-emerald-500 py-3.5 text-base font-semibold text-black shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:bg-emerald-400 hover:shadow-emerald-500/50 hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-emerald-500"
                                            >
                                                {loading ? (
                                                    <span className="inline-flex items-center gap-2">
                                                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                        </svg>
                                                        Finding Quiz...
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-2">
                                                        Join Quiz
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                        </svg>
                                                    </span>
                                                )}
                                            </button>
                                        </form>

                                        {/* Divider */}
                                        <div className="relative my-8">
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="w-full border-t border-neutral-800" />
                                            </div>
                                            <div className="relative flex justify-center text-xs">
                                                <span className="bg-neutral-900 px-3 text-neutral-600">
                                                    how it works
                                                </span>
                                            </div>
                                        </div>

                                        {/* Info Steps */}
                                        <div className="space-y-3">
                                            {[
                                                { step: '1', text: 'Get the quiz code from your faculty' },
                                                { step: '2', text: 'Enter the code above and click Join' },
                                                { step: '3', text: 'Review quiz details and start when ready' },
                                            ].map((item) => (
                                                <div key={item.step} className="flex items-center gap-3 text-sm text-neutral-500">
                                                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400">
                                                        {item.step}
                                                    </span>
                                                    {item.text}
                                                </div>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="mt-8 flex items-center justify-between border-t border-neutral-800 pt-4 text-[0.7rem] text-neutral-600 sm:text-xs">
                    <span>
                        © {new Date().getFullYear()} Procto. Built for secure online exams.
                    </span>
                    <span className="hidden sm:inline">
                        Designed for performance · Next.js · Tailwind CSS
                    </span>
                </footer>
            </div>
        </main>
    );
}
