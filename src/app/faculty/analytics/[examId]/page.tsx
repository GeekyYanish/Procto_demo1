'use client';

import Link from 'next/link';
import { useEffect, useState, use } from 'react';
import { downloadCSV } from '@/lib/csv-export';

interface Analytics {
    totalSubmissions: number;
    avgScore: number;
    highestScore: number;
    lowestScore: number;
    passRate: number;
    passCount: number;
    failCount: number;
    distribution: number[];
}

interface QuestionStat {
    questionId: string;
    type: string;
    points: number;
    avgScore: number;
    correctRate: number;
    totalAttempts: number;
}

interface StudentResult {
    studentId: string;
    studentName: string;
    email: string;
    totalScore: number;
    percentage: number;
    passStatus: boolean;
}

interface ExamInfo {
    id: string;
    title: string;
    courseName: string;
}

export default function AnalyticsPage({ params }: { params: Promise<{ examId: string }> }) {
    const { examId } = use(params);
    const [exam, setExam] = useState<ExamInfo | null>(null);
    const [analytics, setAnalytics] = useState<Analytics | null>(null);
    const [questionStats, setQuestionStats] = useState<QuestionStat[]>([]);
    const [results, setResults] = useState<StudentResult[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await fetch(`/api/results/analytics/${examId}`);
                if (res.ok) {
                    const data = await res.json();
                    setExam(data.exam);
                    setAnalytics(data.analytics);
                    setQuestionStats(data.questionStats);
                    setResults(data.results);
                }
            } catch { /* ignore */ }
            setLoading(false);
        };
        fetchAnalytics();
    }, [examId]);

    const handleExportCSV = () => {
        if (results.length === 0) return;
        downloadCSV(
            results.map(r => ({
                'Student Name': r.studentName,
                'Email': r.email,
                'Score': r.totalScore,
                'Percentage': r.percentage,
                'Pass/Fail': r.passStatus ? 'PASS' : 'FAIL',
            })),
            `${exam?.title || 'exam'}_results`
        );
    };

    if (loading) {
        return (
            <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-2 border-cyan-400 border-t-transparent rounded-full" />
            </main>
        );
    }

    const maxDist = analytics ? Math.max(...analytics.distribution, 1) : 1;

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -left-40 top-0 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
                <div className="absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-violet-500/15 blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-6xl px-6 py-8">
                <Link href="/faculty/grading" className="text-sm text-slate-500 hover:text-slate-300 transition-colors mb-2 inline-block">← Back to Grading</Link>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">
                            Class <span className="text-cyan-400">Analytics</span>
                        </h1>
                        <p className="mt-1 text-sm text-slate-400">{exam?.title} · {exam?.courseName}</p>
                    </div>
                    <button
                        onClick={handleExportCSV}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 text-sm font-medium text-black hover:bg-cyan-400 transition-all shadow-lg shadow-cyan-500/30"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        Export CSV
                    </button>
                </div>

                {analytics && (
                    <>
                        {/* Stats Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
                            {[
                                { label: 'Submissions', value: analytics.totalSubmissions, color: 'text-white' },
                                { label: 'Avg Score', value: `${analytics.avgScore}%`, color: 'text-cyan-400' },
                                { label: 'Highest', value: `${analytics.highestScore}%`, color: 'text-emerald-400' },
                                { label: 'Lowest', value: `${analytics.lowestScore}%`, color: 'text-red-400' },
                                { label: 'Pass Rate', value: `${analytics.passRate}%`, color: 'text-violet-400' },
                            ].map((stat) => (
                                <div key={stat.label} className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-4 text-center">
                                    <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                                    <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Score Distribution */}
                        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-6 mb-8">
                            <h2 className="text-lg font-semibold text-white mb-4">Score Distribution</h2>
                            <div className="flex items-end gap-2 h-40">
                                {analytics.distribution.map((count, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                        <span className="text-xs text-slate-500">{count}</span>
                                        <div
                                            className="w-full rounded-t-lg bg-gradient-to-t from-cyan-500 to-cyan-400 transition-all duration-500"
                                            style={{ height: `${(count / maxDist) * 100}%`, minHeight: count > 0 ? '4px' : '0' }}
                                        />
                                        <span className="text-[0.6rem] text-slate-500">{i * 10}-{(i + 1) * 10}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pass/Fail Donut */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-6">
                                <h2 className="text-lg font-semibold text-white mb-4">Pass / Fail</h2>
                                <div className="flex items-center justify-center gap-8">
                                    <div className="text-center">
                                        <p className="text-4xl font-bold text-emerald-400">{analytics.passCount}</p>
                                        <p className="text-sm text-slate-500 mt-1">Passed</p>
                                    </div>
                                    <div className="w-px h-12 bg-slate-700/60" />
                                    <div className="text-center">
                                        <p className="text-4xl font-bold text-red-400">{analytics.failCount}</p>
                                        <p className="text-sm text-slate-500 mt-1">Failed</p>
                                    </div>
                                </div>
                            </div>

                            {/* Per-question Performance */}
                            <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-6">
                                <h2 className="text-lg font-semibold text-white mb-4">Per-Question Performance</h2>
                                <div className="space-y-2 max-h-48 overflow-y-auto">
                                    {questionStats.map((q, i) => (
                                        <div key={q.questionId} className="flex items-center gap-3">
                                            <span className="text-xs text-slate-500 w-6">Q{i + 1}</span>
                                            <div className="flex-1 h-2 rounded-full bg-slate-800">
                                                <div
                                                    className={`h-full rounded-full transition-all ${q.correctRate >= 70 ? 'bg-emerald-500' : q.correctRate >= 40 ? 'bg-amber-500' : 'bg-red-500'
                                                        }`}
                                                    style={{ width: `${q.correctRate}%` }}
                                                />
                                            </div>
                                            <span className="text-xs text-slate-400 w-10 text-right">{q.correctRate}%</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Student Results Table */}
                        <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-6">
                            <h2 className="text-lg font-semibold text-white mb-4">Student Results</h2>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-700/60">
                                            <th className="text-left py-3 px-2 text-slate-400 font-medium">Student</th>
                                            <th className="text-left py-3 px-2 text-slate-400 font-medium">Email</th>
                                            <th className="text-right py-3 px-2 text-slate-400 font-medium">Score</th>
                                            <th className="text-right py-3 px-2 text-slate-400 font-medium">%</th>
                                            <th className="text-center py-3 px-2 text-slate-400 font-medium">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.map((r) => (
                                            <tr key={r.studentId} className="border-b border-slate-800/40 hover:bg-slate-800/30">
                                                <td className="py-3 px-2 text-white">{r.studentName}</td>
                                                <td className="py-3 px-2 text-slate-400">{r.email}</td>
                                                <td className="py-3 px-2 text-right text-white">{r.totalScore}</td>
                                                <td className="py-3 px-2 text-right text-cyan-400">{r.percentage}%</td>
                                                <td className="py-3 px-2 text-center">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${r.passStatus ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/10 text-red-400 border border-red-500/30'
                                                        }`}>
                                                        {r.passStatus ? 'PASS' : 'FAIL'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </main>
    );
}
