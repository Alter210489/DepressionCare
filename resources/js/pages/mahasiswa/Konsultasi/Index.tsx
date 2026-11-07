import React from 'react';
import { Head, Link } from '@inertiajs/react';
import {
    PlayIcon,
    ClipboardDocumentListIcon,
    ChartBarIcon,
    CalendarDaysIcon,
    ClockIcon,
    CheckCircleIcon,
    InformationCircleIcon,
    HeartIcon,
    AcademicCapIcon,
    BeakerIcon,
    ArrowLeftIcon,
} from '@heroicons/react/24/outline';

interface RecentConsultation {
    id_konsultasi: number;
    tanggal_konsultasi: string;
    hasil_diagnosa: string;
    nilai_cf: number;
    tingkat_keparahan: string;
    diagnosa: {
        nama_diagnosa: string;
        deskripsi_diagnosa: string;
    };
}

interface Statistics {
    total_konsultasi: number;
    konsultasi_bulan_ini: number;
    last_consultation: RecentConsultation | null;
}

interface Props {
    recentConsultations: RecentConsultation[];
    statistics: Statistics;
    totalGejala: number;
}

const Index: React.FC<Props> = ({
    recentConsultations,
    statistics,
    totalGejala
}) => {
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getSeverityColor = (severity: string) => {
        const colors: { [key: string]: string } = {
            'Minimal / Normal': 'bg-green-100 text-green-800',
            'Depresi Ringan': 'bg-yellow-100 text-yellow-800',
            'Depresi Sedang': 'bg-orange-100 text-orange-800',
            'Depresi Berat': 'bg-red-100 text-red-800'
        };
        return colors[severity] || 'bg-gray-100 text-gray-800';
    };

    return (
        <>
            <Head title="Konsultasi - Dashboard Mahasiswa" />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
                {/* Enhanced Header with Back Button */}
                <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 shadow-xl">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>

                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                        {/* Back Button */}
                        <div className="mb-6">
                            <Link
                                href={route('mahasiswa.dashboard')}
                                className="group inline-flex items-center space-x-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white px-4 py-3 rounded-xl border border-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                            >
                                <ArrowLeftIcon className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
                                <span className="font-semibold">Kembali ke Dashboard</span>
                            </Link>
                        </div>

                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                            <div className="max-w-3xl">
                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
                                    Konsultasi Mental Health
                                </h1>
                                <p className="mt-3 text-lg sm:text-xl text-blue-100 leading-relaxed">
                                    Sistem diagnosa kesehatan mental menggunakan metode Certainty Factor
                                </p>
                                <div className="flex flex-wrap items-center gap-4 sm:gap-6 mt-6 text-sm">
                                    <div className="flex items-center space-x-2">
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                        <span className="text-blue-100">100% Anonim</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                                        <span className="text-blue-100">Hasil Akurat</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
                                        <span className="text-blue-100">{totalGejala} Gejala</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3 sm:space-x-4">
                                <Link
                                    href={route('mahasiswa.riwayat-konsultasi.index')}
                                    className="group bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white px-4 sm:px-6 py-3 rounded-xl hover:scale-105 transition-all duration-300 flex items-center space-x-2 border border-white/20 hover:border-white/30 shadow-lg hover:shadow-xl"
                                >
                                    <ClipboardDocumentListIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                    <span className="font-semibold hidden sm:inline">Riwayat Konsultasi</span>
                                    <span className="font-semibold sm:hidden">Riwayat</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    {/* Enhanced Statistics Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6 hover:scale-105 transition-all duration-300">
                            <div className="flex items-center">
                                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600">
                                    <ClipboardDocumentListIcon className="h-6 w-6 text-white" />
                                </div>
                                <div className="ml-3 sm:ml-4">
                                    <p className="text-xs sm:text-sm font-medium text-gray-600">Total Konsultasi</p>
                                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{statistics.total_konsultasi}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6 hover:scale-105 transition-all duration-300">
                            <div className="flex items-center">
                                <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-green-600">
                                    <CalendarDaysIcon className="h-6 w-6 text-white" />
                                </div>
                                <div className="ml-3 sm:ml-4">
                                    <p className="text-xs sm:text-sm font-medium text-gray-600">Bulan Ini</p>
                                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{statistics.konsultasi_bulan_ini}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6 hover:scale-105 transition-all duration-300">
                            <div className="flex items-center">
                                <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-purple-600">
                                    <BeakerIcon className="h-6 w-6 text-white" />
                                </div>
                                <div className="ml-3 sm:ml-4">
                                    <p className="text-xs sm:text-sm font-medium text-gray-600">Total Gejala</p>
                                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{totalGejala}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6 hover:scale-105 transition-all duration-300">
                            <div className="flex items-center">
                                <div className="p-3 rounded-xl bg-gradient-to-r from-orange-500 to-orange-600">
                                    <ClockIcon className="h-6 w-6 text-white" />
                                </div>
                                <div className="ml-3 sm:ml-4">
                                    <p className="text-xs sm:text-sm font-medium text-gray-600">Estimasi Waktu</p>
                                    <p className="text-xl sm:text-2xl font-bold text-gray-900">15 Min</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                        {/* Enhanced Main Action Card */}
                        <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                            {/* Start Consultation Hero */}
                            <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl shadow-xl p-6 sm:p-8 text-white">
                                <div className="absolute inset-0 bg-black/10"></div>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>

                                <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-6 lg:space-y-0">
                                    <div className="flex-1 max-w-none lg:max-w-2xl">
                                        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
                                            Mulai Konsultasi Baru
                                        </h2>
                                        <p className="text-blue-100 mb-6 text-base sm:text-lg leading-relaxed">
                                            Dapatkan diagnosa kesehatan mental yang akurat dengan menjawab {totalGejala} pertanyaan
                                            terkait gejala yang Anda rasakan menggunakan metode Certainty Factor.
                                        </p>

                                        <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
                                            <div className="flex items-center space-x-2">
                                                <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-300" />
                                                <span className="text-sm">Privasi Terjamin</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-300" />
                                                <span className="text-sm">Hasil Akurat</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-green-300" />
                                                <span className="text-sm">Metode Ilmiah</span>
                                            </div>
                                        </div>

                                        <Link
                                            href={route('mahasiswa.konsultasi.start')}
                                            className="group inline-flex items-center space-x-3 bg-white text-blue-600 px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105"
                                        >
                                            <PlayIcon className="h-5 w-5 sm:h-6 sm:w-6 group-hover:scale-110 transition-transform" />
                                            <span className="text-sm sm:text-base">Mulai Konsultasi Sekarang</span>
                                        </Link>
                                    </div>
                                    <div className="hidden lg:block ml-8">
                                        <div className="w-28 h-28 xl:w-32 xl:h-32 bg-white bg-opacity-20 rounded-full flex items-center justify-center backdrop-blur-xl">
                                            <HeartIcon className="h-12 w-12 xl:h-16 xl:w-16 text-white" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced Last Consultation */}
                            {statistics.last_consultation && (
                                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Konsultasi Terakhir
                                        </h3>
                                        <span className="text-sm text-gray-500">
                                            {formatDate(statistics.last_consultation.tanggal_konsultasi)}
                                        </span>
                                    </div>
                                    <div className="border rounded-xl p-4 bg-gradient-to-r from-gray-50 to-white hover:from-blue-50 hover:to-indigo-50 transition-all duration-300">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 space-y-2 sm:space-y-0">
                                            <span className="font-medium text-gray-900 text-sm sm:text-base">
                                                {statistics.last_consultation.hasil_diagnosa}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium w-fit ${getSeverityColor(statistics.last_consultation.tingkat_keparahan)}`}>
                                                {statistics.last_consultation.tingkat_keparahan}
                                            </span>
                                        </div>
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                                            <span className="text-sm text-gray-600">
                                                Tingkat Kepercayaan: {Math.round(statistics.last_consultation.nilai_cf * 100)}%
                                            </span>
                                            <Link
                                                href={route('mahasiswa.konsultasi.result', statistics.last_consultation.id_konsultasi)}
                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium w-fit hover:underline"
                                            >
                                                Lihat Detail →
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Enhanced How It Works */}
                            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
                                <h3 className="text-xl font-semibold text-gray-900 mb-6">
                                    Cara Kerja Sistem
                                </h3>
                                <div className="space-y-4 sm:space-y-6">
                                    <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl flex items-center justify-center font-semibold text-sm">
                                            1
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-1">Jawab Kuesioner</h4>
                                            <p className="text-gray-600 text-sm leading-relaxed">
                                                Jawab {totalGejala} pertanyaan tentang gejala yang Anda rasakan dengan skala kepercayaan
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl flex items-center justify-center font-semibold text-sm">
                                            2
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-1">Analisis Certainty Factor</h4>
                                            <p className="text-gray-600 text-sm leading-relaxed">
                                                Sistem menganalisis jawaban menggunakan metode Certainty Factor untuk menghitung tingkat kepercayaan
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-4">
                                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl flex items-center justify-center font-semibold text-sm">
                                            3
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-gray-900 mb-1">Hasil & Rekomendasi</h4>
                                            <p className="text-gray-600 text-sm leading-relaxed">
                                                Dapatkan hasil diagnosa dengan tingkat kepercayaan dan rekomendasi yang sesuai
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Enhanced Right Sidebar */}
                        <div className="space-y-6">
                            {/* Enhanced Recent Consultations */}
                            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Riwayat Terbaru
                                    </h3>
                                    <Link
                                        href={route('mahasiswa.riwayat-konsultasi.index')}
                                        className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                                    >
                                        Lihat Semua
                                    </Link>
                                </div>
                                {recentConsultations.length > 0 ? (
                                    <div className="space-y-3">
                                        {recentConsultations.slice(0, 3).map((consultation) => (
                                            <div key={consultation.id_konsultasi} className="border rounded-xl p-3 hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 hover:border-blue-200">
                                                <div className="flex flex-col space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                                                            {consultation.hasil_diagnosa}
                                                        </span>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(consultation.tingkat_keparahan)}`}>
                                                            {consultation.tingkat_keparahan.split(' ')[0]}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between">
                                                        <span className="text-xs text-gray-500">
                                                            {formatDate(consultation.tanggal_konsultasi).split(',')[0]}
                                                        </span>
                                                        <Link
                                                            href={route('mahasiswa.konsultasi.result', consultation.id_konsultasi)}
                                                            className="text-blue-600 hover:text-blue-800 text-xs font-medium hover:underline"
                                                        >
                                                            Detail
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-6 sm:py-8">
                                        <ClipboardDocumentListIcon className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-2" />
                                        <p className="text-gray-500 text-sm">Belum ada riwayat konsultasi</p>
                                    </div>
                                )}
                            </div>

                            {/* Enhanced Information Card */}
                            <div className="bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 rounded-2xl border border-blue-200 p-4 sm:p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-lg flex items-center justify-center">
                                        <InformationCircleIcon className="h-4 w-4 text-white" />
                                    </div>
                                    <div className="ml-3">
                                        <h4 className="text-sm font-medium text-blue-900 mb-2">
                                            Catatan Penting
                                        </h4>
                                        <p className="text-sm text-blue-800 leading-relaxed">
                                            Hasil konsultasi ini bukan pengganti konsultasi dengan profesional kesehatan mental.
                                            Jika Anda merasa dalam kondisi darurat, segera hubungi layanan kesehatan mental profesional.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced Quick Actions */}
                            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6 hover:shadow-xl transition-all duration-300">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Tautan Cepat
                                </h3>
                                <div className="space-y-3">
                                    <Link
                                        href={route('mahasiswa.gejala.index')}
                                        className="flex items-center text-gray-700 hover:text-blue-600 transition-colors duration-200 p-2 rounded-lg hover:bg-blue-50"
                                    >
                                        <AcademicCapIcon className="h-4 w-4 mr-3" />
                                        <span className="text-sm">Pelajari Gejala Depresi</span>
                                    </Link>
                                    <Link
                                        href={route('mahasiswa.help')}
                                        className="flex items-center text-gray-700 hover:text-blue-600 transition-colors duration-200 p-2 rounded-lg hover:bg-blue-50"
                                    >
                                        <InformationCircleIcon className="h-4 w-4 mr-3" />
                                        <span className="text-sm">Bantuan & FAQ</span>
                                    </Link>
                                    {/* <Link
                                        href={route('mahasiswa.contact')}
                                        className="flex items-center text-gray-700 hover:text-blue-600 transition-colors duration-200 p-2 rounded-lg hover:bg-blue-50"
                                    >
                                        <HeartIcon className="h-4 w-4 mr-3" />
                                        <span className="text-sm">Hubungi Konselor</span>
                                    </Link> */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Index;
