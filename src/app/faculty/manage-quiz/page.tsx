// app/faculty/manage-quiz/page.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

// ── Types (mirrors create-quiz) ──
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

// Accent colours for visual variety
const accentColors = ['violet', 'cyan', 'emerald', 'amber'] as const;
type Accent = (typeof accentColors)[number];

const colorMap: Record<
    Accent,
    {
        border: string;
        hoverBorder: string;
        bg: string;
        text: string;
        dot: string;
        badge: string;
        iconBg: string;
        shadow: string;
    }
> = {
    violet: {
        border: 'border-violet-500/30',
        hoverBorder: 'hover:border-violet-500/60',
        bg: 'bg-violet-500/10',
        text: 'text-violet-400',
        dot: 'bg-violet-400',
        badge: 'border-violet-500/40 bg-violet-500/10 text-violet-400',
        iconBg: 'bg-violet-500/20',
        shadow: 'hover:shadow-violet-500/10',
    },
    cyan: {
        border: 'border-cyan-500/30',
        hoverBorder: 'hover:border-cyan-500/60',
        bg: 'bg-cyan-500/10',
        text: 'text-cyan-400',
        dot: 'bg-cyan-400',
        badge: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400',
        iconBg: 'bg-cyan-500/20',
        shadow: 'hover:shadow-cyan-500/10',
    },
    emerald: {
        border: 'border-emerald-500/30',
        hoverBorder: 'hover:border-emerald-500/60',
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        dot: 'bg-emerald-400',
        badge: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400',
        iconBg: 'bg-emerald-500/20',
        shadow: 'hover:shadow-emerald-500/10',
    },
    amber: {
        border: 'border-amber-500/30',
        hoverBorder: 'hover:border-amber-500/60',
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        dot: 'bg-amber-400',
        badge: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
        iconBg: 'bg-amber-500/20',
        shadow: 'hover:shadow-amber-500/10',
    },
};

