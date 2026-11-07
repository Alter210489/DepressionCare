import React from 'react';
import { Head, Link } from '@inertiajs/react';
import GuestLayout from '@/layouts/GuestLayout';
import { HeartIcon, PhoneIcon } from '@heroicons/react/24/outline';

// ============================================================================
// TYPES
// ============================================================================

interface Diagnosa {
    id_diagnosa: number;
    nama_diagnosa: string;
    deskripsi_diagnosa: string;
}

interface Konsultasi {
    id_guestconsultation: number;
    tanggal_konsultasi: string;
    nama?: string;
    hasil_diagnosa: string;
    nilai_cf: number;
    tingkat_keparahan: string;
    diagnosa: Diagnosa;
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
    bobot_jawaban: number; // bobot pilihan jawaban (0.0–1.0)
    cf_hasil: number;      // kontribusi CF = nilai_cf × bobot_jawaban
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

// ============================================================================
// COMPONENT
// ============================================================================

export default function GuestHasil({
    konsultasi,
    gejalaDetails = [],
    cfPercentage = 0,
    confidenceLevel = { label: 'Tidak Diketahui', color: 'gray' },
    rekomendasi = [],
}: Props) {

    // ── Style helpers ─────────────────────────────────────────────────────────
    const getSeverityStyle = (tingkat: string) => {
        const t = tingkat?.toLowerCase() ?? '';
        if (t.includes('berat') || t.includes('severe'))     return { gradient: 'from-red-600 to-rose-600',     icon: '🔴', border: 'border-red-200' };
        if (t.includes('sedang') || t.includes('moderate'))  return { gradient: 'from-orange-500 to-amber-500', icon: '🟠', border: 'border-orange-200' };
        if (t.includes('ringan') || t.includes('mild'))      return { gradient: 'from-yellow-500 to-orange-400', icon: '🟡', border: 'border-amber-200' };
        return { gradient: 'from-green-500 to-emerald-500', icon: '🟢', border: 'border-green-200' };
    };

    const getConfidenceBadge = (color: string) => ({
        red:    'bg-red-100 text-red-800 border border-red-200',
        orange: 'bg-orange-100 text-orange-800 border border-orange-200',
        yellow: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
        blue:   'bg-blue-100 text-blue-800 border border-blue-200',
        green:  'bg-green-100 text-green-800 border border-green-200',
    }[color] ?? 'bg-gray-100 text-gray-800 border border-gray-200');

    const isEmergency = ['sedang', 'berat', 'moderate', 'severe'].some(t =>
        (konsultasi.tingkat_keparahan ?? '').toLowerCase().includes(t)
    );

    const severityStyle = getSeverityStyle(konsultasi.tingkat_keparahan);

    // =========================================================================
    // RENDER HELPERS — identik dengan Result.tsx
    // =========================================================================

    /**
     * Render teks inline: urai **bold** menjadi <strong>.
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
     * Format yang dikenali:
     *   ## Judul Section → header kartu (H2)
     *   ### Sub-judul    → label kecil uppercase di dalam kartu (H3)
     *   • Item / - Item  → bullet list dengan dot bulat
     *   **bold**         → <strong>
     *   --- / kosong     → dilewati
     *   Teks biasa       → paragraf
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
            if (/bunuh diri|kritis|darurat medis/.test(t))                       return 'critical';
            if (/peringatan|mendesak|tindakan mendesak|segera diperlukan/.test(t)) return 'warning';
            if (/tindakan|langkah|aksi|langkah keselamatan/.test(t))             return 'action';
            if (/sumber bantuan|layanan|resource/.test(t))                       return 'resource';
            if (/akademik|performa|manajemen|penghentian/.test(t))               return 'academic';
            if (/pemantauan|tindak lanjut|jadwal/.test(t))                       return 'followup';
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
                current.blocks.push({ kind: 'h3', h3Text: raw.replace(/^###\s*/, '').trim() });
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
                            {/* Header kartu */}
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

    // =========================================================================
    // RENDER
    // =========================================================================
    return (
        <GuestLayout>
            <Head title="Hasil Konsultasi Depresi" />

            <div className="max-w-6xl mx-auto py-6 px-4 space-y-8">

                {/* ── Hero Header ──────────────────────────────────────────── */}
                <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl shadow-xl">
                    <div className="absolute inset-0 bg-black/10" />
                    <div className="relative px-6 py-8 text-white sm:px-8 sm:py-10">
                        <div className="max-w-3xl">
                            <div className="flex items-center space-x-4 mb-4 sm:mb-6">
                                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                                    <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-1 leading-tight">
                                        Hasil Konsultasi Depresi ✨
                                    </h1>
                                    <p className="text-base sm:text-lg opacity-90">
                                        Analisis lengkap kondisi kesehatan mental Anda
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-wrap items-center gap-4 text-sm">
                                <div className="flex items-center space-x-2">
                                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                                    <span>📅 {new Date(konsultasi.tanggal_konsultasi).toLocaleDateString('id-ID')}</span>
                                </div>
                                {konsultasi.nama && (
                                    <div className="flex items-center space-x-2">
                                        <span className="w-2 h-2 bg-blue-400 rounded-full" />
                                        <span>👤 {konsultasi.nama}</span>
                                    </div>
                                )}
                                <div className="flex items-center space-x-2">
                                    <span className="w-2 h-2 bg-purple-400 rounded-full" />
                                    <span>🔬 CF Score: {cfPercentage}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Hasil Diagnosa ───────────────────────────────────────── */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                    <div className={`px-6 py-6 sm:px-8 sm:py-8 bg-gradient-to-r ${severityStyle.gradient} text-white`}>
                        <div className="flex items-center space-x-4">
                            <div className="text-3xl sm:text-4xl">{severityStyle.icon}</div>
                            <div>
                                <h3 className="text-xl sm:text-2xl font-bold mb-1">Hasil Diagnosa</h3>
                                <p className="text-base sm:text-lg font-semibold opacity-95">{konsultasi.hasil_diagnosa}</p>
                                <p className="text-sm opacity-80 mt-1">{konsultasi.tingkat_keparahan}</p>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 sm:p-8">
                        <h4 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                            <span>📋</span><span>Deskripsi Kondisi</span>
                        </h4>
                        <p className="text-gray-700 leading-relaxed bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-100">
                            {konsultasi.diagnosa.deskripsi_diagnosa}
                        </p>
                    </div>
                </div>

                {/* ── Tingkat Keyakinan Sistem ─────────────────────────────── */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6 sm:p-8">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">Tingkat Keyakinan Sistem</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                            <div className="text-4xl sm:text-5xl font-bold text-blue-600 mb-3">{cfPercentage}%</div>
                            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getConfidenceBadge(confidenceLevel.color)}`}>
                                {confidenceLevel.label}
                            </span>
                        </div>
                        <div className="flex items-center">
                            <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-xl border border-gray-100 w-full">
                                <h4 className="font-semibold text-gray-800 mb-2 flex items-center space-x-2">
                                    <span>ℹ️</span><span>Tentang CF Score</span>
                                </h4>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    Certainty Factor (CF) menunjukkan tingkat keyakinan sistem terhadap diagnosis.
                                    Semakin tinggi nilai CF, semakin yakin sistem terhadap hasil diagnosis yang diberikan.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ================================================================ */}
                {/* REKOMENDASI TINDAKAN — parser identik dengan Result.tsx           */}
                {/* ================================================================ */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6 sm:p-8">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                            <HeartIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Rekomendasi &amp; Tindakan</h2>
                            <p className="text-xs text-gray-500 mt-0.5">
                                Disesuaikan dengan hasil diagnosis dan gejala spesifik Anda
                            </p>
                        </div>
                    </div>

                    {rekomendasi.length > 0
                        ? parseAndRenderRecommendations(rekomendasi)
                        : (
                            <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-xl">
                                <HeartIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                <p>Tidak ada rekomendasi khusus saat ini</p>
                            </div>
                        )
                    }

                    {/* Emergency callout */}
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

                {/* ── Detail Gejala ─────────────────────────────────────────── */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                    <div className="bg-gradient-to-r from-slate-50 to-gray-100 px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Detail Gejala yang Dipilih</h3>
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 text-sm font-medium rounded-full">
                                {gejalaDetails.length} gejala
                            </span>
                        </div>
                    </div>
                    <div className="p-6">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-gray-200">
                                        {[
                                            { label: 'Kode', width: 'w-20' },
                                            { label: 'Gejala', width: '' },
                                            { label: 'Kategori', width: 'w-32' },
                                            { label: 'Jawaban', width: 'w-40' },
                                            { label: 'Bobot', width: 'w-20', hint: 'Bobot pilihan (0–1)' },
                                            { label: 'CF Gejala', width: 'w-24', hint: 'nilai_cf × bobot' },
                                        ].map(({ label, width, hint }) => (
                                            <th key={label} className={`px-4 py-4 text-left text-sm font-semibold text-gray-700 bg-gradient-to-r from-gray-50 to-white ${width}`}>
                                                <span title={hint ?? ''}>{label}{hint ? ' ⓘ' : ''}</span>
                                            </th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {gejalaDetails.map((item, index) => {
                                        const bobotJawaban = item.bobot_jawaban ?? 0;
                                        const cfHasil      = item.cf_hasil ?? 0;

                                        // Warna badge CF Gejala berdasarkan kontribusinya
                                        const cfBadge =
                                            cfHasil > 0.6 ? 'bg-red-100 text-red-700 border border-red-200' :
                                            cfHasil > 0.4 ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                                            cfHasil > 0.2 ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                                            cfHasil > 0   ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                            'bg-gray-100 text-gray-500 border border-gray-200';

                                        return (
                                            <tr key={index} className="hover:bg-blue-50/40 transition-colors duration-150">
                                                <td className="px-4 py-4">
                                                    <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-1 rounded-md">
                                                        {item.gejala.kode_gejala}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <p className="text-sm text-gray-800 leading-relaxed">{item.gejala.nama_gejala}</p>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full capitalize">
                                                        {item.gejala.kategori_gejala?.replace(/_/g, ' ')}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className="text-sm text-gray-700">
                                                        {item.opsi_terpilih?.text || 'N/A'}
                                                    </span>
                                                </td>
                                                {/* Bobot pilihan jawaban (0.0 – 1.0) */}
                                                <td className="px-4 py-4 text-center">
                                                    <span className="text-sm font-mono text-gray-600">
                                                        {bobotJawaban.toFixed(2)}
                                                    </span>
                                                </td>
                                                {/* CF Gejala = nilai_cf × bobot_jawaban */}
                                                <td className="px-4 py-4 text-center">
                                                    <span className={`px-2.5 py-1 rounded-md text-xs font-mono font-semibold ${cfBadge}`}>
                                                        {cfHasil > 0 ? cfHasil.toFixed(4) : '—'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* ── Action Buttons ────────────────────────────────────────── */}
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6 sm:p-8">
                    <div className="text-center mb-6">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">Langkah Selanjutnya</h3>
                        <p className="text-gray-600">Pilih tindakan yang ingin Anda lakukan berdasarkan hasil konsultasi</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        <Link href={route('guest.konsultasi.index')}
                            className="group relative bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-4 rounded-xl font-semibold text-center hover:from-blue-700 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl overflow-hidden">
                            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative flex items-center justify-center space-x-3">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Konsultasi Lagi</span>
                            </div>
                        </Link>

                        {route().has('register') && (
                            <Link href={route('register')}
                                className="group relative bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-4 rounded-xl font-semibold text-center hover:from-purple-700 hover:to-pink-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl overflow-hidden">
                                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="relative flex items-center justify-center space-x-3">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                                    </svg>
                                    <span>Daftar sebagai Mahasiswa</span>
                                </div>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </GuestLayout>
    );
}
