'use client';

import Link from 'next/link';
import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

// ── Username Registry Helpers (localStorage) ──────────────────────────────
// Stores { username: email } mapping for uniqueness checks & login lookup
const USER_REGISTRY_KEY = 'procto_user_registry';

function getUserRegistry(): Record<string, string> {
    if (typeof window === 'undefined') return {};
    try {
        const raw = localStorage.getItem(USER_REGISTRY_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

function isUsernameTaken(username: string): boolean {
    const registry = getUserRegistry();
    return Object.keys(registry).some(
        (u) => u.toLowerCase() === username.toLowerCase()
    );
}

function registerUsername(username: string, email: string): void {
    const registry = getUserRegistry();
    registry[username.toLowerCase()] = email.toLowerCase();
    localStorage.setItem(USER_REGISTRY_KEY, JSON.stringify(registry));
}

function getEmailByUsername(username: string): string | null {
    const registry = getUserRegistry();
    return registry[username.toLowerCase()] ?? null;
}

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

    // Show error if redirected from OAuth failure
    const authError = searchParams.get('error');

    // Username validation: only letters, numbers, underscores, 3-20 chars
    const isValidUsername = (u: string) => /^[a-zA-Z0-9_]{3,20}$/.test(u);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        const supabase = createClient();

        if (isSignUp) {
            // ── Sign Up ──────────────────────────────────────────────
            // Validate username format
            if (!isValidUsername(username)) {
                setError('Username must be 3-20 characters and can only contain letters, numbers, and underscores.');
                setLoading(false);
                return;
            }

            // Check username uniqueness
            if (isUsernameTaken(username)) {
                setError('This username is already taken. Please choose a different one.');
                setLoading(false);
                return;
            }

            // Validate names
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

            const { error: signUpError } = await supabase.auth.signUp({
                email: signUpEmail,
                password,
                options: {
                    data: {
                        role: isStudent ? 'student' : 'faculty',
                        username: username.toLowerCase(),
                        first_name: firstName.trim(),
                        last_name: lastName.trim(),
                        full_name: `${firstName.trim()} ${lastName.trim()}`,
                    },
                },
            });

            if (signUpError) {
                setError(signUpError.message);
                setLoading(false);
                return;
            }

            // Register username → email mapping
            registerUsername(username, signUpEmail);

            setMessage('Account created! Check your email for a confirmation link.');
            setLoading(false);
        } else {
            // ── Sign In ──────────────────────────────────────────────
            let loginEmail = emailOrUsername.trim();

            // Determine if the input is an email or username
            if (!loginEmail.includes('@')) {
                // Treat as username → look up the email
                const resolvedEmail = getEmailByUsername(loginEmail);
                if (!resolvedEmail) {
                    setError('No account found with that username.');
                    setLoading(false);
                    return;
                }
                loginEmail = resolvedEmail;
            }

            const { error: signInError } = await supabase.auth.signInWithPassword({
                email: loginEmail,
                password,
            });

            if (signInError) {
                setError(signInError.message);
                setLoading(false);
                return;
            }

            // Navigate to appropriate dashboard after login
            if (isStudent) {
                router.push('/student');
            } else {
                router.push('/faculty');
            }
            router.refresh();
        }
    };

    const handleGoogleLogin = async () => {
        const supabase = createClient();
        const { error: oauthError } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${window.location.origin}/auth/callback?next=${isStudent ? '/student' : '/faculty'}`,
            },
        });

        if (oauthError) {
            setError(oauthError.message);
        }
    };

    const handleGitHubLogin = async () => {
        const supabase = createClient();
        const { error: oauthError } = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: `${window.location.origin}/auth/callback?next=${isStudent ? '/student' : '/faculty'}`,
            },
        });

        if (oauthError) {
            setError(oauthError.message);
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
                                {/* Background slider */}
                                <div
                                    className={`absolute top-1 h-[calc(100%-8px)] w-[calc(50%-4px)] rounded-full transition-all duration-300 ${isStudent ? 'left-1 bg-emerald-500' : 'left-[calc(50%+2px)] bg-violet-500'}`}
                                />

                                {/* Student Toggle */}
                                <button
                                    onClick={() => setIsStudent(true)}
                                    className={`relative z-10 px-6 py-2 text-sm font-medium rounded-full transition-colors duration-300 ${isStudent ? 'text-black' : 'text-slate-400 hover:text-slate-200'}`}
                                >
                                    Student
                                </button>

                                {/* Faculty Toggle */}
                                <button
                                    onClick={() => setIsStudent(false)}
                                    className={`relative z-10 px-6 py-2 text-sm font-medium rounded-full transition-colors duration-300 ${!isStudent ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
                                >
                                    Faculty
                                </button>
                            </div>
                        </div>

                        {/* Error/Success Messages */}
                        {(error || authError) && (
                            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                                {error || 'Authentication failed. Please try again.'}
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
                                    {/* Username Field */}
                                    <div>
                                        <label
                                            htmlFor="username"
                                            className="block text-sm font-medium text-slate-300 mb-2"
                                        >
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

                                    {/* First Name & Last Name Side-by-Side */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div>
                                            <label
                                                htmlFor="firstName"
                                                className="block text-sm font-medium text-slate-300 mb-2"
                                            >
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
                                            <label
                                                htmlFor="lastName"
                                                className="block text-sm font-medium text-slate-300 mb-2"
                                            >
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

                                    {/* Email Field (sign up) */}
                                    <div>
                                        <label
                                            htmlFor="signUpEmail"
                                            className="block text-sm font-medium text-slate-300 mb-2"
                                        >
                                            {isStudent ? 'Student Email' : 'Faculty Email'}
                                        </label>
                                        <input
                                            type="email"
                                            id="signUpEmail"
                                            value={signUpEmail}
                                            onChange={(e) => setSignUpEmail(e.target.value)}
                                            placeholder={
                                                isStudent
                                                    ? 'student@university.edu'
                                                    : 'faculty@university.edu'
                                            }
                                            className={inputClass}
                                            required
                                        />
                                    </div>
                                </>
                            )}

                            {/* ─── SIGN IN FIELD ──────────────────────────────── */}
                            {!isSignUp && (
                                <div>
                                    <label
                                        htmlFor="emailOrUsername"
                                        className="block text-sm font-medium text-slate-300 mb-2"
                                    >
                                        Email or Username
                                    </label>
                                    <input
                                        type="text"
                                        id="emailOrUsername"
                                        value={emailOrUsername}
                                        onChange={(e) => setEmailOrUsername(e.target.value)}
                                        placeholder={
                                            isStudent
                                                ? 'student@university.edu or @username'
                                                : 'faculty@university.edu or @username'
                                        }
                                        className={inputClass}
                                        required
                                    />
                                </div>
                            )}

                            {/* Password Field */}
                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium text-slate-300 mb-2"
                                >
                                    Password
                                </label>
                                <input
                                    type="password"
                                    id="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
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
                                        <span className="text-slate-400">
                                            Remember me
                                        </span>
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

                        {/* Divider */}
                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-700/60"></div>
                            </div>
                            <div className="relative flex justify-center text-xs">
                                <span className="bg-slate-900 px-3 text-slate-500">
                                    or continue with
                                </span>
                            </div>
                        </div>

                        {/* Social Login */}
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={handleGoogleLogin}
                                disabled={loading}
                                className="flex items-center justify-center gap-2 rounded-xl border border-slate-700/60 bg-slate-900/60 px-4 py-3 text-sm text-slate-300 transition-all hover:border-slate-600 hover:bg-slate-800/60 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg
                                    className="w-5 h-5"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
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
                            </button>
                            <button
                                onClick={handleGitHubLogin}
                                disabled={loading}
                                className="flex items-center justify-center gap-2 rounded-xl border border-slate-700/60 bg-slate-900/60 px-4 py-3 text-sm text-slate-300 transition-all hover:border-slate-600 hover:bg-slate-800/60 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <svg
                                    className="w-5 h-5"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                                </svg>
                                GitHub
                            </button>
                        </div>

                        {/* Sign Up / Sign In Toggle */}
                        <p className="mt-6 text-center text-sm text-slate-400">
                            {isSignUp ? 'Already have an account?' : "Don\u0027t have an account?"}{' '}
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
