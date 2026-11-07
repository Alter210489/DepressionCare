import { Alert, AlertDescription } from '@/components/ui/alert';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@headlessui/react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import {
    ArrowLeft,
    Trash2,
    User,
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
    Target
} from 'lucide-react';
import { useState } from 'react';

interface Mahasiswa {
    id_mahasiswa: number;
    nama: string;
    nim: string;
    fakultas: string;
    program_studi: string;
    email: string;
}

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

interface RiwayatKonsultasi {
    id_konsultasi: number;
    id_mahasiswa: number;
    tanggal_konsultasi: string;
    hasil_diagnosa: string;
    tingkat_keparahan: 'Minimal / Normal' | 'Depresi Ringan' | 'Depresi Sedang' | 'Depresi Berat';
    nilai_cf: number;
    rekomendasi: string;
    created_at: string;
    updated_at: string;
    mahasiswa: Mahasiswa;
    gejala_terpilih: GejalaTerpilih[];
    detail_diagnosa?: DetailDiagnosa;
}

interface ShowProps {
    riwayatKonsultasi: RiwayatKonsultasi;
}

export default function RiwayatKonsultasiShow({ riwayatKonsultasi }: ShowProps) {
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
            title: 'Riwayat Konsultasi',
            href: '/admin/riwayat-konsultasi',
        },
        {
            title: 'Detail Riwayat Konsultasi',
            href: `/admin/riwayat-konsultasi/${riwayatKonsultasi.id_konsultasi}`,
        },
    ];

    // Get Severity Badge Color
    const getSeverityBadgeColor = (tingkat: string) => {
        switch (tingkat) {
            case 'Minimal / Normal':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'Depresi Ringan':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Depresi Sedang':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'Depresi Berat':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    // Get Severity Icon
    const getSeverityIcon = (tingkat: string) => {
        switch (tingkat) {
            case 'Minimal / Normal':
                return <CheckCircle className="text-green-600" size={20} />;
            case 'Depresi Ringan':
                return <AlertTriangle className="text-yellow-600" size={20} />;
            case 'Depresi Sedang':
                return <AlertTriangle className="text-orange-600" size={20} />;
            case 'Depresi Berat':
                return <AlertTriangle className="text-red-600" size={20} />;
            default:
                return <AlertTriangle className="text-gray-600" size={20} />;
        }
    };

    // Handle Delete
    const handleDelete = () => {
        setIsDeleting(true);
        router.delete(route('admin.riwayat-konsultasi.destroy', riwayatKonsultasi.id_konsultasi), {
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
        window.Printer();
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Riwayat Konsultasi - ${riwayatKonsultasi.mahasiswa.nama}`} />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Detail Riwayat Konsultasi</h1>
                        <p className="text-gray-600 mt-1">
                            Riwayat konsultasi untuk {riwayatKonsultasi.mahasiswa.nama}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={route('admin.riwayat-konsultasi.index')}
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
                        {/* Mahasiswa Information Card */}
                        <div className="bg-white rounded-lg shadow-sm border">
                            <div className="p-6">
                                <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <User className="text-blue-600" size={24} />
                                    Informasi Mahasiswa
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                Nama Lengkap
                                            </label>
                                            <p className="text-lg font-semibold text-gray-900">
                                                {riwayatKonsultasi.mahasiswa.nama}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1">
                                                NIM
                                            </label>
                                            <p className="text-gray-900 font-mono text-sm bg-gray-50 px-2 py-1 rounded">
                                                {riwayatKonsultasi.mahasiswa.nim}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center gap-1">
                                                <Mail size={14} />
                                                Email
                                            </label>
                                            <p className="text-gray-900 text-sm">
                                                {riwayatKonsultasi.mahasiswa.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center gap-1">
                                                <Building size={14} />
                                                Fakultas
                                            </label>
                                            <p className="text-gray-900">
                                                {riwayatKonsultasi.mahasiswa.fakultas}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center gap-1">
                                                <GraduationCap size={14} />
                                                Program Studi
                                            </label>
                                            <p className="text-gray-900">
                                                {riwayatKonsultasi.mahasiswa.program_studi}
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
                                            {riwayatKonsultasi.hasil_diagnosa}
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                                {getSeverityIcon(riwayatKonsultasi.tingkat_keparahan)}
                                                Tingkat Keparahan
                                            </h4>
                                            <span className={`inline-flex px-4 py-2 text-sm font-semibold rounded-full border ${getSeverityBadgeColor(riwayatKonsultasi.tingkat_keparahan)}`}>
                                                {riwayatKonsultasi.tingkat_keparahan}
                                            </span>
                                        </div>

                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                                <Target className="text-purple-600" size={16} />
                                                Nilai Confidence Factor
                                            </h4>
                                            <span className={`inline-flex px-3 py-2 rounded-full text-sm font-medium border ${getCFValueColor(riwayatKonsultasi.nilai_cf)}`}>
                                                CF: {riwayatKonsultasi.nilai_cf.toFixed(3)}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detail Diagnosa Card (jika ada) */}
                        {riwayatKonsultasi.detail_diagnosa && (
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
                                                        {riwayatKonsultasi.detail_diagnosa.kode_diagnosa}
                                                    </p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                                        Nama Diagnosa
                                                    </label>
                                                    <p className="font-semibold text-gray-900">
                                                        {riwayatKonsultasi.detail_diagnosa.nama_diagnosa}
                                                    </p>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-500 mb-1">
                                                    Deskripsi
                                                </label>
                                                <p className="text-gray-700 text-sm leading-relaxed">
                                                    {riwayatKonsultasi.detail_diagnosa.deskripsi}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Gejala Terpilih Card */}
                        {riwayatKonsultasi.gejala_terpilih && riwayatKonsultasi.gejala_terpilih.length > 0 && (
                            <div className="bg-white rounded-lg shadow-sm border">
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                        <CheckCircle className="text-green-600" size={24} />
                                        Gejala yang Dipilih ({riwayatKonsultasi.gejala_terpilih.length} item)
                                    </h3>
                                    <div className="space-y-3">
                                        {riwayatKonsultasi.gejala_terpilih.map((gejala) => (
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
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                                        {riwayatKonsultasi.rekomendasi}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Warning for Severe Cases */}
                        {riwayatKonsultasi.tingkat_keparahan === 'Depresi Berat' && (
                            <div className="bg-red-50 border-l-4 border-red-400 rounded-lg p-4">
                                <div className="flex items-start gap-3">
                                    <AlertTriangle className="text-red-600 mt-1 flex-shrink-0" size={20} />
                                    <div>
                                        <h4 className="font-semibold text-red-800 mb-1">Perhatian Khusus!</h4>
                                        <p className="text-red-700 text-sm leading-relaxed">
                                            Mahasiswa ini memiliki tingkat keparahan <strong>"Depresi Berat"</strong> yang memerlukan
                                            perhatian dan tindak lanjut yang intensif. Pastikan untuk melakukan
                                            monitoring berkala dan koordinasi dengan pihak terkait seperti konselor profesional
                                            atau psikolog klinis.
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
                                            #{riwayatKonsultasi.id_konsultasi}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">
                                            Tanggal Konsultasi
                                        </label>
                                        <p className="text-gray-900 text-sm">
                                            {formatDate(riwayatKonsultasi.tanggal_konsultasi)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center gap-1">
                                            <Clock size={14} />
                                            Dibuat
                                        </label>
                                        <p className="text-gray-900 text-sm">
                                            {formatDate(riwayatKonsultasi.created_at)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1 flex items-center gap-1">
                                            <Clock size={14} />
                                            Terakhir Diubah
                                        </label>
                                        <p className="text-gray-900 text-sm">
                                            {formatDate(riwayatKonsultasi.updated_at)}
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
                                        href={route('admin.mahasiswa.show', riwayatKonsultasi.id_mahasiswa)}
                                        className="w-full flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-3 rounded-lg border border-blue-200 transition-colors"
                                    >
                                        <User size={18} />
                                        Lihat Profil Mahasiswa
                                    </Link>
                                    <Link
                                        href={route('admin.riwayat-konsultasi.index')}
                                        className="w-full flex items-center gap-2 bg-purple-50 hover:bg-purple-100 text-purple-700 px-4 py-3 rounded-lg border border-purple-200 transition-colors"
                                    >
                                        <FileText size={18} />
                                        Semua Riwayat
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
                                        <span className={`text-xs font-semibold px-2 py-1 rounded ${
                                            riwayatKonsultasi.tingkat_keparahan === 'Minimal / Normal' ? 'text-green-700 bg-green-100' :
                                            riwayatKonsultasi.tingkat_keparahan === 'Depresi Ringan' ? 'text-yellow-700 bg-yellow-100' :
                                            riwayatKonsultasi.tingkat_keparahan === 'Depresi Sedang' ? 'text-orange-700 bg-orange-100' :
                                            'text-red-700 bg-red-100'
                                        }`}>
                                            {riwayatKonsultasi.tingkat_keparahan}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-1">
                                        <span className="text-sm text-gray-600">CF Value:</span>
                                        <span className={`text-xs font-semibold px-2 py-1 rounded ${getCFValueColor(riwayatKonsultasi.nilai_cf)}`}>
                                            {riwayatKonsultasi.nilai_cf.toFixed(3)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-1">
                                        <span className="text-sm text-gray-600">Gejala Terdeteksi:</span>
                                        <span className="text-sm font-semibold text-gray-900 bg-gray-50 px-2 py-1 rounded">
                                            {riwayatKonsultasi.gejala_terpilih?.length || 0} item
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center py-1">
                                        <span className="text-sm text-gray-600">Mahasiswa:</span>
                                        <span className="text-sm font-semibold text-blue-600 truncate max-w-32" title={riwayatKonsultasi.mahasiswa.nama}>
                                            {riwayatKonsultasi.mahasiswa.nama}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
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
                            Apakah Anda yakin ingin menghapus riwayat konsultasi ini?
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
