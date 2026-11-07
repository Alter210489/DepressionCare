import React, { useState, useEffect, useRef } from 'react';
import { Link } from '@inertiajs/react';

const Beranda = ({ auth }) => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isVisible, setIsVisible] = useState({});
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    // Function untuk toggle mobile menu
    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    // Function untuk close menu saat navigasi
    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    // Mouse tracking for interactive effects
    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Intersection Observer for animations
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        setIsVisible(prev => ({ ...prev, [entry.target.dataset.section]: true }));
                    }
                });
            },
            { threshold: 0.3 }
        );

        const sections = document.querySelectorAll('[data-section]');
        sections.forEach(section => observer.observe(section));

        return () => observer.disconnect();
    }, []);

    const features = [
        {
            icon: "🧠",
            title: "AI-Powered Diagnosis",
            description: "Sistem diagnosis berbasis kecerdasan buatan dengan akurasi tinggi berdasarkan standar internasional.",
            gradient: "from-purple-600 to-pink-600"
        },
        {
            icon: "⚡",
            title: "Hasil Instan",
            description: "Dapatkan hasil diagnosis dalam hitungan menit, tidak perlu menunggu berhari-hari.",
            gradient: "from-blue-600 to-purple-600"
        },
        {
            icon: "🔒",
            title: "Privasi Terjamin",
            description: "Data Anda sepenuhnya anonim dan aman dengan enkripsi tingkat enterprise.",
            gradient: "from-green-600 to-blue-600"
        },
        {
            icon: "📱",
            title: "Akses Mudah",
            description: "Tersedia 24/7 dari perangkat apapun, kapanpun Anda membutuhkannya.",
            gradient: "from-pink-600 to-purple-600"
        },
        {
            icon: "👨‍⚕️",
            title: "Standar Medis",
            description: "Menggunakan protokol diagnosis yang diakui WHO dan praktisi kesehatan mental.",
            gradient: "from-indigo-600 to-purple-600"
        },
        {
            icon: "📊",
            title: "Laporan Detail",
            description: "Laporan komprehensif dengan rekomendasi tindak lanjut yang dapat membantu anda memantau kondisi tiap 2 minggu terakhir.",
            gradient: "from-teal-600 to-blue-600"
        }
    ];

    const testimonials = [
        {
            name: "Arya Hidayat",
            role: "Mahasiswa",
            content: "Sistem ini membantu saya menyadari kondisi mental saya lebih awal. Sekarang saya sudah mendapat bantuan yang tepat.",
            rating: 5
        },
        {
            name: "Michael Owen",
            role: "Mahasiswa",
            content: "Tool yang sangat membantu untuk skrining awal. Hasil diagnosisnya cukup akurat dan membantu proses konsultasi.",
            rating: 5
        },
        {
            name: "Kurniawan",
            role: "Mahasiswa",
            content: "Prosesnya cepat dan mudah dipahami. Interface-nya user-friendly dan tidak membuat stress.",
            rating: 5
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden relative">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div
                    className="absolute w-96 h-96 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse"
                    style={{
                        left: `${mousePosition.x * 0.02}px`,
                        top: `${mousePosition.y * 0.02}px`,
                        transform: 'translate(-50%, -50%)'
                    }}
                />
                <div
                    className="absolute w-80 h-80 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse"
                    style={{
                        right: `${mousePosition.x * 0.01}px`,
                        bottom: `${mousePosition.y * 0.01}px`,
                        transform: 'translate(50%, 50%)',
                        animationDelay: '1s'
                    }}
                />
            </div>

            {/* Floating Particles */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                {[...Array(20)].map((_, i) => (
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
                        <div className="w-2 h-2 bg-white rounded-full animate-ping" />
                    </div>
                ))}
            </div>

            <div className="relative z-10">
                {/* Navigation */}
                    <nav className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-4 sm:space-x-8">
                            <Link href="/" className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                DepressionCare
                            </Link>
                            <div className="hidden lg:flex items-center space-x-6">
                                <Link href="/beranda" className="text-gray-300 hover:text-white transition-colors duration-300 hover:scale-105 relative group">
                                    Beranda
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-400 group-hover:w-full transition-all duration-300"></span>
                                </Link>
                                <Link href="/tentang" className="text-gray-300 hover:text-white transition-colors duration-300 hover:scale-105 relative group">
                                    Tentang
                                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-400 group-hover:w-full transition-all duration-300"></span>
                                </Link>
                                <Link href="/edukasi" className="text-gray-300 hover:text-white transition-colors duration-300 hover:scale-105 relative group">
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

                        <div className="hidden lg:flex items-center space-x-4">
                            {auth.user ? (
                                <Link
                                    href="/dashboard"
                                    className="px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg text-sm sm:text-base"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href="/login"
                                        className="px-4 sm:px-6 py-2 sm:py-3 text-gray-300 hover:text-white transition-colors duration-300 text-sm sm:text-base"
                                    >
                                        Masuk
                                    </Link>
                                    <Link
                                        href="/register"
                                        className="px-4 sm:px-6 py-2 sm:py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 text-sm sm:text-base"
                                    >
                                        Daftar
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Enhanced Mobile Navigation Menu */}
                    <div className={`lg:hidden transition-all duration-300 ease-in-out ${
                        mobileMenuOpen
                            ? 'max-h-96 opacity-100 mt-4 border-t border-white/10 pt-4'
                            : 'max-h-0 opacity-0 overflow-hidden'
                    }`}>
                        <div className="flex flex-col space-y-1">
                            <Link
                                href="/beranda"
                                onClick={closeMobileMenu}
                                className="text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300 py-3 px-4 rounded-lg relative group"
                            >
                                <span className="flex items-center">
                                    <span className="w-2 h-2 bg-purple-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                                    Beranda
                                </span>
                            </Link>
                            <Link
                                href="/tentang"
                                onClick={closeMobileMenu}
                                className="text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300 py-3 px-4 rounded-lg relative group"
                            >
                                <span className="flex items-center">
                                    <span className="w-2 h-2 bg-purple-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                                    Tentang
                                </span>
                            </Link>
                            <Link
                                href="/edukasi"
                                onClick={closeMobileMenu}
                                className="text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300 py-3 px-4 rounded-lg relative group"
                            >
                                <span className="flex items-center">
                                    <span className="w-2 h-2 bg-purple-400 rounded-full mr-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                                    Edukasi
                                </span>
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
                                    <div className="flex space-x-3">
                                        <Link
                                            href="/login"
                                            onClick={closeMobileMenu}
                                            className="flex-1 px-4 py-3 text-center text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-300"
                                        >
                                            Masuk
                                        </Link>
                                        <Link
                                            href="/register"
                                            onClick={closeMobileMenu}
                                            className="flex-1 px-4 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-center hover:bg-white/20 transition-all duration-300"
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
                <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16" data-section="hero">
                    <div className={`text-center max-w-5xl mx-auto transition-all duration-1000 ${
                        isVisible.hero ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'
                    }`}>
                        <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-xs sm:text-sm font-medium mb-6 sm:mb-8">
                            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                            Platform Kesehatan Mental Terdepan
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 sm:mb-8 leading-tight">
                            <span className="block bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-2 sm:mb-4">
                                Selamat Datang di
                            </span>
                            <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                                DepressionCare
                            </span>
                        </h1>

                        <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed px-4 sm:px-0">
                            Platform inovatif untuk deteksi dini depresi dengan teknologi AI terdepan.
                            <span className="text-purple-300 font-semibold"> Membantu jutaan orang menemukan jalan menuju kesehatan mental yang lebih baik.</span>
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center px-4 sm:px-0">
                            <Link
                                href="/guest/konsultasi"
                                className="group relative inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-full overflow-hidden transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:shadow-purple-500/50"
                            >
                                <span className="mr-3">🚀</span>
                                Mulai Diagnosa
                            </Link>
                            <Link
                                href="/tentang"
                                className="px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 text-base sm:text-lg font-medium"
                            >
                                Pelajari Lebih Lanjut
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Why Early Detection is Important */}
                <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-20" data-section="why-important">
                    <div className={`transition-all duration-1000 ${
                        isVisible['why-important'] ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'
                    }`}>
                        <div className="text-center mb-12 sm:mb-16">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Mengapa Deteksi Dini Sangat Penting?
                            </h2>
                            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto px-4 sm:px-0">
                                Deteksi dini depresi dapat mengubah hidup seseorang secara signifikan
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
                            <div className="p-6 sm:p-8 bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-md rounded-3xl border border-white/10 hover:border-purple-500/50 transition-all duration-500 hover:scale-105">
                                <div className="text-5xl sm:text-6xl mb-4 sm:mb-6 text-center">🛡️</div>
                                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white text-center">Mencegah Perburukan</h3>
                                <p className="text-gray-300 leading-relaxed text-center text-sm sm:text-base">
                                    Dengan deteksi dini, depresi dapat ditangani sebelum berkembang menjadi kondisi yang lebih serius dan mengganggu kehidupan sehari-hari.
                                </p>
                            </div>

                            <div className="p-6 sm:p-8 bg-gradient-to-br from-blue-900/50 to-purple-900/50 backdrop-blur-md rounded-3xl border border-white/10 hover:border-blue-500/50 transition-all duration-500 hover:scale-105">
                                <div className="text-5xl sm:text-6xl mb-4 sm:mb-6 text-center">🎓</div>
                                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white text-center">Fokus Akademik</h3>
                                <p className="text-gray-300 leading-relaxed text-center text-sm sm:text-base">
                                    Membantu mahasiswa tetap fokus pada studi dan prestasi akademik dengan mengatasi masalah kesehatan mental sejak dini.
                                </p>
                            </div>

                            <div className="p-6 sm:p-8 bg-gradient-to-br from-green-900/50 to-blue-900/50 backdrop-blur-md rounded-3xl border border-white/10 hover:border-green-500/50 transition-all duration-500 hover:scale-105">
                                <div className="text-5xl sm:text-6xl mb-4 sm:mb-6 text-center">💪</div>
                                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white text-center">Kualitas Hidup</h3>
                                <p className="text-gray-300 leading-relaxed text-center text-sm sm:text-base">
                                    Meningkatkan kualitas hidup secara keseluruhan dengan mendapatkan bantuan yang tepat pada waktu yang tepat.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Inspirational Stories */}
                <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-20" data-section="stories">
                    <div className={`transition-all duration-1000 ${
                        isVisible.stories ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'
                    }`}>
                        <div className="text-center mb-12 sm:mb-16">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                                Kisah Inspiratif Pemulihan
                            </h2>
                            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto px-4 sm:px-0">
                                Bukti nyata bahwa mencari bantuan profesional bisa menyelamatkan hidup
                            </p>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                            <div className="p-6 sm:p-8 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 hover:border-green-500/50 transition-all duration-500">
                                <div className="flex items-center mb-6">
                                    <div className="w-16 h-16 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center text-2xl">
                                        👨‍🎓
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-xl font-bold text-white">Bayu</h3>
                                        <p className="text-green-300 text-sm">Mahasiswa Tingkat Akhir</p>
                                    </div>
                                </div>
                                <p className="text-gray-300 leading-relaxed text-sm sm:text-base mb-4">
                                    "Saya sempat mengalami depresi berat karena tekanan skripsi dan masalah keluarga. Kondisi ini membuat saya menjauh dari teman-teman dan nilai kuliah menurun drastis."
                                </p>
                                <p className="text-gray-300 leading-relaxed text-sm sm:text-base mb-4">
                                    "Beruntung, setelah didorong sahabat, saya berani menemui konselor kampus. Dari konseling, saya mendapat ruang aman untuk bercerita dan strategi mengelola beban pikiran."
                                </p>
                                <p className="text-green-300 font-medium text-sm sm:text-base">
                                    "Perlahan keadaan membaik. Saya kembali bisa bersosialisasi, fokus menyelesaikan skripsi, dan akhirnya lulus tepat waktu. Mencari bantuan benar-benar menyelamatkan hidup saya."
                                </p>
                            </div>

                            <div className="p-6 sm:p-8 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 hover:border-purple-500/50 transition-all duration-500">
                                <div className="flex items-center mb-6">
                                    <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-2xl">
                                        👩‍🎓
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-xl font-bold text-white">Rina</h3>
                                        <p className="text-purple-300 text-sm">Mahasiswi Semester 5</p>
                                    </div>
                                </div>
                                <p className="text-gray-300 leading-relaxed text-sm sm:text-base mb-4">
                                    "Saya hampir menyerah kuliah karena tertekan dengan banyaknya tugas dan ekspektasi orang tua. Saya sering merasa tidak berharga dan menarik diri dari teman-teman."
                                </p>
                                <p className="text-gray-300 leading-relaxed text-sm sm:text-base mb-4">
                                    "Saat kondisi semakin berat, saya memberanikan diri datang ke layanan konseling kampus. Di sana, saya belajar mengatur waktu dan teknik pernapasan untuk menenangkan pikiran."
                                </p>
                                <p className="text-purple-300 font-medium text-sm sm:text-base">
                                    "Di semester akhir, saya berhasil menyelesaikan skripsi tepat waktu. Sekarang saya aktif sebagai relawan organisasi kesehatan mental kampus untuk membantu mahasiswa lain."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Professional Quote */}
                <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-20" data-section="quote">
                    <div className={`transition-all duration-1000 ${
                        isVisible.quote ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'
                    }`}>
                        <div className="max-w-4xl mx-auto text-center">
                            <div className="p-8 sm:p-12 bg-gradient-to-r from-blue-900/30 to-purple-900/30 backdrop-blur-md rounded-3xl border border-white/10">
                                <div className="text-6xl sm:text-8xl mb-6 opacity-20">💬</div>
                                <blockquote className="text-xl sm:text-2xl md:text-3xl font-light text-white mb-6 sm:mb-8 leading-relaxed italic">
                                    "Depresi dapat ditangani secara efektif. Deteksi dini dan intervensi yang tepat dapat mencegah dampak jangka panjang dan meningkatkan kualitas hidup seseorang secara signifikan."
                                </blockquote>
                                <div className="text-gray-300">
                                    <p className="font-semibold text-lg sm:text-xl mb-2">World Health Organization (WHO)</p>
                                    <p className="text-sm sm:text-base opacity-80">Depression and Other Common Mental Disorders</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Features Section */}
                <div className="container mx-auto px-6 py-20" data-section="features">
                    <div className={`transition-all duration-1000 ${
                        isVisible.features ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'
                    }`}>
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Mengapa Memilih DepressionCare?
                            </h2>
                            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                                Solusi komprehensif untuk deteksi dini dan penanganan depresi
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    className="group p-8 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 hover:border-purple-500/50 transition-all duration-500 hover:scale-105 transform-gpu hover:bg-white/10"
                                >
                                    <div className="text-center">
                                        <div className="text-6xl mb-6 group-hover:scale-110 transition-transform duration-300">
                                            {feature.icon}
                                        </div>
                                        <h3 className="text-2xl font-bold mb-4 text-white">
                                            {feature.title}
                                        </h3>
                                        <p className="text-gray-300 leading-relaxed">
                                            {feature.description}
                                        </p>
                                        <div className={`w-20 h-1 bg-gradient-to-r ${feature.gradient} rounded-full mx-auto mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* How It Works Section */}
                <div className="container mx-auto px-6 py-20" data-section="how-it-works">
                    <div className={`transition-all duration-1000 ${
                        isVisible['how-it-works'] ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'
                    }`}>
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                Cara Kerja Sistem
                            </h2>
                            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                                Proses sederhana dalam 3 langkah untuk mendapatkan diagnosis yang akurat
                            </p>
                        </div>

                        <div className="max-w-4xl mx-auto">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="text-center group">
                                    <div className="relative mb-8">
                                        <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold group-hover:scale-110 transition-transform duration-300">
                                            1
                                        </div>
                                        <div className="absolute inset-0 w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mx-auto animate-ping opacity-20"></div>
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4 text-white">Isi Kuesioner</h3>
                                    <p className="text-gray-300">
                                        Jawab 21 pertanyaan yang dirancang berdasarkan standar diagnosis internasional (BDI-II)
                                    </p>
                                </div>

                                <div className="text-center group">
                                    <div className="relative mb-8">
                                        <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold group-hover:scale-110 transition-transform duration-300">
                                            2
                                        </div>
                                        <div className="absolute inset-0 w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto animate-ping opacity-20"></div>
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4 text-white">Analisis AI</h3>
                                    <p className="text-gray-300">
                                        Sistem AI canggih menganalisis jawaban Anda dengan Sistem Pakar Certainty Factory
                                    </p>
                                </div>

                                <div className="text-center group">
                                    <div className="relative mb-8">
                                        <div className="w-20 h-20 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mx-auto text-2xl font-bold group-hover:scale-110 transition-transform duration-300">
                                            3
                                        </div>
                                        <div className="absolute inset-0 w-20 h-20 bg-gradient-to-r from-green-600 to-blue-600 rounded-full mx-auto animate-ping opacity-20"></div>
                                    </div>
                                    <h3 className="text-2xl font-bold mb-4 text-white">Hasil & Rekomendasi</h3>
                                    <p className="text-gray-300">
                                        Dapatkan hasil diagnosis detail dengan rekomendasi langkah selanjutnya
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Testimonials Section */}
                <div className="container mx-auto px-6 py-20" data-section="testimonials">
                    <div className={`transition-all duration-1000 ${
                        isVisible.testimonials ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'
                    }`}>
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                                Apa Kata Mereka
                            </h2>
                            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                                Testimoni dari pengguna dan profesional kesehatan mental
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {testimonials.map((testimonial, index) => (
                                <div
                                    key={index}
                                    className="p-8 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 hover:border-purple-500/50 transition-all duration-500 hover:scale-105 transform-gpu"
                                >
                                    <div className="flex mb-4">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <span key={i} className="text-yellow-400 text-xl">⭐</span>
                                        ))}
                                    </div>
                                    <p className="text-gray-300 mb-6 italic leading-relaxed">
                                        "{testimonial.content}"
                                    </p>
                                    <div className="border-t border-white/10 pt-4">
                                        <div className="font-bold text-white">{testimonial.name}</div>
                                        <div className="text-purple-300 text-sm">{testimonial.role}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* CTA Section */}
                <div className="container mx-auto px-6 py-20" data-section="cta">
                    <div className={`text-center max-w-4xl mx-auto transition-all duration-1000 ${
                        isVisible.cta ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'
                    }`}>
                        <h3 className="text-4xl md:text-5xl font-bold mb-8 text-white">
                            Siap Memulai Perjalanan Kesehatan Mental Anda?
                        </h3>
                        <p className="text-xl text-gray-300 mb-10">
                            Jangan menunda lagi. Kesehatan mental Anda adalah prioritas utama.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/guest/konsultasi"
                                className="inline-flex items-center px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-purple-500/50"
                            >
                                <span className="mr-3">🎯</span>
                                Mulai Sekarang - Gratis
                            </Link>
                            <Link
                                href="/edukasi"
                                className="px-10 py-5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 text-xl font-medium"
                            >
                                <span className="mr-3">📚</span>
                                Pelajari Dulu
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Styles */}
            <style jsx>{`
                .transform-gpu {
                    transform: translateZ(0);
                }
            `}</style>
        </div>
    );
};

export default Beranda;
