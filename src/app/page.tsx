// app/page.tsx
import Link from 'next/link';

export default function HomePage() {
    return (
        <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100">
            {/* Glow background */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -left-40 top-0 h-80 w-80 rounded-full bg-cyan-500/30 blur-3xl" />
                <div className="absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-violet-500/25 blur-3xl" />
            </div>

            {/* Outer container uses full width on large screens */}
            <div className="relative mx-auto flex w-full flex-col px-6 py-8 sm:px-8 lg:px-12 xl:px-20 xl:py-12">
                {/* Top bar */}
                <header className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
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
                    </div>

                    <nav className="hidden items-center gap-6 text-sm text-slate-300 sm:flex">
                        <a
                            href="#home"
                            className="text-cyan-300 transition-colors hover:text-cyan-300"
                        >
                            Home
                        </a>
                        <a
                            href="#features"
                            className="transition-colors hover:text-cyan-300"
                        >
                            Features
                        </a>
                        <a
                            href="#about"
                            className="transition-colors hover:text-cyan-300"
                        >
                            About Us
                        </a>
                    </nav>
                </header>

                {/* Hero Section */}
                <section
                    id="home"
                    className="mt-12 flex min-h-[80vh] items-center justify-center lg:mt-16 xl:mt-20"
                >
                    <div className="flex w-full max-w-6xl flex-col gap-12 lg:flex-row lg:items-center">
                        {/* Left: text */}
                        <div className="flex w-full flex-1 flex-col justify-center">
                            <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-xs text-slate-300 shadow-sm shadow-cyan-500/30 backdrop-blur">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                Live exam monitoring in under 60 seconds
                            </div>

                            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-50 sm:text-5xl lg:text-6xl xl:text-7xl 2xl:text-8xl">
                                Next‑gen{' '}
                                <span className="bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400 bg-clip-text text-transparent">
                                    proctoring
                                </span>{' '}
                                for remote exams.
                            </h1>

                            <p className="mt-5 max-w-2xl text-base text-slate-300 sm:text-lg lg:text-xl">
                                Procto lets faculty spin up secure, QR‑enabled
                                exam sessions and monitor activity in real time,
                                while students join with a single code from any
                                device.
                            </p>

                            {/* CTAs */}
                            <div className="mt-6 flex flex-wrap items-center gap-3">
                                <Link
                                    href="/login"
                                    className="group inline-flex items-center justify-center rounded-full bg-cyan-500 px-6 py-2.5 text-sm font-medium text-slate-950 shadow-lg shadow-cyan-500/40 transition hover:bg-cyan-400"
                                >
                                    Faculty login
                                    <span className="ml-2 text-lg leading-none transition-transform group-hover:translate-x-0.5">
                                        →
                                    </span>
                                </Link>

                                <Link
                                    href="/login"
                                    className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900/70 px-5 py-2.5 text-sm font-medium text-slate-200 backdrop-blur hover:border-cyan-400/70 hover:text-cyan-200"
                                >
                                    Student login
                                </Link>
                            </div>

                            {/* Small feature list */}
                            <div className="mt-5 flex flex-wrap gap-4 text-xs text-slate-400 sm:text-sm">
                                <div className="flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                                    QR‑based session join
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                                    Face &amp; tab activity hooks
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                    Real‑time integrity score
                                </div>
                            </div>
                        </div>

                        {/* Right: futuristic card */}
                        <div className="flex w-full flex-1 items-center justify-center">
                            <div className="relative w-full max-w-md lg:max-w-xl xl:max-w-2xl">
                                <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-tr from-cyan-500/40 via-sky-500/30 to-violet-500/40 opacity-60 blur-xl" />
                                <div className="relative rounded-3xl border border-slate-700/80 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl sm:p-7 lg:p-8">
                                    <div className="flex items-center justify-between text-xs text-slate-300">
                                        <span className="uppercase tracking-[0.16em] text-slate-400">
                                            Live session
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
                                            Monitoring
                                        </span>
                                    </div>

                                    <div className="mt-4 rounded-2xl border border-slate-700/60 bg-slate-900/60 p-4 sm:p-5 lg:p-6">
                                        <div className="flex items-center justify-between text-xs text-slate-300">
                                            <div className="space-y-1">
                                                <p className="text-[0.7rem] uppercase tracking-[0.18em] text-slate-500">
                                                    Session code
                                                </p>
                                                <p className="font-mono text-lg sm:text-xl text-cyan-300">
                                                    PROCTO‑4821
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end space-y-1">
                                                <p className="text-[0.7rem] uppercase tracking-[0.18em] text-slate-500">
                                                    Active students
                                                </p>
                                                <p className="text-lg sm:text-xl font-semibold text-slate-50">
                                                    32
                                                </p>
                                            </div>
                                        </div>

                                        {/* Fake QR placeholder */}
                                        <div className="mt-4 grid grid-cols-2 gap-3 sm:gap-4">
                                            <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-700/80 bg-slate-950/60 p-4 sm:p-5">
                                                <div className="h-24 w-24 sm:h-28 sm:w-28 rounded-md bg-[radial-gradient(circle_at_10px_10px,#22d3ee_1px,transparent_1px)] bg-[length:10px_10px]" />
                                            </div>
                                            <div className="flex flex-col justify-between text-xs text-slate-300">
                                                <div>
                                                    <p className="text-[0.7rem] uppercase tracking-[0.18em] text-slate-500">
                                                        Join in 3 steps
                                                    </p>
                                                    <ol className="mt-1 space-y-1">
                                                        <li>
                                                            1. Scan QR or enter
                                                            code
                                                        </li>
                                                        <li>
                                                            2. Verify camera
                                                            &amp; mic
                                                        </li>
                                                        <li>
                                                            3. Start exam
                                                            securely
                                                        </li>
                                                    </ol>
                                                </div>
                                                <button className="mt-2 inline-flex items-center self-start rounded-full bg-slate-50/5 px-3 py-1 text-[0.7rem] font-medium text-cyan-200 ring-1 ring-slate-600 hover:ring-cyan-400/70">
                                                    Preview student view
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom stats */}
                                    <div className="mt-4 grid grid-cols-3 gap-2 text-[0.7rem] text-slate-300 sm:gap-3">
                                        <div className="rounded-xl border border-slate-700/70 bg-slate-900/70 p-2 sm:p-3">
                                            <p className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-500">
                                                Anomalies
                                            </p>
                                            <p className="mt-1 text-sm sm:text-base font-semibold text-amber-300">
                                                3 flagged
                                            </p>
                                        </div>
                                        <div className="rounded-xl border border-slate-700/70 bg-slate-900/70 p-2 sm:p-3">
                                            <p className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-500">
                                                Focus score
                                            </p>
                                            <p className="mt-1 text-sm sm:text-base font-semibold text-emerald-300">
                                                92%
                                            </p>
                                        </div>
                                        <div className="rounded-xl border border-slate-700/70 bg-slate-900/70 p-2 sm:p-3">
                                            <p className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-500">
                                                Integrity
                                            </p>
                                            <p className="mt-1 text-sm sm:text-base font-semibold text-cyan-300">
                                                Stable
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-20 scroll-mt-20">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-xs text-slate-300 mb-4">
                                <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                                Powerful Features
                            </div>
                            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-slate-50 mb-4">
                                Everything you need for{' '}
                                <span className="bg-gradient-to-r from-cyan-300 to-violet-400 bg-clip-text text-transparent">
                                    secure exams
                                </span>
                            </h2>
                            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
                                AI-powered proctoring that ensures integrity
                                while keeping the experience smooth for students
                                and faculty alike.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Feature 1: Live Proctoring */}
                            <div className="group relative rounded-2xl border border-slate-700/60 bg-slate-900/60 p-6 backdrop-blur-sm hover:border-cyan-400/50 transition-all duration-300">
                                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-cyan-500/10 to-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center mb-4 group-hover:bg-cyan-500/30 transition-colors">
                                        <svg
                                            className="w-6 h-6 text-cyan-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-slate-100 mb-2">
                                        Live Proctoring
                                    </h3>
                                    <p className="text-slate-400">
                                        Real-time webcam and screen monitoring
                                        with AI-powered anomaly detection to
                                        flag suspicious behavior instantly.
                                    </p>
                                </div>
                            </div>

                            {/* Feature 2: QR-Based Join */}
                            <div className="group relative rounded-2xl border border-slate-700/60 bg-slate-900/60 p-6 backdrop-blur-sm hover:border-violet-400/50 transition-all duration-300">
                                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-violet-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-xl bg-violet-500/20 flex items-center justify-center mb-4 group-hover:bg-violet-500/30 transition-colors">
                                        <svg
                                            className="w-6 h-6 text-violet-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-slate-100 mb-2">
                                        QR-Based Join
                                    </h3>
                                    <p className="text-slate-400">
                                        Students can join exam sessions
                                        instantly by scanning a QR code or
                                        entering a simple session code.
                                    </p>
                                </div>
                            </div>

                            {/* Feature 3: Real-time Analytics */}
                            <div className="group relative rounded-2xl border border-slate-700/60 bg-slate-900/60 p-6 backdrop-blur-sm hover:border-emerald-400/50 transition-all duration-300">
                                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4 group-hover:bg-emerald-500/30 transition-colors">
                                        <svg
                                            className="w-6 h-6 text-emerald-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-slate-100 mb-2">
                                        Real-time Analytics
                                    </h3>
                                    <p className="text-slate-400">
                                        Live dashboards with integrity scores,
                                        focus metrics, and comprehensive reports
                                        for faculty review.
                                    </p>
                                </div>
                            </div>

                            {/* Feature 4: Secure Environment */}
                            <div className="group relative rounded-2xl border border-slate-700/60 bg-slate-900/60 p-6 backdrop-blur-sm hover:border-amber-400/50 transition-all duration-300">
                                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center mb-4 group-hover:bg-amber-500/30 transition-colors">
                                        <svg
                                            className="w-6 h-6 text-amber-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-slate-100 mb-2">
                                        Secure Environment
                                    </h3>
                                    <p className="text-slate-400">
                                        Full-screen lockdown with tab-switch
                                        detection and copy-paste blocking to
                                        maintain exam integrity.
                                    </p>
                                </div>
                            </div>

                            {/* Feature 5: Multi-Device Support */}
                            <div className="group relative rounded-2xl border border-slate-700/60 bg-slate-900/60 p-6 backdrop-blur-sm hover:border-pink-400/50 transition-all duration-300">
                                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-pink-500/10 to-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-xl bg-pink-500/20 flex items-center justify-center mb-4 group-hover:bg-pink-500/30 transition-colors">
                                        <svg
                                            className="w-6 h-6 text-pink-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-slate-100 mb-2">
                                        Multi-Device Support
                                    </h3>
                                    <p className="text-slate-400">
                                        Works seamlessly on desktops, laptops,
                                        tablets, and mobile phones with
                                        responsive design.
                                    </p>
                                </div>
                            </div>

                            {/* Feature 6: Instant Results */}
                            <div className="group relative rounded-2xl border border-slate-700/60 bg-slate-900/60 p-6 backdrop-blur-sm hover:border-sky-400/50 transition-all duration-300">
                                <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-sky-500/10 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity blur-xl" />
                                <div className="relative">
                                    <div className="w-12 h-12 rounded-xl bg-sky-500/20 flex items-center justify-center mb-4 group-hover:bg-sky-500/30 transition-colors">
                                        <svg
                                            className="w-6 h-6 text-sky-400"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M13 10V3L4 14h7v7l9-11h-7z"
                                            />
                                        </svg>
                                    </div>
                                    <h3 className="text-xl font-semibold text-slate-100 mb-2">
                                        Instant Results
                                    </h3>
                                    <p className="text-slate-400">
                                        Automated grading and immediate result
                                        generation with detailed performance
                                        analytics.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* About Us Section */}
                <section id="about" className="py-20 scroll-mt-20">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                            {/* Left: Content */}
                            <div>
                                <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-900/70 px-3 py-1 text-xs text-slate-300 mb-4">
                                    <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                                    About Us
                                </div>
                                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-slate-50 mb-6">
                                    Built for{' '}
                                    <span className="bg-gradient-to-r from-violet-300 to-cyan-400 bg-clip-text text-transparent">
                                        Christ University MCA
                                    </span>
                                </h2>
                                <p className="text-slate-300 text-lg mb-6 leading-relaxed">
                                    Procto is an innovative exam proctoring
                                    platform developed as part of the Software
                                    Project Development course at Christ
                                    University. Our mission is to provide a
                                    secure, fair, and seamless online
                                    examination experience for educational
                                    institutions.
                                </p>
                                <p className="text-slate-400 mb-8 leading-relaxed">
                                    We combine cutting-edge AI technology with
                                    intuitive design to detect irregularities
                                    while respecting student privacy. Our
                                    platform empowers faculty with real-time
                                    monitoring tools and provides students with
                                    a distraction-free exam environment.
                                </p>

                                {/* Stats */}
                                <div className="grid grid-cols-3 gap-6">
                                    <div className="text-center">
                                        <p className="text-3xl font-bold text-cyan-400">
                                            99.9%
                                        </p>
                                        <p className="text-sm text-slate-500 mt-1">
                                            Uptime
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-3xl font-bold text-violet-400">
                                            50K+
                                        </p>
                                        <p className="text-sm text-slate-500 mt-1">
                                            Exams Proctored
                                        </p>
                                    </div>
                                    <div className="text-center">
                                        <p className="text-3xl font-bold text-emerald-400">
                                            98%
                                        </p>
                                        <p className="text-sm text-slate-500 mt-1">
                                            Detection Rate
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Right: Team/Values Card */}
                            <div className="relative">
                                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-tr from-violet-500/30 via-cyan-500/20 to-violet-500/30 opacity-60 blur-xl" />
                                <div className="relative rounded-3xl border border-slate-700/80 bg-slate-900/80 p-8 backdrop-blur-xl">
                                    <h3 className="text-xl font-semibold text-slate-100 mb-6">
                                        Our Core Values
                                    </h3>

                                    <div className="space-y-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                                                <svg
                                                    className="w-5 h-5 text-cyan-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                                                    />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-slate-100">
                                                    Integrity First
                                                </h4>
                                                <p className="text-sm text-slate-400">
                                                    Maintaining academic honesty
                                                    through fair and transparent
                                                    monitoring.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                                                <svg
                                                    className="w-5 h-5 text-violet-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                                                    />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-slate-100">
                                                    Student-Centric
                                                </h4>
                                                <p className="text-sm text-slate-400">
                                                    Designing experiences that
                                                    minimize stress and maximize
                                                    focus.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                                                <svg
                                                    className="w-5 h-5 text-emerald-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                                    />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-slate-100">
                                                    Innovation Driven
                                                </h4>
                                                <p className="text-sm text-slate-400">
                                                    Leveraging AI and modern
                                                    tech for smarter proctoring
                                                    solutions.
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                                                <svg
                                                    className="w-5 h-5 text-pink-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        strokeWidth={2}
                                                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                                    />
                                                </svg>
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-slate-100">
                                                    Privacy Respected
                                                </h4>
                                                <p className="text-sm text-slate-400">
                                                    Protecting student data with
                                                    enterprise-grade security.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
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
        </main>
    );
}
