// app/faculty/create-classroom/page.tsx
'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreateClassroomPage() {
    const [user, setUser] = useState<Record<string, unknown> | null>(null);
    const router = useRouter();

    // Form state
    const [classroomName, setClassroomName] = useState('');
    const [courseCode, setCourseCode] = useState('');
    const [subject, setSubject] = useState('');
    const [section, setSection] = useState('');
    const [description, setDescription] = useState('');

    // UI state
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [generatedCode, setGeneratedCode] = useState('');

    useEffect(() => {
        const getUser = async () => {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) { const data = await res.json(); setUser(data.user); }
            } catch { /* ignore */ }
        };
        getUser();
    }, []);

    const handleLogout = async () => {
        
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/');
        router.refresh();
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!classroomName.trim()) {
            setError('Please enter a classroom name.');
            return;
        }
        if (!courseCode.trim()) {
            setError('Please enter a course code.');
            return;
        }
        if (!subject.trim()) {
            setError('Please enter a subject.');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/courses', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: `${classroomName.trim()} — ${subject.trim()}`,
                    description: [
                        `Course: ${courseCode.trim()}`,
                        section.trim() ? `Section: ${section.trim()}` : '',
                        description.trim() || '',
                    ].filter(Boolean).join(' | '),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to create classroom.');
                setLoading(false);
                return;
            }

            setGeneratedCode(data.course.code);
            setSuccess(true);
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        setClassroomName('');
        setCourseCode('');
        setSubject('');
        setSection('');
        setDescription('');
        setError('');
        setSuccess(false);
        setGeneratedCode('');
    };

    // Get user initials for avatar
    const getInitials = () => {
        const u = user as Record<string, string> | null;
        if (u?.firstName && u?.lastName) return (u.firstName[0] + u.lastName[0]).toUpperCase();
        if (!u?.email) return 'FC';
        return u.email.substring(0, 2).toUpperCase();
    };

    // Get display name
    const getDisplayName = () => {
        const u = user as Record<string, string> | null;
        if (u?.firstName) return `${u.firstName} ${u.lastName}`;
        if (!u?.email) return 'Faculty';
        return u.email.split('@')[0];
    };

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
            {/* Glow background */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -left-40 top-0 h-80 w-80 rounded-full bg-violet-500/30 blur-3xl" />
                <div className="absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-cyan-500/25 blur-3xl" />
                <div className="absolute left-1/2 top-1/3 -translate-x-1/2 h-[500px] w-[500px] rounded-full bg-violet-500/5 blur-3xl" />
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
                                {!!user?.email && (
                                    <div className="px-3 py-2 text-xs text-slate-500 truncate border-t border-slate-700/60 mt-1 pt-2">
                                        {String(user.email)}
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
                <section className="flex flex-1 items-start justify-center pt-6 lg:pt-10">
                    <div className="w-full max-w-2xl">
                        {/* Back Link */}
                        <Link
                            href="/faculty"
                            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-cyan-400 transition-colors mb-8 group"
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

                        {/* Card */}
                        <div className="relative">
                            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-violet-500/30 via-cyan-500/10 to-violet-500/30 opacity-60 blur-xl" />
                            <div className="relative rounded-3xl border border-slate-700/80 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl sm:p-10">

                                {/* ── SUCCESS OVERLAY ── */}
                                {success ? (
                                    <div className="flex flex-col items-center text-center py-6">
                                        {/* Animated checkmark circle */}
                                        <div className="relative mb-6">
                                            <div className="absolute -inset-3 rounded-full bg-emerald-500/20 blur-xl animate-pulse" />
                                            <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-emerald-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-emerald-500/40">
                                                <svg
                                                    className="w-10 h-10 text-white"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={2.5}
                                                >
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
                                            Classroom Created{' '}
                                            <span className="bg-gradient-to-r from-emerald-300 to-cyan-300 bg-clip-text text-transparent">
                                                Successfully!
                                            </span>
                                        </h2>
                                        <p className="mt-3 text-slate-400 max-w-sm">
                                            Share the classroom code below with your students so they can join.
                                        </p>

                                        {/* Generated Code */}
                                        <div className="mt-8 w-full max-w-xs">
                                            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                                                Classroom Code
                                            </p>
                                            <div className="relative rounded-xl border border-cyan-500/40 bg-slate-950/70 px-6 py-4">
                                                <span className="font-mono text-2xl font-bold tracking-[0.2em] bg-gradient-to-r from-cyan-300 to-violet-300 bg-clip-text text-transparent">
                                                    {generatedCode}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Classroom Details Summary */}
                                        <div className="mt-6 w-full rounded-xl border border-slate-700/60 bg-slate-950/50 p-4 text-left space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Name</span>
                                                <span className="text-slate-200 font-medium">{classroomName}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Course</span>
                                                <span className="text-slate-200 font-medium">{courseCode}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-slate-500">Subject</span>
                                                <span className="text-slate-200 font-medium">{subject}</span>
                                            </div>
                                            {section && (
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-slate-500">Section</span>
                                                    <span className="text-slate-200 font-medium">{section}</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Action buttons */}
                                        <div className="mt-8 flex flex-col sm:flex-row gap-3 w-full">
                                            <Link
                                                href="/faculty/manage-classrooms"
                                                className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 py-3.5 text-base font-semibold text-white shadow-lg shadow-violet-500/30 transition-all duration-300 hover:shadow-violet-500/50 hover:scale-[1.02]"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                </svg>
                                                Go to Manage Classroom
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
                                            <div className="mx-auto w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mb-5">
                                                <svg
                                                    className="w-7 h-7 text-cyan-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                                    />
                                                </svg>
                                            </div>
                                            <h1 className="text-2xl font-bold text-white sm:text-3xl">
                                                Create a Classroom
                                            </h1>
                                            <p className="mt-2 text-sm text-slate-500">
                                                Set up a new classroom for your course. Students will use the generated code to join.
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
                                        <form onSubmit={handleSubmit} className="space-y-5">
                                            {/* Classroom Name */}
                                            <div>
                                                <label htmlFor="classroomName" className="block text-sm font-medium text-slate-300 mb-2">
                                                    Classroom Name <span className="text-red-400">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    id="classroomName"
                                                    value={classroomName}
                                                    onChange={(e) => setClassroomName(e.target.value)}
                                                    placeholder="e.g. MCA Semester 4 – Batch A"
                                                    className="w-full rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 py-3 text-white placeholder-slate-600 outline-none transition-all duration-300 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20"
                                                    autoFocus
                                                />
                                            </div>

                                            {/* Course Code & Subject – 2 cols */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label htmlFor="courseCode" className="block text-sm font-medium text-slate-300 mb-2">
                                                        Course Code <span className="text-red-400">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="courseCode"
                                                        value={courseCode}
                                                        onChange={(e) => setCourseCode(e.target.value.toUpperCase())}
                                                        placeholder="e.g. MCA401"
                                                        className="w-full rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 py-3 text-white placeholder-slate-600 outline-none transition-all duration-300 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 uppercase"
                                                    />
                                                </div>
                                                <div>
                                                    <label htmlFor="subject" className="block text-sm font-medium text-slate-300 mb-2">
                                                        Subject <span className="text-red-400">*</span>
                                                    </label>
                                                    <input
                                                        type="text"
                                                        id="subject"
                                                        value={subject}
                                                        onChange={(e) => setSubject(e.target.value)}
                                                        placeholder="e.g. Software Project Development"
                                                        className="w-full rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 py-3 text-white placeholder-slate-600 outline-none transition-all duration-300 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20"
                                                    />
                                                </div>
                                            </div>

                                            {/* Section / Batch */}
                                            <div>
                                                <label htmlFor="section" className="block text-sm font-medium text-slate-300 mb-2">
                                                    Section / Batch <span className="text-slate-600">(optional)</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    id="section"
                                                    value={section}
                                                    onChange={(e) => setSection(e.target.value)}
                                                    placeholder="e.g. Batch A, Section II"
                                                    className="w-full rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 py-3 text-white placeholder-slate-600 outline-none transition-all duration-300 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20"
                                                />
                                            </div>

                                            {/* Description */}
                                            <div>
                                                <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
                                                    Description <span className="text-slate-600">(optional)</span>
                                                </label>
                                                <textarea
                                                    id="description"
                                                    value={description}
                                                    onChange={(e) => setDescription(e.target.value)}
                                                    placeholder="Brief description about this classroom..."
                                                    rows={3}
                                                    className="w-full rounded-xl border border-slate-700/80 bg-slate-950/60 px-4 py-3 text-white placeholder-slate-600 outline-none transition-all duration-300 focus:border-cyan-500/60 focus:ring-2 focus:ring-cyan-500/20 resize-none"
                                                />
                                            </div>

                                            {/* Submit */}
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 py-3.5 text-base font-semibold text-white shadow-lg shadow-violet-500/30 transition-all duration-300 hover:shadow-violet-500/50 hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
                                            >
                                                {loading ? (
                                                    <span className="inline-flex items-center gap-2">
                                                        <svg
                                                            className="animate-spin h-5 w-5"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                        >
                                                            <circle
                                                                className="opacity-25"
                                                                cx="12"
                                                                cy="12"
                                                                r="10"
                                                                stroke="currentColor"
                                                                strokeWidth="4"
                                                            />
                                                            <path
                                                                className="opacity-75"
                                                                fill="currentColor"
                                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                            />
                                                        </svg>
                                                        Creating Classroom...
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-2">
                                                        Create Classroom
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                                        </svg>
                                                    </span>
                                                )}
                                            </button>
                                        </form>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
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

            {/* Checkmark draw animation */}
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
