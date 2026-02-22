// app/faculty/create-quiz/page.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

// ── Types ──
interface MCQQuestion {
    id: string;
    type: 'mcq';
    questionText: string;
    options: [string, string, string, string];
    correctOption: number; // 0-3
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

export default function CreateQuizPage() {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();

    // Quiz metadata
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [timeLimit, setTimeLimit] = useState<number | ''>('');

    // Questions
    const [questions, setQuestions] = useState<Question[]>([]);

    // UI
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [generatedCode, setGeneratedCode] = useState('');
    const [showAddMenu, setShowAddMenu] = useState(false);

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

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
    };

    // ── Helpers ──
    const getInitials = () => {
        if (!user?.email) return 'FC';
        const parts = user.email.split('@')[0].split('.');
        if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
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

    const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 4; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return `QUIZ-${code}`;
    };

    // ── Question CRUD ──
    const addQuestion = (type: 'mcq' | 'descriptive') => {
        const id = crypto.randomUUID();
        if (type === 'mcq') {
            setQuestions((prev) => [
                ...prev,
                {
                    id,
                    type: 'mcq',
                    questionText: '',
                    options: ['', '', '', ''],
                    correctOption: -1,
                } as MCQQuestion,
            ]);
        } else {
            setQuestions((prev) => [
                ...prev,
                { id, type: 'descriptive', questionText: '', maxWords: undefined } as DescriptiveQuestion,
            ]);
        }
        setShowAddMenu(false);
    };

    const removeQuestion = (id: string) => {
        setQuestions((prev) => prev.filter((q) => q.id !== id));
    };

    const updateQuestionText = (id: string, text: string) => {
        setQuestions((prev) => prev.map((q) => (q.id === id ? { ...q, questionText: text } : q)));
    };

    const updateMCQOption = (id: string, optionIndex: number, value: string) => {
        setQuestions((prev) =>
            prev.map((q) => {
                if (q.id === id && q.type === 'mcq') {
                    const opts = [...q.options] as [string, string, string, string];
                    opts[optionIndex] = value;
                    return { ...q, options: opts };
                }
                return q;
            }),
        );
    };

    const updateCorrectOption = (id: string, optionIndex: number) => {
        setQuestions((prev) =>
            prev.map((q) => (q.id === id && q.type === 'mcq' ? { ...q, correctOption: optionIndex } : q)),
        );
    };

    const updateMaxWords = (id: string, val: string) => {
        const num = val === '' ? undefined : Number(val);
        setQuestions((prev) =>
            prev.map((q) => (q.id === id && q.type === 'descriptive' ? { ...q, maxWords: num } : q)),
        );
    };

    // ── Submit ──
    const handleSubmit = async () => {
        setError('');

        if (!title.trim()) {
            setError('Please enter a quiz title.');
            return;
        }
        if (!timeLimit || timeLimit < 1) {
            setError('Please set a valid time limit (min 1 minute).');
            return;
        }
        if (questions.length === 0) {
            setError('Add at least one question to the quiz.');
            return;
        }

        for (let i = 0; i < questions.length; i++) {
            const q = questions[i];
            if (!q.questionText.trim()) {
                setError(`Question ${i + 1} is missing question text.`);
                return;
            }
            if (q.type === 'mcq') {
                const mcq = q as MCQQuestion;
                if (mcq.options.some((o) => !o.trim())) {
                    setError(`Question ${i + 1} (MCQ): All four options must be filled.`);
                    return;
                }
                if (mcq.correctOption < 0 || mcq.correctOption > 3) {
                    setError(`Question ${i + 1} (MCQ): Please select the correct answer.`);
                    return;
                }
            }
        }

        setLoading(true);
        await new Promise((r) => setTimeout(r, 800));

        const code = generateCode();
        const quiz: Quiz = {
            id: crypto.randomUUID(),
            code,
            title: title.trim(),
            description: description.trim() || undefined,
            timeLimit: Number(timeLimit),
            questions,
            createdAt: new Date().toISOString(),
            createdBy: user?.email || undefined,
        };

        const existing = JSON.parse(localStorage.getItem('procto_quizzes') || '[]');
        existing.push(quiz);
        localStorage.setItem('procto_quizzes', JSON.stringify(existing));

        setGeneratedCode(code);
        setSuccess(true);
        setLoading(false);
    };

