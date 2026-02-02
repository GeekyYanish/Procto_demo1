'use client';

import { Shield } from 'lucide-react';
import Link from 'next/link';

export default function Navbar() {
    return (
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="p-2 bg-blue-600 rounded-lg group-hover:bg-blue-700 transition-colors">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-slate-900">
                            Procto
                        </span>
                    </Link>

                    {/* Navigation Buttons */}
                    <div className="flex items-center gap-3">
                        <Link
                            href="/student/login"
                            className="px-4 py-2 text-sm font-medium text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-all duration-200"
                        >
                            Student Login
                        </Link>
                        <Link
                            href="/faculty/login"
                            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            Faculty Login
                        </Link>
                    </div>
                </div>
            </div>
        </nav>
    );
}
