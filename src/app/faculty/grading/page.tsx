'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface ExamSummary {
    id: string;
    title: string;
    courseName: string;
    totalSessions: number;
    gradedSessions: number;
    publishedSessions: number;
    pendingGrading: number;
}

export default function GradingPage() {
    const [exams, setExams] = useState<ExamSummary[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExams = async () => {
            try {
                const res = await fetch('/api/results');
                if (res.ok) {
                    const data = await res.json();
                    setExams(data.exams || []);
                }
            } catch { /* ignore */ }
            setLoading(false);
        };
        fetchExams();
    }, []);

    const handlePublish = async (examId: string) => {
        try {
            const res = await fetch('/api/results', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ examId, publish: true }),
            });
            if (res.ok) {
                setExams(prev => prev.map(e =>
                    e.id === examId ? { ...e, publishedSessions: e.gradedSessions } : e
                ));
            }
        } catch { /* ignore */ }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -left-40 top-0 h-80 w-80 rounded-full bg-emerald-500/20 blur-3xl" />
                <div className="absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-cyan-500/15 blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-5xl px-6 py-8">
                <Link href="/faculty" className="text-sm text-slate-500 hover:text-slate-300 transition-colors mb-2 inline-block">← Back to Dashboard</Link>
                <h1 className="text-3xl font-bold text-white mb-1">
                    Grading <span className="text-emerald-400">Dashboard</span>
                </h1>
                <p className="text-sm text-slate-400 mb-8">Review submissions, grade exams, and publish results</p>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin h-8 w-8 border-2 border-emerald-400 border-t-transparent rounded-full" />
                    </div>
                ) : exams.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-300">No Exams to Grade</h3>
                        <p className="mt-1 text-sm text-slate-500">No exam submissions are available for grading yet.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {exams.map((exam) => (
                            <div key={exam.id} className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-6 hover:border-emerald-500/30 transition-all">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-white">{exam.title}</h3>
                                        <p className="text-sm text-slate-400">{exam.courseName}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {exam.pendingGrading > 0 && (
                                            <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-medium">
                                                {exam.pendingGrading} pending
                                            </span>
                                        )}
                                        {exam.gradedSessions === exam.totalSessions && exam.totalSessions > 0 && (
                                            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium">
                                                All graded
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-4 grid grid-cols-3 gap-4">
                                    <div className="rounded-xl bg-slate-800/50 p-3 text-center">
                                        <p className="text-2xl font-bold text-white">{exam.totalSessions}</p>
                                        <p className="text-xs text-slate-500">Total</p>
                                    </div>
                                    <div className="rounded-xl bg-slate-800/50 p-3 text-center">
                                        <p className="text-2xl font-bold text-emerald-400">{exam.gradedSessions}</p>
                                        <p className="text-xs text-slate-500">Graded</p>
                                    </div>
                                    <div className="rounded-xl bg-slate-800/50 p-3 text-center">
                                        <p className="text-2xl font-bold text-violet-400">{exam.publishedSessions}</p>
                                        <p className="text-xs text-slate-500">Published</p>
                                    </div>
                                </div>

                                <div className="mt-4 flex items-center gap-3">
                                    <Link href={`/faculty/analytics/${exam.id}`} className="px-4 py-2 rounded-xl bg-slate-800/60 border border-slate-700/60 text-sm text-slate-300 hover:text-white hover:border-cyan-400/50 transition-all">
                                        View Analytics
                                    </Link>
                                    {exam.publishedSessions < exam.gradedSessions && (
                                        <button
                                            onClick={() => handlePublish(exam.id)}
                                            className="px-4 py-2 rounded-xl bg-emerald-500 text-sm font-medium text-black hover:bg-emerald-400 transition-all"
                                        >
                                            Publish Results
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