    const handleReset = () => {
        setTitle('');
        setDescription('');
        setTimeLimit('');
        setQuestions([]);
        setError('');
        setSuccess(false);
        setGeneratedCode('');
    };

    // ── Counts for summary ──
    const mcqCount = questions.filter((q) => q.type === 'mcq').length;
    const descCount = questions.filter((q) => q.type === 'descriptive').length;

    // ── Render ──
    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
            {/* Glow background */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -left-40 top-0 h-80 w-80 rounded-full bg-violet-500/30 blur-3xl" />
                <div className="absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-cyan-500/25 blur-3xl" />
                <div className="absolute left-1/2 top-1/3 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-violet-500/5 blur-3xl" />
            </div>

            <div className="relative mx-auto flex min-h-screen w-full flex-col px-6 py-8 sm:px-8 lg:px-12 xl:px-20 xl:py-12">
                {/* ── Header ── */}
                <header className="flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900/70 ring-1 ring-cyan-400/40 shadow-lg shadow-cyan-500/30">
                            <span className="text-lg font-semibold tracking-tight text-cyan-300">P</span>
                        </div>
                        <div className="flex flex-col leading-tight">
                            <span className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-400">Procto</span>
                            <span className="text-xs text-slate-500">Intelligent exam proctoring</span>
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
                                <a href="#" className="flex items-center gap-2 px-3 py-2 text-sm text-slate-300 rounded-lg hover:bg-slate-800/60 hover:text-cyan-300 transition-colors">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
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
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                    Logout
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* ── Main Content ── */}
                <section className="flex flex-1 items-start justify-center pt-6 lg:pt-10">
                    <div className="w-full max-w-3xl">
                        {/* Back Link */}
                        <Link
                            href="/faculty"
                            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-cyan-400 transition-colors mb-8 group"
                        >
                            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                            Back to dashboard
                        </Link>

                        {/* Card */}
                        <div className="relative">
                            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-violet-500/30 via-cyan-500/10 to-violet-500/30 opacity-60 blur-xl" />
                            <div className="relative rounded-3xl border border-slate-700/80 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl sm:p-10">

