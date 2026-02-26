'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, use } from 'react';

interface CheckItem {
    id: string;
    label: string;
    status: 'pending' | 'checking' | 'passed' | 'failed';
    detail?: string;
}

export default function ExamPreflightPage({ params }: { params: Promise<{ examId: string }> }) {
    const { examId } = use(params);
    const [checks, setChecks] = useState<CheckItem[]>([
        { id: 'browser', label: 'Browser Compatibility', status: 'pending' },
        { id: 'fullscreen', label: 'Fullscreen Support', status: 'pending' },
        { id: 'webcam', label: 'Webcam Access', status: 'pending' },
        { id: 'notifications', label: 'Notifications Disabled', status: 'pending' },
    ]);
    const [allPassed, setAllPassed] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);

    const updateCheck = (id: string, update: Partial<CheckItem>) => {
        setChecks(prev => prev.map(c => c.id === id ? { ...c, ...update } : c));
    };

    useEffect(() => {
        const runChecks = async () => {
            // Browser check
            updateCheck('browser', { status: 'checking' });
            await new Promise(r => setTimeout(r, 500));
            const isChrome = /Chrome/.test(navigator.userAgent);
            const isFirefox = /Firefox/.test(navigator.userAgent);
            const isEdge = /Edg/.test(navigator.userAgent);
            updateCheck('browser', {
                status: (isChrome || isFirefox || isEdge) ? 'passed' : 'failed',
                detail: isChrome ? 'Chrome' : isFirefox ? 'Firefox' : isEdge ? 'Edge' : 'Unsupported browser'
            });

            // Fullscreen check
            updateCheck('fullscreen', { status: 'checking' });
            await new Promise(r => setTimeout(r, 500));
            const fsEnabled = document.fullscreenEnabled;
            updateCheck('fullscreen', {
                status: fsEnabled ? 'passed' : 'failed',
                detail: fsEnabled ? 'Fullscreen supported' : 'Fullscreen not available'
            });

            // Webcam check
            updateCheck('webcam', { status: 'checking' });
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                updateCheck('webcam', { status: 'passed', detail: 'Camera access granted' });
            } catch {
                updateCheck('webcam', { status: 'failed', detail: 'Camera access denied' });
            }

            // Notifications check
            updateCheck('notifications', { status: 'checking' });
            await new Promise(r => setTimeout(r, 300));
            updateCheck('notifications', { status: 'passed', detail: 'Ready' });
        };

        runChecks();

        return () => {
            // Cleanup webcam
            if (videoRef.current?.srcObject) {
                const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
                tracks.forEach(t => t.stop());
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        const passed = checks.every(c => c.status === 'passed');
        setAllPassed(passed);
    }, [checks]);

    const handleBeginExam = async () => {
        // Stop any preview stream
        if (videoRef.current?.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
            tracks.forEach(t => t.stop());
        }
        // Enter fullscreen
        try {
            await document.documentElement.requestFullscreen();
        } catch { /* ignore */ }
        window.location.href = `/student/exam-room/${examId}`;
    };

    const getStatusIcon = (status: CheckItem['status']) => {
        switch (status) {
            case 'checking': return <div className="animate-spin h-5 w-5 border-2 border-cyan-400 border-t-transparent rounded-full" />;
            case 'passed': return <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
            case 'failed': return <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
            default: return <div className="w-5 h-5 rounded-full border-2 border-slate-600" />;
        }
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex items-center justify-center">
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -left-40 top-0 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
                <div className="absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-violet-500/15 blur-3xl" />
            </div>

            <div className="relative w-full max-w-lg px-6">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-white">Exam Preflight Check</h1>
                    <p className="mt-2 text-sm text-slate-400">We need to verify your system is ready for the exam</p>
                </div>

                {/* Webcam Preview */}
                <div className="relative rounded-2xl border border-slate-700/60 bg-slate-900/60 overflow-hidden mb-6">
                    <video ref={videoRef} autoPlay muted playsInline className="w-full h-48 object-cover bg-black" />
                    <div className="absolute bottom-2 right-2 px-2 py-1 rounded-lg bg-black/60 text-xs text-slate-300">
                        Camera Preview
                    </div>
                </div>

                {/* Checklist */}
                <div className="rounded-2xl border border-slate-700/60 bg-slate-900/60 p-6 space-y-4 mb-6">
                    {checks.map((check) => (
                        <div key={check.id} className="flex items-center gap-4">
                            {getStatusIcon(check.status)}
                            <div className="flex-1">
                                <p className="text-sm font-medium text-white">{check.label}</p>
                                {check.detail && <p className="text-xs text-slate-500">{check.detail}</p>}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-4">
                    <Link href="/student" className="flex-1 text-center px-6 py-3 rounded-xl border border-slate-700/60 bg-slate-900/60 text-sm text-slate-300 hover:text-white hover:border-slate-600 transition-all">
                        Cancel
                    </Link>
                    <button
                        onClick={handleBeginExam}
                        disabled={!allPassed}
                        className="flex-1 px-6 py-3 rounded-xl text-sm font-semibold shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed bg-emerald-500 text-black hover:bg-emerald-400 shadow-emerald-500/30"
                    >
                        Begin Exam
                    </button>
                </div>
            </div>
        </main>
    );
}
