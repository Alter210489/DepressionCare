import { Head, Link, router } from '@inertiajs/react';
import React, { useState, useEffect } from 'react';
import {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    PrinterIcon,
    ClipboardDocumentListIcon,
    ChartBarIcon,
    HeartIcon,
    AcademicCapIcon,
    PhoneIcon,
    ChevronLeftIcon,
    CalendarDaysIcon,
    BeakerIcon,
    SparklesIcon,
    ShieldCheckIcon,
    ClockIcon,
    CpuChipIcon,
    DocumentTextIcon,
    ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';

interface Diagnosa {
    id_diagnosa: number;
    nama_diagnosa: string;
    deskripsi_diagnosa: string;
}

interface Konsultasi {
    id_konsultasi: number;
    tanggal_konsultasi: string;
    hasil_diagnosa: string;
    nilai_cf: number;
    tingkat_keparahan: string;
    rekomendasi: string | string[];
    diagnosa: Diagnosa;
    detail?: any;
}

interface OpsiTerpilih {
    text: string;
    bobot: number;
}

interface GejalaDetail {
    gejala: {
        id_gejala: number;
        kode_gejala: string;
        nama_gejala: string;
        kategori_gejala: string;
        nilai_cf: number;
    };
    opsi_terpilih: OpsiTerpilih;
    bobot_jawaban: number;
    cf_hasil: number;
}

interface ConfidenceLevel {
    label: string;
    color: string;
}

interface Props {
    konsultasi: Konsultasi;
    gejalaDetails: GejalaDetail[];
    cfPercentage: number;
    confidenceLevel: ConfidenceLevel;
    rekomendasi: string[];
}

const safeToNumber = (value: any, defaultValue: number = 0): number => {
    if (typeof value === 'number' && !isNaN(value)) return value;
    if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return !isNaN(parsed) ? parsed : defaultValue;
    }
    return defaultValue;
};

const safeToFixed = (value: any, digits: number = 4, defaultValue: string = '0.0000'): string => {
    const numValue = safeToNumber(value);
    try { return numValue.toFixed(digits); }
    catch { return defaultValue; }
};

