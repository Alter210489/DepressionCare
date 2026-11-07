import React, { useState, useEffect } from 'react';
import { Link, Head } from '@inertiajs/react';

const Edukasi = ({ auth }) => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isVisible, setIsVisible] = useState({});
    const [expandedFaq, setExpandedFaq] = useState(null);
    const [expandedArticle, setExpandedArticle] = useState(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const toggleMobileMenu = () => setMobileMenuOpen(!mobileMenuOpen);
    const closeMobileMenu = () => setMobileMenuOpen(false);

    useEffect(() => {
        const isMobile = window.innerWidth < 768;
        if (isMobile) return;
        const handleMouseMove = (e) => setMousePosition({ x: e.clientX, y: e.clientY });
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
            { threshold: 0.2 }
        );
        const sections = document.querySelectorAll('[data-section]');
        sections.forEach(section => observer.observe(section));
        return () => observer.disconnect();
    }, []);

    const articles = [
        {
            icon: '🧠💔',
            title: 'Perbedaan Stres & Depresi',
            summary: 'Banyak orang mengira stres dan depresi adalah hal yang sama. Padahal keduanya memiliki perbedaan mendasar dalam gejala, durasi, dan cara penanganannya.',
            detail: [
                {
                    subtitle: 'Apa itu Stres?',
                    text: 'Stres adalah respons normal tubuh terhadap tekanan atau tantangan tertentu. Biasanya bersifat sementara dan akan mereda setelah situasi pemicunya berlalu. Contohnya: stres menjelang ujian akan hilang setelah ujian selesai.'
                },
                {
                    subtitle: 'Apa itu Depresi?',
                    text: 'Depresi adalah gangguan suasana hati (mood disorder) yang bersifat klinis dan persisten. Berlangsung minimal 2 minggu, mempengaruhi kemampuan berpikir, merasakan, dan menjalani aktivitas sehari-hari — bahkan tanpa pemicu yang jelas.'
                },
                {
                    subtitle: 'Perbedaan Utama',
                    text: 'Stres biasanya masih memiliki motivasi meski tertekan, sedangkan depresi ditandai dengan kehilangan minat total (anhedonia). Stres cenderung memicu kecemasan berlebih, sementara depresi lebih ke arah kekosongan dan perasaan tidak berharga yang mendalam.'
                },
                {
                    subtitle: 'Kapan Harus Waspada?',
                    text: 'Jika perasaan sedih, hampa, atau kehilangan minat berlangsung lebih dari 2 minggu dan mengganggu fungsi sehari-hari (kuliah, makan, tidur, hubungan sosial), segera konsultasikan ke profesional kesehatan mental.'
                }
            ],
            color: 'purple'
        },
        {
            icon: '📚💪',
            title: 'Tips Mengelola Stres saat Kuliah',
            summary: 'Kehidupan kuliah penuh tantangan: deadline tugas, ujian, presentasi, dan tekanan sosial. Pelajari strategi coping yang efektif.',
            detail: [
                {
                    subtitle: '1. Manajemen Waktu dengan Teknik Pomodoro',
                    text: 'Bagi waktu belajar menjadi sesi 25 menit fokus penuh, lalu istirahat 5 menit. Setelah 4 sesi, ambil istirahat panjang 15–30 menit. Teknik ini terbukti meningkatkan produktivitas dan mengurangi rasa kewalahan.'
                },
                {
                    subtitle: '2. Teknik Pernapasan 4-7-8',
                    text: 'Hirup napas selama 4 hitungan, tahan 7 hitungan, hembuskan perlahan selama 8 hitungan. Lakukan 3–4 kali saat merasa panik atau kewalahan. Ini mengaktifkan sistem saraf parasimpatik yang menenangkan tubuh.'
                },
                {
                    subtitle: '3. Batasi Multitasking',
                    text: 'Otak manusia tidak dirancang untuk multitasking. Fokus pada satu tugas dalam satu waktu terbukti lebih efisien dan mengurangi stres. Gunakan aplikasi pemblokir notifikasi saat belajar.'
                },
                {
                    subtitle: '4. Kelola Ekspektasi',
                    text: 'Tidak semua tugas harus sempurna. Bedakan antara tugas yang membutuhkan usaha maksimal dan yang cukup dikerjakan "baik saja". Belajar memprioritaskan adalah keterampilan penting.'
                },
                {
                    subtitle: '5. Jaga Rutinitas Dasar',
                    text: 'Tidur 7–8 jam, makan teratur, dan olahraga ringan minimal 3x seminggu adalah fondasi ketahanan mental. Jangan korbankan ini demi belajar semalam suntuk — justru kontraproduktif.'
                }
            ],
            color: 'blue'
        },
        {
            icon: '💪❤️',
            title: 'Kenapa Minta Bantuan itu Tanda Kekuatan',
            summary: 'Stigma sosial sering membuat orang enggan mencari bantuan. Padahal, berani mengakui butuh bantuan adalah tanda keberanian nyata.',
            detail: [
                {
                    subtitle: 'Mitos yang Perlu Diluruskan',
                    text: 'Banyak yang percaya bahwa "orang kuat tidak butuh bantuan" atau "masalah mental cukup diselesaikan sendiri." Ini adalah mitos berbahaya. Tidak ada yang bisa — atau seharusnya — menanggung segalanya sendirian.'
                },
                {
                    subtitle: 'Mengapa Meminta Bantuan itu Berani',
                    text: 'Dibutuhkan kesadaran diri, keberanian, dan kejujuran untuk mengakui bahwa kita sedang tidak baik-baik saja. Ini jauh lebih sulit dari pura-pura baik-baik saja. Orang yang meminta bantuan sedang berjuang untuk dirinya sendiri — itu kekuatan.'
                },
                {
                    subtitle: 'Apa yang Terjadi Jika Tidak Mencari Bantuan',
                    text: 'Depresi yang dibiarkan cenderung memburuk seiring waktu. Dampaknya bisa meluas ke akademik, hubungan sosial, kesehatan fisik, bahkan berujung pada krisis yang lebih serius. Mencari bantuan lebih awal = pemulihan lebih cepat.'
                },
                {
                    subtitle: 'Bagaimana Memulai',
                    text: 'Mulai dari yang kecil: ceritakan pada satu orang terpercaya — teman dekat, orang tua, atau konselor kampus. Tidak harus langsung ke psikiater. Yang penting, jangan simpan sendiri.'
                }
            ],
            color: 'green'
        },
        {
            icon: '🤝💝',
            title: 'Cara Mendukung Teman yang Sedang Depresi',
            summary: 'Melihat teman berjuang dengan depresi bisa membuat kita merasa tidak berdaya. Pelajari cara memberikan dukungan yang tepat.',
            detail: [
                {
                    subtitle: 'Yang Perlu Dilakukan',
                    text: 'Dengarkan tanpa menghakimi atau langsung memberi solusi. Terkadang yang dibutuhkan hanya didengar. Validasi perasaannya: "Aku mengerti ini berat buatmu" jauh lebih membantu daripada "Banyak yang lebih susah dari kamu."'
                },
                {
                    subtitle: 'Yang Perlu Dihindari',
                    text: 'Jangan katakan "Lebih bersyukur dong", "Pikir positif aja", atau "Kamu lebay." Kalimat-kalimat ini terasa meremehkan dan memperburuk kondisi. Depresi bukan soal kurang bersyukur — ini kondisi medis.'
                },
                {
                    subtitle: 'Tawarkan Bantuan Konkret',
                    text: 'Daripada hanya berkata "Kalau butuh apa-apa bilang ya", tawarkan hal spesifik: "Boleh aku temani kamu ke konselor?", "Mau aku belikan makan malam?", atau "Kita jalan-jalan sebentar yuk." Tawaran konkret lebih mudah diterima.'
                },
                {
                    subtitle: 'Jaga Diri Sendiri Juga',
                    text: 'Mendampingi orang yang depresi bisa menguras energi emosional. Penting untuk menjaga batasan yang sehat dan tidak mengabaikan kesehatan mental diri sendiri. Kamu tidak bisa menuangkan air dari gelas yang kosong.'
                },
                {
                    subtitle: 'Kapan Harus Eskalasi',
                    text: 'Jika temanmu menyebut keinginan untuk menyakiti diri sendiri atau mengakhiri hidup, ini darurat. Tetaplah bersamanya, hubungi konselor kampus atau hotline darurat (119), dan jangan tinggalkan dia sendirian.'
                }
            ],
            color: 'pink'
        }
    ];

    const preventionSteps = [
        {
            number: '01',
            icon: '🏃‍♂️',
            title: 'Aktivitas Fisik Teratur',
            color: 'from-purple-600 to-pink-600',
            borderColor: 'hover:border-purple-500/50',
            points: [
                'Olahraga 30 menit, minimal 3x seminggu — berjalan kaki, bersepeda, atau berenang sudah cukup',
                'Aktivitas fisik melepaskan endorfin dan serotonin, neurotransmitter alami yang meningkatkan suasana hati',
                'Tidak perlu gym — naik tangga, jalan ke kampus, atau senam ringan di kamar sudah efektif',
                'Konsistensi lebih penting dari intensitas; mulai kecil dan bangun kebiasaan secara bertahap'
            ]
        },
        {
            number: '02',
            icon: '😴',
            title: 'Higienitas Tidur yang Baik',
            color: 'from-blue-600 to-purple-600',
            borderColor: 'hover:border-blue-500/50',
            points: [
                'Tidur dan bangun di jam yang sama setiap hari, termasuk akhir pekan',
                'Hindari layar HP/laptop minimal 1 jam sebelum tidur — cahaya biru mengganggu produksi melatonin',
                'Jaga kamar tetap gelap, tenang, dan sejuk untuk kualitas tidur optimal',
                'Hindari kafein setelah pukul 14.00 dan jangan tidur siang lebih dari 20 menit'
            ]
        },
        {
            number: '03',
            icon: '🤝',
            title: 'Bangun Koneksi Sosial',
            color: 'from-green-600 to-blue-600',
            borderColor: 'hover:border-green-500/50',
            points: [
                'Jaga hubungan dengan keluarga dan teman dekat secara aktif, bukan hanya saat butuh',
                'Bergabung dengan komunitas atau organisasi yang sesuai minat untuk memperluas jaringan sosial',
                'Kurangi interaksi di media sosial yang memicu perbandingan diri dan ganti dengan interaksi nyata',
                'Jangan ragu memulai percakapan — banyak orang merasa kesepian dan menunggu untuk diajak bicara'
            ]
        },
        {
            number: '04',
            icon: '🧠',
            title: 'Kelola Stres Secara Proaktif',
            color: 'from-pink-600 to-purple-600',
            borderColor: 'hover:border-pink-500/50',
            points: [
                'Identifikasi sumber stres utama dan buat rencana konkret untuk mengatasinya',
                'Praktikkan mindfulness atau meditasi 10 menit setiap pagi untuk melatih kesadaran penuh',
                'Journaling — tulis 3 hal yang kamu syukuri setiap malam untuk melatih pola pikir positif',
                'Belajar berkata "tidak" pada komitmen yang melebihi kapasitasmu'
            ]
        },
        {
            number: '05',
            icon: '🥗',
            title: 'Nutrisi & Gaya Hidup Sehat',
            color: 'from-teal-600 to-green-600',
            borderColor: 'hover:border-teal-500/50',
            points: [
                'Konsumsi makanan bergizi seimbang — Omega-3 (ikan, kacang), sayuran hijau, dan buah-buahan mendukung kesehatan otak',
                'Batasi konsumsi gula berlebih dan junk food yang dapat menyebabkan mood crash',
                'Minum air putih yang cukup — dehidrasi ringan sudah bisa memengaruhi suasana hati dan konsentrasi',
                'Kurangi alkohol dan hindari rokok — keduanya memperparah gejala kecemasan dan depresi jangka panjang'
            ]
        },
        {
            number: '06',
            icon: '🎯',
            title: 'Temukan Makna & Tujuan',
            color: 'from-indigo-600 to-blue-600',
            borderColor: 'hover:border-indigo-500/50',
            points: [
                'Tetapkan tujuan kecil yang realistis setiap hari untuk membangun rasa pencapaian',
                'Lakukan aktivitas yang memberi makna — volunteering, mengajar, berkarya, atau membantu orang lain',
                'Eksplorasi nilai-nilai pribadi dan pastikan aktivitas sehari-harimu selaras dengannya',
                'Rayakan pencapaian kecil — otak merespons penghargaan dengan cara yang memperkuat motivasi'
            ]
        }
    ];

    const mentalHealthSteps = [
        {
            step: 1,
            icon: '🔍',
            title: 'Kenali Kondisi Dirimu',
            desc: 'Langkah pertama adalah kesadaran diri. Perhatikan pola perasaan, pikiran, dan perilakumu secara jujur.',
            actions: [
                'Lakukan self-check rutin: "Bagaimana perasaanku hari ini dan kenapa?"',
                'Catat di jurnal jika kamu sering merasa sedih, kosong, atau kehilangan semangat',
                'Gunakan alat skrining seperti DepressionCare untuk evaluasi awal yang terstruktur',
                'Jangan abaikan sinyal tubuh seperti sering sakit kepala, insomnia, atau nafsu makan berubah drastis'
            ],
            color: 'purple'
        },
        {
            step: 2,
            icon: '💬',
            title: 'Buka Diri & Bicara',
            desc: 'Menyimpan semua perasaan sendiri adalah beban yang tidak perlu. Berbagi dapat meringankan.',
            actions: [
                'Ceritakan perasaanmu kepada satu orang terpercaya — teman dekat, anggota keluarga, atau mentor',
                'Gunakan kalimat "Aku merasa..." untuk mengekspresikan emosi tanpa menyalahkan diri sendiri',
                'Manfaatkan layanan konseling kampus yang biasanya gratis dan rahasia',
                'Bergabung dengan support group — berbagi dengan orang yang punya pengalaman serupa sangat menyembuhkan'
            ],
            color: 'blue'
        },
        {
            step: 3,
            icon: '🛠️',
            title: 'Bangun Kebiasaan Pelindung',
            desc: 'Kebiasaan sehari-hari adalah pertahanan terkuat melawan masalah kesehatan mental.',
            actions: [
                'Terapkan rutinitas pagi yang konsisten: bangun, bergerak, sarapan, dan rencanakan hari',
                'Lakukan satu aktivitas menyenangkan setiap hari — sekecil apapun, ini penting',
                'Batasi konsumsi berita dan media sosial yang memicu kecemasan (maksimal 30 menit/hari)',
                'Praktikkan teknik grounding saat cemas: perhatikan 5 hal yang bisa kamu lihat, 4 yang bisa kamu sentuh, dst.'
            ],
            color: 'green'
        },
        {
            step: 4,
            icon: '👨‍⚕️',
            title: 'Cari Bantuan Profesional',
            desc: 'Ketika kebiasaan baik tidak cukup, bantuan profesional adalah langkah yang tepat — bukan tanda kegagalan.',
            actions: [
                'Konsultasi dengan psikolog untuk terapi berbasis bukti seperti CBT (Cognitive Behavioral Therapy)',
                'Kunjungi psikiater jika gejala cukup berat dan mungkin memerlukan kombinasi terapi dan obat',
                'Manfaatkan konseling online yang kini lebih terjangkau dan fleksibel (Halodoc, Riliv, Alodokter)',
                'Jangan berhenti di sesi pertama — membangun hubungan terapeutik membutuhkan beberapa pertemuan'
            ],
            color: 'pink'
        },
        {
            step: 5,
            icon: '🔄',
            title: 'Pantau & Evaluasi Perkembangan',
            desc: 'Pemulihan adalah proses, bukan peristiwa. Pantau perkembanganmu secara berkala.',
            actions: [
                'Lakukan tes skrining ulang setiap 2–4 minggu untuk melihat tren perkembangan kondisimu',
                'Diskusikan progres dan tantangan dengan profesional atau orang pendukungmu secara rutin',
                'Catat apa yang berhasil dan apa yang tidak — setiap orang berbeda dalam perjalanan pemulihannya',
                'Bersikap sabar dan berbelas kasih pada diri sendiri — ada kemunduran bukan berarti gagal'
            ],
            color: 'indigo'
        }
    ];

    const colorMap = {
        purple: 'border-purple-500/30 hover:border-purple-400/60 bg-purple-900/20',
        blue: 'border-blue-500/30 hover:border-blue-400/60 bg-blue-900/20',
        green: 'border-green-500/30 hover:border-green-400/60 bg-green-900/20',
        pink: 'border-pink-500/30 hover:border-pink-400/60 bg-pink-900/20',
        indigo: 'border-indigo-500/30 hover:border-indigo-400/60 bg-indigo-900/20',
    };

    const stepColorMap = {
        purple: 'from-purple-600 to-pink-600',
        blue: 'from-blue-600 to-purple-600',
        green: 'from-green-600 to-teal-600',
        pink: 'from-pink-600 to-rose-600',
        indigo: 'from-indigo-600 to-blue-600',
    };

    const faqs = [
        {
            question: 'Apakah diagnosis online sama akuratnya dengan diagnosis langsung oleh dokter?',
            answer: 'Diagnosis online adalah alat skrining awal yang sangat berguna, namun tidak menggantikan diagnosis professional. Sistem kami memiliki akurasi 95% untuk deteksi dini, tetapi konsultasi dengan profesional kesehatan mental tetap direkomendasikan untuk diagnosis definitif dan rencana pengobatan.'
        },
        {
            question: 'Berapa lama waktu yang dibutuhkan untuk menyelesaikan tes?',
            answer: 'Tes diagnosis kami terdiri dari 20 pertanyaan dan biasanya memakan waktu 5-10 menit. Kami menyarankan Anda menjawab dengan tenang dan jujur untuk mendapatkan hasil yang paling akurat.'
        },
        {
            question: 'Apakah data saya akan disimpan dan dibagikan?',
            answer: 'Tidak, kami sangat menghormati privasi Anda. Semua data dienkripsi dan dapat diakses secara anonim. Kami tidak membagikan informasi personal Anda kepada pihak ketiga tanpa persetujuan eksplisit.'
        },
        {
            question: 'Apa yang harus saya lakukan setelah mendapat hasil diagnosis?',
            answer: 'Setelah mendapat hasil, kami akan memberikan rekomendasi langkah selanjutnya. Jika hasilnya menunjukkan indikasi depresi, kami menyarankan untuk berkonsultasi dengan psikolog atau psikiater. Kami juga menyediakan daftar profesional terpercaya.'
        },
        {
            question: 'Apakah sistem ini cocok untuk semua usia?',
            answer: 'Sistem kami dirancang untuk dewasa berusia 18 tahun ke atas. Untuk anak-anak dan remaja, diperlukan pendampingan orang tua dan konsultasi langsung dengan profesional kesehatan mental anak.'
        },
        {
            question: 'Bagaimana jika saya membutuhkan bantuan darurat?',
            answer: 'Jika Anda memiliki pikiran untuk menyakiti diri sendiri atau bunuh diri, segera hubungi layanan darurat (119), konselor krisis, atau kunjungi unit gawat darurat terdekat. Jangan menunggu hasil tes.'
        }
    ];

    return (
        <>
            <Head title="Edukasi" />
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white overflow-hidden relative">

                {/* Animated Background */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute w-64 h-64 md:w-96 md:h-96 bg-gradient-to-r from-purple-500/30 to-pink-500/30 rounded-full blur-3xl animate-pulse"
                        style={{ left: `${mousePosition.x * 0.02}px`, top: `${mousePosition.y * 0.02}px`, transform: 'translate(-50%, -50%)' }} />
                    <div className="absolute w-48 h-48 md:w-80 md:h-80 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse"
                        style={{ right: `${mousePosition.x * 0.01}px`, bottom: `${mousePosition.y * 0.01}px`, transform: 'translate(50%, 50%)', animationDelay: '1s' }} />
                </div>

                {/* Floating Particles */}
                <div className="fixed inset-0 overflow-hidden pointer-events-none">
                    {[...Array(15)].map((_, i) => (
                        <div key={i} className="absolute opacity-10 animate-pulse"
                            style={{ left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, animationDelay: `${Math.random() * 5}s`, animationDuration: `${3 + Math.random() * 4}s` }}>
                            <div className="w-1 h-1 md:w-2 md:h-2 bg-white rounded-full animate-ping" />
                        </div>
                    ))}
                </div>

                <div className="relative z-10">
                    {/* Navigation */}
                    <nav className="container mx-auto px-4 sm:px-6 py-4 sm:py-6 md:py-8">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center space-x-3 sm:space-x-8">
                                <Link href="/" className="text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
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

                            <div className="lg:hidden">
                                <button onClick={toggleMobileMenu} className="text-white p-2 rounded-lg hover:bg-white/10 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-400" aria-label="Toggle Menu">
                                    <div className="w-6 h-6 relative flex flex-col justify-center items-center">
                                        <span className={`bg-white block h-0.5 w-6 rounded-sm transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'}`}></span>
                                        <span className={`bg-white block h-0.5 w-6 rounded-sm transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                                        <span className={`bg-white block h-0.5 w-6 rounded-sm transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'}`}></span>
                                    </div>
                                </button>
                            </div>

                            <div className="hidden lg:flex items-center space-x-4">
                                {auth.user ? (
                                    <Link href="/dashboard" className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-lg">
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link href="/login" className="px-6 py-3 text-gray-300 hover:text-white transition-colors duration-300">Masuk</Link>
                                        <Link href="/register" className="px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">Daftar</Link>
                                    </>
                                )}
                            </div>
                        </div>

                        <div className={`lg:hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? 'max-h-96 opacity-100 mt-4 border-t border-white/10 pt-4' : 'max-h-0 opacity-0 overflow-hidden'}`}>
                            <div className="flex flex-col space-y-1">
                                <Link href="/tentang" onClick={closeMobileMenu} className="text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300 py-3 px-4 rounded-lg">Tentang</Link>
                                <Link href="/edukasi" onClick={closeMobileMenu} className="text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-300 py-3 px-4 rounded-lg">Edukasi</Link>
                                <div className="flex flex-col space-y-3 pt-4 border-t border-white/10 mt-3">
                                    {auth.user ? (
                                        <Link href="/dashboard" onClick={closeMobileMenu} className="px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-semibold text-center">Dashboard</Link>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-3">
                                            <Link href="/login" onClick={closeMobileMenu} className="px-4 py-3 text-center text-gray-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors duration-300">Masuk</Link>
                                            <Link href="/register" onClick={closeMobileMenu} className="px-4 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-center hover:bg-white/20 transition-all duration-300">Daftar</Link>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </nav>

                    {/* Hero Section */}
                    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16" data-section="hero">
                        <div className={`text-center max-w-5xl mx-auto transition-all duration-1000 ${isVisible.hero ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'}`}>
                            <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-xs sm:text-sm font-medium mb-4 sm:mb-6 md:mb-8">
                                <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                                Pusat Edukasi Kesehatan Mental
                            </div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold mb-4 sm:mb-6 md:mb-8 leading-tight">
                                <span className="block bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-2 sm:mb-3 md:mb-4">Edukasi</span>
                                <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">Kesehatan Mental</span>
                            </h1>
                            <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-300 mb-6 sm:mb-8 md:mb-12 max-w-4xl mx-auto leading-relaxed px-2 sm:px-4">
                                Pelajari tentang depresi, cara pencegahan, dan langkah-langkah untuk menjaga kesehatan mental Anda.
                                <span className="text-purple-300 font-semibold"> Pengetahuan adalah langkah pertama menuju kesembuhan.</span>
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center px-2 sm:px-4">
                                <Link href="/guest/konsultasi" className="group relative inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-bold text-white bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 rounded-full overflow-hidden transition-all duration-500 hover:scale-105 md:hover:scale-110 hover:shadow-2xl hover:shadow-purple-500/50">
                                    <span className="mr-2 sm:mr-3">🚀</span>Mulai Diagnosa
                                </Link>
                                <button onClick={() => document.getElementById('articles')?.scrollIntoView({ behavior: 'smooth' })} className="px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 text-base sm:text-lg font-medium">
                                    <span className="mr-2 sm:mr-3">📚</span>Jelajahi Artikel
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12" data-section="stats">
                        <div className={`transition-all duration-1000 ${isVisible.stats ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'}`}>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto">
                                {[
                                    { val: '50+', label: 'Artikel Edukasi', color: 'text-purple-400' },
                                    { val: '6', label: 'Kategori', color: 'text-pink-400' },
                                    { val: '24/7', label: 'Akses', color: 'text-blue-400' },
                                    { val: '100%', label: 'Gratis', color: 'text-green-400' },
                                ].map((s, i) => (
                                    <div key={i} className="text-center p-4 sm:p-6 bg-white/5 backdrop-blur-md rounded-xl sm:rounded-2xl border border-white/10 hover:bg-white/10 transition-all duration-300">
                                        <div className={`text-2xl sm:text-3xl font-bold ${s.color} mb-1 sm:mb-2`}>{s.val}</div>
                                        <div className="text-gray-300 text-xs sm:text-sm">{s.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Mengapa Deteksi Dini Penting */}
                    <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20" data-section="why-important">
                        <div className={`transition-all duration-1000 ${isVisible['why-important'] ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'}`}>
                            <div className="text-center mb-12 sm:mb-16">
                                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                    Mengapa Deteksi Dini Sangat Penting?
                                </h2>
                                <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
                                    Deteksi dini depresi dapat mengubah hidup seseorang secara signifikan
                                </p>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
                                {[
                                    { icon: '🛡️', title: 'Mencegah Perburukan', text: 'Dengan deteksi dini, depresi dapat ditangani sebelum berkembang menjadi kondisi yang lebih serius dan mengganggu kehidupan sehari-hari.', grad: 'from-purple-900/50 to-pink-900/50', border: 'hover:border-purple-500/50' },
                                    { icon: '🎓', title: 'Fokus Akademik', text: 'Membantu mahasiswa tetap fokus pada studi dan prestasi akademik dengan mengatasi masalah kesehatan mental sejak dini.', grad: 'from-blue-900/50 to-purple-900/50', border: 'hover:border-blue-500/50' },
                                    { icon: '💪', title: 'Kualitas Hidup', text: 'Meningkatkan kualitas hidup secara keseluruhan dengan mendapatkan bantuan yang tepat pada waktu yang tepat.', grad: 'from-green-900/50 to-blue-900/50', border: 'hover:border-green-500/50' },
                                ].map((c, i) => (
                                    <div key={i} className={`p-6 sm:p-8 bg-gradient-to-br ${c.grad} backdrop-blur-md rounded-3xl border border-white/10 ${c.border} transition-all duration-500 hover:scale-105`}>
                                        <div className="text-5xl sm:text-6xl mb-4 sm:mb-6 text-center">{c.icon}</div>
                                        <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white text-center">{c.title}</h3>
                                        <p className="text-gray-300 leading-relaxed text-center text-sm sm:text-base">{c.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Quote WHO */}
                    <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20" data-section="quote">
                        <div className={`transition-all duration-1000 ${isVisible.quote ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'}`}>
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

                    {/* ── Artikel Edukasi dengan Accordion ── */}
                    <div id="articles" className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20" data-section="articles">
                        <div className={`transition-all duration-1000 ${isVisible.articles ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'}`}>
                            <div className="text-center mb-8 sm:mb-12 md:mb-16">
                                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 md:mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                                    Artikel Edukasi
                                </h2>
                                <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
                                    Pelajari lebih dalam tentang kesehatan mental dan cara menjaganya
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
                                {articles.map((article, idx) => (
                                    <div key={idx} className={`bg-white/5 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-white/10 transition-all duration-500 ${expandedArticle === idx ? 'border-white/20' : 'hover:scale-[1.02]'}`}>
                                        {/* Card Header */}
                                        <div className="p-4 sm:p-6 md:p-8">
                                            <div className="text-3xl sm:text-4xl md:text-5xl mb-4 sm:mb-6 text-center">{article.icon}</div>
                                            <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-white mb-3 sm:mb-4 text-center">{article.title}</h3>
                                            <p className="text-gray-300 leading-relaxed text-sm sm:text-base mb-4 sm:mb-6">{article.summary}</p>

                                            {/* Accordion Content */}
                                            {expandedArticle === idx && (
                                                <div className="space-y-4 mt-4 border-t border-white/10 pt-4">
                                                    {article.detail.map((d, i) => (
                                                        <div key={i}>
                                                            <h4 className="text-sm sm:text-base font-semibold text-purple-300 mb-1">{d.subtitle}</h4>
                                                            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">{d.text}</p>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Toggle Button */}
                                            <button
                                                onClick={() => setExpandedArticle(expandedArticle === idx ? null : idx)}
                                                className={`w-full mt-4 py-2 sm:py-3 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2
                                                    ${expandedArticle === idx
                                                        ? 'bg-white/10 text-gray-300 hover:bg-white/15'
                                                        : 'bg-gradient-to-r from-purple-600/40 to-pink-600/40 text-purple-200 hover:from-purple-600/60 hover:to-pink-600/60 border border-purple-500/30'
                                                    }`}
                                            >
                                                {expandedArticle === idx ? (
                                                    <><span>Sembunyikan</span> <span className="text-base">↑</span></>
                                                ) : (
                                                    <><span>Baca Selengkapnya</span> <span className="text-base">↓</span></>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── SECTION BARU: Cara Mencegah Depresi ── */}
                    <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20" data-section="prevention">
                        <div className={`transition-all duration-1000 ${isVisible.prevention ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'}`}>
                            <div className="text-center mb-12 sm:mb-16">
                                <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                                    <span className="mr-2">🛡️</span> Panduan Pencegahan
                                </div>
                                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
                                    Cara Mencegah Depresi
                                </h2>
                                <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
                                    Pencegahan adalah investasi terbaik. Terapkan 6 pilar ini secara konsisten untuk membangun
                                    <span className="text-green-300 font-semibold"> ketahanan mental jangka panjang.</span>
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
                                {preventionSteps.map((item, idx) => (
                                    <div key={idx} className={`group p-6 sm:p-8 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 ${item.borderColor} transition-all duration-500 hover:scale-105 hover:bg-white/10`}>
                                        {/* Number + Icon */}
                                        <div className="flex items-center gap-4 mb-5">
                                            <div className={`w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r ${item.color} rounded-2xl flex items-center justify-center text-white font-bold text-sm sm:text-base flex-shrink-0`}>
                                                {item.number}
                                            </div>
                                            <div className="text-3xl sm:text-4xl">{item.icon}</div>
                                        </div>
                                        <h3 className="text-lg sm:text-xl font-bold text-white mb-4">{item.title}</h3>
                                        <ul className="space-y-2">
                                            {item.points.map((point, i) => (
                                                <li key={i} className="flex items-start gap-2 text-gray-300 text-xs sm:text-sm leading-relaxed">
                                                    <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
                                                    <span>{point}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* ── SECTION BARU: Langkah Menjaga Kesehatan Mental ── */}
                    <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20" data-section="mental-steps">
                        <div className={`transition-all duration-1000 ${isVisible['mental-steps'] ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'}`}>
                            <div className="text-center mb-12 sm:mb-16">
                                <div className="inline-flex items-center px-3 sm:px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                                    <span className="mr-2">🗺️</span> Panduan Bertahap
                                </div>
                                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                                    Langkah Menjaga Kesehatan Mental
                                </h2>
                                <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto">
                                    Perjalanan menuju kesehatan mental yang baik dimulai dari satu langkah.
                                    <span className="text-blue-300 font-semibold"> Berikut peta jalannya.</span>
                                </p>
                            </div>

                            <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
                                {mentalHealthSteps.map((item, idx) => (
                                    <div key={idx} className={`p-5 sm:p-6 md:p-8 border rounded-2xl sm:rounded-3xl backdrop-blur-md transition-all duration-500 ${colorMap[item.color]}`}>
                                        <div className="flex items-start gap-4 sm:gap-6">
                                            {/* Step Number */}
                                            <div className={`w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br ${stepColorMap[item.color]} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                                                <span className="text-white font-bold text-base sm:text-xl">{item.step}</span>
                                            </div>
                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                                                    <span className="text-2xl sm:text-3xl">{item.icon}</span>
                                                    <h3 className="text-base sm:text-xl font-bold text-white">{item.title}</h3>
                                                </div>
                                                <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-3 sm:mb-4">{item.desc}</p>
                                                <ul className="space-y-1 sm:space-y-2">
                                                    {item.actions.map((action, i) => (
                                                        <li key={i} className="flex items-start gap-2 text-gray-300 text-xs sm:text-sm leading-relaxed">
                                                            <span className="text-blue-400 mt-0.5 flex-shrink-0">→</span>
                                                            <span>{action}</span>
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Call to action inline */}
                            <div className="mt-10 sm:mt-12 text-center">
                                <p className="text-gray-400 text-sm sm:text-base mb-4">Tidak yakin harus mulai dari mana?</p>
                                <Link href="/guest/konsultasi" className="inline-flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full font-semibold text-sm sm:text-base hover:from-blue-700 hover:to-purple-700 transition-all duration-300 hover:scale-105 shadow-lg">
                                    <span>🔍</span> Mulai dengan Evaluasi Diri Sekarang
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Help Resources */}
                    <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20" data-section="help">
                        <div className={`transition-all duration-1000 ${isVisible.help ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'}`}>
                            <div className="text-center mb-8 sm:mb-12 md:mb-16">
                                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 md:mb-6 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                                    Sumber Bantuan
                                </h2>
                                <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
                                    Jangan ragu untuk mencari bantuan. Berikut adalah berbagai sumber dukungan yang tersedia
                                </p>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
                                <div className="p-4 sm:p-6 md:p-8 bg-white/5 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-white/10 hover:border-red-500/50 transition-all duration-500 hover:scale-105">
                                    <div className="text-3xl sm:text-4xl md:text-5xl mb-4 sm:mb-6 text-center">📞</div>
                                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-3 sm:mb-4 text-center">Hotline Kesehatan Mental</h3>
                                    <div className="text-gray-300 text-xs sm:text-sm md:text-base leading-relaxed space-y-2">
                                        <p className="font-medium text-red-300">Layanan 24 Jam:</p>
                                        <p>• <span className="font-bold text-red-400">Sejiwa: 119 ext 8</span></p>
                                        <p>• Crisis Helpline: 500-454</p>
                                        <p>• Mental Health Indonesia</p>
                                    </div>
                                </div>
                                <div className="p-4 sm:p-6 md:p-8 bg-white/5 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-white/10 hover:border-green-500/50 transition-all duration-500 hover:scale-105">
                                    <div className="text-3xl sm:text-4xl md:text-5xl mb-4 sm:mb-6 text-center">💻</div>
                                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-3 sm:mb-4 text-center">Konseling Online</h3>
                                    <div className="text-gray-300 text-xs sm:text-sm md:text-base leading-relaxed space-y-2">
                                        <p className="font-medium text-green-300">Platform Terpercaya:</p>
                                        <p>• Halodoc (Psikologi)</p>
                                        <p>• Alodokter Mental Health</p>
                                        <p>• Riliv - Curhat & Konseling</p>
                                        <p>• Bicarakan.id</p>
                                    </div>
                                </div>
                                <div className="p-4 sm:p-6 md:p-8 bg-white/5 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-white/10 hover:border-blue-500/50 transition-all duration-500 hover:scale-105 sm:col-span-2 lg:col-span-1">
                                    <div className="text-3xl sm:text-4xl md:text-5xl mb-4 sm:mb-6 text-center">📚</div>
                                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-white mb-3 sm:mb-4 text-center">Sumber Bacaan</h3>
                                    <div className="text-gray-300 text-xs sm:text-sm md:text-base leading-relaxed space-y-2">
                                        <p className="font-medium text-blue-300">Website & Buku:</p>
                                        <p>• intothelightid.org</p>
                                        <p>• mentalhealthindonesia.id</p>
                                        <p>• "Feeling Good" - D. Burns</p>
                                        <p>• WHO Mental Health</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Mental Health Tips */}
                    <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20" data-section="tips">
                        <div className={`transition-all duration-1000 ${isVisible.tips ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'}`}>
                            <div className="text-center mb-8 sm:mb-12 md:mb-16">
                                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-6 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                                    Tips Kesehatan Mental Harian
                                </h2>
                                <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
                                    Praktik sederhana yang bisa Anda lakukan setiap hari untuk menjaga kesehatan mental
                                </p>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6 max-w-6xl mx-auto">
                                {[
                                    { icon: '🧘‍♀️', title: 'Meditasi 10 Menit', desc: 'Luangkan waktu untuk mindfulness setiap pagi' },
                                    { icon: '🚶‍♂️', title: 'Jalan Kaki', desc: 'Aktivitas fisik ringan untuk meningkatkan mood' },
                                    { icon: '📝', title: 'Journaling', desc: 'Tulis pikiran dan perasaan Anda' },
                                    { icon: '😴', title: 'Tidur Cukup', desc: '7-9 jam tidur berkualitas setiap malam' },
                                    { icon: '🤝', title: 'Hubungan Sosial', desc: 'Jaga koneksi dengan orang-orang terkasih' },
                                    { icon: '🎵', title: 'Musik Relaksasi', desc: 'Dengarkan musik yang menenangkan' },
                                    { icon: '🌱', title: 'Hobi Kreatif', desc: 'Lakukan aktivitas yang Anda nikmati' },
                                    { icon: '🙏', title: 'Gratitude', desc: 'Syukuri hal-hal kecil dalam hidup' }
                                ].map((tip, index) => (
                                    <div key={index} className="p-3 sm:p-4 md:p-6 bg-white/5 backdrop-blur-md rounded-xl sm:rounded-2xl border border-white/10 hover:border-green-500/50 transition-all duration-500 hover:scale-105 text-center">
                                        <div className="text-2xl sm:text-3xl md:text-4xl mb-2 sm:mb-4">{tip.icon}</div>
                                        <h3 className="text-xs sm:text-sm md:text-lg font-semibold text-white mb-1 sm:mb-2">{tip.title}</h3>
                                        <p className="text-gray-300 text-xs sm:text-sm hidden sm:block">{tip.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Emergency Resources */}
                    <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20" data-section="emergency">
                        <div className={`transition-all duration-1000 ${isVisible.emergency ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'}`}>
                            <div className="max-w-4xl mx-auto">
                                <div className="p-4 sm:p-6 md:p-8 bg-gradient-to-r from-red-900/30 to-orange-900/30 backdrop-blur-md rounded-2xl sm:rounded-3xl border-2 border-red-500/50">
                                    <div className="text-center mb-6 sm:mb-8">
                                        <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">🆘</div>
                                        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white mb-3 sm:mb-4">Butuh Bantuan Segera?</h2>
                                        <p className="text-sm sm:text-base md:text-lg text-gray-300">
                                            Jika Anda atau seseorang yang Anda kenal dalam keadaan darurat mental, jangan ragu untuk mencari bantuan
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 md:gap-6">
                                        {[
                                            { icon: '📞', title: 'Hotline Darurat', val: '119', sub: '24 jam', valColor: 'text-red-300' },
                                            { icon: '💬', title: 'Crisis Chat', val: 'Sejiwa: 119 ext 8', sub: 'Online 24/7', valColor: 'text-green-300' },
                                            { icon: '🏥', title: 'IGD Terdekat', val: 'Kunjungi unit gawat darurat', sub: 'Segera', valColor: 'text-blue-300' },
                                        ].map((r, i) => (
                                            <div key={i} className="text-center p-3 sm:p-4 md:p-6 bg-white/10 rounded-xl sm:rounded-2xl">
                                                <div className="text-xl sm:text-2xl md:text-3xl mb-2 sm:mb-3">{r.icon}</div>
                                                <h3 className="font-bold text-white mb-1 sm:mb-2 text-xs sm:text-sm md:text-base">{r.title}</h3>
                                                <p className={`${r.valColor} text-xs sm:text-sm font-bold`}>{r.val}</p>
                                                <p className="text-gray-300 text-xs sm:text-sm">{r.sub}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* FAQ Section */}
                    <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20" data-section="faq">
                        <div className={`transition-all duration-1000 ${isVisible.faq ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'}`}>
                            <div className="text-center mb-8 sm:mb-12 md:mb-16">
                                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 md:mb-6 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                                    Pertanyaan yang Sering Diajukan
                                </h2>
                                <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-2xl mx-auto">
                                    Temukan jawaban atas pertanyaan umum tentang diagnosis dan kesehatan mental
                                </p>
                            </div>
                            <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4">
                                {faqs.map((faq, index) => (
                                    <div key={index} className="bg-white/5 backdrop-blur-md rounded-xl sm:rounded-2xl border border-white/10 hover:border-purple-500/50 transition-all duration-300">
                                        <button
                                            onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                                            className="w-full p-3 sm:p-4 md:p-6 text-left flex justify-between items-center hover:bg-white/5 transition-colors duration-300 rounded-xl sm:rounded-2xl"
                                        >
                                            <span className="text-sm sm:text-base md:text-lg font-semibold text-white pr-4">{faq.question}</span>
                                            <div className={`text-lg sm:text-xl md:text-2xl transition-transform duration-300 flex-shrink-0 ${expandedFaq === index ? 'rotate-180' : ''}`}>⌄</div>
                                        </button>
                                        {expandedFaq === index && (
                                            <div className="px-3 sm:px-4 md:px-6 pb-3 sm:pb-4 md:pb-6">
                                                <div className="border-t border-white/10 pt-3 sm:pt-4">
                                                    <p className="text-gray-300 leading-relaxed text-xs sm:text-sm md:text-base">{faq.answer}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="container mx-auto px-4 sm:px-6 py-12 sm:py-16 md:py-20" data-section="cta">
                        <div className={`text-center max-w-4xl mx-auto transition-all duration-1000 ${isVisible.cta ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-10'}`}>
                            <h3 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 md:mb-8 text-white">
                                Siap Mengambil Langkah Selanjutnya?
                            </h3>
                            <p className="text-base sm:text-lg md:text-xl text-gray-300 mb-6 sm:mb-8 md:mb-10">
                                Setelah mempelajari tentang kesehatan mental, saatnya untuk melakukan evaluasi diri
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                <Link href="/guest/konsultasi" className="inline-flex items-center justify-center px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-base sm:text-lg md:text-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-purple-500/50">
                                    <span className="mr-2 sm:mr-3">🎯</span>Mulai Tes Diagnosa
                                </Link>
                                <Link href="/tentang" className="inline-flex items-center justify-center px-6 sm:px-8 md:px-10 py-3 sm:py-4 md:py-5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105 text-base sm:text-lg md:text-xl font-medium">
                                    <span className="mr-2 sm:mr-3">ℹ️</span>Tentang Platform
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Edukasi;
