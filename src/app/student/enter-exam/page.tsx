'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';



export default function EnterExamPage() {
    const [user, setUser] = useState<Record<string, unknown> | null>(null);
    const [examCode, setExamCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        
        const getUser = async () => {
            const res = await fetch('/api/auth/me'); const data = await res.json(); const user = data.user;
            setUser(user);
        };
        getUser();
    }, []);

    const handleLogout = async () => {
        
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/');
        router.refresh();
    };

    const handleEnterExam = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!examCode.trim()) {
            setError('Please enter an exam code.');
            return;
        }

        setLoading(true);

        // Valid demo exam codes
        const validCodes = ['EXAM-2026'];
        const code = examCode.trim().toUpperCase();

        // Simulate network verification
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (validCodes.includes(code)) {
            router.push(`/student/exam-room/${code}`);
        } else {
            setError('Invalid exam code. Please check the code provided by your faculty and try again.');
            setLoading(false);
        }
    };

    const getInitials = () => {
        const u = user as Record<string, string> | null;
        if (u?.firstName && u?.lastName) return (u.firstName[0] + u.lastName[0]).toUpperCase();
        if (!u?.email) return 'ST';
        return u.email.substring(0, 2).toUpperCase();
    };

    const getDisplayName = () => {
        const u = user as Record<string, string> | null;
        if (u?.firstName) return `${u.firstName} ${u.lastName}`;
        if (!u?.email) return 'Student';
        return u.email.split('@')[0];
    };

    return (
        <main className="min-h-screen bg-neutral-950 text-white">
            {/* Emerald Glow Background */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
                <div className="absolute -right-32 bottom-20 h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-emerald-500/5 blur-3xl" />
            </div>

            {/* Carbon Fiber Pattern */}
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
                                {!!user?.email && (
                                    <div className="px-3 py-2 text-xs text-neutral-500 truncate border-t border-neutral-700/60 mt-1 pt-2">{String(user.email)}</div>
                                )}
                                <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 rounded-lg hover:bg-red-500/10 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
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
                            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to dashboard
                        </Link>

                        {/* Card */}
                        <div className="relative">
                            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-emerald-500/30 via-emerald-500/10 to-emerald-500/30 opacity-60 blur-xl" />
                            <div className="relative rounded-3xl border border-emerald-500/30 bg-neutral-900/90 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
                                {/* Header */}
                                <div className="text-center mb-8">
                                    <div className="mx-auto w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-5">
                                        <svg className="w-7 h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <h1 className="text-2xl font-bold text-white sm:text-3xl">Enter Exam Room</h1>
                                    <p className="mt-2 text-sm text-neutral-500">
                                        Enter the exam code shared by your faculty to join the examination session.
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
                                <form onSubmit={handleEnterExam} className="space-y-6">
                                    <div>
                                        <label htmlFor="examCode" className="block text-sm font-medium text-neutral-300 mb-2">
                                            Exam Code
                                        </label>
                                        <input
                                            type="text"
                                            id="examCode"
                                            value={examCode}
                                            onChange={(e) => setExamCode(e.target.value.toUpperCase())}
                                            placeholder="e.g. EXAM-2026"
                                            className="w-full rounded-xl border border-neutral-800 bg-neutral-950/60 px-4 py-3.5 text-white text-center font-mono text-lg tracking-widest placeholder-neutral-600 outline-none transition-all duration-300 focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20"
                                            autoComplete="off"
                                            autoFocus
                                        />
                                        <p className="mt-2 text-xs text-neutral-600">
                                            The code is case-insensitive and usually looks like EXAM-XXXX
                                        </p>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading || !examCode.trim()}
                                        className="w-full rounded-xl bg-emerald-500 py-3.5 text-base font-semibold text-black shadow-lg shadow-emerald-500/30 transition-all duration-300 hover:bg-emerald-400 hover:shadow-emerald-500/50 hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:bg-emerald-500"
                                    >
                                        {loading ? (
                                            <span className="inline-flex items-center gap-2">
                                                <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                </svg>
                                                Verifying Code...
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-2">
                                                Enter Exam Room
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                </svg>
                                            </span>
                                        )}
                                    </button>
                                </form>

                                {/* Info Box */}
                                <div className="mt-8 rounded-xl border border-neutral-800 bg-neutral-950/40 p-4">
                                    <div className="flex items-start gap-3">
                                        <svg className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <div>
                                            <h3 className="text-sm font-medium text-neutral-300 mb-1">Before you begin</h3>
                                            <ul className="text-xs text-neutral-500 space-y-1">
                                                <li className="flex items-center gap-1.5">
                                                    <span className="h-1 w-1 rounded-full bg-emerald-400/60" />
                                                    Ensure a stable internet connection
                                                </li>
                                                <li className="flex items-center gap-1.5">
                                                    <span className="h-1 w-1 rounded-full bg-emerald-400/60" />
                                                    Close all unnecessary tabs and applications
                                                </li>
                                                <li className="flex items-center gap-1.5">
                                                    <span className="h-1 w-1 rounded-full bg-emerald-400/60" />
                                                    Full-screen mode will be activated during the exam
                                                </li>
                                                <li className="flex items-center gap-1.5">
                                                    <span className="h-1 w-1 rounded-full bg-emerald-400/60" />
                                                    Do not switch tabs or windows during the exam
                                                </li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>

                                {/* Demo hint */}
                                <div className="mt-4 text-center">
                                    <p className="text-xs text-neutral-600">
                                        Demo exam code: <span className="font-mono text-emerald-400/70">EXAM-2026</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="mt-8 flex items-center justify-between border-t border-neutral-800 pt-4 text-[0.7rem] text-neutral-600 sm:text-xs">
                    <span>© {new Date().getFullYear()} Procto. Built for secure online exams.</span>
                    <span className="hidden sm:inline">Designed for performance · Next.js · Tailwind CSS</span>
                </footer>
            </div>
        </main>
    );
}
