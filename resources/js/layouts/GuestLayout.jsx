import React, { useState } from 'react';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-white/20 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-20">
                        {/* Logo Section */}
                        <div className="flex items-center space-x-3">
                            <Link href="/" className="flex items-center space-x-3 group">
                                {/* Modern Logo Icon */}
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div className="flex flex-col">
                                    <h1 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                        DepressionCare
                                    </h1>
                                    <span className="text-xs text-gray-500 font-medium">Sistem Diagnosa Depresi</span>
                                </div>
                            </Link>
                            <div className="hidden sm:flex">
                                <span className="ml-3 px-3 py-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 text-xs font-semibold rounded-full border border-blue-200/50 shadow-sm">
                                    🎭 Guest Mode
                                </span>
                            </div>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex items-center space-x-2">
                            <Link
                                href={route('guest.konsultasi.index')}
                                className="group flex items-center space-x-2 px-4 py-2.5 text-gray-600 hover:text-gray-900 rounded-xl hover:bg-white/60 transition-all duration-200 font-medium"
                            >
                                <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Konsultasi</span>
                            </Link>

                            {route().has('login') && (
                                <Link
                                    href={route('login')}
                                    className="group flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-5 py-2.5 rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                    </svg>
                                    <span>Login Mahasiswa</span>
                                </Link>
                            )}
                        </nav>

                        {/* Mobile menu button */}
                        <button
                            className="md:hidden p-2 rounded-xl hover:bg-white/60 transition-colors"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            <svg className={`w-6 h-6 transition-transform ${isMenuOpen ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {isMenuOpen && (
                    <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-xl border-b border-white/20 shadow-lg">
                        <div className="max-w-7xl mx-auto px-4 py-4 space-y-3">
                            <div className="sm:hidden">
                                <span className="inline-block px-3 py-1.5 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 text-xs font-semibold rounded-full border border-blue-200/50">
                                    🎭 Guest Mode
                                </span>
                            </div>
                            <Link
                                href={route('guest.konsultasi.index')}
                                className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:text-gray-900 hover:bg-white/60 rounded-xl transition-all"
                                onClick={() => setIsMenuOpen(false)}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="font-medium">Konsultasi</span>
                            </Link>

                            {route().has('login') && (
                                <Link
                                    href={route('login')}
                                    className="flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-xl font-semibold"
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                    </svg>
                                    <span>Login Mahasiswa</span>
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </header>

            {/* Main Content */}
            <main className="relative">
                {/* Decorative background elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute -top-24 -right-24 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-indigo-600/10 rounded-full blur-3xl"></div>
                    <div className="absolute top-1/3 -left-32 w-80 h-80 bg-gradient-to-br from-purple-400/10 to-pink-600/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 right-1/3 w-64 h-64 bg-gradient-to-br from-green-400/10 to-blue-600/10 rounded-full blur-3xl"></div>
                </div>

                <div className="relative z-10 py-8">
                    {children}
                </div>
            </main>

            {/* Footer */}
            <footer className="relative bg-white/80 backdrop-blur-xl border-t border-white/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Brand Section */}
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <span className="font-bold text-gray-800">DepressionCare</span>
                            </div>
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Sistem diagnosa depresi berbasis web yang membantu memberikan evaluasi awal kondisi mental dengan pendekatan ilmiah.
                            </p>
                        </div>

                        {/* Important Notice */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-800 flex items-center space-x-2">
                                <span className="text-red-500">⚠️</span>
                                <span>Penting Diingat</span>
                            </h3>
                            <div className="space-y-2 text-xs text-gray-600">
                                <p className="flex items-start space-x-2">
                                    <span className="text-red-500 mt-0.5">•</span>
                                    <span>Hasil diagnosa bukan pengganti konsultasi medis profesional</span>
                                </p>
                                <p className="flex items-start space-x-2">
                                    <span className="text-orange-500 mt-0.5">•</span>
                                    <span>Darurat mental: <strong className="text-red-600">119 ext 8</strong></span>
                                </p>
                                <p className="flex items-start space-x-2">
                                    <span className="text-blue-500 mt-0.5">•</span>
                                    <span>Konsultasi lanjutan dengan psikolog/psikiater dianjurkan</span>
                                </p>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-gray-800">Akses Cepat</h3>
                            <div className="space-y-2">
                                <Link
                                    href={route('guest.konsultasi.index')}
                                    className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700 transition-colors"
                                >
                                    <span>🔍</span>
                                    <span>Mulai Konsultasi</span>
                                </Link>
                                {route().has('login') && (
                                    <Link
                                        href={route('login')}
                                        className="flex items-center space-x-2 text-sm text-indigo-600 hover:text-indigo-700 transition-colors"
                                    >
                                        <span>👤</span>
                                        <span>Login sebagai Mahasiswa</span>
                                    </Link>
                                )}
                                {route().has('register') && (
                                    <Link
                                        href={route('register')}
                                        className="flex items-center space-x-2 text-sm text-green-600 hover:text-green-700 transition-colors"
                                    >
                                        <span>✨</span>
                                        <span>Daftar untuk fitur lengkap</span>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Bottom Footer */}
                    <div className="border-t border-gray-200 pt-8 mt-8">
                        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                            <p className="text-sm text-gray-500">
                                © 2025 DepressionCare System. Dibuat untuk membantu evaluasi kesehatan mental.
                            </p>
                            <div className="flex items-center space-x-6 text-xs text-gray-400">
                                <span className="flex items-center space-x-1">
                                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                    <span>Sistem Aktif</span>
                                </span>
                                <span>|</span>
                                <span>Responsif & Aman</span>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