                                {/* ── SUCCESS OVERLAY ── */}
                                {success ? (
                                    <div className="flex flex-col items-center text-center py-6">
                                        {/* Animated checkmark */}
                                        <div className="relative mb-6">
                                            <div className="absolute -inset-3 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
                                            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/40">
                                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M5 13l4 4L19 7"
                                                        style={{
                                                            strokeDasharray: 24,
                                                            strokeDashoffset: 0,
                                                            animation: 'checkDraw 0.5s ease-out forwards',
                                                        }}
                                                    />
                                                </svg>
                                            </div>
                                        </div>

                                        <h2 className="text-2xl font-bold text-white sm:text-3xl">
                                            Quiz Created{' '}
                                            <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                                                Successfully!
                                            </span>
                                        </h2>
                                        <p className="mt-3 text-slate-400 max-w-sm">
                                            Share the quiz code below with your students so they can join the exam.
                                        </p>

                                        {/* Generated Code */}
                                        <div className="mt-8 w-full max-w-xs">
                                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                                                Quiz Join Code
                                            </p>
                                            <div className="relative rounded-xl border border-cyan-500/40 bg-slate-950/70 px-6 py-4">
                                                <span className="font-mono text-2xl font-bold tracking-[0.2em] bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-transparent">
                                                    {generatedCode}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Quiz Summary */}
                                        <div className="mt-6 w-full rounded-xl border border-slate-700/60 bg-slate-950/50 p-4 text-left space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Title</span>
                                                <span className="text-slate-200 font-medium">{title}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Time Limit</span>
                                                <span className="text-slate-200 font-medium">{timeLimit} min</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Total Questions</span>
                                                <span className="text-slate-200 font-medium">{questions.length}</span>
                                            </div>
                                            {mcqCount > 0 && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-500">MCQ</span>
                                                    <span className="text-violet-300 font-medium">{mcqCount}</span>
                                                </div>
                                            )}
                                            {descCount > 0 && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-500">Descriptive</span>
                                                    <span className="text-cyan-300 font-medium">{descCount}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action buttons */}
                                        <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full">
                                            <Link
                                                href="/faculty"
                                                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 py-3.5 text-base font-semibold text-white shadow-lg shadow-violet-500/30 transition-all duration-300 hover:shadow-violet-500/50 hover:scale-[1.02]"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                                </svg>
                                                Go to Dashboard
                                            </Link>
                                            <button
                                                type="button"
                                                onClick={handleReset}
                                                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700/60 bg-slate-900/60 py-3.5 text-base font-semibold text-slate-300 transition-all duration-300 hover:border-cyan-400/50 hover:text-cyan-300 hover:bg-slate-800/60"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                                Create Another
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    /* ── FORM VIEW ── */
                                    <>
                                        {/* Header */}
                                        <div className="text-center mb-8">
                                            <div className="mx-auto w-14 h-14 rounded-2xl bg-violet-500/10 border border-violet-500/30 flex items-center justify-center mb-5">
                                                <svg className="w-7 h-7 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <h1 className="text-2xl font-bold text-white sm:text-3xl">Create a Quiz</h1>
                                            <p className="mt-2 text-sm text-slate-500">
                                                Build your own quiz with MCQ and descriptive questions. A unique code will be generated for students to join.
                                            </p>
                                        </div>

                                        {/* Error */}
                                        {error && (
                                            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 flex items-center gap-2">
                                                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                {error}
                                            </div>
                                        )}

                                        {/* ── Quiz Metadata ── */}
                                        <div className="space-y-5 mb-8">
                                            <div>
                                                <label htmlFor="quizTitle" className="block text-sm font-medium text-slate-300 mb-2">
                                                    Quiz Title <span className="text-red-400">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    id="quizTitle"
                                                    value={title}
                                                    onChange={(e) => setTitle(e.target.value)}
                                                    placeholder="e.g. Data Structures Mid-Semester Exam"
                                                    className="w-full rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 py-3 text-white placeholder-slate-600 outline-none transition-all duration-300 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20"
                                                    autoFocus
                                                />
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label htmlFor="timeLimit" className="block text-sm font-medium text-slate-300 mb-2">
                                                        Time Limit (minutes) <span className="text-red-400">*</span>
                                                    </label>
                                                    <input
                                                        type="number"
                                                        id="timeLimit"
                                                        min={1}
                                                        value={timeLimit}
                                                        onChange={(e) => setTimeLimit(e.target.value === '' ? '' : Number(e.target.value))}
                                                        placeholder="e.g. 30"
                                                        className="w-full rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 py-3 text-white placeholder-slate-600 outline-none transition-all duration-300 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20"
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="quizDesc" className="block text-sm font-medium text-slate-300 mb-2">
                                                        Description <span className="text-slate-600">(optional)</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="quizDesc"
                                                        value={description}
                                                        onChange={(e) => setDescription(e.target.value)}
                                                        placeholder="Brief description..."
                                                        className="w-full rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 py-3 text-white placeholder-slate-600 outline-none transition-all duration-300 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Divider */}
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="flex-1 h-px bg-slate-700/60" />
                                            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Questions</span>
                                            <div className="flex-1 h-px bg-slate-700/60" />
                                        </div>

