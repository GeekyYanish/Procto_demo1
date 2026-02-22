'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

// Demo exam data
const DEMO_EXAMS: Record<string, {
    title: string;
    subject: string;
    faculty: string;
    duration: number; // in seconds
    totalMarks: number;
    questions: {
        id: number;
        question: string;
        options: string[];
        correctAnswer: number;
    }[];
}> = {
    'EXAM-2026': {
        title: 'Mid-Semester Examination',
        subject: 'Data Structures & Algorithms (CS201)',
        faculty: 'Dr. Sharma',
        duration: 1800, // 30 minutes
        totalMarks: 25,
        questions: [
            {
                id: 1,
                question: 'What is the time complexity of searching an element in a balanced Binary Search Tree (BST)?',
                options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
                correctAnswer: 1,
            },
            {
                id: 2,
                question: 'Which data structure is used for implementing a priority queue most efficiently?',
                options: ['Stack', 'Queue', 'Heap', 'Linked List'],
                correctAnswer: 2,
            },
            {
                id: 3,
                question: 'What is the worst-case time complexity of QuickSort?',
                options: ['O(n log n)', 'O(n)', 'O(n²)', 'O(log n)'],
                correctAnswer: 2,
            },
            {
                id: 4,
                question: 'Which traversal of a Binary Search Tree gives elements in sorted order?',
                options: ['Pre-order', 'Post-order', 'In-order', 'Level-order'],
                correctAnswer: 2,
            },
            {
                id: 5,
                question: 'In a graph, BFS (Breadth-First Search) uses which data structure?',
                options: ['Stack', 'Queue', 'Priority Queue', 'Deque'],
                correctAnswer: 1,
            },
        ],
    },
};

