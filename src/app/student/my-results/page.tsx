'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface ResultItem {
    id: string;
    totalScore: number;
    percentage: number;
    passStatus: boolean;
    finalizedAt: string | null;
    session: {
        id: string;
        exam: { id: string; title: string; durationMinutes: number };
        _count: { suspiciousEvents: number };
    };
}

export default function MyResultsPage() {
    const [results, setResults] = useState<ResultItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            try {
                const res = await fetch('/api/results');
                if (res.ok) {
                    const data = await res.json();
                    setResults(data.results || []);
                }
            } catch { /* ignore */ }
            setLoading(false);
        };
        fetchResults();
    }, []);

    return (
        <main className="min-h-screen bg-neutral-950 text-white">
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
                <div className="absolute -right-32 bottom-20 h-80 w-80 rounded-full bg-emerald-500/15 blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-4xl px-6 py-8">
                <Link href="/student" className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors mb-2 inline-block">← Back to Dashboard</Link>
                <h1 className="text-3xl font-bold text-white mb-1">
                    My <span className="text-emerald-400">Results</span>
                </h1>
                <p className="text-sm text-neutral-400 mb-8">View your exam scores and performance</p>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin h-8 w-8 border-2 border-emerald-400 border-t-transparent rounded-full" />
                    </div>
                ) : results.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-neutral-800/60 border border-neutral-700/60 flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-neutral-300">No Results Yet</h3>
                        <p className="mt-1 text-sm text-neutral-500">Complete an exam to see your results here.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {results.map((result) => (
                            <Link
                                key={result.id}
                                href={`/student/result/${result.session.id}`}
                                className="block rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 hover:border-emerald-500/40 transition-all group"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors">{result.session.exam.title}</h3>
                                        <p className="text-xs text-neutral-500">
                                            {result.finalizedAt ? new Date(result.finalizedAt).toLocaleDateString() : 'Pending'}
                                            {' · '}{result.session.exam.durationMinutes} min
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-emerald-400">{result.percentage}%</p>
                                        <span className={`inline-block mt-1 px-2.5 py-0.5 rounded-full text-xs font-medium ${result.passStatus
                                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                                : 'bg-red-500/10 text-red-400 border border-red-500/30'
                                            }`}>
                                            {result.passStatus ? 'PASSED' : 'FAILED'}
                                        </span>
                                    </div>
                                </div>
                                {result.session._count.suspiciousEvents > 0 && (
                                    <div className="mt-3">
                                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs">
                                            ⚠ {result.session._count.suspiciousEvents} suspicious events
                                        </span>
                                    </div>
                                )}
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
