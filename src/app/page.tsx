// app/page.tsx
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Shield, Eye, Brain, Lock, Fingerprint, Cpu, Scan, Zap, ChevronRight, ArrowRight, Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ParticleField from '@/components/ParticleField';
import GlitchText from '@/components/GlitchText';
import AnimatedCounter from '@/components/AnimatedCounter';

/* ── Data ────────────────────────────────────────────────────── */
const features = [
    { icon: Eye, title: 'Visual Intelligence', desc: 'Real-time gaze tracking and face detection powered by advanced neural networks.', accent: 'cyan' },
    { icon: Brain, title: 'Behavioral Analysis', desc: 'AI monitors keystroke patterns, mouse behavior, and browsing anomalies.', accent: 'violet' },
    { icon: Lock, title: 'Secure Environment', desc: 'Locked-down browser with tab-switch detection and screen capture prevention.', accent: 'emerald' },
    { icon: Fingerprint, title: 'Identity Verification', desc: 'Biometric authentication ensures the right person takes the exam.', accent: 'pink' },
    { icon: Cpu, title: 'Edge Processing', desc: 'On-device ML inference for real-time analysis with zero latency.', accent: 'sky' },
    { icon: Scan, title: 'Anomaly Detection', desc: 'Multi-signal fusion detects suspicious patterns across all monitored channels.', accent: 'amber' },
];

const accentColors: Record<string, { bg: string; bgHover: string; text: string; border: string; glow: string }> = {
    cyan: { bg: 'bg-cyan-500/10', bgHover: 'group-hover:bg-cyan-500/20', text: 'text-cyan-400', border: 'hover:border-cyan-400/50', glow: 'group-hover:shadow-cyan-500/10' },
    violet: { bg: 'bg-violet-500/10', bgHover: 'group-hover:bg-violet-500/20', text: 'text-violet-400', border: 'hover:border-violet-400/50', glow: 'group-hover:shadow-violet-500/10' },
    emerald: { bg: 'bg-emerald-500/10', bgHover: 'group-hover:bg-emerald-500/20', text: 'text-emerald-400', border: 'hover:border-emerald-400/50', glow: 'group-hover:shadow-emerald-500/10' },
    pink: { bg: 'bg-pink-500/10', bgHover: 'group-hover:bg-pink-500/20', text: 'text-pink-400', border: 'hover:border-pink-400/50', glow: 'group-hover:shadow-pink-500/10' },
    sky: { bg: 'bg-sky-500/10', bgHover: 'group-hover:bg-sky-500/20', text: 'text-sky-400', border: 'hover:border-sky-400/50', glow: 'group-hover:shadow-sky-500/10' },
    amber: { bg: 'bg-amber-500/10', bgHover: 'group-hover:bg-amber-500/20', text: 'text-amber-400', border: 'hover:border-amber-400/50', glow: 'group-hover:shadow-amber-500/10' },
};

const capabilities = [
    { title: 'Neuro-Sync Protocol', desc: 'Synchronizes proctoring signals across audio, video, and behavioral channels for unified integrity scoring.' },
    { title: 'Visual-Lock Engine', desc: 'Computer vision pipeline that tracks eye movement, head pose, and environmental context in real-time.' },
    { title: 'Adaptive Threshold AI', desc: 'Machine learning models that adapt sensitivity based on exam difficulty and historical patterns.' },
];

const stats = [
    { value: '99.7%', label: 'Detection Accuracy' },
    { value: '50ms', label: 'Response Latency' },
    { value: '10000+', label: 'Exams Proctored' },
    { value: '24/7', label: 'System Uptime' },
];

const marqueeItems = [
    'Neural Integrity', 'AI Proctoring', 'Real-Time Detection', 'Edge Computing',
    'Behavioral Analysis', 'Visual Lock', 'Anomaly Detection', 'Biometric Auth',
];

/* ── Animations ──────────────────────────────────────────────── */
const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as const },
    }),
};

const staggerContainer = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
};