export default function ExamRoomPage() {
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();
    const params = useParams();
    const code = (params.code as string)?.toUpperCase();
    const exam = DEMO_EXAMS[code];

    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState<Record<number, number>>({});
    const [timeLeft, setTimeLeft] = useState(exam?.duration || 0);
    const [submitted, setSubmitted] = useState(false);
    const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
    const [score, setScore] = useState(0);

    useEffect(() => {
        const supabase = createClient();
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();
    }, []);

    // Timer
    useEffect(() => {
        if (!exam || submitted) return;
        if (timeLeft <= 0) {
            handleSubmit();
            return;
        }
        const timer = setInterval(() => {
            setTimeLeft((prev) => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [timeLeft, submitted, exam]);

    const handleSubmit = useCallback(() => {
        if (!exam) return;
        let calculatedScore = 0;
        exam.questions.forEach((q) => {
            if (answers[q.id] === q.correctAnswer) {
                calculatedScore += exam.totalMarks / exam.questions.length;
            }
        });
        setScore(calculatedScore);
        setSubmitted(true);
        setShowConfirmSubmit(false);
    }, [exam, answers]);

    const handleSelectAnswer = (questionId: number, optionIndex: number) => {
        if (submitted) return;
        setAnswers((prev) => ({ ...prev, [questionId]: optionIndex }));
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
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

    const answeredCount = Object.keys(answers).length;
    const totalQuestions = exam?.questions.length || 0;

    // Exam not found
    if (!exam) {
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
                    <h1 className="text-2xl font-bold text-white mb-2">Exam Not Found</h1>
                    <p className="text-neutral-500 mb-6">The exam code <span className="font-mono text-red-400">{code}</span> doesn&apos;t match any active examination.</p>
                    <Link
                        href="/student/enter-exam"
                        className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-black hover:bg-emerald-400 transition-colors"
                    >
                        ← Try Another Code
                    </Link>
                </div>
            </main>
        );
    }

    // Results screen
    if (submitted) {
        const percentage = Math.round((score / exam.totalMarks) * 100);
        return (
            <main className="min-h-screen bg-neutral-950 text-white">
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

                <div className="relative mx-auto flex min-h-screen w-full flex-col items-center justify-center px-6 py-8">
                    <div className="w-full max-w-lg">
                        <div className="relative">
                            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-emerald-500/30 via-emerald-500/10 to-emerald-500/30 opacity-60 blur-xl" />
                            <div className="relative rounded-3xl border border-emerald-500/30 bg-neutral-900/90 p-8 shadow-2xl backdrop-blur-xl sm:p-10 text-center">
                                {/* Trophy Icon */}
                                <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 flex items-center justify-center mb-6">
                                    <svg className="w-10 h-10 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>

                                <h1 className="text-3xl font-bold text-white mb-2">Exam Submitted!</h1>
                                <p className="text-neutral-500 mb-8">{exam.title} — {exam.subject}</p>

                                {/* Score Circle */}
                                <div className="relative mx-auto w-36 h-36 mb-8">
                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                        <circle cx="50" cy="50" r="42" fill="none" stroke="rgb(38,38,38)" strokeWidth="6" />
                                        <circle
                                            cx="50" cy="50" r="42" fill="none"
                                            stroke={percentage >= 60 ? 'rgb(52,211,153)' : percentage >= 40 ? 'rgb(251,191,36)' : 'rgb(248,113,113)'}
                                            strokeWidth="6"
                                            strokeDasharray={`${(percentage / 100) * 264} 264`}
                                            strokeLinecap="round"
                                            className="transition-all duration-1000"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-bold text-white">{percentage}%</span>
                                        <span className="text-xs text-neutral-500">{score}/{exam.totalMarks} marks</span>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-4 mb-8">
                                    <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3">
                                        <p className="text-lg font-bold text-white">{answeredCount}</p>
                                        <p className="text-xs text-neutral-500">Answered</p>
                                    </div>
                                    <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3">
                                        <p className="text-lg font-bold text-emerald-400">{Math.round(score / (exam.totalMarks / totalQuestions))}</p>
                                        <p className="text-xs text-neutral-500">Correct</p>
                                    </div>
                                    <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 p-3">
                                        <p className="text-lg font-bold text-white">{totalQuestions - answeredCount}</p>
                                        <p className="text-xs text-neutral-500">Skipped</p>
                                    </div>
                                </div>

                                <Link
                                    href="/student"
                                    className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-8 py-3 text-base font-semibold text-black shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 hover:shadow-emerald-500/50 transition-all hover:scale-105"
                                >
                                    Back to Dashboard
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                    </svg>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        );
    }

    const question = exam.questions[currentQuestion];

    return (
        <main className="min-h-screen bg-neutral-950 text-white">
            {/* Background */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
                <div className="absolute -right-32 bottom-20 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl" />
            </div>
            <div
                className="pointer-events-none fixed inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)`,
                }}
            />

            {/* Top Bar */}
            <div className="relative border-b border-neutral-800 bg-neutral-950/95 backdrop-blur-xl">
                <div className="mx-auto flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
                    {/* Left — Exam Info */}
                    <div className="flex items-center gap-4">
                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 ring-1 ring-emerald-500/40 shadow-lg shadow-emerald-500/20">
                            <span className="text-lg font-semibold tracking-tight text-emerald-400">P</span>
                        </div>
                        <div className="hidden sm:flex flex-col leading-tight">
                            <span className="text-sm font-semibold text-white">{exam.title}</span>
                            <span className="text-xs text-neutral-500">{exam.subject}</span>
                        </div>
                    </div>

                    {/* Center — Timer */}
                    <div className={`flex items-center gap-2 rounded-full border px-4 py-2 font-mono text-lg ${timeLeft <= 300
                            ? 'border-red-500/50 bg-red-500/10 text-red-400 shadow-lg shadow-red-500/20'
                            : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                        }`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatTime(timeLeft)}
                    </div>

                    {/* Right — Student Info */}
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex flex-col items-end leading-tight">
                            <span className="text-sm font-medium text-neutral-200">{getDisplayName()}</span>
                            <span className="text-[0.65rem] text-neutral-500">{answeredCount}/{totalQuestions} answered</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-semibold text-sm">
                            {getInitials()}
                        </div>
                    </div>
                </div>
            </div>

            <div className="relative mx-auto flex w-full max-w-7xl flex-1 gap-6 px-4 py-6 sm:px-6 lg:px-8">
                {/* Sidebar — Question Navigation */}
                <aside className="hidden lg:flex w-64 flex-col gap-4">
                    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 backdrop-blur-sm">
                        <h3 className="text-sm font-semibold text-neutral-400 mb-3 uppercase tracking-wider">Questions</h3>
                        <div className="grid grid-cols-5 gap-2">
                            {exam.questions.map((q, index) => (
                                <button
                                    key={q.id}
                                    onClick={() => setCurrentQuestion(index)}
                                    className={`w-full aspect-square rounded-lg text-sm font-semibold transition-all duration-200 ${currentQuestion === index
                                            ? 'bg-emerald-500 text-black scale-110 shadow-lg shadow-emerald-500/30'
                                            : answers[q.id] !== undefined
                                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/30'
                                                : 'bg-neutral-800/60 text-neutral-400 border border-neutral-700/50 hover:border-neutral-600'
                                        }`}
                                >
                                    {index + 1}
                                </button>
                            ))}
                        </div>

                        {/* Legend */}
                        <div className="mt-4 space-y-2 text-xs text-neutral-500">
                            <div className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded bg-emerald-500" />
                                Current
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded bg-emerald-500/20 border border-emerald-500/30" />
                                Answered
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="h-3 w-3 rounded bg-neutral-800/60 border border-neutral-700/50" />
                                Not Answered
                            </div>
                        </div>
                    </div>

                    {/* Progress */}
                    <div className="rounded-2xl border border-neutral-800 bg-neutral-900/60 p-4 backdrop-blur-sm">
                        <div className="flex items-center justify-between text-sm mb-2">
                            <span className="text-neutral-400">Progress</span>
                            <span className="text-emerald-400 font-semibold">{answeredCount}/{totalQuestions}</span>
                        </div>
                        <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                                style={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Submit */}
                    <button
                        onClick={() => setShowConfirmSubmit(true)}
                        className="w-full rounded-xl border border-red-500/30 bg-red-500/10 py-3 text-sm font-semibold text-red-400 transition-all hover:bg-red-500/20 hover:border-red-500/50"
                    >
                        Submit Exam
                    </button>
                </aside>

                {/* Main Question Area */}
                <div className="flex-1">
                    <div className="relative">
                        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-emerald-500/20 via-transparent to-emerald-500/20 opacity-40 blur-xl" />
                        <div className="relative rounded-3xl border border-emerald-500/20 bg-neutral-900/80 p-6 sm:p-8 backdrop-blur-xl shadow-2xl">
                            {/* Question Header */}
                            <div className="flex items-center justify-between mb-6">
                                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                                    Question {currentQuestion + 1} of {totalQuestions}
                                </span>
                                <span className="text-xs text-neutral-500 font-mono">
                                    {exam.totalMarks / totalQuestions} marks
                                </span>
                            </div>

                            {/* Question Text */}
                            <h2 className="text-xl sm:text-2xl font-semibold text-white leading-relaxed mb-8">
                                {question.question}
                            </h2>

                            {/* Options */}
                            <div className="space-y-3">
                                {question.options.map((option, index) => (
                                    <button
                                        key={index}
                                        onClick={() => handleSelectAnswer(question.id, index)}
                                        className={`w-full text-left rounded-xl border p-4 transition-all duration-200 group ${answers[question.id] === index
                                                ? 'border-emerald-500/60 bg-emerald-500/10 ring-2 ring-emerald-500/20'
                                                : 'border-neutral-800 bg-neutral-950/40 hover:border-neutral-600 hover:bg-neutral-900/60'
                                            }`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold transition-all ${answers[question.id] === index
                                                    ? 'bg-emerald-500 text-black'
                                                    : 'bg-neutral-800/80 text-neutral-400 group-hover:bg-neutral-700/80'
                                                }`}>
                                                {String.fromCharCode(65 + index)}
                                            </div>
                                            <span className={`text-sm sm:text-base ${answers[question.id] === index ? 'text-white' : 'text-neutral-300'
                                                }`}>
                                                {option}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Navigation */}
                            <div className="flex items-center justify-between mt-8 pt-6 border-t border-neutral-800">
                                <button
                                    onClick={() => setCurrentQuestion((prev) => Math.max(0, prev - 1))}
                                    disabled={currentQuestion === 0}
                                    className="inline-flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-950/40 px-5 py-2.5 text-sm font-medium text-neutral-400 transition-all hover:border-neutral-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-neutral-800 disabled:hover:text-neutral-400"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Previous
                                </button>

                                {/* Mobile question indicator */}
                                <div className="flex lg:hidden items-center gap-1">
                                    {exam.questions.map((q, index) => (
                                        <button
                                            key={q.id}
                                            onClick={() => setCurrentQuestion(index)}
                                            className={`w-2.5 h-2.5 rounded-full transition-all ${currentQuestion === index
                                                    ? 'bg-emerald-400 scale-125'
                                                    : answers[q.id] !== undefined
                                                        ? 'bg-emerald-500/40'
                                                        : 'bg-neutral-700'
                                                }`}
                                        />
                                    ))}
                                </div>

                                {currentQuestion === totalQuestions - 1 ? (
                                    <button
                                        onClick={() => setShowConfirmSubmit(true)}
                                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-black shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 hover:shadow-emerald-500/40 hover:scale-105"
                                    >
                                        Submit
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => setCurrentQuestion((prev) => Math.min(totalQuestions - 1, prev + 1))}
                                        className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-black shadow-lg shadow-emerald-500/20 transition-all hover:bg-emerald-400 hover:shadow-emerald-500/40 hover:scale-105"
                                    >
                                        Next
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Mobile Submit */}
                    <button
                        onClick={() => setShowConfirmSubmit(true)}
                        className="lg:hidden w-full mt-4 rounded-xl border border-red-500/30 bg-red-500/10 py-3 text-sm font-semibold text-red-400 transition-all hover:bg-red-500/20"
                    >
                        Submit Exam
                    </button>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmSubmit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
                    <div className="relative w-full max-w-md">
                        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-red-500/20 via-transparent to-red-500/20 opacity-60 blur-xl" />
                        <div className="relative rounded-3xl border border-neutral-700/60 bg-neutral-900/95 p-8 shadow-2xl backdrop-blur-xl text-center">
                            <div className="mx-auto w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center justify-center mb-5">
                                <svg className="w-7 h-7 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">Submit Exam?</h2>
                            <p className="text-sm text-neutral-500 mb-2">
                                You have answered <span className="text-emerald-400 font-semibold">{answeredCount}</span> out of <span className="text-white font-semibold">{totalQuestions}</span> questions.
                            </p>
                            {answeredCount < totalQuestions && (
                                <p className="text-xs text-amber-400/80 mb-6">
                                    ⚠ You have {totalQuestions - answeredCount} unanswered question(s).
                                </p>
                            )}
                            {answeredCount === totalQuestions && <div className="mb-6" />}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowConfirmSubmit(false)}
                                    className="flex-1 rounded-xl border border-neutral-700 bg-neutral-800/60 py-3 text-sm font-medium text-neutral-300 transition-all hover:bg-neutral-700/60 hover:text-white"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSubmit}
                                    className="flex-1 rounded-xl bg-red-500 py-3 text-sm font-semibold text-white shadow-lg shadow-red-500/30 transition-all hover:bg-red-400 hover:shadow-red-500/50"
                                >
                                    Confirm Submit
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
}
