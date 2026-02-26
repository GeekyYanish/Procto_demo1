'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
    return (
        <Suspense fallback={
            <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="animate-spin h-8 w-8 border-2 border-emerald-400 border-t-transparent rounded-full" />
            </main>
        }>
            <LoginContent />
        </Suspense>
    );
}

function LoginContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // Read role from query params to pre-select the toggle
    const roleParam = searchParams.get('role');
    const [isStudent, setIsStudent] = useState(roleParam !== 'faculty');
    const [isSignUp, setIsSignUp] = useState(false);

    // Shared fields
    const [emailOrUsername, setEmailOrUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);

    // Sign-up only fields
    const [signUpEmail, setSignUpEmail] = useState('');
    const [username, setUsername] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');

    // Username validation: only letters, numbers, underscores, 3-20 chars
    const isValidUsername = (u: string) => /^[a-zA-Z0-9_]{3,20}$/.test(u);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        if (isSignUp) {
            // ── Sign Up ──────────────────────────────────────────────
            if (!isValidUsername(username)) {
                setError('Username must be 3-20 characters and can only contain letters, numbers, and underscores.');
                setLoading(false);
                return;
            }
            if (!firstName.trim()) {
                setError('First name is required.');
                setLoading(false);
                return;
            }
            if (!lastName.trim()) {
                setError('Last name is required.');
                setLoading(false);
                return;
            }

            try {
                const res = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: signUpEmail,
                        password,
                        firstName: firstName.trim(),
                        lastName: lastName.trim(),
                        username: username.toLowerCase(),
                        role: isStudent ? 'STUDENT' : 'FACULTY',
                    }),
                });

                const data = await res.json();

                if (!res.ok) {
                    setError(data.error || 'Registration failed');
                    setLoading(false);
                    return;
                }

                // Registration successful — redirect to dashboard
                router.push(isStudent ? '/student' : '/faculty');
                router.refresh();
            } catch {
                setError('Network error. Please try again.');
                setLoading(false);
            }
        } else {
            // ── Sign In ──────────────────────────────────────────────
            try {
                const res = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        identifier: emailOrUsername.trim(),
                        password,
                    }),
                });

                const data = await res.json();

                if (!res.ok) {
                    setError(data.error || 'Login failed');
                    setLoading(false);
                    return;
                }

                // Navigate to appropriate dashboard
                const role = data.user?.role;
                router.push(role === 'FACULTY' ? '/faculty' : '/student');
                router.refresh();
            } catch {
                setError('Network error. Please try again.');
                setLoading(false);
            }
        }
    };

    // Common input class builder
    const inputClass = `w-full rounded-xl border bg-slate-950/60 px-4 py-3 text-slate-100 placeholder-slate-500 outline-none transition-all duration-300 ${isStudent ? 'border-slate-700/60 focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20' : 'border-slate-700/60 focus:border-violet-500/60 focus:ring-2 focus:ring-violet-500/20'}`;

    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 flex items-center justify-center">
            {/* Glow background */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div
                    className={`absolute -left-40 top-0 h-80 w-80 rounded-full blur-3xl transition-colors duration-500 ${isStudent ? 'bg-emerald-500/30' : 'bg-violet-500/30'}`}
                />
                <div
                    className={`absolute -right-32 bottom-0 h-72 w-72 rounded-full blur-3xl transition-colors duration-500 ${isStudent ? 'bg-emerald-500/25' : 'bg-cyan-500/25'}`}
                />
                <div
                    className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full blur-3xl transition-colors duration-500 ${isStudent ? 'bg-emerald-500/10' : 'bg-violet-500/10'}`}
                />
            </div>

            <div className="relative w-full max-w-md px-6">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link href="/" className="inline-flex items-center gap-2">
                        <div
                            className={`flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900/70 ring-1 shadow-lg transition-all duration-500 ${isStudent ? 'ring-emerald-400/40 shadow-emerald-500/30' : 'ring-violet-400/40 shadow-violet-500/30'}`}
                        >
                            <span
                                className={`text-2xl font-semibold tracking-tight transition-colors duration-500 ${isStudent ? 'text-emerald-400' : 'text-violet-400'}`}
                            >
                                P
                            </span>
                        </div>
                    </Link>
                    <h1 className="mt-4 text-2xl font-semibold text-slate-100">
                        Welcome to Procto
                    </h1>
                    <p className="mt-2 text-sm text-slate-400">
                        {isSignUp ? 'Create your account' : 'Sign in to access your'}{' '}
                        {!isSignUp && (isStudent ? 'exam session' : 'dashboard')}
                    </p>
                </div>

                {/* Login Card */}
                <div className="relative">
                    <div
                        className={`absolute -inset-1 rounded-3xl opacity-60 blur-xl transition-all duration-500 ${isStudent ? 'bg-gradient-to-tr from-emerald-500/30 via-emerald-500/10 to-emerald-500/30' : 'bg-gradient-to-tr from-violet-500/30 via-cyan-500/10 to-violet-500/30'}`}
                    />
                    <div className="relative rounded-3xl border border-slate-700/80 bg-slate-900/90 p-8 shadow-2xl backdrop-blur-xl">
                        {/* Toggle Switch */}
                        <div className="flex justify-center mb-8">
                            <div className="relative flex rounded-full border border-slate-700/60 bg-slate-900/80 p-1">
                                <div
                                    className={`absolute top-1 h-[calc(100%-8px)] w-[calc(50%-4px)] rounded-full transition-all duration-300 ${isStudent ? 'left-1 bg-emerald-500' : 'left-[calc(50%+2px)] bg-violet-500'}`}
                                />
                                <button
                                    onClick={() => setIsStudent(true)}
                                    className={`relative z-10 px-6 py-2 text-sm font-medium rounded-full transition-colors duration-300 ${isStudent ? 'text-black' : 'text-slate-400 hover:text-slate-200'}`}
                                >
                                    Student
                                </button>
                                <button
                                    onClick={() => setIsStudent(false)}
                                    className={`relative z-10 px-6 py-2 text-sm font-medium rounded-full transition-colors duration-300 ${!isStudent ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
                                >
                                    Faculty
                                </button>
                            </div>
                        </div>

                        {/* Error/Success Messages */}
                        {error && (
                            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                                {error}
                            </div>
                        )}
                        {message && (
                            <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
                                {message}
                            </div>
                        )}

                        {/* Login Form */}
                        <form onSubmit={handleSubmit} className="space-y-4">

                            {/* ─── SIGN UP FIELDS ─────────────────────────────── */}
                            {isSignUp && (
                                <>
                                    <div>
                                        <label htmlFor="username" className="block text-sm font-medium text-slate-300 mb-2">
                                            Username
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm">@</span>
                                            <input
                                                type="text"
                                                id="username"
                                                value={username}
                                                onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))}
                                                placeholder="choose_a_username"
                                                className={`${inputClass} pl-8`}
                                                required
                                                minLength={3}
                                                maxLength={20}
                                            />
                                        </div>
                                        <p className="mt-1 text-xs text-slate-500">
                                            3-20 characters. Letters, numbers, and underscores only.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label htmlFor="firstName" className="block text-sm font-medium text-slate-300 mb-2">
                                                First Name
                                            </label>
                                            <input
                                                type="text"
                                                id="firstName"
                                                value={firstName}
                                                onChange={(e) => setFirstName(e.target.value)}
                                                placeholder="John"
                                                className={inputClass}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="lastName" className="block text-sm font-medium text-slate-300 mb-2">
                                                Last Name
                                            </label>
                                            <input
                                                type="text"
                                                id="lastName"
                                                value={lastName}
                                                onChange={(e) => setLastName(e.target.value)}
                                                placeholder="Doe"
                                                className={inputClass}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="signUpEmail" className="block text-sm font-medium text-slate-300 mb-2">
                                            {isStudent ? 'Student Email' : 'Faculty Email'}
                                        </label>
                                        <input
                                            type="email"
                                            id="signUpEmail"
                                            value={signUpEmail}
                                            onChange={(e) => setSignUpEmail(e.target.value)}
                                            placeholder={isStudent ? 'student@university.edu' : 'faculty@university.edu'}
                                            className={inputClass}
                                            required
                                        />
                                    </div>
                                </>
                            )}

                            {/* ─── SIGN IN FIELD ──────────────────────────────── */}
                            {!isSignUp && (
                                <div>
                                    <label htmlFor="emailOrUsername" className="block text-sm font-medium text-slate-300 mb-2">
                                        Email or Username
                                    </label>
                                    <input
                                        type="text"
                                        id="emailOrUsername"
                                        value={emailOrUsername}
                                        onChange={(e) => setEmailOrUsername(e.target.value)}
                                        placeholder={isStudent ? 'student@university.edu or username' : 'faculty@university.edu or username'}
                                        className={inputClass}
                                        required
                                    />
                                </div>
                            )}

                            {/* Password Field */}
                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    className={inputClass}
                                    required
                                    minLength={6}
                                />
                            </div>

                            {/* Remember Me & Forgot Password (only for sign in) */}
                            {!isSignUp && (
                                <div className="flex items-center justify-between text-sm">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            className={`w-4 h-4 rounded border-slate-600 bg-slate-900 transition-colors ${isStudent ? 'text-emerald-500 focus:ring-emerald-500/30' : 'text-violet-500 focus:ring-violet-500/30'}`}
                                        />
                                        <span className="text-slate-400">Remember me</span>
                                    </label>
                                    <a
                                        href="#"
                                        className={`transition-colors ${isStudent ? 'text-emerald-400 hover:text-emerald-300' : 'text-violet-400 hover:text-violet-300'}`}
                                    >
                                        Forgot password?
                                    </a>
                                </div>
                            )}

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full rounded-xl py-3.5 text-sm font-semibold shadow-lg transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${isStudent ? 'bg-emerald-500 text-black shadow-emerald-500/30 hover:bg-emerald-400' : 'bg-violet-500 text-white shadow-violet-500/30 hover:bg-violet-400'}`}
                            >
                                {loading ? (
                                    <span className="inline-flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {isSignUp ? 'Creating Account...' : 'Signing In...'}
                                    </span>
                                ) : isSignUp ? (
                                    'Create Account'
                                ) : isStudent ? (
                                    'Enter Exam Lobby'
                                ) : (
                                    'Access Dashboard'
                                )}
                            </button>
                        </form>

                        {/* ─── OAUTH LOGIN BUTTONS ────────────────────────────── */}
                        <div className="mt-6">
                            <div className="relative mb-6">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-700/60"></div>
                                </div>
                                <div className="relative flex justify-center text-xs text-slate-500 uppercase font-medium tracking-widest">
                                    <span className="bg-slate-900/90 px-3">Or continue with</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <a
                                    href={`/api/auth/google?role=${isStudent ? 'STUDENT' : 'FACULTY'}`}
                                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-700/60 bg-slate-900/60 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-slate-800/80 hover:text-white"
                                >
                                    <svg className="h-5 w-5" viewBox="0 0 24 24">
                                        <path
                                            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            fill="#4285F4"
                                        />
                                        <path
                                            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            fill="#34A853"
                                        />
                                        <path
                                            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            fill="#FBBC05"
                                        />
                                        <path
                                            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            fill="#EA4335"
                                        />
                                    </svg>
                                    Google
                                </a>
                                <a
                                    href={`/api/auth/github?role=${isStudent ? 'STUDENT' : 'FACULTY'}`}
                                    className="flex items-center justify-center gap-2 rounded-xl border border-slate-700/60 bg-slate-900/60 py-2.5 text-sm font-medium text-slate-300 transition-all hover:bg-slate-800/80 hover:text-white"
                                >
                                    <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                                        <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.831.092-.646.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.269 2.75 1.025A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.025 2.747-1.025.546 1.379.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
                                    </svg>
                                    GitHub
                                </a>
                            </div>
                        </div>

                        {/* Sign Up / Sign In Toggle */}
                        <p className="mt-6 text-center text-sm text-slate-400">
                            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                            <button
                                onClick={() => {
                                    setIsSignUp(!isSignUp);
                                    setError('');
                                    setMessage('');
                                }}
                                className={`font-medium transition-colors ${isStudent ? 'text-emerald-400 hover:text-emerald-300' : 'text-violet-400 hover:text-violet-300'}`}
                            >
                                {isSignUp ? 'Sign in' : 'Sign up'}
                            </button>
                        </p>
                    </div>
                </div>

                {/* Back to Home */}
                <div className="mt-8 text-center">
                    <Link
                        href="/"
                        className="text-sm text-slate-500 hover:text-slate-300 transition-colors"
                    >
                        ← Back to home
                    </Link>
                </div>
            </div>
        </main>
    );
}