export default function ManageQuizPage() {
    const [user, setUser] = useState<User | null>(null);
    const [quizzes, setQuizzes] = useState<Quiz[]>([]);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        const supabase = createClient();
        const getUser = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();
    }, []);

    // Load quizzes from localStorage
    useEffect(() => {
        const stored = localStorage.getItem('procto_quizzes');
        if (stored) {
            try {
                setQuizzes(JSON.parse(stored));
            } catch {
                setQuizzes([]);
            }
        }
    }, []);

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    const handleDelete = (id: string) => {
        const updated = quizzes.filter((q) => q.id !== id);
        setQuizzes(updated);
        localStorage.setItem('procto_quizzes', JSON.stringify(updated));
        setDeleteId(null);
        if (expandedId === id) setExpandedId(null);
    };

    const getInitials = () => {
        if (!user?.email) return 'FC';
        const parts = user.email.split('@')[0].split('.');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[1][0]).toUpperCase();
        }
        return user.email.substring(0, 2).toUpperCase();
    };

    const getDisplayName = () => {
        if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
        if (!user?.email) return 'Faculty';
        return user.email
            .split('@')[0]
            .replace('.', ' ')
            .replace(/\b\w/g, (c: string) => c.toUpperCase());
    };

    const getAccent = (index: number): Accent =>
        accentColors[index % accentColors.length];

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    const getQuestionSummary = (quiz: Quiz) => {
        const mcq = quiz.questions.filter((q) => q.type === 'mcq').length;
        const desc = quiz.questions.filter((q) => q.type === 'descriptive').length;
        const parts: string[] = [];
        if (mcq > 0) parts.push(`${mcq} MCQ`);
        if (desc > 0) parts.push(`${desc} Descriptive`);
        return parts.join(' · ') || 'No questions';
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
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    My Profile
                                </a>
                                <a
                                    href="#"
                                    className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 rounded-lg hover:bg-slate-800/60 hover:text-cyan-300 transition-colors"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
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
                <section className="flex flex-1 flex-col pt-6 lg:pt-10">
                    {/* Back Link */}
                    <Link
                        href="/faculty"
                        className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-cyan-400 transition-colors mb-6 group w-fit"
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

                    {/* Page header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                        <div>
                            <h1 className="text-3xl font-bold text-white sm:text-4xl">
                                Manage{' '}
                                <span className="bg-gradient-to-r from-violet-300 to-cyan-300 bg-clip-text text-transparent">
                                    Quizzes
                                </span>
                            </h1>
                            <p className="mt-2 text-sm text-slate-400">
                                View and manage all your created quizzes in one place.
                            </p>
                        </div>
                        {quizzes.length > 0 && (
                            <Link
                                href="/faculty/create-quiz"
                                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition-all duration-300 hover:shadow-violet-500/50 hover:scale-[1.02] w-fit"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                New Quiz
                            </Link>
                        )}
                    </div>

                    {/* Quiz Grid */}
                    {quizzes.length === 0 ? (
                        /* Empty state */
                        <div className="flex flex-1 items-center justify-center">
                            <div className="relative max-w-md w-full">
                                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-violet-500/20 via-cyan-500/5 to-violet-500/20 opacity-60 blur-xl" />
                                <div className="relative rounded-3xl border border-slate-700/80 bg-slate-900/90 p-10 shadow-2xl backdrop-blur-xl text-center">
                                    <div className="mx-auto w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-center mb-6">
                                        <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-slate-200 mb-2">
                                        No quizzes yet
                                    </h3>
                                    <p className="text-sm text-slate-500 mb-6">
                                        Create your first quiz to start conducting assessments with your students.
                                    </p>
                                    <Link
                                        href="/faculty/create-quiz"
                                        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/30 transition-all duration-300 hover:shadow-violet-500/50 hover:scale-[1.02]"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Create Quiz
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                            {quizzes.map((quiz, idx) => {
                                const accent = getAccent(idx);
                                const colors = colorMap[accent];
                                const isExpanded = expandedId === quiz.id;
                                return (
                                    <div
                                        key={quiz.id}
                                        className={`group relative rounded-2xl border ${colors.border} ${colors.hoverBorder} bg-slate-900/60 p-5 backdrop-blur-sm transition-all duration-300 hover:shadow-lg ${colors.shadow}`}
                                    >
                                        {/* Top row */}
                                        <div className="flex items-start justify-between mb-3">
                                            <div className={`w-11 h-11 rounded-xl ${colors.iconBg} flex items-center justify-center`}>
                                                <svg
                                                    className={`w-5 h-5 ${colors.text}`}
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
                                            {/* Code badge */}
                                            <span
                                                className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-xs font-mono font-semibold tracking-wider ${colors.badge}`}
                                            >
                                                {quiz.code}
                                            </span>
                                        </div>

                                        {/* Info */}
                                        <h3 className="text-lg font-semibold text-slate-100 mb-1 truncate">
                                            {quiz.title}
                                        </h3>
                                        {quiz.description && (
                                            <p className="text-sm text-slate-400 mb-2 line-clamp-2">
                                                {quiz.description}
                                            </p>
                                        )}

                                        {/* Meta row */}
                                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-4">
                                            <div className="flex items-center gap-1.5">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {quiz.timeLimit} min
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className={`h-1.5 w-1.5 rounded-full ${colors.dot}`} />
                                                {getQuestionSummary(quiz)}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                {formatDate(quiz.createdAt)}
                                            </div>
                                        </div>

                                        {/* Expanded Questions Detail */}
                                        {isExpanded && (
                                            <div className="mb-4 rounded-xl border border-slate-800/60 bg-slate-950/40 p-4 space-y-3 max-h-60 overflow-y-auto">
                                                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                                                    Questions ({quiz.questions.length})
                                                </h4>
                                                {quiz.questions.map((q, qIdx) => (
                                                    <div
                                                        key={q.id}
                                                        className="rounded-lg border border-slate-800/40 bg-slate-900/40 p-3"
                                                    >
                                                        <div className="flex items-center gap-2 mb-1.5">
                                                            <span className={`text-[0.65rem] font-semibold px-1.5 py-0.5 rounded ${q.type === 'mcq'
                                                                ? 'bg-violet-500/20 text-violet-300'
                                                                : 'bg-cyan-500/20 text-cyan-300'
                                                                }`}>
                                                                {q.type === 'mcq' ? 'MCQ' : 'DESC'}
                                                            </span>
                                                            <span className="text-xs text-slate-500">
                                                                Q{qIdx + 1}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-slate-300 leading-relaxed">
                                                            {q.questionText}
                                                        </p>
                                                        {q.type === 'mcq' && (
                                                            <div className="mt-2 grid grid-cols-2 gap-1.5">
                                                                {(q as MCQQuestion).options.map((opt, oIdx) => (
                                                                    <div
                                                                        key={oIdx}
                                                                        className={`text-xs px-2 py-1 rounded ${oIdx === (q as MCQQuestion).correctOption
                                                                            ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                                                            : 'bg-slate-800/40 text-slate-400'
                                                                            }`}
                                                                    >
                                                                        {String.fromCharCode(65 + oIdx)}. {opt}
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                        {q.type === 'descriptive' && (q as DescriptiveQuestion).maxWords && (
                                                            <p className="mt-1.5 text-xs text-slate-500">
                                                                Max words: {(q as DescriptiveQuestion).maxWords}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}

                                        {/* Actions */}
                                        <div className="flex gap-2 pt-3 border-t border-slate-800/60">
                                            <button
                                                onClick={() =>
                                                    setExpandedId(isExpanded ? null : quiz.id)
                                                }
                                                className={`flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-700/60 bg-slate-900/60 px-3 py-2 text-xs font-medium text-slate-300 transition-all hover:bg-slate-800/60 ${colors.hoverBorder}`}
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                                {isExpanded ? 'Hide' : 'View'}
                                            </button>
                                            <button
                                                onClick={() => setDeleteId(quiz.id)}
                                                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-700/60 bg-slate-900/60 px-3 py-2 text-xs font-medium text-slate-400 transition-all hover:border-red-500/50 hover:text-red-400 hover:bg-red-500/5"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
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

            {/* Delete Confirmation Modal */}
            {deleteId && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="relative w-full max-w-sm mx-4">
                        <div className="absolute -inset-1 rounded-2xl bg-red-500/20 blur-xl" />
                        <div className="relative rounded-2xl border border-slate-700/80 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                                    <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold text-white">Delete Quiz</h3>
                                    <p className="text-xs text-slate-500">This action cannot be undone.</p>
                                </div>
                            </div>
                            <p className="text-sm text-slate-400 mb-6">
                                Are you sure you want to delete this quiz? All questions and data will be permanently removed.
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setDeleteId(null)}
                                    className="flex-1 rounded-xl border border-slate-700/60 bg-slate-900/60 py-2.5 text-sm font-semibold text-slate-300 transition-all hover:bg-slate-800/60"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDelete(deleteId)}
                                    className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-500/30 transition-all hover:bg-red-400"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
