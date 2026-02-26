'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';

interface Session {
    id: string;
    startedAt: string;
    student: { firstName: string; lastName: string; email: string };
    exam: { title: string; durationMinutes: number };
    suspiciousEvents: { id: string; type: string; severity: string; timestamp: string }[];
    _count: { suspiciousEvents: number };
}

export default function ProctorDashboardPage() {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedSession, setSelectedSession] = useState<string | null>(null);

    const fetchSessions = useCallback(async () => {
        try {
            const res = await fetch('/api/proctor/sessions');
            if (res.ok) {
                const data = await res.json();
                setSessions(data.sessions);
            }
        } catch { /* ignore */ }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchSessions();
        const interval = setInterval(fetchSessions, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, [fetchSessions]);

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'HIGH': return 'text-red-400 bg-red-500/10 border-red-500/30';
            case 'MEDIUM': return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
            default: return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
        }
    };

    const getElapsedTime = (startedAt: string) => {
        const diff = Date.now() - new Date(startedAt).getTime();
        const mins = Math.floor(diff / 60000);
        return `${mins}m`;
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -left-40 top-0 h-80 w-80 rounded-full bg-red-500/20 blur-3xl" />
                <div className="absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-orange-500/15 blur-3xl" />
            </div>

            <div className="relative mx-auto max-w-7xl px-6 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <Link href="/faculty" className="text-sm text-slate-500 hover:text-slate-300 transition-colors mb-2 inline-block">← Back to Dashboard</Link>
                        <h1 className="text-3xl font-bold text-white">
                            Proctor <span className="text-red-400">Dashboard</span>
                        </h1>
                        <p className="mt-1 text-sm text-slate-400">Monitor active exam sessions in real-time</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse shadow-[0_0_8px_rgba(248,113,113,0.8)]" />
                        <span className="text-sm text-slate-400">Live Monitoring</span>
                    </div>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="animate-spin h-8 w-8 border-2 border-red-400 border-t-transparent rounded-full" />
                    </div>
                ) : sessions.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-slate-300">No Active Sessions</h3>
                        <p className="mt-1 text-sm text-slate-500">There are no exam sessions being taken right now.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Session List */}
                        <div className="lg:col-span-2 space-y-4">
                            <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Active Sessions ({sessions.length})</h2>
                            {sessions.map((session) => (
                                <button
                                    key={session.id}
                                    onClick={() => setSelectedSession(session.id === selectedSession ? null : session.id)}
                                    className={`w-full text-left rounded-2xl border p-5 transition-all duration-300 ${selectedSession === session.id
                                            ? 'border-red-500/50 bg-slate-800/80 shadow-lg shadow-red-500/10'
                                            : 'border-slate-700/60 bg-slate-900/60 hover:border-slate-600'
                                        }`}
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-white">{session.student.firstName} {session.student.lastName}</p>
                                            <p className="text-xs text-slate-500">{session.student.email}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-slate-300">{session.exam.title}</p>
                                            <p className="text-xs text-slate-500">{getElapsedTime(session.startedAt)} elapsed</p>
                                        </div>
                                    </div>
                                    <div className="mt-3 flex items-center gap-3">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${session._count.suspiciousEvents > 5 ? 'text-red-400 bg-red-500/10 border-red-500/30' :
                                                session._count.suspiciousEvents > 0 ? 'text-amber-400 bg-amber-500/10 border-amber-500/30' :
                                                    'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
                                            }`}>
                                            {session._count.suspiciousEvents} violations
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        {/* Event Detail Panel */}
                        <div className="lg:col-span-1">
                            <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-4">Event Timeline</h2>
                            {selectedSession ? (
                                <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-5 space-y-3">
                                    {sessions.find(s => s.id === selectedSession)?.suspiciousEvents.map((evt) => (
                                        <div key={evt.id} className={`rounded-xl border p-3 ${getSeverityColor(evt.severity)}`}>
                                            <div className="flex justify-between items-start">
                                                <span className="text-xs font-medium">{evt.type.replace(/_/g, ' ')}</span>
                                                <span className="text-[0.65rem] opacity-70">{new Date(evt.timestamp).toLocaleTimeString()}</span>
                                            </div>
                                        </div>
                                    )) || <p className="text-sm text-slate-500">No events</p>}
                                </div>
                            ) : (
                                <div className="rounded-2xl border border-slate-700/60 bg-slate-900/40 p-8 text-center">
                                    <p className="text-sm text-slate-500">Select a session to view events</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}
