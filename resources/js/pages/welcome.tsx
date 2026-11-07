import React, { useState, useEffect, useRef } from 'react';
import { Link, Head } from '@inertiajs/react';

const Welcome = ({ auth }) => {
    const [counters, setCounters] = useState({
        patients: 0,
        undiagnosed: 0,
        recovery: 0,
    });
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isStatsVisible, setIsStatsVisible] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const statsRef = useRef(null);

    // Function untuk toggle mobile menu
    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    // Function untuk close menu saat navigasi
    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    // Animated counter effect
    useEffect(() => {
        if (isStatsVisible) {
            const targets = { patients: 280, undiagnosed: 75, recovery: 90 };
            const duration = 2000;
            const increment = 16;

            Object.keys(targets).forEach(key => {
                const target = targets[key];
                const step = target / (duration / increment);
                let current = 0;

                const timer = setInterval(() => {
                    current += step;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    setCounters(prev => ({ ...prev, [key]: Math.floor(current) }));
                }, increment);
            });
        }
    }, [isStatsVisible]);

    // Intersection Observer for stats animation
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setIsStatsVisible(true);
                        observer.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.3 }
        );

        if (statsRef.current) {
            observer.observe(statsRef.current);
        }

        return () => observer.disconnect();
    }, []);

    // Mouse tracking for interactive effects (disabled on mobile)
    useEffect(() => {
        const isMobile = window.innerWidth < 768;
        if (isMobile) return;

        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleDiagnosaClick = (e) => {
        const button = e.currentTarget;
        const rect = button.getBoundingClientRect();
        const ripple = document.createElement('div');
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;

        ripple.className = 'ripple-effect';
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.4);
            transform: scale(0);
            animation: ripple 0.6s linear;
            width: ${size}px;
            height: ${size}px;
            left: ${x}px;
            top: ${y}px;
            pointer-events: none;
            z-index: 10;
        `;

        button.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    };

    return (
        <>
            <Head title="Beranda" />

            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden relative">
                {/* Animated Orb Background */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div
                        className="absolute w-64 h-64 md:w-96 md:h-96 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse"
                        style={{
                            left: `${mousePosition.x * 0.02}px`,
                            top: `${mousePosition.y * 0.02}px`,
                            transform: 'translate(-50%, -50%)'
                        }}
                    />
                    <div
                        className="absolute w-48 h-48 md:w-80 md:h-80 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse"
                        style={{
                            right: `${mousePosition.x * 0.01}px`,
                            bottom: `${mousePosition.y * 0.01}px`,
                            transform: 'translate(50%, 50%)',
                            animationDelay: '1s'
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                </div>

                {/* Floating Geometric Shapes - reduced on mobile */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    {[...Array(window.innerWidth < 768 ? 8 : 15)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute opacity-10 animate-pulse"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 5}s`,
                                animationDuration: `${3 + Math.random() * 4}s`
                            }}
                        >
                            <div className="w-1 h-1 md:w-2 md:h-2 bg-white rounded-full animate-ping" />
                        </div>
                    ))}
                </div>

                {/* Main Content */}
                <div className="relative z-10">
                    {/* Navigation */}
                    <nav className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-8">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-3 sm:space-x-8">
                                <Link
                                    href="/"
                                    className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"
                                >
                                    DepressionCare
                                </Link>
                                <div className="hidden lg:flex items-center space-x-6">
                                    {/* <Link
                                        href="/beranda"
                                        className="text-gray-300 hover:text-white transition-colors duration-300 hover:scale-105 relative group"
                                    >
                                        Beranda
                                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-400 group-hover:w-full transition-all duration-300"></span>
                                    </Link> */}
                                    <Link
                                        href="/tentang"
                                        className="text-gray-300 hover:text-white transition-colors duration-300 hover:scale-105 relative group"
                                    >
                                        Tentang
                                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-400 group-hover:w-full transition-all duration-300"></span>
                                    </Link>
                                    <Link
                                        href="/edukasi"
                                        className="text-gray-300 hover:text-white transition-colors duration-300 hover:scale-105 relative group"
                                    >
                                        Edukasi
                                        <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-400 group-hover:w-full transition-all duration-300"></span>
                                    </Link>
                                </div>
                            </div>

                            {/* Mobile Menu Button */}
                            <div className="lg:hidden">
                                <button
                                    onClick={toggleMobileMenu}
                                    className="text-white p-2 rounded-lg hover:bg-white/10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                                    aria-label="Toggle Menu"
                                >
                                    <div className="w-6 h-6 relative flex flex-col justify-center items-center">
                                        <span className={`bg-white block h-0.5 w-6 rounded-sm transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'}`}></span>
                                        <span className={`bg-white block h-0.5 w-6 rounded-sm transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                                        <span className={`bg-white block h-0.5 w-6 rounded-sm transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'}`}></span>
                                    </div>
                                </button>
                            </div>

                            {/* Desktop Auth Buttons */}
                            <div className="hidden lg:flex items-center space-x-4">
                                {auth.user ? (
                                    <Link
                                        href="/dashboard"
                                        className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            className="px-6 py-3 text-gray-300 hover:text-white transition-colors duration-300"
                                        >
                                            Masuk
                                        </Link>
                                        <Link
                                            href="/register"
                                            className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105"
                                        >
                                            Daftar
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Mobile Navigation Menu */}
                        <div className={`lg:hidden transition-all duration-300 ease-in-out ${
                            mobileMenuOpen
                                ? 'max-h-96 opacity-100 mt-4 border-t border-white/10 pt-4'
                                : 'max-h-0 opacity-0 overflow-hidden'
                        }`}>
                            <div className="flex flex-col space-y-1">
                                <Link
                                    href="/beranda"
                                    onClick={closeMobileMenu}
                                    className="text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300 py-3 px-4 rounded-lg"
                                >
                                    Beranda
                                </Link>
                                <Link
                                    href="/tentang"
                                    onClick={closeMobileMenu}
                                    className="text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300 py-3 px-4 rounded-lg"
                                >
                                    Tentang
                                </Link>
                                <Link
                                    href="/edukasi"
                                    onClick={closeMobileMenu}
                                    className="text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300 py-3 px-4 rounded-lg"
                                >
                                    Edukasi
                                </Link>

                                <div className="flex flex-col space-y-3 pt-4 border-t border-white/10 mt-3">
                                    {auth.user ? (
                                        <Link
                                            href="/dashboard"
                                            onClick={closeMobileMenu}
                                            className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold text-center hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
                                        >
                                            Dashboard
                                        </Link>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-3">
                                            <Link
                                                href="/login"
                                                onClick={closeMobileMenu}
                                                className="px-4 py-3 text-center text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-300"
                                            >
                                                Masuk
                                            </Link>
                                            <Link
                                                href="/register"
                                                onClick={closeMobileMenu}
                                                className="px-4 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-center hover:bg-white/20 transition-all duration-300"
                                            >
                                                Daftar
                                            </Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </nav>

                    {/* Hero Section */}
                    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16 lg:py-20">
                        <div className="text-center max-w-5xl mx-auto">
                            {/* Badge */}
                            <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-xs sm:text-sm font-medium mb-4 sm:mb-6 md:mb-8 animate-fade-in">
                                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                                Sistem Diagnosis Terpercaya
                            </div>

                            {/* Main Headline */}
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl xl:text-8xl font-bold mb-4 sm:mb-6 md:mb-8 leading-tight animate-fade-in-up">
                                <span className="block bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-2 sm:mb-3 md:mb-4">
                                    Deteksi Dini
                                </span>
                                <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                                    Depresi
                                </span>
                            </h1>

                            {/* Subtitle */}
                            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-6 sm:mb-8 md:mb-12 max-w-3xl mx-auto leading-relaxed animate-fade-in-up animation-delay-300 px-2 sm:px-4">
                                Sistem pakar berbasis AI untuk diagnosis awal depresi.
                                <span className="text-purple-300 font-semibold"> Akurat, Cepat, dan Terpercaya.</span>
                            </p>

                            {/* CTA Section */}
                            <div className="flex flex-col items-center space-y-4 sm:space-y-6 md:space-y-8 animate-fade-in-up animation-delay-600 px-2 sm:px-4">
                                {/* Main CTA Button */}
                                <Link
                                    href="/guest/konsultasi"
                                    onClick={handleDiagnosaClick}
                                    className="group relative inline-flex items-center justify-center px-6 sm:px-8 md:px-12 py-3 sm:py-4 md:py-6 text-base sm:text-lg md:text-xl font-bold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-full overflow-hidden transition-all duration-500 hover:scale-105 md:hover:scale-110 hover:shadow-2xl hover:shadow-purple-500/50 transform-gpu w-full sm:w-auto max-w-md"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 animate-pulse"></div>
                                    <div className="relative flex items-center space-x-2 sm:space-x-3">
                                        <svg className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-base sm:text-lg md:text-xl lg:text-2xl tracking-wide">MULAI DIAGNOSA</span>
                                    </div>
                                    <div className="absolute inset-0 rounded-full border-2 border-white/30 group-hover:border-white/50 transition-colors duration-300"></div>
                                </Link>

                                {/* Secondary Info */}
                                <div className="text-center space-y-3 sm:space-y-4">
                                    <p className="text-gray-400 text-xs sm:text-sm">
                                        ✓ Gratis · ✓ Anonim · ✓ Hasil Instan
                                    </p>
                                    <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 md:gap-6 text-xs sm:text-sm text-gray-500">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                                            <span>5-10 menit</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                            <span>21 pertanyaan</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                                            <span>Akurasi 95%</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Secondary Actions */}
                                <div className="w-full sm:w-auto">
                                    <Link
                                        href="/edukasi"
                                        className="block px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 text-sm sm:text-base md:text-lg font-medium text-center max-w-md mx-auto"
                                    >
                                        📚 Pelajari Lebih Lanjut
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Trust Indicators */}
                    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16">
                        <div className="text-center mb-8 sm:mb-12">
                            <p className="text-gray-400 text-sm sm:text-base md:text-lg">Dipercaya oleh ribuan pengguna</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 max-w-4xl mx-auto">
                            <div className="text-center p-4 sm:p-6 bg-white/5 backdrop-blur-md rounded-xl sm:rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                                <div className="text-2xl sm:text-3xl font-bold text-purple-400 mb-1 sm:mb-2">WHO</div>
                                <div className="text-gray-400 text-xs sm:text-sm">Standar Internasional</div>
                            </div>
                            <div className="text-center p-4 sm:p-6 bg-white/5 backdrop-blur-md rounded-xl sm:rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                                <div className="text-2xl sm:text-3xl font-bold text-pink-400 mb-1 sm:mb-2">AI</div>
                                <div className="text-gray-400 text-xs sm:text-sm">Teknologi Modern</div>
                            </div>
                            <div className="text-center p-4 sm:p-6 bg-white/5 backdrop-blur-md rounded-xl sm:rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                                <div className="text-2xl sm:text-3xl font-bold text-blue-400 mb-1 sm:mb-2">24/7</div>
                                <div className="text-gray-400 text-xs sm:text-sm">Tersedia Kapan Saja</div>
                            </div>
                            <div className="text-center p-4 sm:p-6 bg-white/5 backdrop-blur-md rounded-xl sm:rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300 hover:scale-105">
                                <div className="text-2xl sm:text-3xl font-bold text-green-400 mb-1 sm:mb-2">SSL</div>
                                <div className="text-gray-400 text-xs sm:text-sm">Data Aman</div>
                            </div>
                        </div>
                    </div>

                    {/* Statistics Section */}
                    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16">
                        <div className="text-center mb-8 sm:mb-12 md:mb-16">
                            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Fakta Tentang Depresi
                            </h2>
                            <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto px-4">
                                Data dari World Health Organization (WHO) menunjukkan urgensi deteksi dini
                            </p>
                        </div>

                        <div
                            ref={statsRef}
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto"
                        >
                            <div className="text-center p-6 sm:p-8 bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-white/10 hover:border-purple-500/50 transition-all duration-500 hover:scale-105 transform-gpu">
                                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text mb-3 sm:mb-4">
                                    {counters.patients}M+
                                </div>
                                <div className="text-gray-300 text-base sm:text-lg font-medium">Orang Mengalami Depresi</div>
                                <div className="text-gray-500 text-xs sm:text-sm mt-2">di seluruh dunia</div>
                            </div>
                            <div className="text-center p-6 sm:p-8 bg-gradient-to-br from-blue-900/50 to-purple-900/50 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-white/10 hover:border-blue-500/50 transition-all duration-500 hover:scale-105 transform-gpu">
                                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text mb-3 sm:mb-4">
                                    {counters.undiagnosed}%
                                </div>
                                <div className="text-gray-300 text-base sm:text-lg font-medium">Tidak Terdiagnosis</div>
                                <div className="text-gray-500 text-xs sm:text-sm mt-2">butuh deteksi dini</div>
                            </div>
                            <div className="text-center p-6 sm:p-8 bg-gradient-to-br from-green-900/50 to-blue-900/50 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-white/10 hover:border-green-500/50 transition-all duration-500 hover:scale-105 transform-gpu sm:col-span-2 lg:col-span-1">
                                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-transparent bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text mb-3 sm:mb-4">
                                    {counters.recovery}%
                                </div>
                                <div className="text-gray-300 text-base sm:text-lg font-medium">Tingkat Kesembuhan</div>
                                <div className="text-gray-500 text-xs sm:text-sm mt-2">dengan penanganan tepat</div>
                            </div>
                        </div>
                    </div>

                    {/* Footer CTA */}
                    <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20 text-center">
                        <div className="max-w-4xl mx-auto">
                            <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 text-white">
                                Mulai Perjalanan Menuju Kesehatan Mental Yang Lebih Baik
                            </h3>
                            <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 px-4">
                                Langkah pertama menuju pemulihan adalah mengenali kondisi Anda
                            </p>
                            <Link
                                href="/guest/konsultasi"
                                className="inline-flex items-center px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-lg sm:text-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-purple-500/50"
                            >
                                <span className="mr-2 sm:mr-3">🚀</span>
                                Mulai Diagnosa Sekarang
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Custom Styles */}
                <style jsx>{`
                    @keyframes fade-in {
                        from { opacity: 0; transform: translateY(20px); }
                        to { opacity: 1; transform: translateY(0); }
                    }

                    @keyframes fade-in-up {
                        from { opacity: 0; transform: translateY(30px); }
                        to { opacity: 1; transform: translateY(0); }
                    }

                    @keyframes ripple {
                        to {
                            transform: scale(4);
                            opacity: 0;
                        }
                    }

                    .animate-fade-in {
                        animation: fade-in 0.8s ease-out;
                    }

                    .animate-fade-in-up {
                        animation: fade-in-up 1s ease-out;
                    }

                    .animation-delay-300 {
                        animation-delay: 0.3s;
                        animation-fill-mode: both;
                    }

                    .animation-delay-600 {
                        animation-delay: 0.6s;
                        animation-fill-mode: both;
                    }

                    .transform-gpu {
                        transform: translateZ(0);
                    }
                `}</style>
            </div>
        </>
    );
};

export default Welcome;