const Result: React.FC<Props> = ({
    konsultasi,
    gejalaDetails = [],
    cfPercentage = 0,
    confidenceLevel = { label: 'Tidak Diketahui', color: 'gray' },
    rekomendasi = []
}) => {
    if (!konsultasi || !konsultasi.id_konsultasi) {
        return (
            <>
                <Head title="Memuat Hasil Konsultasi..." />
                <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center">
                    <div className="text-center max-w-md bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
                        <div className="relative mb-6">
                            <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-3">Memuat Hasil Konsultasi</h2>
                        <p className="text-gray-600 mb-6">Mohon tunggu sebentar...</p>
                        <Link href={route('mahasiswa.dashboard')}
                            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-200">
                            <ChevronLeftIcon className="h-4 w-4 mr-2" />
                            Kembali ke Dashboard
                        </Link>
                    </div>
                </div>
            </>
        );
    }

    // =========================================================================
    // RENDER HELPERS
    // =========================================================================

    /**
     * Render teks inline: urai **bold** menjadi <strong>, sisanya plain span.
     * Aman — tidak menggunakan dangerouslySetInnerHTML.
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
     * Parse array string dari controller menjadi komponen React terstruktur.
     *
     * Format yang dikenali dari controller:
     *   ## Judul Section (H2 → header kartu)
     *   ### Sub-judul (H3 → label kecil di dalam kartu)
     *   • Item / - Item → bullet list
     *   **bold** inline → <strong>
     *   --- dan baris kosong → dilewati (spasi sudah dari layout)
     *   Teks biasa → paragraf
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

        // ── Klasifikasi section dari judulnya ────────────────────────────────
        const classify = (title: string): SectionType => {
            const t = title.toLowerCase();
            if (/bunuh diri|kritis|darurat medis/.test(t))                  return 'critical';
            if (/peringatan|mendesak|tindakan mendesak|segera diperlukan/.test(t)) return 'warning';
            if (/tindakan|langkah|aksi|langkah keselamatan/.test(t))        return 'action';
            if (/sumber bantuan|layanan|resource/.test(t))                  return 'resource';
            if (/akademik|performa|manajemen|penghentian/.test(t))          return 'academic';
            if (/pemantauan|tindak lanjut|jadwal/.test(t))                  return 'followup';
            return 'info';
        };

        // ── Parse baris per baris ────────────────────────────────────────────
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
            // H2
            if (raw.startsWith('## ')) {
                flushBullets();
                if (current) sections.push(current);
                const h2 = raw.replace(/^##\s*/, '').trim();
                current = { h2, type: classify(h2), blocks: [] };
                continue;
            }
            if (!current) continue;

            // H3
            if (raw.startsWith('### ')) {
                flushBullets();
                const h3 = raw.replace(/^###\s*/, '').trim();
                current.blocks.push({ kind: 'h3', h3Text: h3 });
                continue;
            }

            // Separator / kosong — skip
            if (raw.trim() === '---' || raw.trim() === '') continue;

            // Bullet
            if (raw.startsWith('• ') || raw.startsWith('- ')) {
                bullets.push(raw.replace(/^[•\-]\s+/, '').trim());
                continue;
            }

            // Paragraf biasa
            flushBullets();
            current.blocks.push({ kind: 'paragraph', text: raw.trim() });
        }

        flushBullets();
        if (current) sections.push(current);
        if (sections.length === 0) return null;

        // ── Palet warna per tipe ─────────────────────────────────────────────
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

        // ── Render ───────────────────────────────────────────────────────────
        return (
            <div className="space-y-5">
                {sections.map((sec, si) => {
                    const c = pal[sec.type];
                    return (
                        <div key={si} className={c.wrap}>

                            {/* ── Judul kartu (gradient bar) ── */}
                            <div className={`${c.bar} px-5 py-4 flex items-start gap-3`}>
                                <span className="text-xl leading-none mt-0.5 flex-shrink-0">{icon[sec.type]}</span>
                                <h3 className={`font-bold text-sm leading-snug ${c.title}`}>
                                    {renderInline(sec.h2, `h2-${si}`)}
                                </h3>
                            </div>

                            {/* ── Isi kartu ── */}
                            <div className="bg-white/80 px-5 py-4 space-y-3">
                                {sec.blocks.map((blk, bi) => {

                                    // H3 — label seksi kecil
                                    if (blk.kind === 'h3') return (
                                        <p key={bi}
                                           className={`text-xs font-bold uppercase tracking-wider pt-2 pb-0.5 border-b border-current/20 ${c.h3}`}>
                                            {renderInline(blk.h3Text || '', `h3-${bi}`)}
                                        </p>
                                    );

                                    // Bullet list
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

                                    // Paragraf
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

    // =========================================================================
    // HANDLERS
    // =========================================================================

    const handleDownloadPDF = () => {
        try {
            const params = new URLSearchParams({ id_konsultasi: konsultasi.id_konsultasi.toString() }).toString();
            window.open(`${route('mahasiswa.konsultasi.result.export.pdf')}?${params}`, '_blank');
        } catch (error) {
            console.error('Error downloading PDF:', error);
            alert('Terjadi kesalahan saat download PDF');
        }
    };

    const handlePrint = async () => {
        try {
            const params = new URLSearchParams({ id_konsultasi: konsultasi.id_konsultasi.toString(), action: 'print' });
            const response = await fetch(`${route('mahasiswa.konsultasi.result.export.pdf')}?${params}`);
            const blob = await response.blob();
            const pdfUrl = URL.createObjectURL(blob);
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = pdfUrl;
            document.body.appendChild(iframe);
            iframe.onload = () => {
                setTimeout(() => {
                    iframe.contentWindow?.print();
                    setTimeout(() => { URL.revokeObjectURL(pdfUrl); iframe.remove(); }, 10000);
                }, 500);
            };
        } catch (error) {
            console.error('Print error:', error);
            alert('Gagal memproses print');
        }
    };

    // =========================================================================
    // HELPERS
    // =========================================================================

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Tanggal tidak tersedia';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return 'Format tanggal tidak valid';
            return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
        } catch { return 'Format tanggal tidak valid'; }
    };

    const getSeverityColors = (severity: string) => {
        const colors: Record<string, { gradient: string; text: string; border: string; icon: string }> = {
            'Normal':   { gradient: 'from-emerald-500 to-teal-500',   text: 'text-white', border: 'border-emerald-200', icon: '✅' },
            'Minimal':  { gradient: 'from-emerald-500 to-teal-500',   text: 'text-white', border: 'border-emerald-200', icon: '✅' },
            'Ringan':   { gradient: 'from-amber-500 to-yellow-500',   text: 'text-white', border: 'border-amber-200',   icon: '⚠️' },
            'Mild':     { gradient: 'from-amber-500 to-yellow-500',   text: 'text-white', border: 'border-amber-200',   icon: '⚠️' },
            'Sedang':   { gradient: 'from-orange-500 to-red-500',     text: 'text-white', border: 'border-orange-200',  icon: '🚨' },
            'Moderate': { gradient: 'from-orange-500 to-red-500',     text: 'text-white', border: 'border-orange-200',  icon: '🚨' },
            'Berat':    { gradient: 'from-red-600 to-rose-600',       text: 'text-white', border: 'border-red-200',     icon: '🔴' },
            'Severe':   { gradient: 'from-red-600 to-rose-600',       text: 'text-white', border: 'border-red-200',     icon: '🔴' },
        };
        if (colors[severity]) return colors[severity];
        for (const [key, val] of Object.entries(colors)) {
            if (severity?.toLowerCase().includes(key.toLowerCase())) return val;
        }
        return colors['Normal'];
    };

    const getConfidenceColor = (level: string) => ({
        'Sangat Yakin': 'text-red-600', 'Yakin': 'text-orange-600',
        'Cukup Yakin': 'text-yellow-600', 'Kurang Yakin': 'text-blue-600', 'Tidak Yakin': 'text-green-600'
    }[level] || 'text-gray-600');

    // =========================================================================
    // DATA
    // =========================================================================

    const tingkatKeparahan        = konsultasi?.tingkat_keparahan || 'Tidak Diketahui';
    const hasilDiagnosa           = konsultasi?.hasil_diagnosa    || 'Diagnosis tidak tersedia';
    const tanggalKonsultasi       = konsultasi?.tanggal_konsultasi || '';
    const idKonsultasi            = konsultasi?.id_konsultasi      || 0;
    const cfGabungan              = safeToNumber(konsultasi?.nilai_cf, 0);
    const cfPercentageDisplay     = safeToNumber(cfPercentage, cfGabungan * 100);
    const formattedCfGabungan     = safeToFixed(cfGabungan, 4);
    const diagnosaDeskripsi       = konsultasi?.diagnosa?.deskripsi_diagnosa || 'Deskripsi tidak tersedia';
    const diagnosaNama            = konsultasi?.diagnosa?.nama_diagnosa      || hasilDiagnosa;

    const statistik = konsultasi?.detail?.statistik || {
        total_gejala_dijawab:       gejalaDetails?.length || 0,
        gejala_dengan_cf_positif:   gejalaDetails?.filter(g => g.cf_hasil > 0).length || 0,
        cf_gabungan:                cfGabungan,
        cf_percentage:              cfPercentageDisplay,
    };

    // Normalise rekomendasi ke string[]
    let rekomendasiArray: string[] = [];
    if (Array.isArray(rekomendasi)) {
        rekomendasiArray = rekomendasi;
    } else if (typeof rekomendasi === 'string') {
        try { const p = JSON.parse(rekomendasi); rekomendasiArray = Array.isArray(p) ? p : [rekomendasi]; }
        catch { rekomendasiArray = [rekomendasi]; }
    } else if (konsultasi?.rekomendasi) {
        if (typeof konsultasi.rekomendasi === 'string') {
            try { const p = JSON.parse(konsultasi.rekomendasi); rekomendasiArray = Array.isArray(p) ? p : [konsultasi.rekomendasi]; }
            catch { rekomendasiArray = [konsultasi.rekomendasi]; }
        } else if (Array.isArray(konsultasi.rekomendasi)) {
            rekomendasiArray = konsultasi.rekomendasi;
        }
    }

    const severityColors = getSeverityColors(tingkatKeparahan);
    const isEmergency    = ['Sedang', 'Berat', 'Moderate', 'Severe'].some(t =>
        tingkatKeparahan.toLowerCase().includes(t.toLowerCase())
    );

    // =========================================================================
    // RENDER
    // =========================================================================
    return (
        <>
            <Head title="Hasil Konsultasi - Mental Health Detection" />
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">

                {/* Header */}
                <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                    <div className="absolute inset-0 bg-black/5" />
                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="py-6 sm:py-8">
                            <div className="mb-4 sm:mb-6">
                                <Link href={route('mahasiswa.konsultasi.index')}
                                    className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-white/20 hover:bg-white/30 border border-white/30 backdrop-blur-sm rounded-lg sm:rounded-xl text-sm font-medium text-white transition-all duration-300">
                                    <ChevronLeftIcon className="h-4 w-4 mr-2" />
                                    Kembali
                                </Link>
                            </div>
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                <div className="text-center sm:text-left">
                                    <div className="flex items-center justify-center sm:justify-start space-x-3 mb-3">
                                        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl backdrop-blur-sm flex items-center justify-center">
                                            <CheckCircleIcon className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                                        </div>
                                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">Hasil Konsultasi</h1>
                                    </div>
                                    <p className="text-base sm:text-lg text-blue-100 mb-4">
                                        Analisis menggunakan metode Certainty Factor (CF)
                                    </p>
                                    <div className="flex flex-wrap justify-center sm:justify-start gap-3 text-xs sm:text-sm text-white/90">
                                        {[
                                            { icon: <CalendarDaysIcon className="h-3 w-3" />, text: formatDate(tanggalKonsultasi) },
                                            { icon: <BeakerIcon className="h-3 w-3" />,      text: `ID: #${idKonsultasi}` },
                                            { icon: <CpuChipIcon className="h-3 w-3" />,      text: 'CF Method' },
                                        ].map((item, i) => (
                                            <div key={i} className="flex items-center space-x-2 bg-white/10 rounded-full px-3 py-1 backdrop-blur-sm">
                                                {item.icon}
                                                <span>{item.text}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex items-center justify-center gap-3">
                                    <button onClick={handlePrint}
                                        className="inline-flex items-center px-4 py-2 bg-white/20 hover:bg-white/30 border border-white/30 backdrop-blur-sm rounded-xl text-white font-medium transition-all duration-300">
                                        <PrinterIcon className="h-4 w-4 mr-2" />
                                        <span className="hidden sm:inline">Print</span>
                                    </button>
                                    <button onClick={handleDownloadPDF}
                                        className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 border border-red-500 rounded-xl text-white font-medium transition-all duration-300 shadow-lg">
                                        <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                                        <span className="hidden sm:inline">Download PDF</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">

                    {/* Diagnosis Card */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 sm:p-8 mb-8">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 mb-8">
                            <div className="flex-1">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                        <SparklesIcon className="h-6 w-6 text-white" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Hasil Diagnosis AI</h2>
                                        <p className="text-gray-600 text-sm">Metode: Certainty Factor (CF) Only</p>
                                    </div>
                                </div>
                            </div>
                            <div className={`inline-flex items-center px-6 py-3 rounded-2xl bg-gradient-to-r ${severityColors.gradient} ${severityColors.text} shadow-lg border ${severityColors.border}`}>
                                <span className="text-lg mr-2">{severityColors.icon}</span>
                                <span className="font-bold text-sm sm:text-base">{tingkatKeparahan}</span>
                            </div>
                        </div>

                        <div className="bg-gradient-to-r from-gray-50 to-blue-50/50 rounded-2xl p-6 sm:p-8 mb-8 border border-gray-100">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">{diagnosaNama}</h3>
                            <p className="text-gray-700 leading-relaxed text-base mb-4">{diagnosaDeskripsi}</p>
                            <div className="flex items-center text-sm text-gray-600">
                                <DocumentTextIcon className="h-4 w-4 mr-2" />
                                <span>Diagnosis berdasarkan evaluasi {statistik.total_gejala_dijawab} gejala dengan metode CF</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-bold text-purple-900">Indeks Keyakinan Sistem</h4>
                                    <ChartBarIcon className="h-6 w-6 text-purple-600" />
                                </div>
                                <div className="flex items-end space-x-3 mb-3">
                                    <span className="text-3xl sm:text-4xl font-bold text-purple-600">{cfPercentageDisplay.toFixed(1)}%</span>
                                    <span className="text-sm text-purple-500 mb-1">Akurasi</span>
                                </div>
                                <div className="w-full bg-purple-200 rounded-full h-3 overflow-hidden mb-3">
                                    <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full transition-all duration-700 ease-out"
                                        style={{ width: `${Math.min(cfPercentageDisplay, 100)}%` }} />
                                </div>
                                <p className={`text-sm font-bold ${getConfidenceColor(confidenceLevel?.label || '')}`}>
                                    Status: {confidenceLevel?.label || 'Tidak Diketahui'}
                                </p>
                                <div className="text-xs text-purple-600 mt-2 space-y-1">
                                    <p>Nilai CF: {formattedCfGabungan}</p>
                                    <p>Gejala Relevan: {statistik.gejala_dengan_cf_positif}/{statistik.total_gejala_dijawab}</p>
                                    <p>Formula: CF1 + CF2 × (1 - CF1)</p>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-gray-50 to-slate-50 border-2 border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <h4 className="font-bold text-gray-900">Ringkasan Analisis</h4>
                                    <CpuChipIcon className="h-6 w-6 text-gray-600" />
                                </div>
                                <div className="space-y-4 text-sm">
                                    {[
                                        { label: 'Total Gejala',    value: statistik.total_gejala_dijawab },
                                        { label: 'Gejala Relevan', value: statistik.gejala_dengan_cf_positif },
                                        { label: 'Tingkat Relevansi', value: statistik.total_gejala_dijawab > 0
                                            ? ((statistik.gejala_dengan_cf_positif / statistik.total_gejala_dijawab) * 100).toFixed(1) + '%'
                                            : '0%' },
                                    ].map(({ label, value }) => (
                                        <div key={label} className="flex justify-between">
                                            <span className="text-gray-700">{label}:</span>
                                            <span className="font-bold text-gray-900">{value}</span>
                                        </div>
                                    ))}
                                    <div className="border-t pt-3 mt-3 space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Kategori:</span>
                                            <span className="font-mono text-xs text-gray-900">
                                                {cfGabungan >= 0.70 ? 'Tinggi (≥70%)' : cfGabungan >= 0.50 ? 'Sedang (50–69%)' : cfGabungan >= 0.30 ? 'Rendah (30–49%)' : 'Minimal (0–30%)'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-700">Metode:</span>
                                            <span className="font-medium text-gray-900">CF Only</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">

                            {/* ============================================================ */}
                            {/* REKOMENDASI & TINDAKAN                                       */}
                            {/* ============================================================ */}
                            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 sm:p-8">
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

                                {rekomendasiArray.length > 0
                                    ? parseAndRenderRecommendations(rekomendasiArray)
                                    : (
                                        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
                                            <HeartIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                            <p>Tidak ada rekomendasi khusus saat ini</p>
                                        </div>
                                    )
                                }

                                {/* Emergency callout terpisah di bawah */}
                                {isEmergency && (
                                    <div className="mt-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                                        <PhoneIcon className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                        <p className="text-sm text-red-700">
                                            <strong>Butuh bantuan segera?</strong> Hubungi hotline krisis:{' '}
                                            <strong>119 ext 8</strong> (24 jam, gratis, anonim) atau pergi ke{' '}
                                            <strong>UGD RSUD Tarakan</strong>.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Gejala Details */}
                            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 sm:p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                                            <ClipboardDocumentListIcon className="h-5 w-5 text-white" />
                                        </div>
                                        <h2 className="text-xl font-bold text-gray-900">Rincian Gejala yang Dianalisis</h2>
                                    </div>
                                    <div className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
                                        {gejalaDetails?.length || 0} gejala
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                                    {[
                                        { bg: 'bg-blue-50',   text: 'text-blue-600',  sub: 'text-blue-700',  val: statistik.total_gejala_dijawab,     label: 'Total Gejala' },
                                        { bg: 'bg-green-50',  text: 'text-green-600', sub: 'text-green-700', val: statistik.gejala_dengan_cf_positif, label: 'Gejala Relevan' },
                                        { bg: 'bg-amber-50',  text: 'text-amber-600', sub: 'text-amber-700', val: new Set(gejalaDetails?.map(g => g.gejala.kategori_gejala) || []).size, label: 'Kategori' },
                                    ].map(({ bg, text, sub, val, label }) => (
                                        <div key={label} className={`${bg} p-4 rounded-xl text-center`}>
                                            <div className={`text-2xl font-bold ${text}`}>{val}</div>
                                            <div className={`text-xs ${sub}`}>{label}</div>
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-4 max-h-96 overflow-y-auto">
                                    {gejalaDetails && gejalaDetails.length > 0 ? (
                                        gejalaDetails.map((detail, index) =>
                                            detail?.gejala ? (
                                                <div key={index} className="bg-gradient-to-r from-gray-50 to-blue-50/30 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200">
                                                    <div className="flex items-start justify-between mb-3">
                                                        <div className="flex-1">
                                                            <div className="flex items-center space-x-2 mb-2">
                                                                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-mono rounded-md">
                                                                    {detail.gejala.kode_gejala || 'N/A'}
                                                                </span>
                                                                <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded-md capitalize">
                                                                    {detail.gejala.kategori_gejala?.replace(/_/g, ' ') || 'Tidak diketahui'}
                                                                </span>
                                                            </div>
                                                            <h4 className="font-semibold text-gray-900 mb-2">
                                                                {detail.gejala.nama_gejala || 'Nama gejala tidak tersedia'}
                                                            </h4>
                                                        </div>
                                                    </div>
                                                    <div className="bg-white/80 backdrop-blur-sm rounded-lg px-4 py-3 border border-gray-100">
                                                        <span className="font-semibold text-gray-900 text-sm">Jawaban Anda:</span>
                                                        <p className="text-gray-700 mt-1 text-sm">
                                                            {detail.opsi_terpilih?.text || 'Tidak ada jawaban'}
                                                        </p>
                                                    </div>
                                                </div>
                                            ) : null
                                        )
                                    ) : (
                                        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
                                            <ClipboardDocumentListIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                            <p>Tidak ada data gejala tersedia</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400 rounded-xl shadow-md p-6">
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                        <ExclamationTriangleIcon className="h-5 w-5 text-amber-600" />
                                    </div>
                                    <div>
                                        <h3 className="text-base font-bold text-amber-900 mb-3">Disclaimer Medis</h3>
                                        <div className="text-sm text-amber-800 space-y-2">
                                            <p>Hasil ini adalah screening awal menggunakan AI dan bukan diagnosis medis resmi.</p>
                                            <p>Disarankan konsultasi dengan profesional kesehatan mental untuk evaluasi lebih lanjut.</p>
                                            {isEmergency && (
                                                <p className="font-bold bg-amber-200 rounded-lg px-3 py-2 mt-3">
                                                    Segera hubungi konselor atau psikolog profesional.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {isEmergency && (
                                <div className="bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 rounded-xl shadow-md p-6">
                                    <div className="flex items-center space-x-3 mb-4">
                                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                            <PhoneIcon className="h-5 w-5 text-red-600" />
                                        </div>
                                        <h3 className="font-bold text-red-900">Kontak Darurat</h3>
                                    </div>
                                    <div className="space-y-3 text-sm">
                                        <div className="bg-white/80 rounded-lg p-3 border border-red-200">
                                            <p className="font-semibold text-red-900">Hotline Crisis</p>
                                            <p className="text-red-800">119 ext 8 (24/7)</p>
                                        </div>
                                        <div className="bg-white/80 rounded-lg p-3 border border-red-200">
                                            <p className="font-semibold text-red-900">Rumah Sakit</p>
                                            <p className="text-red-800">RSUD Tarakan — UGD</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                                        <SparklesIcon className="h-4 w-4 text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-900">Langkah Selanjutnya</h3>
                                </div>
                                <div className="space-y-3">
                                    <Link href={route('mahasiswa.konsultasi.start')}
                                        className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 border border-blue-200 rounded-xl transition-all duration-200 group">
                                        <div className="flex items-center space-x-3">
                                            <AcademicCapIcon className="h-5 w-5 text-blue-600" />
                                            <span className="font-medium text-blue-900">Konsultasi Lagi</span>
                                        </div>
                                        <span className="text-blue-400 group-hover:translate-x-1 transition-transform">→</span>
                                    </Link>
                                    <Link href={route('mahasiswa.dashboard')}
                                        className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-slate-50 hover:from-gray-100 hover:to-slate-100 border border-gray-200 rounded-xl transition-all duration-200 group">
                                        <div className="flex items-center space-x-3">
                                            <ClipboardDocumentListIcon className="h-5 w-5 text-gray-600" />
                                            <span className="font-medium text-gray-900">Lihat Dashboard</span>
                                        </div>
                                        <span className="text-gray-400 group-hover:translate-x-1 transition-transform">→</span>
                                    </Link>
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl shadow-lg p-6">
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                                        <InformationCircleIcon className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-base font-bold text-blue-900 mb-3">Tentang Metode CF</h4>
                                        <div className="text-sm text-blue-800 space-y-2">
                                            {[
                                                { label: 'Certainty Factor', desc: 'Metode untuk menghitung tingkat kepercayaan hasil diagnosis' },
                                                { label: 'Kombinasi CF',    desc: 'Menggunakan rumus CF = CF1 + CF2 × (1 - CF1)' },
                                                { label: 'Threshold',       desc: '≥70% Berat, 50–69% Sedang, 30–49% Ringan, <30% Normal' },
                                                { label: 'Akurasi',         desc: 'Memberikan tingkat kepercayaan diagnosis yang terukur' },
                                            ].map(({ label, desc }) => (
                                                <div key={label} className="flex items-start space-x-2">
                                                    <span className="w-1 h-1 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                                                    <p><strong>{label}:</strong> {desc}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className="w-8 h-8 bg-gradient-to-r from-gray-500 to-slate-600 rounded-lg flex items-center justify-center">
                                        <ClockIcon className="h-4 w-4 text-white" />
                                    </div>
                                    <h3 className="text-base font-bold text-gray-900">Detail Konsultasi</h3>
                                </div>
                                <div className="space-y-3 text-sm">
                                    {[
                                        { icon: <CalendarDaysIcon className="h-4 w-4 text-gray-600" />, label: 'Tanggal',          value: formatDate(tanggalKonsultasi) },
                                        { icon: <BeakerIcon className="h-4 w-4 text-gray-600" />,       label: 'ID Konsultasi',    value: `#${idKonsultasi}` },
                                        { icon: <ChartBarIcon className="h-4 w-4 text-gray-600" />,     label: 'Gejala Dievaluasi', value: statistik.total_gejala_dijawab },
                                        { icon: <CpuChipIcon className="h-4 w-4 text-gray-600" />,      label: 'CF Gabungan',      value: formattedCfGabungan },
                                        { icon: <BeakerIcon className="h-4 w-4 text-gray-600" />,       label: 'Metode',           value: 'CF Only' },
                                    ].map(({ icon, label, value }) => (
                                        <div key={label} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center space-x-2">{icon}<span className="text-gray-700">{label}</span></div>
                                            <span className="font-medium text-gray-900 text-right max-w-[55%] truncate">{value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl shadow-lg p-6">
                                <div className="flex items-start space-x-3">
                                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
                                        <ShieldCheckIcon className="h-5 w-5 text-white" />
                                    </div>
                                    <div>
                                        <h4 className="text-base font-bold text-green-900 mb-2">Jaminan Privasi</h4>
                                        <ul className="text-sm text-green-800 space-y-1">
                                            {['Data Anda dijaga kerahasiaannya','Konsultasi 100% anonim','Tidak ada informasi yang dibagikan','Hasil dapat dicetak untuk referensi'].map(t => (
                                                <li key={t} className="flex items-start gap-2">
                                                    <span className="w-1 h-1 bg-green-600 rounded-full mt-2 flex-shrink-0" />
                                                    <span>{t}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="mt-8 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <Link href={route('mahasiswa.dashboard')}
                                className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-gray-100 to-slate-100 hover:from-gray-200 hover:to-slate-200 border border-gray-300 rounded-xl text-gray-700 font-medium transition-all duration-200">
                                <ChevronLeftIcon className="h-4 w-4 mr-2" />
                                Kembali ke Dashboard
                            </Link>
                            <div className="flex flex-col sm:flex-row gap-3">
                                <button onClick={handlePrint}
                                    className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-gray-600 to-slate-600 hover:from-gray-700 hover:to-slate-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg">
                                    <PrinterIcon className="h-4 w-4 mr-2" />
                                    Print Hasil
                                </button>
                                <button onClick={handleDownloadPDF}
                                    className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg">
                                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                                    Download PDF
                                </button>
                                <Link href={route('mahasiswa.konsultasi.start')}
                                    className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg">
                                    <AcademicCapIcon className="h-4 w-4 mr-2" />
                                    Konsultasi Lagi
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Result;