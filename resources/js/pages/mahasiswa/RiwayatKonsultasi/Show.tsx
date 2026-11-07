import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    ChevronLeftIcon,
    PrinterIcon,
    TrashIcon,
    ShareIcon,
    CalendarIcon,
    ClockIcon,
    BeakerIcon,
    DocumentTextIcon,
    InformationCircleIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    UserIcon,
    IdentificationIcon,
    AcademicCapIcon,
    HeartIcon,
    LightBulbIcon,
    ChatBubbleBottomCenterTextIcon,
    ArrowPathIcon,
    EyeIcon,
    ChartBarIcon,
    ClipboardDocumentListIcon,
    ArrowLeftIcon,
    HomeIcon,
} from '@heroicons/react/24/outline';

interface GejalaData {
    id_gejala: number;
    kode_gejala: string;
    nama_gejala: string;
    kategori_gejala: string;
    jawaban: string;
    nilai_cf: number;
    deskripsi?: string;
}

interface DiagnosaData {
    id_diagnosa: number;
    kode_diagnosa: string;
    nama_diagnosa: string;
    deskripsi: string;
    nilai_cf: number;
    rekomendasi: string;
}

interface RiwayatKonsultasi {
    id_konsultasi: number;
    mahasiswa_id: number;
    tanggal_konsultasi: string;
    hasil_diagnosa: string;
    tingkat_keparahan: string;
    nilai_cf: number;
    rekomendasi: string;
    created_at: string;
    updated_at: string;
    mahasiswa?: {
        id: number;
        nama: string;
        nim: string;
        email: string;
        jurusan?: string;
        angkatan?: string;
    };
    gejala_terpilih?: GejalaData[];
    detail_diagnosa?: DiagnosaData;
    saran_lanjutan?: string[];
    referensi?: string[];
}

interface Props {
    riwayat: RiwayatKonsultasi;
    relatedKonsultasi?: RiwayatKonsultasi[];
}

