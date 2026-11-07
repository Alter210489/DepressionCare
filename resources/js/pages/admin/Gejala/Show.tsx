import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@headlessui/react';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Edit, Calendar, Hash, Tag, FileText, MessageSquare, TrendingUp, Target } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
    {
        title: 'Manajemen Gejala',
        href: '/admin/gejala',
    },
    {
        title: 'Detail Gejala',
        href: '#',
    },
];

interface OpsiJawaban {
    text: string;
    bobot: number;
}

interface Gejala {
    id_gejala: number;
    kode_gejala: string;
    nama_gejala: string;
    deskripsi_gejala?: string;
    kategori_gejala?: string;
    opsi_jawaban: OpsiJawaban[];
    nilai_cf: number;
    formatted_nilai_cf?: string;
    persentase_cf?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface ShowProps {
    gejala: Gejala;
    kategoriOptions: Record<string, string>;
    nilaiCfOptions?: Record<string, string>;
}

export default function ShowGejala({ gejala, kategoriOptions, nilaiCfOptions }: ShowProps) {
    const getKategoriBadgeColor = (kategori?: string) => {
        const colors: Record<string, string> = {
            'fisik': 'bg-blue-100 text-blue-800 border-blue-200',
            'emosional': 'bg-red-100 text-red-800 border-red-200',
            'kognitif': 'bg-purple-100 text-purple-800 border-purple-200',
            'perilaku': 'bg-green-100 text-green-800 border-green-200',
            'sosial': 'bg-yellow-100 text-yellow-800 border-yellow-200',
        };
        return colors[kategori || ''] || 'bg-gray-100 text-gray-800 border-gray-200';
    };

    const getBobotColor = (bobot: number) => {
        if (bobot === 0) return 'bg-gray-100 text-gray-800';
        if (bobot <= 0.3) return 'bg-green-100 text-green-800';
        if (bobot <= 0.7) return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };

    // Get CF Label
    const getCfLabel = (nilai_cf: number) => {
        if (nilai_cf >= 0.9) return 'Sangat Tinggi';
        if (nilai_cf >= 0.7) return 'Tinggi';
        if (nilai_cf >= 0.5) return 'Sedang';
        if (nilai_cf >= 0.3) return 'Rendah';
        return 'Sangat Rendah';
    };

    // Get CF Color
    const getCfColor = (nilai_cf: number) => {
        if (nilai_cf >= 0.9) return 'text-red-600 bg-red-100 border-red-200';
        if (nilai_cf >= 0.7) return 'text-orange-600 bg-orange-100 border-orange-200';
        if (nilai_cf >= 0.5) return 'text-yellow-600 bg-yellow-100 border-yellow-200';
        if (nilai_cf >= 0.3) return 'text-blue-600 bg-blue-100 border-blue-200';
        return 'text-gray-600 bg-gray-100 border-gray-200';
    };

    // Get CF Badge Color
    const getCfBadgeColor = (nilai_cf: number) => {
        if (nilai_cf >= 0.9) return 'bg-red-100 text-red-800';
        if (nilai_cf >= 0.7) return 'bg-orange-100 text-orange-800';
        if (nilai_cf >= 0.5) return 'bg-yellow-100 text-yellow-800';
        if (nilai_cf >= 0.3) return 'bg-blue-100 text-blue-800';
        return 'bg-gray-100 text-gray-800';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Gejala ${gejala.kode_gejala} - Admin`} />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Detail Gejala</h1>
                        <p className="text-gray-600 mt-1">Informasi lengkap gejala dengan nilai CF dan opsi jawaban</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={route('admin.gejala.edit', gejala.id_gejala)}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                        >
                            <Edit size={18} />
                            Edit Gejala
                        </Link>
                        <Link
                            href={route('admin.gejala.index')}
                            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                        >
                            <ArrowLeft size={18} />
                            Kembali
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Information */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Basic Info Card */}
                        <div className="bg-white rounded-lg shadow-sm border">
                            <div className="px-6 py-4 border-b">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <FileText size={20} />
                                    Informasi Dasar
                                </h2>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Kode Gejala
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <Hash size={16} className="text-gray-400" />
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                            {gejala.kode_gejala}
                                        </span>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Nama Gejala
                                    </label>
                                    <p className="text-lg font-medium text-gray-900">{gejala.nama_gejala}</p>
                                </div>

                                {gejala.deskripsi_gejala && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">
                                            Deskripsi
                                        </label>
                                        <p className="text-gray-700 leading-relaxed">{gejala.deskripsi_gejala}</p>
                                    </div>
                                )}

                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Kategori
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <Tag size={16} className="text-gray-400" />
                                        {gejala.kategori_gejala ? (
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getKategoriBadgeColor(gejala.kategori_gejala)}`}>
                                                {kategoriOptions[gejala.kategori_gejala] || gejala.kategori_gejala}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 text-sm">Tidak ada kategori</span>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Status
                                    </label>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                        gejala.is_active
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {gejala.is_active ? 'Aktif' : 'Tidak Aktif'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* CF Information Card */}
                        <div className="bg-white rounded-lg shadow-sm border">
                            <div className="px-6 py-4 border-b">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Target size={20} />
                                    Certainty Factor (CF)
                                </h2>
                            </div>
                            <div className="p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-2">
                                            Nilai CF
                                        </label>
                                        <div className="flex items-center gap-3">
                                            <span className={`inline-flex items-center px-3 py-2 rounded-lg text-lg font-bold border ${getCfColor(gejala.nilai_cf)}`}>
                                                {gejala.nilai_cf.toFixed(3)}
                                            </span>
                                            <div>
                                                <div className={`text-sm font-medium ${getCfColor(gejala.nilai_cf).split(' ')[0]}`}>
                                                    {getCfLabel(gejala.nilai_cf)}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {(gejala.nilai_cf * 100).toFixed(1)}% kepastian
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-2">
                                            Visualisasi CF
                                        </label>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span>0.000</span>
                                                <span>1.000</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                <div
                                                    className={`h-3 rounded-full transition-all duration-300 ${
                                                        gejala.nilai_cf >= 0.9 ? 'bg-red-500' :
                                                        gejala.nilai_cf >= 0.7 ? 'bg-orange-500' :
                                                        gejala.nilai_cf >= 0.5 ? 'bg-yellow-500' :
                                                        gejala.nilai_cf >= 0.3 ? 'bg-blue-500' : 'bg-gray-400'
                                                    }`}
                                                    style={{ width: `${gejala.nilai_cf * 100}%` }}
                                                ></div>
                                            </div>
                                            <div className="text-xs text-gray-600 text-center">
                                                Tingkat kepastian: {getCfLabel(gejala.nilai_cf)}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                    <h4 className="text-sm font-medium text-blue-900 mb-2">Formula Perhitungan</h4>
                                    <p className="text-sm text-blue-800">
                                        <strong>CF Hasil = CF Gejala × Bobot Jawaban User</strong>
                                    </p>
                                    <p className="text-xs text-blue-700 mt-1">
                                        Nilai CF ini akan dikalikan dengan bobot jawaban user untuk mendapatkan nilai kepercayaan akhir.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Opsi Jawaban Card */}
                        <div className="bg-white rounded-lg shadow-sm border">
                            <div className="px-6 py-4 border-b">
                                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <MessageSquare size={20} />
                                    Opsi Jawaban ({gejala.opsi_jawaban?.length || 0})
                                </h2>
                            </div>
                            <div className="p-6">
                                {gejala.opsi_jawaban && gejala.opsi_jawaban.length > 0 ? (
                                    <div className="space-y-3">
                                        {gejala.opsi_jawaban.map((opsi, index) => (
                                            <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border">
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 text-sm font-bold rounded-full">
                                                        {index + 1}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{opsi.text}</p>
                                                        <p className="text-sm text-gray-500">Opsi jawaban {index + 1}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${getBobotColor(opsi.bobot)}`}>
                                                            Bobot: {opsi.bobot}
                                                        </span>
                                                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                                            CF: {(gejala.nilai_cf * opsi.bobot).toFixed(3)}
                                                        </span>
                                                    </div>
                                                    <p className="text-xs text-gray-500">
                                                        {opsi.bobot === 0 && 'Tidak ada gejala'}
                                                        {opsi.bobot > 0 && opsi.bobot <= 0.3 && 'Gejala ringan'}
                                                        {opsi.bobot > 0.3 && opsi.bobot <= 0.7 && 'Gejala sedang'}
                                                        {opsi.bobot > 0.7 && 'Gejala berat'}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500">
                                        <MessageSquare size={48} className="mx-auto mb-4 text-gray-300" />
                                        <p className="text-lg font-medium">Tidak ada opsi jawaban</p>
                                        <p className="text-sm">Gejala ini belum memiliki opsi jawaban</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Preview Pertanyaan */}
                        <div className="bg-white rounded-lg shadow-sm border">
                            <div className="px-6 py-4 border-b">
                                <h2 className="text-lg font-semibold text-gray-900">Preview Pertanyaan</h2>
                            </div>
                            <div className="p-6">
                                <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-medium text-gray-900">
                                            {gejala.nama_gejala}
                                        </h3>
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${getCfBadgeColor(gejala.nilai_cf)}`}>
                                            CF: {gejala.nilai_cf.toFixed(3)}
                                        </span>
                                    </div>
                                    {gejala.deskripsi_gejala && (
                                        <p className="text-sm text-gray-600 mb-4">{gejala.deskripsi_gejala}</p>
                                    )}
                                    <p className="text-sm font-medium text-gray-700 mb-3">
                                        Seberapa sering Anda mengalami kondisi berikut?
                                    </p>

                                    <div className="space-y-3">
                                        {gejala.opsi_jawaban?.map((opsi, index) => (
                                            <label key={index} className="flex items-center justify-between p-3 bg-white rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors">
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="radio"
                                                        name="preview"
                                                        className="text-blue-600 focus:ring-blue-500"
                                                        disabled
                                                    />
                                                    <span className="flex-1 text-sm font-medium text-gray-900">
                                                        {opsi.text}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-gray-500 space-y-1">
                                                    <div>Bobot: {opsi.bobot}</div>
                                                    <div>CF Hasil: {(gejala.nilai_cf * opsi.bobot).toFixed(3)}</div>
                                                </div>
                                            </label>
                                        )) || (
                                            <p className="text-gray-500 text-center py-4">
                                                Tidak ada opsi jawaban untuk ditampilkan
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Metadata Card */}
                        <div className="bg-white rounded-lg shadow-sm border">
                            <div className="px-6 py-4 border-b">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Calendar size={20} />
                                    Metadata
                                </h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        ID Gejala
                                    </label>
                                    <p className="text-sm text-gray-900">#{gejala.id_gejala}</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Dibuat pada
                                    </label>
                                    <p className="text-sm text-gray-900">
                                        {new Date(gejala.created_at).toLocaleDateString('id-ID', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Terakhir diperbarui
                                    </label>
                                    <p className="text-sm text-gray-900">
                                        {new Date(gejala.updated_at).toLocaleDateString('id-ID', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Statistics Card */}
                        <div className="bg-white rounded-lg shadow-sm border">
                            <div className="px-6 py-4 border-b">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <TrendingUp size={20} />
                                    Statistik
                                </h3>
                            </div>
                            <div className="p-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Nilai CF</span>
                                    <span className={`text-sm font-medium ${getCfColor(gejala.nilai_cf).split(' ')[0]}`}>
                                        {gejala.nilai_cf.toFixed(3)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Level CF</span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {getCfLabel(gejala.nilai_cf)}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Jumlah Opsi</span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {gejala.opsi_jawaban?.length || 0}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Bobot Terendah</span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {gejala.opsi_jawaban?.length ? Math.min(...gejala.opsi_jawaban.map(o => o.bobot)) : '-'}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Bobot Tertinggi</span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {gejala.opsi_jawaban?.length ? Math.max(...gejala.opsi_jawaban.map(o => o.bobot)) : '-'}
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Rata-rata Bobot</span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {gejala.opsi_jawaban?.length
                                            ? (gejala.opsi_jawaban.reduce((sum, o) => sum + o.bobot, 0) / gejala.opsi_jawaban.length).toFixed(2)
                                            : '-'
                                        }
                                    </span>
                                </div>

                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">CF Hasil Tertinggi</span>
                                    <span className="text-sm font-medium text-purple-600">
                                        {gejala.opsi_jawaban?.length
                                            ? (gejala.nilai_cf * Math.max(...gejala.opsi_jawaban.map(o => o.bobot))).toFixed(3)
                                            : '-'
                                        }
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* CF Range Indicator */}
                        <div className="bg-white rounded-lg shadow-sm border">
                            <div className="px-6 py-4 border-b">
                                <h3 className="text-lg font-semibold text-gray-900">Indikator CF</h3>
                            </div>
                            <div className="p-6 space-y-3">
                                {[
                                    { range: '0.9 - 1.0', label: 'Sangat Tinggi', color: 'bg-red-100 text-red-800', active: gejala.nilai_cf >= 0.9 },
                                    { range: '0.7 - 0.89', label: 'Tinggi', color: 'bg-orange-100 text-orange-800', active: gejala.nilai_cf >= 0.7 && gejala.nilai_cf < 0.9 },
                                    { range: '0.5 - 0.69', label: 'Sedang', color: 'bg-yellow-100 text-yellow-800', active: gejala.nilai_cf >= 0.5 && gejala.nilai_cf < 0.7 },
                                    { range: '0.3 - 0.49', label: 'Rendah', color: 'bg-blue-100 text-blue-800', active: gejala.nilai_cf >= 0.3 && gejala.nilai_cf < 0.5 },
                                    { range: '0.0 - 0.29', label: 'Sangat Rendah', color: 'bg-gray-100 text-gray-800', active: gejala.nilai_cf < 0.3 }
                                ].map((item) => (
                                    <div key={item.range} className={`flex items-center justify-between p-2 rounded ${item.active ? item.color + ' border-2 border-current' : 'opacity-50'}`}>
                                        <span className="text-xs font-medium">{item.label}</span>
                                        <span className="text-xs">{item.range}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white rounded-lg shadow-sm border">
                            <div className="px-6 py-4 border-b">
                                <h3 className="text-lg font-semibold text-gray-900">Aksi Cepat</h3>
                            </div>
                            <div className="p-6 space-y-3">
                                <Link
                                    href={route('admin.gejala.edit', gejala.id_gejala)}
                                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                                >
                                    <Edit size={16} />
                                    Edit Gejala
                                </Link>

                                <Link
                                    href={route('admin.gejala.index')}
                                    className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
                                >
                                    <ArrowLeft size={16} />
                                    Kembali ke Daftar
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