export default function HomePage() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            setScrollProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
            setIsScrolled(scrollTop > 20);
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 relative">
            <ParticleField />

            {/* Scroll progress bar */}
            <div
                className="scroll-progress"
                style={{ width: `${scrollProgress}%` }}
            />

            {/* ─── NAVBAR ─────────────────────────────────────────── */}
            <nav className={`sticky top-0 z-50 glass border-b border-white/5 px-6 py-4 transition-all duration-300 ${isScrolled ? 'shadow-lg shadow-black/20' : ''}`}>
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-slate-900 border border-white/10 group-hover:border-cyan-400/50 group-hover:shadow-lg group-hover:shadow-cyan-500/20 transition-all duration-300 shadow-2xl">
                            <Shield className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
                            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 to-transparent pointer-events-none rounded-xl" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
                                PROCTO
                            </span>
                            <span className="mono text-[8px] font-bold text-cyan-400 uppercase tracking-[0.3em] leading-none">
                                Neural Systems
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <div className="hidden md:flex items-center gap-8 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                        <a href="#home" className="hover:text-cyan-400 transition-colors relative group">
                            Home
                            <span className="absolute -bottom-1 left-0 w-0 h-px bg-cyan-400 group-hover:w-full transition-all duration-300" />
                        </a>
                        <a href="#features" className="hover:text-cyan-400 transition-colors relative group">
                            Features
                            <span className="absolute -bottom-1 left-0 w-0 h-px bg-cyan-400 group-hover:w-full transition-all duration-300" />
                        </a>
                        <a href="#about" className="hover:text-cyan-400 transition-colors relative group">
                            About
                            <span className="absolute -bottom-1 left-0 w-0 h-px bg-cyan-400 group-hover:w-full transition-all duration-300" />
                        </a>
                    </div>

                    {/* Desktop CTAs */}
                    <div className="hidden md:flex items-center gap-3">
                        <Link href="/login?role=student" className="shimmer-btn px-6 py-2.5 text-xs font-black uppercase tracking-widest bg-cyan-400 text-slate-950 hover:bg-cyan-300 transition-all shadow-xl rounded-xl">
                            Login
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-slate-400 hover:text-white transition-colors"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3, ease: 'easeInOut' }}
                            className="md:hidden mt-4 pt-4 border-t border-white/5 space-y-1 overflow-hidden"
                        >
                            <a href="#home" className="block px-4 py-3 text-sm text-slate-400 hover:text-cyan-400 hover:bg-white/5 rounded-xl transition-all">Home</a>
                            <a href="#features" className="block px-4 py-3 text-sm text-slate-400 hover:text-cyan-400 hover:bg-white/5 rounded-xl transition-all">Features</a>
                            <a href="#about" className="block px-4 py-3 text-sm text-slate-400 hover:text-cyan-400 hover:bg-white/5 rounded-xl transition-all">About</a>
                            <Link href="/login?role=student" className="block px-4 py-3 text-sm text-cyan-400 hover:bg-cyan-500/10 rounded-xl transition-all">Student Login</Link>
                            <Link href="/login?role=faculty" className="block px-4 py-3 text-sm text-violet-400 hover:bg-violet-500/10 rounded-xl transition-all">Faculty Login</Link>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>

            {/* ─── HERO ─────────────────────────────────────────────── */}
            <section id="home" className="relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 py-24 md:py-36">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left – Text */}
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={staggerContainer}
                            className="relative z-10"
                        >
                            <motion.div variants={fadeUp} custom={0} className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 mb-8">
                                <Zap className="w-3 h-3" />
                                <span>Neural Integrity Systems v3.0</span>
                            </motion.div>

                            <motion.div variants={fadeUp} custom={1}>
                                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] mb-8">
                                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-500">
                                        NEXT‑GEN
                                    </span>
                                    <br />
                                    <GlitchText as="span" className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400">
                                        PROCTORING
                                    </GlitchText>
                                </h1>
                            </motion.div>

                            <motion.p variants={fadeUp} custom={2} className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed">
                                AI-powered proctoring that ensures academic honesty through real-time
                                behavioral analysis, computer vision, and neural pattern recognition.
                                No manual oversight needed.
                            </motion.p>

                            <motion.div variants={fadeUp} custom={3} className="flex flex-wrap gap-4">
                                <Link
                                    href="/login?role=faculty"
                                    className="shimmer-btn px-8 py-4 bg-cyan-400 text-slate-950 font-black uppercase tracking-widest text-sm hover:bg-cyan-300 transition-all shadow-2xl shadow-cyan-500/30 rounded-xl"
                                >
                                    Faculty login
                                </Link>
                                <Link
                                    href="/login?role=student"
                                    className="group px-8 py-4 border border-cyan-400 text-white font-black uppercase tracking-widest text-sm rounded-xl hover:bg-cyan-400/10 transition-all flex items-center gap-2"
                                >
                                    Student login
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </motion.div>
                        </motion.div>

                        {/* Right – Live session card */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, x: 50 }}
                            animate={{ opacity: 1, scale: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                            className="relative hidden lg:block"
                        >
                            <div className="relative">
                                <div className="absolute -inset-0.5 rounded-3xl bg-gradient-to-tr from-cyan-500/40 via-sky-500/30 to-violet-500/40 opacity-60 blur-xl" />
                                <div className="relative rounded-3xl border border-slate-700/80 bg-slate-900/80 p-7 shadow-2xl backdrop-blur-xl">
                                    <div className="flex items-center justify-between text-xs text-slate-300">
                                        <span className="uppercase tracking-[0.16em] text-slate-400">
                                            Live session
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.8)]" />
                                            Monitoring
                                        </span>
                                    </div>

                                    <div className="mt-4 rounded-2xl border border-slate-700/60 bg-slate-900/60 p-5">
                                        <div className="flex items-center justify-between text-xs text-slate-300">
                                            <div className="space-y-1">
                                                <p className="text-[0.7rem] uppercase tracking-[0.18em] text-slate-500">
                                                    Session code
                                                </p>
                                                <p className="font-mono text-xl text-cyan-300">
                                                    PROCTO‑4821
                                                </p>
                                            </div>
                                            <div className="flex flex-col items-end space-y-1">
                                                <p className="text-[0.7rem] uppercase tracking-[0.18em] text-slate-500">
                                                    Active students
                                                </p>
                                                <p className="text-xl font-semibold text-slate-50">
                                                    32
                                                </p>
                                            </div>
                                        </div>

                                        {/* Fake QR placeholder */}
                                        <div className="mt-4 grid grid-cols-2 gap-4">
                                            <div className="flex items-center justify-center rounded-xl border border-dashed border-slate-700/80 bg-slate-950/60 p-5">
                                                <div className="h-28 w-28 rounded-md bg-[radial-gradient(circle_at_10px_10px,#22d3ee_1px,transparent_1px)] bg-[length:10px_10px]" />
                                            </div>
                                            <div className="flex flex-col justify-between text-xs text-slate-300">
                                                <div>
                                                    <p className="text-[0.7rem] uppercase tracking-[0.18em] text-slate-500">
                                                        Join in 3 steps
                                                    </p>
                                                    <ol className="mt-1 space-y-1">
                                                        <li>1. Scan QR or enter code</li>
                                                        <li>2. Verify camera &amp; mic</li>
                                                        <li>3. Start exam securely</li>
                                                    </ol>
                                                </div>
                                                <button className="mt-2 inline-flex items-center self-start rounded-full bg-slate-50/5 px-3 py-1 text-[0.7rem] font-medium text-cyan-200 ring-1 ring-slate-600 hover:ring-cyan-400/70">
                                                    Preview student view
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Bottom stats */}
                                    <div className="mt-4 grid grid-cols-3 gap-3 text-[0.7rem] text-slate-300">
                                        <div className="rounded-xl border border-slate-700/70 bg-slate-900/70 p-3">
                                            <p className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-500">
                                                Anomalies
                                            </p>
                                            <p className="mt-1 text-base font-semibold text-amber-300">
                                                3 flagged
                                            </p>
                                        </div>
                                        <div className="rounded-xl border border-slate-700/70 bg-slate-900/70 p-3">
                                            <p className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-500">
                                                Focus score
                                            </p>
                                            <p className="mt-1 text-base font-semibold text-emerald-300">
                                                92%
                                            </p>
                                        </div>
                                        <div className="rounded-xl border border-slate-700/70 bg-slate-900/70 p-3">
                                            <p className="text-[0.65rem] uppercase tracking-[0.18em] text-slate-500">
                                                Integrity
                                            </p>
                                            <p className="mt-1 text-base font-semibold text-cyan-300">
                                                Stable
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>

                {/* Decorative orbs */}
                <div className="absolute top-20 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-1/3 w-72 h-72 bg-violet-500/5 rounded-full blur-[100px] pointer-events-none" />
            </section>

            {/* ─── MARQUEE ──────────────────────────────────────────── */}
            <section className="border-y border-white/5 overflow-hidden py-4">
                <div className="marquee-track">
                    {[...marqueeItems, ...marqueeItems].map((item, i) => (
                        <span key={i} className="mx-8 mono text-[11px] font-bold text-slate-600 uppercase tracking-[0.3em] whitespace-nowrap flex items-center gap-3">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/40" />
                            {item}
                        </span>
                    ))}
                </div>
            </section>

            {/* ─── STATS ────────────────────────────────────────────── */}
            <section className="border-b border-white/5 aurora-bg">
                <div className="max-w-7xl mx-auto px-6 py-16">
                    <motion.div
                        className="grid grid-cols-2 md:grid-cols-4 gap-8"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.3 }}
                        variants={staggerContainer}
                    >
                        {stats.map((stat, i) => (
                            <motion.div key={stat.label} variants={fadeUp} custom={i} className="text-center">
                                <AnimatedCounter value={stat.value} />
                                <div className="mono text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    {stat.label}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* ─── FEATURES GRID ────────────────────────────────────── */}
            <section id="features" className="py-24 scroll-mt-20">
                <div className="max-w-7xl mx-auto px-6">
                    <motion.div
                        className="mb-16"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="mono text-[10px] font-bold text-cyan-400 uppercase tracking-[0.3em]">
                            Advanced Neural Modules
                        </span>
                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter mt-4">
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                                Powered by Intelligence
                            </span>
                        </h2>
                    </motion.div>

                    <motion.div
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, amount: 0.2 }}
                        variants={staggerContainer}
                    >
                        {features.map((feature, i) => {
                            const colors = accentColors[feature.accent];
                            return (
                                <motion.div
                                    key={feature.title}
                                    variants={fadeUp}
                                    custom={i}
                                    className={`glass-card tilt-3d rounded-2xl p-8 group ${colors.border}`}
                                >
                                    <div className={`w-12 h-12 rounded-xl ${colors.bg} border border-white/10 flex items-center justify-center mb-6 ${colors.bgHover} group-hover:shadow-lg ${colors.glow} transition-all duration-300`}>
                                        <feature.icon className={`w-6 h-6 ${colors.text}`} />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-3">{feature.title}</h3>
                                    <p className="text-sm text-slate-400 leading-relaxed">{feature.desc}</p>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </section>

            {/* ─── CAPABILITIES / ABOUT ──────────────────────────────── */}
            <section id="about" className="py-24 border-t border-white/5 scroll-mt-20">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial={{ opacity: 0, x: -40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7 }}
                        >
                            <span className="mono text-[10px] font-bold text-cyan-400 uppercase tracking-[0.3em]">
                                Core Architecture
                            </span>
                            <h2 className="text-4xl md:text-5xl font-black tracking-tighter mt-4 mb-4">
                                <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                                    Neural Protocols
                                </span>
                            </h2>
                            <p className="text-lg text-slate-300 mb-2 leading-relaxed">
                                Built for <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-300 to-cyan-400 font-semibold">Christ University MCA</span>
                            </p>
                            <p className="text-slate-400 leading-relaxed mb-8">
                                Our multi-layered architecture combines real-time sensor fusion with adaptive machine learning
                                to deliver unmatched integrity monitoring. Procto is developed as part of the Software
                                Project Development course.
                            </p>

                            <div className="space-y-4">
                                {capabilities.map((cap, i) => (
                                    <motion.div
                                        key={cap.title}
                                        className="glass-card rounded-xl p-6 animate-border-glow"
                                        initial={{ opacity: 0, x: -20 }}
                                        whileInView={{ opacity: 1, x: 0 }}
                                        viewport={{ once: true }}
                                        transition={{ delay: i * 0.15, duration: 0.5 }}
                                    >
                                        <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                                            <ChevronRight className="w-4 h-4 text-cyan-400" />
                                            {cap.title}
                                        </h4>
                                        <p className="text-sm text-slate-400 pl-6">{cap.desc}</p>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            className="relative"
                            initial={{ opacity: 0, x: 40 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.7, delay: 0.2 }}
                        >
                            <div className="glass-card rounded-2xl p-8 relative overflow-hidden glow-pulse">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-[60px]" />
                                <div className="relative z-10">
                                    <div className="mono text-[10px] text-cyan-400 font-bold mb-4 animate-flicker">// SYSTEM STATUS</div>
                                    <div className="space-y-3 font-mono text-sm">
                                        {[
                                            { name: 'neural_sync', status: 'ACTIVE', color: 'text-emerald-400' },
                                            { name: 'visual_lock', status: 'ACTIVE', color: 'text-emerald-400' },
                                            { name: 'audio_pulse', status: 'ACTIVE', color: 'text-emerald-400' },
                                            { name: 'edge_compute', status: 'ACTIVE', color: 'text-emerald-400' },
                                            { name: 'anomaly_detect', status: 'LEARNING', color: 'text-cyan-400' },
                                        ].map((sys) => (
                                            <div key={sys.name} className="flex justify-between text-slate-400">
                                                <span>{sys.name}</span>
                                                <span className={sys.color}>● {sys.status}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-white/5">
                                        <div className="flex justify-between items-center">
                                            <span className="mono text-[10px] text-slate-500">INTEGRITY SCORE</span>
                                            <span className="text-2xl font-black text-emerald-400">98.7%</span>
                                        </div>
                                        <div className="mt-2 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                                            <motion.div
                                                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-400 rounded-full"
                                                initial={{ width: 0 }}
                                                whileInView={{ width: '98.7%' }}
                                                viewport={{ once: true }}
                                                transition={{ duration: 1.5, ease: 'easeOut' }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Stats below the system panel */}
                            <div className="grid grid-cols-3 gap-6 mt-8">
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-cyan-400">99.9%</p>
                                    <p className="text-sm text-slate-500 mt-1">Uptime</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-violet-400">50K+</p>
                                    <p className="text-sm text-slate-500 mt-1">Exams Proctored</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-3xl font-bold text-emerald-400">98%</p>
                                    <p className="text-sm text-slate-500 mt-1">Detection Rate</p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ─── CTA ──────────────────────────────────────────────── */}
            <section className="py-24 border-t border-white/5 aurora-bg relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7 }}
                    >
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-6">
                            <GlitchText as="span" className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 via-sky-400 to-violet-400">
                                JOIN THE NEURAL NETWORK
                            </GlitchText>
                        </h2>
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-12">
                            Whether you&apos;re a student, educator, or institution — there&apos;s a place for you in the PROCTO ecosystem.
                        </p>
                        <div className="flex flex-wrap justify-center gap-4">
                            <Link
                                href="/login?role=student"
                                className="shimmer-btn px-10 py-4 bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 font-black uppercase tracking-widest text-sm shadow-2xl hover:shadow-cyan-500/20 transition-all rounded-xl"
                            >
                                Student Access
                            </Link>
                            <Link
                                href="/login?role=faculty"
                                className="group px-10 py-4 border border-cyan-400 text-white font-black uppercase tracking-widest text-sm rounded-xl hover:bg-cyan-400/10 transition-all flex items-center gap-2"
                            >
                                Faculty Portal
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </motion.div>
                </div>
                {/* BG Orb */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-[200px] pointer-events-none" />
            </section>

            {/* ─── FOOTER ───────────────────────────────────────────── */}
            <footer className="border-t border-white/5 py-12">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-8 mb-12">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Shield className="w-5 h-5 text-cyan-400" />
                                <span className="text-lg font-black tracking-tighter">PROCTO</span>
                            </div>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                Neural Integrity Systems v3.0<br />
                                Advanced AI-powered exam proctoring.
                            </p>
                        </div>
                        <div>
                            <h5 className="mono text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Protocols</h5>
                            <div className="space-y-2 text-sm text-slate-500">
                                <div className="hover:text-cyan-400 transition-colors cursor-pointer">Neuro-Sync</div>
                                <div className="hover:text-cyan-400 transition-colors cursor-pointer">Visual-Lock</div>
                                <div className="hover:text-cyan-400 transition-colors cursor-pointer">Audio-Pulse</div>
                                <div className="hover:text-cyan-400 transition-colors cursor-pointer">Edge-Hash</div>
                            </div>
                        </div>
                        <div>
                            <h5 className="mono text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Support</h5>
                            <div className="space-y-2 text-sm text-slate-500">
                                <div className="hover:text-cyan-400 transition-colors cursor-pointer">Documentation</div>
                                <div className="hover:text-cyan-400 transition-colors cursor-pointer">System Status</div>
                                <div className="hover:text-cyan-400 transition-colors cursor-pointer">Privacy Policy</div>
                                <div className="hover:text-cyan-400 transition-colors cursor-pointer">Terms of Service</div>
                            </div>
                        </div>
                        <div>
                            <h5 className="mono text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-4">Connect</h5>
                            <div className="space-y-2 text-sm text-slate-500">
                                <div className="hover:text-cyan-400 transition-colors cursor-pointer">GitHub</div>
                                <div className="hover:text-cyan-400 transition-colors cursor-pointer">Discord</div>
                                <div className="hover:text-cyan-400 transition-colors cursor-pointer">LinkedIn</div>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                        <span className="mono text-[10px] text-slate-600">© {new Date().getFullYear()} PROCTO. All rights reserved.</span>
                        <div className="flex gap-6 mono text-[10px] text-slate-600">
                            <span className="hover:text-cyan-400 transition-colors cursor-pointer">Privacy Policy</span>
                            <span className="hover:text-cyan-400 transition-colors cursor-pointer">Terms of Service</span>
                        </div>
                    </div>
                </div>
            </footer>

            <div className="scanline-overlay" />
        </div>
    );
}