const Show: React.FC<Props> = ({ riwayat, relatedKonsultasi = [] }) => {
    const [showFullRecommendation, setShowFullRecommendation] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'gejala' | 'diagnosa' | 'rekomendasi'>('overview');

    // Handle delete
    const handleDelete = () => {
        if (confirm('Apakah Anda yakin ingin menghapus riwayat konsultasi ini?')) {
            router.delete(route('mahasiswa.riwayat-konsultasi.destroy', riwayat.id_konsultasi), {
                onSuccess: () => {
                    router.visit(route('mahasiswa.riwayat-konsultasi.index'));
                }
            });
        }
    };

    // Handle print
    const handlePrint = () => {
        window.open(route('mahasiswa.konsultasi.result.print', riwayat.id_konsultasi), '_blank');
    };

    // Format functions
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    const formatCF = (cf: number) => {
        return `${(cf * 100).toFixed(2)}%`;
    };

    const getSeverityColor = (severity: string) => {
        switch (severity.toLowerCase()) {
            case 'minimal':
            case 'normal':
            case 'minimal / normal':
                return 'bg-green-100 text-green-800 border-green-200';
            case 'depresi ringan':
            case 'ringan':
                return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'depresi sedang':
            case 'sedang':
                return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'depresi berat':
            case 'berat':
                return 'bg-red-100 text-red-800 border-red-200';
            default:
                return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity.toLowerCase()) {
            case 'minimal':
            case 'normal':
            case 'minimal / normal':
                return <CheckCircleIcon className="h-6 w-6 text-green-600" />;
            case 'depresi ringan':
            case 'ringan':
                return <InformationCircleIcon className="h-6 w-6 text-yellow-600" />;
            case 'depresi sedang':
            case 'sedang':
                return <ExclamationTriangleIcon className="h-6 w-6 text-orange-600" />;
            case 'depresi berat':
            case 'berat':
                return <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />;
            default:
                return <InformationCircleIcon className="h-6 w-6 text-gray-600" />;
        }
    };

    const getKategoriColor = (kategori: string) => {
        const colors: Record<string, string> = {
            'fisik': 'bg-blue-100 text-blue-800',
            'psikologis': 'bg-purple-100 text-purple-800',
            'sosial': 'bg-green-100 text-green-800',
            'akademik': 'bg-yellow-100 text-yellow-800',
            'emosional': 'bg-red-100 text-red-800',
            'kognitif': 'bg-indigo-100 text-indigo-800',
        };
        return colors[kategori.toLowerCase()] || 'bg-gray-100 text-gray-800';
    };

    const getJawabanColor = (jawaban: string) => {
        switch (jawaban.toLowerCase()) {
            case 'ya':
            case 'sering':
            case 'sangat sering':
                return 'bg-red-100 text-red-800';
            case 'kadang-kadang':
            case 'jarang':
                return 'bg-yellow-100 text-yellow-800';
            case 'tidak':
            case 'tidak pernah':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getCFProgressColor = (cf: number) => {
        if (cf >= 0.8) return 'bg-gradient-to-r from-red-500 to-red-600';
        if (cf >= 0.6) return 'bg-gradient-to-r from-orange-500 to-orange-600';
        if (cf >= 0.4) return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
        return 'bg-gradient-to-r from-green-500 to-green-600';
    };

    // =========================================================================
    // REKOMENDASI RENDER — sama persis dengan Result.tsx (paste 2)
    // =========================================================================

    /**
     * Render teks inline: urai **bold** menjadi <strong>, sisanya plain span.
     */
    const renderInline = (text: string, key: string | number): React.ReactNode => {
        const parts = text.split(/\*\*(.*?)\*\*/g);
        return (
            <span key={key}>
                {parts.map((part, i) =>
                    i % 2 === 1
                        ? <strong key={i} className="font-semibold text-gray-900">{part}</strong>
                        : <span key={i}>{part}</span>
                )}
            </span>
        );
    };

    /**
     * Parse array string rekomendasi menjadi komponen React terstruktur.
     * Format: ## H2, ### H3, bullet (•/-), paragraf biasa.
     */
    const parseAndRenderRecommendations = (recs: string[]): React.ReactNode => {
        type SectionType = 'critical' | 'warning' | 'action' | 'resource' | 'academic' | 'followup' | 'info';

        interface Block {
            kind: 'h3' | 'paragraph' | 'bullet-list';
            h3Text?: string;
            text?: string;
            items?: string[];
        }

        interface Section {
            h2: string;
            type: SectionType;
            blocks: Block[];
        }

        const classify = (title: string): SectionType => {
            const t = title.toLowerCase();
            if (/bunuh diri|kritis|darurat medis/.test(t))                       return 'critical';
            if (/peringatan|mendesak|tindakan mendesak|segera diperlukan/.test(t)) return 'warning';
            if (/tindakan|langkah|aksi|langkah keselamatan/.test(t))             return 'action';
            if (/sumber bantuan|layanan|resource/.test(t))                       return 'resource';
            if (/akademik|performa|manajemen|penghentian/.test(t))               return 'academic';
            if (/pemantauan|tindak lanjut|jadwal/.test(t))                       return 'followup';
            return 'info';
        };

        const sections: Section[] = [];
        let current: Section | null = null;
        let bullets: string[] = [];

        const flushBullets = () => {
            if (bullets.length > 0 && current) {
                current.blocks.push({ kind: 'bullet-list', items: [...bullets] });
                bullets = [];
            }
        };

        for (const raw of recs) {
            if (raw.startsWith('## ')) {
                flushBullets();
                if (current) sections.push(current);
                const h2 = raw.replace(/^##\s*/, '').trim();
                current = { h2, type: classify(h2), blocks: [] };
                continue;
            }
            if (!current) continue;

            if (raw.startsWith('### ')) {
                flushBullets();
                const h3 = raw.replace(/^###\s*/, '').trim();
                current.blocks.push({ kind: 'h3', h3Text: h3 });
                continue;
            }

            if (raw.trim() === '---' || raw.trim() === '') continue;

            if (raw.startsWith('• ') || raw.startsWith('- ')) {
                bullets.push(raw.replace(/^[•\-]\s+/, '').trim());
                continue;
            }

            flushBullets();
            current.blocks.push({ kind: 'paragraph', text: raw.trim() });
        }

        flushBullets();
        if (current) sections.push(current);
        if (sections.length === 0) return null;

        const pal: Record<SectionType, {
            wrap: string; bar: string; title: string;
            dot: string; h3: string; para: string;
        }> = {
            critical: {
                wrap:  'border border-red-300 rounded-2xl overflow-hidden shadow-md shadow-red-100/60',
                bar:   'bg-gradient-to-r from-red-600 to-rose-600',
                title: 'text-white',
                dot:   'bg-red-400',
                h3:    'text-red-700',
                para:  'text-gray-700',
            },
            warning: {
                wrap:  'border border-amber-300 rounded-2xl overflow-hidden shadow-md shadow-amber-100/60',
                bar:   'bg-gradient-to-r from-amber-500 to-orange-500',
                title: 'text-white',
                dot:   'bg-amber-400',
                h3:    'text-amber-700',
                para:  'text-gray-700',
            },
            action: {
                wrap:  'border border-blue-200 rounded-2xl overflow-hidden shadow-md shadow-blue-100/40',
                bar:   'bg-gradient-to-r from-blue-600 to-indigo-600',
                title: 'text-white',
                dot:   'bg-blue-400',
                h3:    'text-blue-700',
                para:  'text-gray-700',
            },
            resource: {
                wrap:  'border border-emerald-200 rounded-2xl overflow-hidden shadow-md shadow-emerald-100/40',
                bar:   'bg-gradient-to-r from-emerald-600 to-teal-600',
                title: 'text-white',
                dot:   'bg-emerald-400',
                h3:    'text-emerald-700',
                para:  'text-gray-700',
            },
            academic: {
                wrap:  'border border-purple-200 rounded-2xl overflow-hidden shadow-md shadow-purple-100/40',
                bar:   'bg-gradient-to-r from-purple-600 to-indigo-700',
                title: 'text-white',
                dot:   'bg-purple-400',
                h3:    'text-purple-700',
                para:  'text-gray-700',
            },
            followup: {
                wrap:  'border border-slate-200 rounded-2xl overflow-hidden shadow-md shadow-slate-100/40',
                bar:   'bg-gradient-to-r from-slate-600 to-gray-700',
                title: 'text-white',
                dot:   'bg-slate-400',
                h3:    'text-slate-700',
                para:  'text-gray-700',
            },
            info: {
                wrap:  'border border-sky-200 rounded-2xl overflow-hidden shadow-md shadow-sky-100/40',
                bar:   'bg-gradient-to-r from-sky-500 to-blue-600',
                title: 'text-white',
                dot:   'bg-sky-400',
                h3:    'text-sky-700',
                para:  'text-gray-700',
            },
        };

        const icon: Record<SectionType, string> = {
            critical: '🚨', warning: '⚠️', action: '✅',
            resource: '🆘', academic: '🎓', followup: '📋', info: 'ℹ️',
        };

        return (
            <div className="space-y-5">
                {sections.map((sec, si) => {
                    const c = pal[sec.type];
                    return (
                        <div key={si} className={c.wrap}>
                            {/* Judul kartu (gradient bar) */}
                            <div className={`${c.bar} px-5 py-4 flex items-start gap-3`}>
                                <span className="text-xl leading-none mt-0.5 flex-shrink-0">{icon[sec.type]}</span>
                                <h3 className={`font-bold text-sm leading-snug ${c.title}`}>
                                    {renderInline(sec.h2, `h2-${si}`)}
                                </h3>
                            </div>
                            {/* Isi kartu */}
                            <div className="bg-white/80 px-5 py-4 space-y-3">
                                {sec.blocks.map((blk, bi) => {
                                    if (blk.kind === 'h3') return (
                                        <p key={bi}
                                           className={`text-xs font-bold uppercase tracking-wider pt-2 pb-0.5 border-b border-current/20 ${c.h3}`}>
                                            {renderInline(blk.h3Text || '', `h3-${bi}`)}
                                        </p>
                                    );

                                    if (blk.kind === 'bullet-list') return (
                                        <ul key={bi} className="space-y-2">
                                            {(blk.items || []).map((item, ii) => (
                                                <li key={ii} className="flex items-start gap-2.5">
                                                    <span className={`flex-shrink-0 w-1.5 h-1.5 rounded-full mt-2 ${c.dot}`} />
                                                    <span className="text-sm text-gray-700 leading-relaxed">
                                                        {renderInline(item, ii)}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    );

                                    if (blk.kind === 'paragraph' && blk.text) return (
                                        <p key={bi} className={`text-sm leading-relaxed ${c.para}`}>
                                            {renderInline(blk.text, bi)}
                                        </p>
                                    );

                                    return null;
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <>
            <Head title={`Detail Konsultasi #${riwayat.id_konsultasi} - Mahasiswa`} />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
                {/* Enhanced Header */}
                <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 shadow-xl">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>

                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                        {/* Back Button */}
                        <div className="mb-4 sm:mb-6">
                            <Link
                                href={route('mahasiswa.riwayat-konsultasi.index')}
                                className="group inline-flex items-center space-x-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white px-4 py-3 rounded-xl border border-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                            >
                                <ArrowLeftIcon className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
                                <span className="font-semibold">Kembali ke Riwayat</span>
                            </Link>
                        </div>

                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                            <div className="max-w-3xl">
                                <div className="flex items-center space-x-2 mb-3">
                                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-xl">
                                        <ClipboardDocumentListIcon className="h-6 w-6 text-white" />
                                    </div>
                                    <nav className="flex text-sm text-blue-100" aria-label="Breadcrumb">
                                        <Link href={route('mahasiswa.dashboard')} className="hover:text-white transition-colors duration-200">
                                            Dashboard
                                        </Link>
                                        <span className="mx-2">/</span>
                                        <Link href={route('mahasiswa.riwayat-konsultasi.index')} className="hover:text-white transition-colors duration-200">
                                            Riwayat Konsultasi
                                        </Link>
                                        <span className="mx-2">/</span>
                                        <span className="text-white font-medium">Detail #{riwayat.id_konsultasi}</span>
                                    </nav>
                                </div>

                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-3">
                                    Detail Konsultasi
                                </h1>
                                <p className="text-lg sm:text-xl text-blue-100 leading-relaxed mb-4">
                                    Hasil konsultasi dan rekomendasi lengkap untuk kesehatan mental Anda
                                </p>
                                <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm">
                                    <div className="flex items-center space-x-2">
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                        <span className="text-blue-100">ID: #{riwayat.id_konsultasi}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
                                        <span className="text-blue-100">{formatDate(riwayat.tanggal_konsultasi)}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                                        <span className="text-blue-100">{formatCF(riwayat.nilai_cf)} Keyakinan</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                <button
                                    onClick={handlePrint}
                                    className="group bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white border border-white/20 hover:border-white/30 px-4 sm:px-6 py-3 rounded-xl hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl font-semibold"
                                >
                                    <PrinterIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                    <span>Print</span>
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="group bg-red-500/90 hover:bg-red-600 text-white px-4 sm:px-6 py-3 rounded-xl hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl font-semibold"
                                >
                                    <TrashIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                    <span>Hapus</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    {/* Enhanced Summary Card */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6 mb-6 sm:mb-8 hover:shadow-xl transition-all duration-300">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                            {/* Main Result */}
                            <div className="lg:col-span-2">
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0 p-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl">
                                        {getSeverityIcon(riwayat.tingkat_keparahan)}
                                    </div>
                                    <div className="flex-1">
                                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                                            {riwayat.hasil_diagnosa}
                                        </h2>
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(riwayat.tingkat_keparahan)}`}>
                                                {riwayat.tingkat_keparahan}
                                            </span>
                                            <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-50 to-indigo-50 px-3 py-1 rounded-full">
                                                <BeakerIcon className="h-4 w-4 text-blue-600" />
                                                <span className="text-sm sm:text-lg font-semibold text-blue-900">
                                                    {formatCF(riwayat.nilai_cf)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mb-4">
                                            <div className="flex justify-between text-sm text-gray-600 mb-2">
                                                <span className="font-medium">Tingkat Keyakinan</span>
                                                <span className="font-bold">{formatCF(riwayat.nilai_cf)}</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                                <div
                                                    className={`h-3 rounded-full transition-all duration-500 ${getCFProgressColor(riwayat.nilai_cf)}`}
                                                    style={{ width: `${riwayat.nilai_cf * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Enhanced Metadata */}
                            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 sm:p-6 border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Informasi Konsultasi</h3>
                                <div className="space-y-4">
                                    <div className="flex items-start space-x-3">
                                        <div className="p-2 bg-blue-100 rounded-lg">
                                            <IdentificationIcon className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">ID Konsultasi</p>
                                            <p className="text-sm text-gray-600 font-mono">#{riwayat.id_konsultasi}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start space-x-3">
                                        <div className="p-2 bg-green-100 rounded-lg">
                                            <CalendarIcon className="h-4 w-4 text-green-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">Tanggal Konsultasi</p>
                                            <p className="text-sm text-gray-600">{formatDate(riwayat.tanggal_konsultasi)}</p>
                                        </div>
                                    </div>
                                    {riwayat.mahasiswa && (
                                        <div className="flex items-start space-x-3">
                                            <div className="p-2 bg-purple-100 rounded-lg">
                                                <UserIcon className="h-4 w-4 text-purple-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">Mahasiswa</p>
                                                <p className="text-sm text-gray-600">{riwayat.mahasiswa.nama}</p>
                                                <p className="text-xs text-gray-500 font-mono">{riwayat.mahasiswa.nim}</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-start space-x-3">
                                        <div className="p-2 bg-orange-100 rounded-lg">
                                            <ClockIcon className="h-4 w-4 text-orange-600" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">Gejala Dievaluasi</p>
                                            <p className="text-sm text-gray-600">
                                                {riwayat.gejala_terpilih ? `${riwayat.gejala_terpilih.length} gejala` : 'Data tidak tersedia'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Navigation Tabs */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 mb-6 sm:mb-8 hover:shadow-xl transition-all duration-300">
                        <div className="border-b border-gray-200">
                            <nav className="-mb-px flex overflow-x-auto scrollbar-hide">
                                <button
                                    onClick={() => setActiveTab('overview')}
                                    className={`flex-shrink-0 py-4 px-4 sm:px-6 border-b-2 font-medium text-sm transition-all duration-200 ${
                                        activeTab === 'overview'
                                            ? 'border-blue-500 text-blue-600 bg-blue-50'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-center space-x-2">
                                        <ChartBarIcon className="h-5 w-5" />
                                        <span>Ringkasan</span>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('gejala')}
                                    className={`flex-shrink-0 py-4 px-4 sm:px-6 border-b-2 font-medium text-sm transition-all duration-200 ${
                                        activeTab === 'gejala'
                                            ? 'border-blue-500 text-blue-600 bg-blue-50'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-center space-x-2">
                                        <ClipboardDocumentListIcon className="h-5 w-5" />
                                        <span>Gejala</span>
                                        <span className="bg-gray-200 text-gray-800 text-xs px-2 py-1 rounded-full">
                                            {riwayat.gejala_terpilih?.length || 0}
                                        </span>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('diagnosa')}
                                    className={`flex-shrink-0 py-4 px-4 sm:px-6 border-b-2 font-medium text-sm transition-all duration-200 ${
                                        activeTab === 'diagnosa'
                                            ? 'border-blue-500 text-blue-600 bg-blue-50'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-center space-x-2">
                                        <BeakerIcon className="h-5 w-5" />
                                        <span className="hidden sm:inline">Detail Diagnosa</span>
                                        <span className="inline sm:hidden">Diagnosa</span>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setActiveTab('rekomendasi')}
                                    className={`flex-shrink-0 py-4 px-4 sm:px-6 border-b-2 font-medium text-sm transition-all duration-200 ${
                                        activeTab === 'rekomendasi'
                                            ? 'border-blue-500 text-blue-600 bg-blue-50'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    <div className="flex items-center space-x-2">
                                        <LightBulbIcon className="h-5 w-5" />
                                        <span>Rekomendasi</span>
                                    </div>
                                </button>
                            </nav>
                        </div>

                        <div className="p-4 sm:p-6">
                            {/* Overview Tab */}
                            {activeTab === 'overview' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 sm:p-6 hover:scale-105 transition-all duration-300">
                                            <div className="flex items-center">
                                                <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                                                    <ClipboardDocumentListIcon className="h-6 w-6 text-white" />
                                                </div>
                                                <div className="ml-3 sm:ml-4">
                                                    <p className="text-sm font-medium text-blue-900">Total Gejala</p>
                                                    <p className="text-xl sm:text-2xl font-bold text-blue-600">
                                                        {riwayat.gejala_terpilih?.length || 0}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 sm:p-6 hover:scale-105 transition-all duration-300">
                                            <div className="flex items-center">
                                                <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
                                                    <BeakerIcon className="h-6 w-6 text-white" />
                                                </div>
                                                <div className="ml-3 sm:ml-4">
                                                    <p className="text-sm font-medium text-green-900">Tingkat Keyakinan</p>
                                                    <p className="text-xl sm:text-2xl font-bold text-green-600">
                                                        {formatCF(riwayat.nilai_cf)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 sm:p-6 hover:scale-105 transition-all duration-300 sm:col-span-2 lg:col-span-1">
                                            <div className="flex items-center">
                                                <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl">
                                                    <HeartIcon className="h-6 w-6 text-white" />
                                                </div>
                                                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                                                    <p className="text-sm font-medium text-purple-900">Status Kesehatan</p>
                                                    <p className="text-lg sm:text-xl font-bold text-purple-600 truncate">
                                                        {riwayat.tingkat_keparahan}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick Summary */}
                                    <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 sm:p-6 border border-gray-100">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ringkasan Hasil</h3>
                                        <div className="prose max-w-none">
                                            <p className="text-gray-700 leading-relaxed">
                                                Berdasarkan evaluasi terhadap <strong>{riwayat.gejala_terpilih?.length || 0} gejala</strong> yang telah Anda jawab,
                                                sistem mendiagnosa kondisi Anda sebagai <strong>{riwayat.hasil_diagnosa}</strong> dengan
                                                tingkat keparahan <strong>{riwayat.tingkat_keparahan}</strong> dan tingkat keyakinan sebesar <strong>{formatCF(riwayat.nilai_cf)}</strong>.
                                            </p>
                                        </div>
                                    </div>

                                    {/* Category Distribution */}
                                    {riwayat.gejala_terpilih && riwayat.gejala_terpilih.length > 0 && (
                                        <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-xl p-4 sm:p-6">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribusi Gejala per Kategori</h3>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                                                {Object.entries(
                                                    riwayat.gejala_terpilih.reduce((acc, gejala) => {
                                                        acc[gejala.kategori_gejala] = (acc[gejala.kategori_gejala] || 0) + 1;
                                                        return acc;
                                                    }, {} as Record<string, number>)
                                                ).map(([kategori, count]) => (
                                                    <div key={kategori} className="text-center group hover:scale-105 transition-all duration-300">
                                                        <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl mx-auto mb-2 flex items-center justify-center ${getKategoriColor(kategori)} group-hover:shadow-lg transition-all duration-300`}>
                                                            <span className="text-lg sm:text-2xl font-bold">{count}</span>
                                                        </div>
                                                        <p className="text-sm font-medium text-gray-900 capitalize">{kategori}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Gejala Tab */}
                            {activeTab === 'gejala' && (
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Gejala yang Dievaluasi ({riwayat.gejala_terpilih?.length || 0})
                                        </h3>
                                    </div>

                                    {riwayat.gejala_terpilih && riwayat.gejala_terpilih.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-4">
                                            {riwayat.gejala_terpilih.map((gejala, index) => (
                                                <div key={gejala.id_gejala} className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-xl p-4 sm:p-6 hover:shadow-lg hover:scale-[1.01] transition-all duration-300">
                                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0 sm:space-x-4">
                                                        <div className="flex-1">
                                                            <div className="flex flex-wrap items-center gap-2 mb-3">
                                                                <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                                                                    {gejala.kode_gejala}
                                                                </span>
                                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getKategoriColor(gejala.kategori_gejala)}`}>
                                                                    {gejala.kategori_gejala}
                                                                </span>
                                                                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getJawabanColor(gejala.jawaban)}`}>
                                                                    {gejala.jawaban}
                                                                </span>
                                                            </div>
                                                            <h4 className="text-lg font-semibold text-gray-900 mb-2 leading-tight">
                                                                {gejala.nama_gejala}
                                                            </h4>
                                                            {gejala.deskripsi && (
                                                                <p className="text-gray-600 text-sm leading-relaxed">
                                                                    {gejala.deskripsi}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="flex sm:flex-col items-center sm:items-end space-x-4 sm:space-x-0 sm:space-y-3">
                                                            <div className="text-center sm:text-right">
                                                                <p className="text-sm font-medium text-gray-700">CF Value</p>
                                                                <p className="text-xl font-bold text-blue-600">{formatCF(gejala.nilai_cf)}</p>
                                                            </div>
                                                            <div className="w-20 sm:w-16 bg-gray-200 rounded-full h-2">
                                                                <div
                                                                    className={`h-2 rounded-full transition-all duration-500 ${getCFProgressColor(gejala.nilai_cf)}`}
                                                                    style={{ width: `${gejala.nilai_cf * 100}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-12">
                                            <div className="w-20 h-20 bg-gradient-to-r from-gray-200 to-gray-300 rounded-2xl mx-auto mb-6 flex items-center justify-center">
                                                <ClipboardDocumentListIcon className="h-10 w-10 text-gray-400" />
                                            </div>
                                            <h3 className="text-lg font-medium text-gray-900 mb-2">Data gejala tidak tersedia</h3>
                                            <p className="text-gray-500">Informasi gejala tidak dapat ditampilkan saat ini</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Diagnosa Tab */}
                            {activeTab === 'diagnosa' && (
                                <div className="space-y-6">
                                    <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-xl p-4 sm:p-6">
                                        <div className="flex items-start space-x-4">
                                            <div className="flex-shrink-0 p-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl">
                                                {getSeverityIcon(riwayat.tingkat_keparahan)}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-gray-900 mb-2">
                                                    {riwayat.hasil_diagnosa}
                                                </h3>
                                                {riwayat.detail_diagnosa && (
                                                    <>
                                                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-4">
                                                            <span className="px-3 py-1 text-sm font-medium bg-gray-100 text-gray-800 rounded-full">
                                                                {riwayat.detail_diagnosa.kode_diagnosa}
                                                            </span>
                                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getSeverityColor(riwayat.tingkat_keparahan)}`}>
                                                                {riwayat.tingkat_keparahan}
                                                            </span>
                                                        </div>
                                                        <div className="prose max-w-none mb-6">
                                                            <p className="text-gray-700 leading-relaxed">
                                                                {riwayat.detail_diagnosa.deskripsi}
                                                            </p>
                                                        </div>
                                                    </>
                                                )}

                                                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 sm:p-6">
                                                    <h4 className="text-sm font-semibold text-gray-900 mb-4">Metrik Diagnosa</h4>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-600 mb-2">Tingkat Keyakinan</p>
                                                            <div className="flex items-center space-x-3">
                                                                <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                                                                    <div
                                                                        className={`h-3 rounded-full transition-all duration-500 ${getCFProgressColor(riwayat.nilai_cf)}`}
                                                                        style={{ width: `${riwayat.nilai_cf * 100}%` }}
                                                                    ></div>
                                                                </div>
                                                                <span className="text-sm font-bold text-gray-900 min-w-0">{formatCF(riwayat.nilai_cf)}</span>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-medium text-gray-600">Gejala Teridentifikasi</p>
                                                            <p className="text-2xl font-bold text-gray-900">
                                                                {riwayat.gejala_terpilih?.length || 0} gejala
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* ================================================================ */}
                            {/* REKOMENDASI TAB — menggunakan parser terstruktur dari Result.tsx  */}
                            {/* ================================================================ */}
                            {activeTab === 'rekomendasi' && (
                                <div className="space-y-6">
                                    <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-xl p-4 sm:p-6">
                                        <div className="flex items-center space-x-3 mb-6">
                                            <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                                                <HeartIcon className="h-5 w-5 text-white" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold text-gray-900">Rekomendasi &amp; Tindakan</h2>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    Disesuaikan dengan hasil diagnosis dan gejala spesifik Anda
                                                </p>
                                            </div>
                                        </div>

                                        {(() => {
                                            // Normalise ke string[]
                                            let rekomendasiArray: string[] = [];
                                            if (typeof riwayat.rekomendasi === 'string') {
                                                try {
                                                    const parsed = JSON.parse(riwayat.rekomendasi);
                                                    rekomendasiArray = Array.isArray(parsed) ? parsed : riwayat.rekomendasi.split('\n').filter(line => line.trim());
                                                } catch {
                                                    rekomendasiArray = riwayat.rekomendasi.split('\n').filter(line => line.trim());
                                                }
                                            } else if (Array.isArray(riwayat.rekomendasi)) {
                                                rekomendasiArray = riwayat.rekomendasi as unknown as string[];
                                            }

                                            return rekomendasiArray.length > 0
                                                ? parseAndRenderRecommendations(rekomendasiArray)
                                                : (
                                                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
                                                        <HeartIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                                        <p>Tidak ada rekomendasi khusus saat ini</p>
                                                    </div>
                                                );
                                        })()}
                                    </div>

                                    {/* Additional Recommendations */}
                                    {riwayat.saran_lanjutan && riwayat.saran_lanjutan.length > 0 && (
                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 sm:p-6">
                                            <h4 className="text-lg font-semibold text-blue-900 mb-4">Saran Lanjutan</h4>
                                            <ul className="space-y-3">
                                                {riwayat.saran_lanjutan.map((saran, index) => (
                                                    <li key={index} className="flex items-start space-x-3">
                                                        <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-0.5">
                                                            <CheckCircleIcon className="h-4 w-4 text-blue-600" />
                                                        </div>
                                                        <span className="text-blue-800 leading-relaxed">{saran}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {/* Warning/Important Notes */}
                                    <div className="bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-4 sm:p-6">
                                        <div className="flex items-start space-x-3">
                                            <div className="flex-shrink-0 p-2 bg-yellow-100 rounded-lg">
                                                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-semibold text-yellow-900 mb-2">Catatan Penting</h4>
                                                <p className="text-yellow-800 leading-relaxed">
                                                    Hasil diagnosa ini bersifat indikasi awal dan tidak menggantikan konsultasi dengan tenaga kesehatan profesional.
                                                    Jika gejala berlanjut atau memburuk, segera konsultasikan dengan dokter atau psikolog.
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* References */}
                                    {riwayat.referensi && riwayat.referensi.length > 0 && (
                                        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 sm:p-6">
                                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Referensi</h4>
                                            <ul className="space-y-3">
                                                {riwayat.referensi.map((ref, index) => (
                                                    <li key={index} className="flex items-start space-x-3">
                                                        <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center mt-0.5">
                                                            <DocumentTextIcon className="h-4 w-4 text-gray-500" />
                                                        </div>
                                                        <span className="text-gray-700 text-sm leading-relaxed">{ref}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ================================================================ */}
                    {/* KONSULTASI TERKAIT — card terpisah jelas dengan gap & border     */}
                    {/* ================================================================ */}
                    {relatedKonsultasi && relatedKonsultasi.length > 0 && (
                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6 mb-6 sm:mb-8 hover:shadow-xl transition-all duration-300">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Konsultasi Terkait</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                                {relatedKonsultasi.map((konsultasi) => (
                                    <div
                                        key={konsultasi.id_konsultasi}
                                        className="flex flex-col bg-white rounded-2xl border-2 border-gray-100 shadow-sm hover:border-blue-200 hover:shadow-md hover:scale-[1.02] transition-all duration-300 overflow-hidden"
                                    >
                                        {/* Card header strip */}
                                        <div className="h-1.5 w-full bg-gradient-to-r from-blue-400 to-indigo-500" />

                                        <div className="flex flex-col flex-1 p-5 gap-3">
                                            {/* Top row: ID + severity badge */}
                                            <div className="flex items-center justify-between">
                                                <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2.5 py-1 rounded-lg font-mono">
                                                    #{konsultasi.id_konsultasi}
                                                </span>
                                                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${getSeverityColor(konsultasi.tingkat_keparahan)}`}>
                                                    {konsultasi.tingkat_keparahan}
                                                </span>
                                            </div>

                                            {/* Diagnosis name */}
                                            <h4 className="font-semibold text-gray-900 leading-snug line-clamp-2 text-sm">
                                                {konsultasi.hasil_diagnosa}
                                            </h4>

                                            {/* Date */}
                                            <div className="flex items-center gap-1.5 text-xs text-gray-500">
                                                <CalendarIcon className="h-3.5 w-3.5 flex-shrink-0" />
                                                <span>{formatDate(konsultasi.tanggal_konsultasi)}</span>
                                            </div>

                                            {/* Divider */}
                                            <div className="border-t border-gray-100 pt-3 mt-auto flex items-center justify-between">
                                                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                                                    CF: {formatCF(konsultasi.nilai_cf)}
                                                </span>
                                                <Link
                                                    href={route('mahasiswa.riwayat-konsultasi.show', konsultasi.id_konsultasi)}
                                                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-3 py-2 rounded-lg transition-all duration-200"
                                                >
                                                    <EyeIcon className="h-3.5 w-3.5" />
                                                    <span>Detail</span>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Enhanced Bottom Navigation */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        <Link
                            href={route('mahasiswa.riwayat-konsultasi.index')}
                            className="inline-flex items-center justify-center px-4 py-3 border border-gray-300 shadow-lg text-sm font-medium rounded-xl text-gray-700 bg-white/80 backdrop-blur-xl hover:bg-white hover:shadow-xl hover:scale-105 transition-all duration-300"
                        >
                            <ArrowLeftIcon className="h-4 w-4 mr-2" />
                            Kembali ke Riwayat
                        </Link>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                            <Link
                                href={route('mahasiswa.konsultasi.start')}
                                className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-105 shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                <ArrowPathIcon className="h-4 w-4 mr-2" />
                                Konsultasi Ulang
                            </Link>

                            <button
                                onClick={handlePrint}
                                className="inline-flex items-center justify-center px-4 py-3 border border-gray-300 shadow-lg text-sm font-medium rounded-xl text-gray-700 bg-white/80 backdrop-blur-xl hover:bg-white hover:shadow-xl hover:scale-105 transition-all duration-300"
                            >
                                <PrinterIcon className="h-4 w-4 mr-2" />
                                Print Hasil
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Show;
