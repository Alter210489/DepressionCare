import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';

const Tentang = ({ auth }) => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isVisible, setIsVisible] = useState({});
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setMobileMenuOpen(false);
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            setMousePosition({ x: e.clientX, y: e.clientY });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

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

    const teamMembers = [
        {
            name: "Armando Dewantoro",
            role: "Developer & Researcher",
            image: "👨‍💻",
            expertise: "Teknik Komputer",
            description: "Mahasiswa Teknik Komputer angkatan 2021 yang mengembangkan platform DepressionCare sebagai bagian dari penelitian tugas akhir, dengan fokus pada implementasi sistem pakar dan teknologi web."
        },
        {
            name: "Darni, S.Kep., Ns., M.Kep",
            role: "Pakar Kesehatan Mental",
            image: "👩‍⚕️",
            expertise: "Keperawatan",
            description: "Dosen Keperawatan di Fakultas Kesehatan Universitas Borneo Tarakan. Berperan sebagai ahli dan validator konten kesehatan mental dalam penelitian ini."
        },
        {
            name: "Kharis Hudaiby Hanif, S.Pd., M.Kom",
            role: "Pembimbing Utama",
            image: "👨‍🏫",
            expertise: "Sistem Pakar & Komputasi",
            description: "Dosen pembimbing dengan keahlian dalam bidang sistem pakar dan ilmu komputer. Membimbing pengembangan metodologi dan implementasi teknis platform."
        }
    ];

    const values = [
        {
            icon: "🎯",
            title: "Akurasi",
            description: "Komitmen untuk memberikan hasil diagnosis yang paling akurat dengan teknologi terdepan."
        },
        {
            icon: "🤝",
            title: "Aksesibilitas",
            description: "Memastikan layanan kesehatan mental dapat diakses oleh semua kalangan tanpa diskriminasi."
        },
        {
            icon: "🔒",
            title: "Privasi",
            description: "Menjaga kerahasiaan dan privasi data pengguna dengan standar keamanan tertinggi."
        },
        {
            icon: "💡",
            title: "Inovasi",
            description: "Terus berinovasi untuk menghadirkan solusi terbaik dalam bidang kesehatan mental."
        },
        {
            icon: "❤️",
            title: "Empati",
            description: "Memahami dan peduli terhadap perjuangan setiap individu dalam menghadapi masalah mental."
        },
        {
            icon: "🌱",
            title: "Pertumbuhan",
            description: "Mendukung pertumbuhan dan pemulihan setiap pengguna menuju kehidupan yang lebih baik."
        }
    ];

    // Dipindahkan dari Beranda
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

    // Dipindahkan dari Beranda
    const testimonials = [
        {
            name: "Arya Hidayat",
            role: "Mahasiswa",
            content: "Sistem ini membantu saya menyadari kondisi mental saya lebih awal. Sekarang saya sudah mendapat bantuan yang tepat.",
            rating: 5
        },
        {
            name: "Nelson",
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
                {[...Array(15)].map((_, i) => (
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

                    {/* Mobile Navigation Menu */}
                    <div className={`lg:hidden transition-all duration-300 ease-in-out ${
                        mobileMenuOpen
                            ? 'max-h-96 opacity-100 mt-4 border-t border-white/10 pt-4'
                            : 'max-h-0 opacity-0 overflow-hidden'
                    }`}>
                        <div className="flex flex-col space-y-1">
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
                <div className="container mx-auto px-6 py-16" data-section="hero">
                    <div className={`text-center max-w-5xl mx-auto transition-all duration-1000 ${
                        isVisible.hero ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'
                    }`}>
                        <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-xs sm:text-sm font-medium mb-6 sm:mb-8">
                            <div className="w-2 h-2 bg-blue-400 rounded-full mr-2 animate-pulse"></div>
                            Tentang DepressionCare
                        </div>

                        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-6 sm:mb-8 leading-tight">
                            <span className="block bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-2 sm:mb-4">
                                Membantu Mahasiswa
                            </span>
                            <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
                                Mengenali Depresi Lebih Awal
                            </span>
                        </h1>

                        <p className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-8 sm:mb-12 max-w-4xl mx-auto leading-relaxed px-4 sm:px-0">
                            DepressionCare adalah platform inovatif yang dibuat khusus untuk membantu mahasiswa mengenali gejala depresi sejak dini,
                            <span className="text-purple-300 font-semibold"> sehingga dapat segera mencari bantuan profesional yang tepat.</span>
                        </p>
                    </div>
                </div>

                {/* Platform Purpose */}
                <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-20" data-section="purpose">
                    <div className={`transition-all duration-1000 ${
                        isVisible.purpose ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'
                    }`}>
                        <div className="text-center mb-12 sm:mb-16">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Tujuan Platform Kami
                            </h2>
                            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto px-4 sm:px-0">
                                Menyediakan alat deteksi dini yang mudah diakses untuk komunitas mahasiswa
                            </p>
                        </div>

                        <div className="max-w-4xl mx-auto">
                            <div className="p-6 sm:p-8 lg:p-12 bg-gradient-to-br from-purple-900/50 to-pink-900/50 backdrop-blur-md rounded-3xl border border-white/10">
                                <div className="text-center mb-8">
                                    <div className="text-6xl sm:text-8xl mb-6">🎯</div>
                                    <h3 className="text-2xl sm:text-3xl font-bold text-white mb-6">Mengapa DepressionCare Hadir?</h3>
                                </div>

                                <div className="space-y-6 text-gray-300 leading-relaxed">
                                    <p className="text-base sm:text-lg">
                                        Kehidupan mahasiswa penuh dengan tantangan: tekanan akademik, masalah finansial,
                                        adaptasi lingkungan baru, dan berbagai stressor lainnya. Sayangnya, banyak mahasiswa
                                        yang mengalami gejala depresi tidak menyadarinya atau enggan mencari bantuan.
                                    </p>
                                    <p className="text-base sm:text-lg">
                                        Platform ini diciptakan sebagai <span className="text-purple-300 font-semibold">jembatan antara keraguan dan kepastian</span>,
                                        memberikan cara yang aman dan anonim untuk melakukan evaluasi diri sebelum mengambil
                                        langkah selanjutnya menuju bantuan profesional.
                                    </p>
                                    <p className="text-base sm:text-lg">
                                        Kami percaya bahwa <span className="text-pink-300 font-semibold">deteksi dini adalah kunci</span>
                                        untuk mencegah dampak yang lebih serius dan membantu mahasiswa tetap fokus pada
                                        prestasi akademik dan pengembangan diri.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── DIPINDAHKAN DARI BERANDA: Fitur Unggulan ── */}
                <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-20" data-section="features">
                    <div className={`transition-all duration-1000 ${
                        isVisible.features ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'
                    }`}>
                        <div className="text-center mb-12 sm:mb-16">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Mengapa Memilih DepressionCare?
                            </h2>
                            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto px-4 sm:px-0">
                                Solusi komprehensif untuk deteksi dini dan penanganan depresi
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    className="group p-6 sm:p-8 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 hover:border-purple-500/50 transition-all duration-500 hover:scale-105 transform-gpu hover:bg-white/10"
                                >
                                    <div className="text-center">
                                        <div className="text-5xl sm:text-6xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                                            {feature.icon}
                                        </div>
                                        <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white">
                                            {feature.title}
                                        </h3>
                                        <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                                            {feature.description}
                                        </p>
                                        <div className={`w-20 h-1 bg-gradient-to-r ${feature.gradient} rounded-full mx-auto mt-4 sm:mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* How It Works */}
                <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-20" data-section="how-it-works">
                    <div className={`transition-all duration-1000 ${
                        isVisible['how-it-works'] ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'
                    }`}>
                        <div className="text-center mb-12 sm:mb-16">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                Cara Kerja Sistem Kami
                            </h2>
                            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto px-4 sm:px-0">
                                Metode Certainty Factor dalam 3 langkah sederhana untuk diagnosis yang akurat
                            </p>
                        </div>

                        <div className="max-w-5xl mx-auto space-y-8 sm:space-y-12">
                            {/* 3 Steps */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
                                <div className="text-center group">
                                    <div className="relative mb-6 sm:mb-8">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto text-xl sm:text-2xl font-bold group-hover:scale-110 transition-transform duration-300">
                                            1
                                        </div>
                                        <div className="absolute inset-0 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mx-auto animate-ping opacity-20"></div>
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white">Isi Kuesioner</h3>
                                    <p className="text-gray-300 text-sm sm:text-base">
                                        Jawab 21 pertanyaan yang dirancang berdasarkan standar diagnosis internasional (BDI-II)
                                    </p>
                                </div>

                                <div className="text-center group">
                                    <div className="relative mb-6 sm:mb-8">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto text-xl sm:text-2xl font-bold group-hover:scale-110 transition-transform duration-300">
                                            2
                                        </div>
                                        <div className="absolute inset-0 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mx-auto animate-ping opacity-20"></div>
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white">Analisis AI</h3>
                                    <p className="text-gray-300 text-sm sm:text-base">
                                        Sistem AI canggih menganalisis jawaban Anda dengan Sistem Pakar Certainty Factor
                                    </p>
                                </div>

                                <div className="text-center group">
                                    <div className="relative mb-6 sm:mb-8">
                                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-green-600 to-blue-600 rounded-full flex items-center justify-center mx-auto text-xl sm:text-2xl font-bold group-hover:scale-110 transition-transform duration-300">
                                            3
                                        </div>
                                        <div className="absolute inset-0 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-green-600 to-blue-600 rounded-full mx-auto animate-ping opacity-20"></div>
                                    </div>
                                    <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white">Hasil & Rekomendasi</h3>
                                    <p className="text-gray-300 text-sm sm:text-base">
                                        Dapatkan hasil diagnosis detail dengan rekomendasi langkah selanjutnya
                                    </p>
                                </div>
                            </div>

                            {/* Technical Detail */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                                <div className="p-6 sm:p-8 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 hover:border-blue-500/50 transition-all duration-500">
                                    <div className="text-4xl sm:text-5xl mb-4 sm:mb-6">🤖</div>
                                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Metode Certainty Factor</h3>
                                    <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                                        Sistem kami menggunakan metode Certainty Factor untuk menghitung tingkat kepastian
                                        kemungkinan depresi berdasarkan gejala yang dialami. Metode ini telah terbukti efektif
                                        dalam sistem pakar untuk mengakomodasi ketidakpastian dalam diagnosis.
                                    </p>
                                </div>

                                <div className="p-6 sm:p-8 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 hover:border-purple-500/50 transition-all duration-500">
                                    <div className="text-4xl sm:text-5xl mb-4 sm:mb-6">📋</div>
                                    <h3 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">Kuesioner Tervalidasi</h3>
                                    <p className="text-gray-300 leading-relaxed text-sm sm:text-base">
                                        Pertanyaan dalam sistem disusun berdasarkan standar diagnosis dan telah divalidasi
                                        oleh ahli kesehatan mental. Setiap gejala memiliki bobot kepercayaan yang disesuaikan
                                        dengan konteks kehidupan mahasiswa.
                                    </p>
                                </div>
                            </div>

                            <div className="p-6 sm:p-8 bg-gradient-to-r from-red-900/30 to-orange-900/30 backdrop-blur-md rounded-3xl border-2 border-red-500/50">
                                <div className="flex items-start space-x-4">
                                    <div className="text-3xl sm:text-4xl">⚠️</div>
                                    <div>
                                        <h3 className="text-xl sm:text-2xl font-bold text-white mb-3">Penting untuk Diingat</h3>
                                        <p className="text-gray-300 leading-relaxed text-sm sm:text-base mb-4">
                                            <span className="font-semibold text-red-300">Hasil diagnosis dari platform ini bukan pengganti konsultasi dengan dokter atau psikolog profesional.</span>
                                            Ini adalah alat skrining awal yang membantu Anda memahami kondisi mental dan menentukan apakah perlu mencari bantuan lebih lanjut.
                                        </p>
                                        <p className="text-yellow-200 font-medium text-sm sm:text-base">
                                            🚨 Jika Anda mengalami gejala berat atau memiliki pikiran untuk menyakiti diri sendiri,
                                            segera hubungi konselor, psikolog, atau layanan darurat.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* About Creator */}
                <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-20" data-section="creator">
                    <div className={`transition-all duration-1000 ${
                        isVisible.creator ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'
                    }`}>
                        <div className="text-center mb-12 sm:mb-16">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                                Tentang Penelitian
                            </h2>
                        </div>

                        <div className="max-w-4xl mx-auto">
                            <div className="p-6 sm:p-8 lg:p-12 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 hover:border-green-500/50 transition-all duration-500">
                                <div className="text-center mb-8">
                                    <div className="text-6xl sm:text-8xl mb-6">🎓</div>
                                    <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">Proyek Tugas Akhir Universitas Borneo Tarakan</h3>
                                </div>

                                <div className="space-y-6 text-gray-300 leading-relaxed text-center">
                                    <p className="text-base sm:text-lg">
                                        Platform DepressionCare dikembangkan sebagai bagian dari penelitian tugas akhir
                                        di <span className="text-green-300 font-semibold">Program Studi Teknik Komputer, Universitas Borneo Tarakan</span>,
                                        dengan fokus pada implementasi sistem pakar menggunakan metode Certainty Factor.
                                    </p>
                                    <p className="text-base sm:text-lg">
                                        Penelitian ini menggabungkan teknologi sistem pakar dengan validasi dari ahli kesehatan mental
                                        untuk menghasilkan sistem deteksi dini depresi yang reliable dan dapat diakses oleh mahasiswa.
                                    </p>
                                    <p className="text-base sm:text-lg">
                                        Dengan bimbingan dosen dan validasi dari pakar kesehatan mental, platform ini diharapkan
                                        dapat memberikan kontribusi nyata dalam meningkatkan kesadaran mahasiswa terhadap kesehatan mental.
                                    </p>
                                </div>

                                <div className="mt-8 pt-8 border-t border-white/10">
                                    <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8 text-sm text-gray-400">
                                        <div className="flex items-center space-x-2">
                                            <span>🏫</span>
                                            <span>Universitas Borneo Tarakan</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span>💻</span>
                                            <span>Program Studi Teknik Komputer</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span>📅</span>
                                            <span>2024</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Our Values */}
                <div className="container mx-auto px-6 py-20" data-section="values">
                    <div className={`transition-all duration-1000 ${
                        isVisible.values ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'
                    }`}>
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                Prinsip Pengembangan
                            </h2>
                            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                                Nilai-nilai yang menjadi fondasi dalam pengembangan platform
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {values.map((value, index) => (
                                <div
                                    key={index}
                                    className="group p-6 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all duration-500 hover:scale-105 transform-gpu"
                                >
                                    <div className="text-center">
                                        <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
                                            {value.icon}
                                        </div>
                                        <h3 className="text-xl font-bold mb-3 text-white">
                                            {value.title}
                                        </h3>
                                        <p className="text-gray-300 text-sm leading-relaxed">
                                            {value.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Team Section */}
                <div className="container mx-auto px-6 py-20" data-section="team">
                    <div className={`transition-all duration-1000 ${
                        isVisible.team ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'
                    }`}>
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                                Tim Penelitian
                            </h2>
                            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                                Kolaborasi antara teknologi, kesehatan mental, dan akademisi
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                            {teamMembers.map((member, index) => (
                                <div
                                    key={index}
                                    className="group text-center p-8 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 hover:border-purple-500/50 transition-all duration-500 hover:scale-105 transform-gpu"
                                >
                                    <div className="text-8xl mb-6 group-hover:scale-110 transition-transform duration-300">
                                        {member.image}
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">{member.name}</h3>
                                    <div className="text-purple-300 font-medium mb-3">{member.role}</div>
                                    <div className="text-sm text-gray-400 mb-4">{member.expertise}</div>
                                    <p className="text-gray-300 text-sm leading-relaxed">{member.description}</p>
                                    <div className="w-16 h-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full mx-auto mt-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── DIPINDAHKAN DARI BERANDA: Testimoni ── */}
                <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-20" data-section="testimonials">
                    <div className={`transition-all duration-1000 ${
                        isVisible.testimonials ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'
                    }`}>
                        <div className="text-center mb-12 sm:mb-16">
                            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                                Apa Kata Mereka
                            </h2>
                            <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto px-4 sm:px-0">
                                Testimoni dari pengguna yang telah merasakan manfaat DepressionCare
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
                            {testimonials.map((testimonial, index) => (
                                <div
                                    key={index}
                                    className="p-6 sm:p-8 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 hover:border-purple-500/50 transition-all duration-500 hover:scale-105 transform-gpu"
                                >
                                    <div className="flex mb-4">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <span key={i} className="text-yellow-400 text-xl">⭐</span>
                                        ))}
                                    </div>
                                    <p className="text-gray-300 mb-6 italic leading-relaxed text-sm sm:text-base">
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
                            Mulai Deteksi Dini Sekarang
                        </h3>
                        <p className="text-xl text-gray-300 mb-10">
                            Kenali gejala depresi lebih awal untuk mendapatkan bantuan yang tepat
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href="/guest/konsultasi"
                                className="inline-flex items-center justify-center px-10 py-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-purple-500/50"
                            >
                                <span className="mr-3">🚀</span>
                                Mulai Diagnosa Sekarang
                            </Link>
                            <Link
                                href="/edukasi"
                                className="inline-flex items-center justify-center px-10 py-5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 text-xl font-medium"
                            >
                                <span className="mr-3">📚</span>
                                Pelajari Lebih Lanjut
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

export default Tentang;
