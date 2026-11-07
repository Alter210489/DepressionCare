import { Alert, AlertDescription } from '@/components/ui/alert';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@headlessui/react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Trash2,
    UserCheck,
    Calendar,
    FileText,
    CheckCircle,
    AlertTriangle,
    Clock,
    Mail,
    GraduationCap,
    Building,
    X,
    Printer,
    Activity,
    Target,
    User,
    Phone,
    Hash,
    Globe
} from 'lucide-react';
import { useState } from 'react';

interface GejalaTerpilih {
    id_gejala: number;
    kode_gejala: string;
    nama_gejala: string;
    kategori_gejala?: string;
    jawaban: string;
    nilai_cf: number;
    deskripsi?: string;
}

interface DetailDiagnosa {
    id_diagnosa: number;
    kode_diagnosa: string;
    nama_diagnosa: string;
    deskripsi: string;
    nilai_cf: number;
    rekomendasi: string;
}

interface GuestInfo {
    nama: string;
    email: string;
    nim?: string;
    fakultas?: string;
    program_studi?: string;
    umur: number;
    jenis_kelamin: 'Laki-laki' | 'Perempuan';
}

interface GuestConsultation {
    id_guestconsultation: number;
    session_id: string;
    tanggal_konsultasi: string;
    hasil_diagnosa: string;
    tingkat_keparahan: string;
    nilai_cf: number;
    rekomendasi: string | string[];
    created_at: string;
    updated_at: string;
    guest_info: GuestInfo;
    gejala_terpilih: GejalaTerpilih[];
    detail_diagnosa?: DetailDiagnosa;
}

interface ShowProps {
    guestConsultation: GuestConsultation;
}

