'use client';

import Link from 'next/link';
import { useEffect, useState, use } from 'react';

interface SessionDetail {
    id: string;
    startedAt: string;
    submittedAt: string | null;
    student: { firstName: string; lastName: string; email: string };
    exam: {
        title: string;
        examQuestions: { question: { id: string; type: string; content: Record<string, unknown>; points: number } }[];
    };
    answers: { id: string; questionId: string; response: unknown; autoScore: number | null; manualScore: number | null }[];
    suspiciousEvents: { id: string; type: string; severity: string; timestamp: string }[];
    result: { totalScore: number; percentage: number; passStatus: boolean } | null;
}

export default function ResultDetailPage({ params }: { params: Promise<{ sessionId: string }> }) {
    const { sessionId } = use(params);
    const [session, setSession] = useState<SessionDetail | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const res = await fetch(`/api/results/${sessionId}`);
                if (res.ok) {
                    const data = await res.json();
                    setSession(data.session);
                }
            } catch { /* ignore */ }
            setLoading(false);
        };
        fetchDetail();
    }, [sessionId]);

    if (loading) {
        return (
            <main className="min-h-screen bg-neutral-950 flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-2 border-emerald-400 border-t-transparent rounded-full" />
            </main>
        );
    }

    if (!session) {
        return (
            <main className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
                <p className="text-neutral-400">Session not found</p>
            </main>
        );
    }

    const getScoreForQuestion = (questionId: string) => {
        const answer = session.answers.find(a => a.questionId === questionId);
        if (!answer) return null;
        return answer.manualScore ?? answer.autoScore ?? 0;
    };

    const getResponseForQuestion = (questionId: string) => {
        const answer = session.answers.find(a => a.questionId === questionId);
        if (!answer) return 'No answer';
        const resp = answer.response;
        if (typeof resp === 'string') return resp;
        if (typeof resp === 'object' && resp !== null) return JSON.stringify(resp);
        return String(resp);
    };

    return (
        <main className="min-h-screen bg-neutral-950 text-white">
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -left-40 top-20 h-96 w-96 rounded-full bg-emerald-500/20 blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-4xl px-6 py-8">
                <Link href="/student/my-results" className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors mb-2 inline-block">← Back to Results</Link>

                {/* Header */}
                <div className="flex items-start justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white">{session.exam.title}</h1>
                        <p className="text-sm text-neutral-400 mt-1">
                            {session.student.firstName} {session.student.lastName}
                            {' · '}Submitted {session.submittedAt ? new Date(session.submittedAt).toLocaleString() : 'N/A'}
                        </p>
                    </div>
                    {session.result && (
                        <div className="text-right">
                            <p className="text-3xl font-bold text-emerald-400">{session.result.percentage}%</p>
                            <span className={`inline-block mt-1 px-3 py-1 rounded-full text-xs font-medium ${session.result.passStatus
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                    : 'bg-red-500/10 text-red-400 border border-red-500/30'
                                }`}>
                                {session.result.passStatus ? 'PASSED' : 'FAILED'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Question Breakdown */}
                <div className="space-y-4 mb-8">
                    <h2 className="text-lg font-semibold text-white">Question Breakdown</h2>
                    {session.exam.examQuestions.map((eq, i) => {
                        const q = eq.question;
                        const score = getScoreForQuestion(q.id);
                        const response = getResponseForQuestion(q.id);
                        const isCorrect = score !== null && score >= q.points;

                        return (
                            <div key={q.id} className={`rounded-2xl border p-5 ${isCorrect ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-red-500/30 bg-red-500/5'
                                }`}>
                                <div className="flex items-start justify-between">
                                    <div>
                                        <span className="text-xs text-neutral-400">Q{i + 1} · {q.type.replace(/_/g, ' ')}</span>
                                        <p className="text-sm text-white mt-1">{(q.content as Record<string, string>).text || 'Question'}</p>
                                    </div>
                                    <span className={`text-sm font-bold ${isCorrect ? 'text-emerald-400' : 'text-red-400'}`}>
                                        {score !== null ? score : '—'} / {q.points}
                                    </span>
                                </div>
                                <div className="mt-3 text-xs text-neutral-400">
                                    <span className="text-neutral-500">Your answer: </span>
                                    <span className="text-neutral-300">{response}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Suspicious Events */}
                {session.suspiciousEvents.length > 0 && (
                    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6">
                        <h2 className="text-lg font-semibold text-amber-400 mb-4">Suspicious Events ({session.suspiciousEvents.length})</h2>
                        <div className="space-y-2">
                            {session.suspiciousEvents.map((evt) => (
                                <div key={evt.id} className="flex items-center justify-between text-sm">
                                    <span className="text-neutral-300">{evt.type.replace(/_/g, ' ')}</span>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2 py-0.5 rounded-full text-xs ${evt.severity === 'HIGH' ? 'bg-red-500/10 text-red-400' :
                                                evt.severity === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400' :
                                                    'bg-blue-500/10 text-blue-400'
                                            }`}>
                                            {evt.severity}
                                        </span>
                                        <span className="text-neutral-500 text-xs">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