                                        {/* ── Questions List ── */}
                                        <div className="space-y-5 mb-6">
                                            {questions.length === 0 && (
                                                <div className="rounded-xl border border-dashed border-slate-700/60 bg-slate-950/30 py-12 text-center">
                                                    <svg className="w-12 h-12 text-slate-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                    <p className="text-slate-500 text-sm">No questions added yet.</p>
                                                    <p className="text-slate-600 text-xs mt-1">Click &quot;Add Question&quot; below to get started.</p>
                                                </div>
                                            )}

                                            {questions.map((q, idx) => (
                                                <div
                                                    key={q.id}
                                                    className="rounded-xl border border-slate-700/60 bg-slate-950/40 p-5 transition-all duration-300 hover:border-slate-600/80"
                                                >
                                                    {/* Question Header */}
                                                    <div className="flex items-center justify-between mb-4">
                                                        <div className="flex items-center gap-3">
                                                            <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-slate-800 text-xs font-bold text-slate-300">
                                                                {idx + 1}
                                                            </span>
                                                            <span
                                                                className={`text-[0.65rem] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full ${q.type === 'mcq'
                                                                        ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                                                                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                                                    }`}
                                                            >
                                                                {q.type === 'mcq' ? 'MCQ' : 'Descriptive'}
                                                            </span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeQuestion(q.id)}
                                                            className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                                                            title="Remove question"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                            </svg>
                                                        </button>
                                                    </div>

                                                    {/* Question Text */}
                                                    <div className="mb-4">
                                                        <label className="block text-xs font-medium text-slate-400 mb-1.5">
                                                            Question Text <span className="text-red-400">*</span>
                                                        </label>
                                                        <textarea
                                                            value={q.questionText}
                                                            onChange={(e) => updateQuestionText(q.id, e.target.value)}
                                                            placeholder="Type your question here..."
                                                            rows={2}
                                                            className="w-full rounded-lg border border-slate-700/80 bg-slate-900/60 px-3 py-2.5 text-sm text-white placeholder-slate-600 outline-none transition-all duration-300 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20 resize-none"
                                                        />
                                                    </div>

                                                    {/* MCQ Options */}
                                                    {q.type === 'mcq' && (
                                                        <div className="space-y-2.5">
                                                            <label className="block text-xs font-medium text-slate-400 mb-1">
                                                                Options <span className="text-red-400">*</span>{' '}
                                                                <span className="text-slate-600 font-normal">— select the correct answer</span>
                                                            </label>
                                                            {(q as MCQQuestion).options.map((opt, oi) => (
                                                                <div key={oi} className="flex items-center gap-3">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => updateCorrectOption(q.id, oi)}
                                                                        className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${(q as MCQQuestion).correctOption === oi
                                                                                ? 'border-emerald-400 bg-emerald-500/20'
                                                                                : 'border-slate-600 hover:border-slate-400'
                                                                            }`}
                                                                        title={`Mark option ${String.fromCharCode(65 + oi)} as correct`}
                                                                    >
                                                                        {(q as MCQQuestion).correctOption === oi && (
                                                                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                                                                        )}
                                                                    </button>
                                                                    <span className="text-xs font-bold text-slate-500 w-4">
                                                                        {String.fromCharCode(65 + oi)}
                                                                    </span>
                                                                    <input
                                                                        type="text"
                                                                        value={opt}
                                                                        onChange={(e) => updateMCQOption(q.id, oi, e.target.value)}
                                                                        placeholder={`Option ${String.fromCharCode(65 + oi)}`}
                                                                        className="flex-1 rounded-lg border border-slate-700/80 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-600 outline-none transition-all duration-300 focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/20"
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}

                                                    {/* Descriptive – Max Words */}
                                                    {q.type === 'descriptive' && (
                                                        <div>
                                                            <label className="block text-xs font-medium text-slate-400 mb-1.5">
                                                                Max Word Limit <span className="text-slate-600">(optional)</span>
                                                            </label>
                                                            <input
                                                                type="number"
                                                                min={1}
                                                                value={(q as DescriptiveQuestion).maxWords ?? ''}
                                                                onChange={(e) => updateMaxWords(q.id, e.target.value)}
                                                                placeholder="e.g. 200"
                                                                className="w-40 rounded-lg border border-slate-700/80 bg-slate-900/60 px-3 py-2 text-sm text-white placeholder-slate-600 outline-none transition-all duration-300 focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>

                                        {/* ── Add Question Button ── */}
                                        <div className="relative mb-8">
                                            <button
                                                type="button"
                                                onClick={() => setShowAddMenu(!showAddMenu)}
                                                className="w-full rounded-xl border border-dashed border-slate-600/80 bg-slate-950/30 py-3.5 text-sm font-medium text-slate-400 hover:text-cyan-300 hover:border-cyan-400/40 hover:bg-slate-900/40 transition-all duration-300 flex items-center justify-center gap-2"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                                </svg>
                                                Add Question
                                            </button>

                                            {/* Dropdown */}
                                            {showAddMenu && (
                                                <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-56 rounded-xl border border-slate-700/60 bg-slate-900/95 backdrop-blur-xl shadow-xl p-2 z-40">
                                                    <button
                                                        type="button"
                                                        onClick={() => addQuestion('mcq')}
                                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-violet-500/10 hover:text-violet-300 transition-colors"
                                                    >
                                                        <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center">
                                                            <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                                                            </svg>
                                                        </div>
                                                        <div className="text-left">
                                                            <span className="block font-medium">MCQ</span>
                                                            <span className="block text-xs text-slate-500">Multiple choice question</span>
                                                        </div>
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => addQuestion('descriptive')}
                                                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-300 transition-colors"
                                                    >
                                                        <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                                                            <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                            </svg>
                                                        </div>
                                                        <div className="text-left">
                                                            <span className="block font-medium">Descriptive</span>
                                                            <span className="block text-xs text-slate-500">Long / short answer</span>
                                                        </div>
                                                    </button>
                                                </div>
                                            )}
                                        </div>

                                        {/* ── Question Stats ── */}
                                        {questions.length > 0 && (
                                            <div className="flex items-center gap-4 mb-6 px-1">
                                                <div className="flex items-center gap-2 text-xs text-slate-400">
                                                    <span className="font-semibold text-slate-200">{questions.length}</span> question{questions.length !== 1 && 's'}
                                                </div>
                                                {mcqCount > 0 && (
                                                    <div className="flex items-center gap-1.5 text-xs">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                                                        <span className="text-violet-300">{mcqCount} MCQ</span>
                                                    </div>
                                                )}
                                                {descCount > 0 && (
                                                    <div className="flex items-center gap-1.5 text-xs">
                                                        <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                                                        <span className="text-cyan-300">{descCount} Descriptive</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {/* ── Submit ── */}
                                        <button
                                            type="button"
                                            onClick={handleSubmit}
                                            disabled={loading}
                                            className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 py-3.5 text-base font-semibold text-white shadow-lg shadow-violet-500/30 transition-all duration-300 hover:shadow-violet-500/50 hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                                        >
                                            {loading ? (
                                                <span className="inline-flex items-center gap-2">
                                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                                    </svg>
                                                    Creating Quiz...
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-2">
                                                    Create Quiz
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                    </svg>
                                                </span>
                                            )}
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="mt-8 flex items-center justify-between border-t border-slate-800/80 pt-4 text-[0.7rem] text-slate-500 sm:text-xs">
                    <span>© {new Date().getFullYear()} Procto. Built for secure online exams.</span>
                    <span className="hidden sm:inline">Designed for modern browsers · Next.js · Tailwind CSS</span>
                </footer>
            </div>

            {/* Checkmark animation */}
            <style jsx>{`
                @keyframes checkDraw {
                    from {
                        stroke-dashoffset: 24;
                    }
                    to {
                        stroke-dashoffset: 0;
                    }
                }
            `}</style>
        </main>
    );
}