export default function GuestConsultationShow({ guestConsultation }: ShowProps) {
    const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;
    const [showAlert, setShowAlert] = useState(Boolean(flash?.success || flash?.error));
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/admin/dashboard',
        },
        {
            title: 'Konsultasi Guest',
            href: '/admin/guest-consultation',
        },
        {
            title: 'Detail Konsultasi Guest',
            href: `/admin/guest-consultation/${guestConsultation.id_guestconsultation}`,
        },
    ];

    // Get Severity Badge Color
    const getSeverityBadgeColor = (tingkat: string) => {
        const lowerTingkat = tingkat.toLowerCase();
        if (lowerTingkat.includes('normal') || lowerTingkat.includes('minimal')) {
            return 'bg-green-100 text-green-800 border-green-200';
        } else if (lowerTingkat.includes('ringan') || lowerTingkat.includes('mild')) {
            return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        } else if (lowerTingkat.includes('sedang') || lowerTingkat.includes('moderate')) {
            return 'bg-orange-100 text-orange-800 border-orange-200';
        } else if (lowerTingkat.includes('berat') || lowerTingkat.includes('severe')) {
            return 'bg-red-100 text-red-800 border-red-200';
        }
        return 'bg-gray-100 text-gray-800 border-gray-200';
    };

    // Get Severity Icon
    const getSeverityIcon = (tingkat: string) => {
        const lowerTingkat = tingkat.toLowerCase();
        if (lowerTingkat.includes('normal') || lowerTingkat.includes('minimal')) {
            return <CheckCircle className="text-green-600" size={20} />;
        } else if (lowerTingkat.includes('ringan') || lowerTingkat.includes('mild')) {
            return <AlertTriangle className="text-yellow-600" size={20} />;
        } else if (lowerTingkat.includes('sedang') || lowerTingkat.includes('moderate')) {
            return <AlertTriangle className="text-orange-600" size={20} />;
        } else if (lowerTingkat.includes('berat') || lowerTingkat.includes('severe')) {
            return <AlertTriangle className="text-red-600" size={20} />;
        }
        return <AlertTriangle className="text-gray-600" size={20} />;
    };

    // Handle Delete
    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(route('admin.guest-consultation.destroy', guestConsultation.id_guestconsultation), {
            onSuccess: () => {
                setShowDeleteModal(false);
                setIsDeleting(false);
            },
            onError: () => {
                setIsDeleting(false);
            }
        });
    };

    // Handle Printer
    const handlePrinter = () => {
        window.print();
    };

    // Format Date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Get CF Value Color
    const getCFValueColor = (cf: number) => {
        if (cf >= 0.8) return 'text-red-600 bg-red-50';
        if (cf >= 0.6) return 'text-orange-600 bg-orange-50';
        if (cf >= 0.4) return 'text-yellow-600 bg-yellow-50';
        return 'text-green-600 bg-green-50';
    };

    // Process recommendations
    const processRecommendations = (rekomendasi: string | string[]) => {
        if (Array.isArray(rekomendasi)) {
            return rekomendasi;
        }
        if (typeof rekomendasi === 'string') {
            try {
                const parsed = JSON.parse(rekomendasi);
                return Array.isArray(parsed) ? parsed : [rekomendasi];
            } catch {
                return [rekomendasi];
            }
        }
        return [];
    };

    const recommendations = processRecommendations(guestConsultation.rekomendasi);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Konsultasi Guest - ${guestConsultation.guest_info.nama}`} />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Detail Konsultasi Guest</h1>
                        <p className="text-gray-600 mt-1">
                            Konsultasi guest untuk {guestConsultation.guest_info.nama}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={route('admin.guest-consultation.index')}
                            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={18} />
                            Kembali
                        </Link>
                        <Button
                            onClick={handlePrinter}
                            className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg transition-colors"
                        >
                            <Printer size={18} />
                            Cetak
                        </Button>
                        <Button
                            onClick={() => setShowDeleteModal(true)}
                            className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg transition-colors"
                        >
                            <Trash2 size={18} />
                            Hapus
                        </Button>
                    </div>
                </div>

                {/* Flash Messages */}
                {showAlert && flash && (
                    <Alert
                        className={`${
                            flash.success
                                ? 'bg-green-50 border-green-200 text-green-800'
                                : 'bg-red-50 border-red-200 text-red-800'
                        } transition-all duration-300 relative`}
                    >
                        <AlertDescription className="font-medium pr-8">
                            {flash.success || flash.error}
                        </AlertDescription>
                        <Button
                            onClick={() => setShowAlert(false)}
                            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-1"
                        >
                            <X size={16} />
                        </Button>
                    </Alert>
                )}

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column - Main Information */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Guest Information Card */}
                        <div className="bg-white rounded-lg shadow-sm border">
                            <div className="p-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <UserCheck className="text-purple-600" size={24} />
                                    Informasi Guest
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                Nama Lengkap
                                            </label>
                                            <p className="text-lg font-semibold text-gray-900">
                                                {guestConsultation.guest_info.nama}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center gap-1">
                                                <Mail size={14} />
                                                Email
                                            </label>
                                            <p className="text-gray-900 text-sm">
                                                {guestConsultation.guest_info.email}
                                            </p>
                                        </div>
                                        {guestConsultation.guest_info.nim && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center gap-1">
                                                    <Hash size={14} />
                                                    NIM
                                                </label>
                                                <p className="text-gray-900 font-mono text-sm bg-gray-50 px-2 py-1 rounded">
                                                    {guestConsultation.guest_info.nim}
                                                </p>
                                            </div>
                                        )}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center gap-1">
                                                <User size={14} />
                                                Jenis Kelamin
                                            </label>
                                            <p className="text-gray-900">
                                                {guestConsultation.guest_info.jenis_kelamin}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                Umur
                                            </label>
                                            <p className="text-gray-900">
                                                {guestConsultation.guest_info.umur} tahun
                                            </p>
                                        </div>
                                        {guestConsultation.guest_info.fakultas && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center gap-1">
                                                    <Building size={14} />
                                                    Fakultas
                                                </label>
                                                <p className="text-gray-900">
                                                    {guestConsultation.guest_info.fakultas}
                                                </p>
                                            </div>
                                        )}
                                        {guestConsultation.guest_info.program_studi && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center gap-1">
                                                    <GraduationCap size={14} />
                                                    Program Studi
                                                </label>
                                                <p className="text-gray-900">
                                                    {guestConsultation.guest_info.program_studi}
                                                </p>
                                            </div>
                                        )}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center gap-1">
                                                <Globe size={14} />
                                                Session ID
                                            </label>
                                            <p className="text-gray-900 font-mono text-xs bg-gray-50 px-2 py-1 rounded">
                                                {guestConsultation.session_id}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Diagnosis Information Card */}
                        <div className="bg-white rounded-lg shadow-sm border">
                            <div className="p-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <FileText className="text-blue-600" size={24} />
                                    Hasil Diagnosa
                                </h3>
                                <div className="space-y-4">
                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <h4 className="font-semibold text-gray-900 mb-2">Diagnosa</h4>
                                        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                            {guestConsultation.hasil_diagnosa}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                                {getSeverityIcon(guestConsultation.tingkat_keparahan)}
                                                Tingkat Keparahan
                                            </h4>
                                            <span className={`inline-flex px-4 py-2 text-sm font-semibold rounded-full border ${getSeverityBadgeColor(guestConsultation.tingkat_keparahan)}`}>
                                                {guestConsultation.tingkat_keparahan}
                                            </span>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                                <Target className="text-purple-600" size={16} />
                                                Nilai Confidence Factor
                                            </h4>
                                            <span className={`inline-flex px-3 py-2 rounded-full text-sm font-medium border ${getCFValueColor(guestConsultation.nilai_cf)}`}>
                                                CF: {guestConsultation.nilai_cf.toFixed(3)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detail Diagnosa Card (jika ada) */}
                        {guestConsultation.detail_diagnosa && (
                            <div className="bg-white rounded-lg shadow-sm border">
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <Activity className="text-purple-600" size={24} />
                                        Detail Diagnosa
                                    </h3>
                                    <div className="space-y-4">
                                        <div className="bg-purple-50 rounded-lg p-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                                        Kode Diagnosa
                                                    </label>
                                                    <p className="font-mono text-sm bg-white px-2 py-1 rounded border">
                                                        {guestConsultation.detail_diagnosa.kode_diagnosa}
                                                    </p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                                        Nama Diagnosa
                                                    </label>
                                                    <p className="font-semibold text-gray-900">
                                                        {guestConsultation.detail_diagnosa.nama_diagnosa}
                                                    </p>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                                    Deskripsi
                                                </label>
                                                <p className="text-gray-700 text-sm leading-relaxed">
                                                    {guestConsultation.detail_diagnosa.deskripsi}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Gejala Terpilih Card */}
                        {guestConsultation.gejala_terpilih && guestConsultation.gejala_terpilih.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm border">
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <CheckCircle className="text-green-600" size={24} />
                                        Gejala yang Dipilih ({guestConsultation.gejala_terpilih.length} item)
                                    </h3>
                                    <div className="space-y-3">
                                        {guestConsultation.gejala_terpilih.map((gejala) => (
                                            <div key={`gejala-${gejala.id_gejala}`} className="bg-gray-50 rounded-lg p-4 border-l-4 border-blue-400">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className="text-xs font-mono bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                                {gejala.kode_gejala}
                                                            </span>
                                                            {gejala.kategori_gejala && (
                                                                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                                                    {gejala.kategori_gejala}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <h5 className="font-medium text-gray-900 mb-1">
                                                            {gejala.nama_gejala}
                                                        </h5>
                                                        <p className="text-sm text-gray-600 mb-2">
                                                            <span className="font-medium">Jawaban:</span> {gejala.jawaban}
                                                        </p>
                                                        {gejala.deskripsi && (
                                                            <p className="text-sm text-gray-500 italic">
                                                                {gejala.deskripsi}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div className="ml-4 text-right">
                                                        <span className={`px-3 py-1 text-sm font-medium rounded-full ${getCFValueColor(gejala.nilai_cf)}`}>
                                                            CF: {gejala.nilai_cf.toFixed(3)}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Recommendation Card */}
                        <div className="bg-white rounded-lg shadow-sm border">
                            <div className="p-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <CheckCircle className="text-green-600" size={24} />
                                    Rekomendasi
                                </h3>
                                <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-400">
                                    {recommendations.length > 0 ? (
                                        <div className="space-y-3">
                                            {recommendations.map((rec, index) => (
                                                <div key={index} className="flex items-start gap-2">
                                                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                                                    <p className="text-gray-700 leading-relaxed">
                                                        {rec}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-700 leading-relaxed">
                                            Tidak ada rekomendasi khusus.
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Warning for Severe Cases */}
                        {guestConsultation.tingkat_keparahan.toLowerCase().includes('berat') && (
                            <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="text-red-600 mt-1 flex-shrink-0" size={20} />
                                    <div>
                                        <h4 className="font-semibold text-red-800 mb-1">Perhatian Khusus!</h4>
                                        <p className="text-red-700 text-sm leading-relaxed">
                                            Guest ini memiliki tingkat keparahan <strong>"Depresi Berat"</strong> yang memerlukan
                                            perhatian dan tindak lanjut yang intensif. Disarankan untuk segera menghubungi
                                            guest dan memberikan rujukan ke konselor profesional atau psikolog klinis.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column - Sidebar Information */}
                    <div className="space-y-6">
                        {/* Consultation Details */}
                        <div className="bg-white rounded-lg shadow-sm border">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Calendar className="text-blue-600" size={20} />
                                    Detail Konsultasi
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">
                                            ID Konsultasi
                                        </label>
                                        <p className="text-gray-900 font-mono text-sm bg-gray-50 px-2 py-1 rounded">
                                            #{guestConsultation.id_guestconsultation}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">
                                            Session ID
                                        </label>
                                        <p className="text-gray-900 font-mono text-xs bg-gray-50 px-2 py-1 rounded break-all">
                                            {guestConsultation.session_id}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">
                                            Tanggal Konsultasi
                                        </label>
                                        <p className="text-gray-900 text-sm">
                                            {formatDate(guestConsultation.tanggal_konsultasi)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center gap-1">
                                            <Clock size={14} />
                                            Dibuat
                                        </label>
                                        <p className="text-gray-900 text-sm">
                                            {formatDate(guestConsultation.created_at)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center gap-1">
                                            <Clock size={14} />
                                            Terakhir Diubah
                                        </label>
                                        <p className="text-gray-900 text-sm">
                                            {formatDate(guestConsultation.updated_at)}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-lg shadow-sm border">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Aksi Cepat
                                </h3>
                                <div className="space-y-3">
                                    <Button
                                        onClick={handlePrinter}
                                        className="w-full flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 px-4 py-3 rounded-lg border border-green-200 transition-colors"
                                    >
                                        <Printer size={18} />
                                        Cetak Laporan
                                    </Button>
                                    <Link
                                        href={route('admin.guest-consultation.index')}
                                        className="w-full flex items-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 px-4 py-3 rounded-lg border border-purple-200 transition-colors"
                                    >
                                        <FileText size={18} />
                                        Semua Konsultasi Guest
                                    </Link>
                                    <Link
                                        href={route('admin.guest-consultation.report')}
                                        className="w-full flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-3 rounded-lg border border-blue-200 transition-colors"
                                    >
                                        <Activity size={18} />
                                        Laporan Analytics
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Statistics */}
                        <div className="bg-white rounded-lg shadow-sm border">
                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Ringkasan
                                </h3>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center py-1">
                                        <span className="text-sm text-gray-600">Status:</span>
                                        <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                                            Selesai
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-1">
                                        <span className="text-sm text-gray-600">Tingkat:</span>
                                        <span className={`text-xs font-semibold px-2 py-1 rounded ${getSeverityBadgeColor(guestConsultation.tingkat_keparahan).replace('border-', '')}`}>
                                            {guestConsultation.tingkat_keparahan}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-1">
                                        <span className="text-sm text-gray-600">CF Value:</span>
                                        <span className={`text-xs font-semibold px-2 py-1 rounded ${getCFValueColor(guestConsultation.nilai_cf)}`}>
                                            {guestConsultation.nilai_cf.toFixed(3)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-1">
                                        <span className="text-sm text-gray-600">Gejala Terdeteksi:</span>
                                        <span className="text-sm font-semibold text-gray-900 bg-gray-50 px-2 py-1 rounded">
                                            {guestConsultation.gejala_terpilih?.length || 0} item
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-1">
                                        <span className="text-sm text-gray-600">Guest:</span>
                                        <span className="text-sm font-semibold text-purple-600 truncate max-w-32" title={guestConsultation.guest_info.nama}>
                                            {guestConsultation.guest_info.nama}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-1">
                                        <span className="text-sm text-gray-600">Umur:</span>
                                        <span className="text-sm font-semibold text-gray-900 bg-gray-50 px-2 py-1 rounded">
                                            {guestConsultation.guest_info.umur} tahun
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-1">
                                        <span className="text-sm text-gray-600">Gender:</span>
                                        <span className="text-sm font-semibold text-gray-900 bg-gray-50 px-2 py-1 rounded">
                                            {guestConsultation.guest_info.jenis_kelamin}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information (if needed for follow-up) */}
                        {guestConsultation.tingkat_keparahan.toLowerCase().includes('berat') && (
                            <div className="bg-red-50 rounded-lg shadow-sm border border-red-200">
                                <div className="p-6">
                                    <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
                                        <Phone className="text-red-600" size={20} />
                                        Follow-up Diperlukan
                                    </h3>
                                    <div className="space-y-2">
                                        <p className="text-sm text-red-700">
                                            Kasus tingkat berat memerlukan tindak lanjut segera.
                                        </p>
                                        <div className="bg-white rounded p-3 border border-red-200">
                                            <p className="text-xs text-gray-600">Email untuk kontak:</p>
                                            <p className="text-sm font-semibold text-red-800 break-all">
                                                {guestConsultation.guest_info.email}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-red-100 rounded-full">
                                <AlertTriangle className="text-red-600" size={20} />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                Konfirmasi Hapus
                            </h3>
                        </div>
                        <p className="text-gray-600 mb-6 leading-relaxed">
                            Apakah Anda yakin ingin menghapus konsultasi guest ini?
                            <br />
                            <strong className="text-red-600">Tindakan ini tidak dapat dibatalkan.</strong>
                        </p>
                        <div className="flex items-center gap-3">
                            <Button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                                disabled={isDeleting}
                            >
                                Batal
                            </Button>
                            <Button
                                onClick={handleDelete}
                                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                                disabled={isDeleting}
                            >
                                {isDeleting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        Menghapus...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={16} />
                                        Hapus
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
