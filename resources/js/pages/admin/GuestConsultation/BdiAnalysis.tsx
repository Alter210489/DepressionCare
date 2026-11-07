import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm } from '@inertiajs/react';
import {
    BarChart3,
    Brain,
    Calendar,
    ChevronDown,
    ChevronUp,
    Filter,
    Info,
    TrendingUp,
    Users,
    X,
} from 'lucide-react';
import { useState } from 'react';

// ============================================================================
// BREADCRUMBS
// ============================================================================

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard',        href: '/admin/dashboard' },
    { title: 'Konsultasi Guest', href: '/admin/guest-consultation' },
    { title: 'Analisis BDI-II',  href: '#' },
];

// ============================================================================
// TYPES
// ============================================================================

interface Consultation {
    id: number;
    nama: string;
    nim: string;
    email: string;
    fakultas: string;
    program_studi: string;
    umur: number;
    jenis_kelamin: string;
    tanggal: string;
    nilai_cf: number;
    cf_percentage: number;
    kategori_cf: string;
    skor_bdi: number;
    kategori_bdi: string;
    kategori_bdi_en: string;
    total_item: number;
}

interface StatistikBdi {
    total: number;
    rata_rata: number;
    tertinggi: number;
    terendah: number;
    distribusi: {
        minimal: number;
        ringan: number;
        sedang: number;
        berat: number;
    };
}

interface Filters {
    tanggal_dari: string;
    tanggal_sampai: string;
    fakultas: string;
    jenis_kelamin: string;
    kategori_bdi: string;
}

interface Props {
    consultations: Consultation[];
    statistikBdi: StatistikBdi;
    tingkatKesesuaian: number;
    totalSesuai: number;
    fakultasList: string[];
    filters: Filters;
}

// ============================================================================
// HELPERS
// ============================================================================

const getSeverityBadge = (key: string) => {
    const map: Record<string, string> = {
        minimal: 'bg-green-100 text-green-800',
        ringan:  'bg-yellow-100 text-yellow-800',
        sedang:  'bg-orange-100 text-orange-800',
        berat:   'bg-red-100 text-red-800',
    };
    return map[key] ?? 'bg-gray-100 text-gray-800';
};

const getSkorColor = (skor: number) => {
    if (skor <= 13) return 'text-green-600';
    if (skor <= 19) return 'text-yellow-600';
    if (skor <= 28) return 'text-orange-600';
    return 'text-red-600';
};

const normalizeCfKey = (tingkat: string) => {
    const t = (tingkat ?? '').toLowerCase();
    if (t.includes('berat')  || t.includes('severe'))   return 'berat';
    if (t.includes('sedang') || t.includes('moderate')) return 'sedang';
    if (t.includes('ringan') || t.includes('mild'))     return 'ringan';
    return 'minimal';
};

const formatDate = (d: string) =>
    d ? new Date(d).toLocaleDateString('id-ID', {
        year: 'numeric', month: 'short', day: 'numeric',
    }) : '—';

// ============================================================================
// COMPONENT
// ============================================================================

export default function BdiAnalysis({
    consultations,
    statistikBdi,
    tingkatKesesuaian,
    totalSesuai,
    fakultasList = [],
    filters,
}: Props) {

    const [showFilters, setShowFilters] = useState(false);
    const [search, setSearch]           = useState('');

    const { data, setData } = useForm<Filters>({
        tanggal_dari:   filters.tanggal_dari   || '',
        tanggal_sampai: filters.tanggal_sampai || '',
        fakultas:       filters.fakultas       || '',
        jenis_kelamin:  filters.jenis_kelamin  || '',
        kategori_bdi:   filters.kategori_bdi   || '',
    });

    const applyFilters = () => {
        const params: Record<string, string> = {};
        if (data.tanggal_dari)   params.tanggal_dari   = data.tanggal_dari;
        if (data.tanggal_sampai) params.tanggal_sampai = data.tanggal_sampai;
        if (data.fakultas)       params.fakultas       = data.fakultas;
        if (data.jenis_kelamin)  params.jenis_kelamin  = data.jenis_kelamin;
        if (data.kategori_bdi)   params.kategori_bdi   = data.kategori_bdi;

        router.get(route('admin.guest-consultation.bdi-analysis'), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleReset = () => {
        setData({ tanggal_dari: '', tanggal_sampai: '', fakultas: '', jenis_kelamin: '', kategori_bdi: '' });
        setSearch('');
        router.get(route('admin.guest-consultation.bdi-analysis'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Client-side search
    const filtered = consultations.filter(c => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
            c.nama.toLowerCase().includes(q)          ||
            c.nim.toLowerCase().includes(q)           ||
            c.fakultas.toLowerCase().includes(q)      ||
            c.program_studi.toLowerCase().includes(q)
        );
    });

    const { distribusi, total, rata_rata, tertinggi } = statistikBdi;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Analisis BDI-II - Admin" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">

                {/* ── Page Header ──────────────────────────────────────────── */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Analisis BDI-II</h1>
                        <p className="text-gray-600 mt-1">
                            Beck Depression Inventory-II · Kalkulasi ulang dari data jawaban tersimpan
                        </p>
                    </div>
                    <Link
                        href={route('admin.guest-consultation.index')}
                        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                        ← Kembali
                    </Link>
                </div>

                {/* ── Info Banner ──────────────────────────────────────────── */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
                    <Info className="text-blue-500 mt-0.5 flex-shrink-0" size={18} />
                    <p className="text-sm text-blue-800">
                        <span className="font-semibold">Tentang Kalkulasi BDI-II: </span>
                        Skor dihitung dari indeks pilihan jawaban (0–3) per item, dijumlahkan menjadi total 0–63.
                        Threshold: &nbsp;
                        <span className="font-medium text-green-700">0–13 Minimal</span> ·&nbsp;
                        <span className="font-medium text-yellow-700">14–19 Ringan</span> ·&nbsp;
                        <span className="font-medium text-orange-700">20–28 Sedang</span> ·&nbsp;
                        <span className="font-medium text-red-700">29–63 Berat</span>
                    </p>
                </div>

                {/* ── Statistics Cards ─────────────────────────────────────── */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg shadow-sm border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Responden</p>
                                <p className="text-2xl font-bold text-blue-600">{total}</p>
                            </div>
                            <Users className="text-blue-500" size={24} />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Rata-rata Skor BDI</p>
                                <p className="text-2xl font-bold text-indigo-600">{rata_rata}</p>
                                <p className="text-xs text-gray-400">dari maks 63</p>
                            </div>
                            <BarChart3 className="text-indigo-500" size={24} />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Skor Tertinggi</p>
                                <p className="text-2xl font-bold text-red-600">{tertinggi}</p>
                                <p className="text-xs text-gray-400">skor BDI-II</p>
                            </div>
                            <ChevronUp className="text-red-500" size={24} />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Kesesuaian CF ↔ BDI</p>
                                <p className="text-2xl font-bold text-purple-600">{tingkatKesesuaian}%</p>
                                <p className="text-xs text-gray-400">{totalSesuai} dari {total} konsisten</p>
                            </div>
                            <TrendingUp className="text-purple-500" size={24} />
                        </div>
                    </div>
                </div>

                {/* ── Distribusi BDI-II ────────────────────────────────────── */}
                <div className="bg-white rounded-lg shadow-sm border p-4">
                    <h2 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Brain size={18} className="text-gray-500" />
                        Distribusi Kategori BDI-II
                    </h2>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {([
                            { key: 'minimal', label: 'Minimal', range: '0–13',  count: distribusi.minimal, color: 'text-green-600',  bar: 'bg-green-500',  bg: 'bg-green-50 border border-green-200'   },
                            { key: 'ringan',  label: 'Ringan',  range: '14–19', count: distribusi.ringan,  color: 'text-yellow-600', bar: 'bg-yellow-500', bg: 'bg-yellow-50 border border-yellow-200' },
                            { key: 'sedang',  label: 'Sedang',  range: '20–28', count: distribusi.sedang,  color: 'text-orange-600', bar: 'bg-orange-500', bg: 'bg-orange-50 border border-orange-200' },
                            { key: 'berat',   label: 'Berat',   range: '29–63', count: distribusi.berat,   color: 'text-red-600',    bar: 'bg-red-500',    bg: 'bg-red-50 border border-red-200'       },
                        ] as const).map(({ key, label, range, count, color, bar, bg }) => {
                            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                            return (
                                <div key={key} className={`rounded-lg p-4 ${bg}`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">{label}</span>
                                        <span className="text-xs text-gray-500">{range}</span>
                                    </div>
                                    <p className={`text-2xl font-bold ${color}`}>{count}</p>
                                    <div className="mt-2 w-full bg-white/60 rounded-full h-1.5">
                                        <div className={`h-full rounded-full ${bar}`} style={{ width: `${pct}%` }} />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-1 text-right">{pct}%</p>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* ── Search & Filter ──────────────────────────────────────── */}
                <div className="bg-white rounded-lg shadow-sm border p-4">
                    <div className="flex items-center gap-4">
                        <div className="flex-1 relative">
                            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Cari nama, NIM, atau fakultas..."
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            <Filter size={16} />
                            Filter
                            {showFilters ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                        </button>
                        <button
                            onClick={handleReset}
                            className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                        >
                            <X size={16} />
                            Reset
                        </button>
                    </div>

                    {showFilters && (
                        <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Dari</label>
                                <input
                                    type="date"
                                    value={data.tanggal_dari}
                                    onChange={e => setData('tanggal_dari', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Sampai</label>
                                <input
                                    type="date"
                                    value={data.tanggal_sampai}
                                    onChange={e => setData('tanggal_sampai', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Fakultas</label>
                                <select
                                    value={data.fakultas}
                                    onChange={e => setData('fakultas', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                >
                                    <option value="">Semua Fakultas</option>
                                    {fakultasList.map(f => <option key={f} value={f}>{f}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
                                <select
                                    value={data.jenis_kelamin}
                                    onChange={e => setData('jenis_kelamin', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                >
                                    <option value="">Semua</option>
                                    <option value="L">Laki-laki</option>
                                    <option value="P">Perempuan</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori BDI-II</label>
                                <select
                                    value={data.kategori_bdi}
                                    onChange={e => setData('kategori_bdi', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                                >
                                    <option value="">Semua Kategori</option>
                                    <option value="minimal">Minimal (0–13)</option>
                                    <option value="ringan">Ringan (14–19)</option>
                                    <option value="sedang">Sedang (20–28)</option>
                                    <option value="berat">Berat (29–63)</option>
                                </select>
                            </div>
                            <div className="lg:col-span-5 flex justify-end">
                                <button
                                    onClick={applyFilters}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Terapkan Filter
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Data Table ───────────────────────────────────────────── */}
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    <div className="px-6 py-3 bg-gray-50 border-b">
                        <p className="text-sm text-gray-600">
                            Menampilkan <span className="font-semibold">{filtered.length}</span> dari{' '}
                            <span className="font-semibold">{consultations.length}</span> data
                        </p>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    {['#', 'Nama / NIM', 'Fakultas', 'Tanggal', 'Skor BDI-II', 'Kategori BDI-II', 'CF Score', 'Kategori CF', 'Konsisten'].map(h => (
                                        <th key={h} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filtered.length > 0 ? (
                                    filtered.map((c, i) => {
                                        const cfKey     = normalizeCfKey(c.kategori_cf);
                                        const konsisten = cfKey === c.kategori_bdi_en;
                                        return (
                                            <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 text-sm text-gray-500 whitespace-nowrap">
                                                    {i + 1}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{c.nama}</div>
                                                    <div className="text-xs text-gray-500 font-mono">{c.nim}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm text-gray-900 max-w-[160px] truncate">{c.fakultas}</div>
                                                    <div className="text-xs text-gray-500 max-w-[160px] truncate">{c.program_studi}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-1.5 text-sm text-gray-900">
                                                        <Calendar size={14} className="text-gray-400" />
                                                        {formatDate(c.tanggal)}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`text-xl font-bold ${getSkorColor(c.skor_bdi)}`}>
                                                        {c.skor_bdi}
                                                    </span>
                                                    <span className="text-xs text-gray-400 ml-1">/ 63</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityBadge(c.kategori_bdi_en)}`}>
                                                        {c.kategori_bdi}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="font-mono text-sm text-gray-900">
                                                        {c.cf_percentage}%
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityBadge(cfKey)}`}>
                                                        {c.kategori_cf || '—'}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    {konsisten ? (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                            Ya
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                                                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                                            </svg>
                                                            Tidak
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={9} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center">
                                                <Brain className="h-12 w-12 text-gray-400 mb-4" />
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                    Tidak ada data ditemukan
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    Coba ubah filter atau kata kunci pencarian.
                                                </p>
                                                <button
                                                    onClick={handleReset}
                                                    className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                                                >
                                                    Reset Filter
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* ── Confusion Matrix ─────────────────────────────────────── */}
                <ConfusionMatrixSection consultations={consultations} total={total} />

                {/* ── Catatan Penelitian ───────────────────────────────────── */}
                <div className="bg-white rounded-lg shadow-sm border p-4">
                    <div className="flex items-start gap-3">
                        <Info className="text-amber-500 mt-0.5 flex-shrink-0" size={18} />
                        <p className="text-sm text-gray-700">
                            <span className="font-semibold text-gray-900">Catatan untuk Laporan Penelitian: </span>
                            Kolom <span className="font-medium">Konsisten</span> menunjukkan apakah kategori CF dan BDI-II berada di level yang sama.
                            Tingkat kesesuaian <span className="font-semibold text-purple-600">{tingkatKesesuaian}%</span> ({totalSesuai} dari {total} data)
                            dapat digunakan sebagai nilai konkordansi kedua metode dalam laporan penelitian.
                        </p>
                    </div>
                </div>

            </div>
        </AppLayout>
    );
}

// ============================================================================
// CONFUSION MATRIX COMPONENT
// Baris = CF (predicted), Kolom = BDI-II (ground truth)
// ============================================================================

const KATEGORI = ['minimal', 'ringan', 'sedang', 'berat'] as const;
type KategoriKey = typeof KATEGORI[number];

const KATEGORI_LABEL: Record<KategoriKey, string> = {
    minimal: 'Minimal',
    ringan:  'Ringan',
    sedang:  'Sedang',
    berat:   'Berat',
};

const KATEGORI_COLOR: Record<KategoriKey, string> = {
    minimal: 'text-green-700 bg-green-50',
    ringan:  'text-yellow-700 bg-yellow-50',
    sedang:  'text-orange-700 bg-orange-50',
    berat:   'text-red-700 bg-red-50',
};

function ConfusionMatrixSection({
    consultations,
    total,
}: {
    consultations: Consultation[];
    total: number;
}) {
    // Bangun matrix 4x4: matrix[cf][bdi] = count
    const matrix: Record<KategoriKey, Record<KategoriKey, number>> = {
        minimal: { minimal: 0, ringan: 0, sedang: 0, berat: 0 },
        ringan:  { minimal: 0, ringan: 0, sedang: 0, berat: 0 },
        sedang:  { minimal: 0, ringan: 0, sedang: 0, berat: 0 },
        berat:   { minimal: 0, ringan: 0, sedang: 0, berat: 0 },
    };

    consultations.forEach(c => {
        const cfKey  = normalizeCfKey(c.kategori_cf) as KategoriKey;
        const bdiKey = c.kategori_bdi_en as KategoriKey;
        if (matrix[cfKey] && matrix[cfKey][bdiKey] !== undefined) {
            matrix[cfKey][bdiKey]++;
        }
    });

    // Hitung metrik per kelas (BDI-II sebagai ground truth)
    // TP = matrix[k][k]
    // FP = sum of column k (BDI) minus TP  → CF salah prediksi sebagai k
    // FN = sum of row k (CF) minus TP      → CF prediksi k tapi BDI bukan k
    const metrics = KATEGORI.map(k => {
        const tp = matrix[k][k];
        const rowSum = KATEGORI.reduce((s, j) => s + matrix[k][j], 0); // total CF prediksi k
        const colSum = KATEGORI.reduce((s, i) => s + matrix[i][k], 0); // total BDI ground truth k
        const fp = rowSum - tp;
        const fn = colSum - tp;
        const tn = total - tp - fp - fn;

        const precision = (tp + fp) > 0 ? tp / (tp + fp) : 0;
        const recall    = (tp + fn) > 0 ? tp / (tp + fn) : 0;
        const f1        = (precision + recall) > 0
            ? 2 * precision * recall / (precision + recall)
            : 0;
        const accuracy  = total > 0 ? (tp + tn) / total : 0;

        return { k, tp, fp, fn, tn, precision, recall, f1, accuracy };
    });

    // Overall accuracy = total TP diagonal / total
    const totalTP   = KATEGORI.reduce((s, k) => s + matrix[k][k], 0);
    const overallAcc = total > 0 ? (totalTP / total) * 100 : 0;

    // Warna cell — diagonal hijau, off-diagonal merah jika ada isi
    const cellColor = (cfK: KategoriKey, bdiK: KategoriKey, count: number) => {
        if (cfK === bdiK) return count > 0 ? 'bg-green-100 text-green-800 font-bold' : 'bg-green-50 text-green-400';
        return count > 0 ? 'bg-red-50 text-red-700 font-semibold' : 'bg-white text-gray-300';
    };

    const pct = (n: number) => total > 0 ? ((n / total) * 100).toFixed(1) + '%' : '0%';
    const fmt = (n: number) => (n * 100).toFixed(1) + '%';

    return (
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b bg-gray-50 flex items-center justify-between">
                <div>
                    <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                        <BarChart3 size={18} className="text-gray-500" />
                        Confusion Matrix — CF vs BDI-II
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                        Baris = prediksi CF · Kolom = ground truth BDI-II · diagonal = prediksi benar
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-xs text-gray-500">Overall Accuracy</p>
                    <p className="text-2xl font-bold text-purple-600">{overallAcc.toFixed(1)}%</p>
                </div>
            </div>

            <div className="p-6 space-y-6">

                {/* Matrix Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm border-collapse">
                        <thead>
                            <tr>
                                <td className="p-2" />
                                <td
                                    colSpan={4}
                                    className="text-center text-xs font-bold text-gray-500 uppercase tracking-wide pb-2 border-b-2 border-blue-200"
                                >
                                    Ground Truth (BDI-II) →
                                </td>
                                <td className="p-2" />
                            </tr>
                            <tr>
                                <th className="p-2 text-xs font-bold text-gray-500 uppercase tracking-wide text-left">
                                    CF ↓
                                </th>
                                {KATEGORI.map(bdiK => (
                                    <th key={bdiK} className="p-3 text-center">
                                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${KATEGORI_COLOR[bdiK]}`}>
                                            {KATEGORI_LABEL[bdiK]}
                                        </span>
                                    </th>
                                ))}
                                <th className="p-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wide">
                                    Total CF
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {KATEGORI.map(cfK => {
                                const rowSum = KATEGORI.reduce((s, j) => s + matrix[cfK][j], 0);
                                return (
                                    <tr key={cfK} className="hover:bg-gray-50">
                                        <td className="p-3">
                                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${KATEGORI_COLOR[cfK]}`}>
                                                {KATEGORI_LABEL[cfK]}
                                            </span>
                                        </td>
                                        {KATEGORI.map(bdiK => {
                                            const count = matrix[cfK][bdiK];
                                            return (
                                                <td key={bdiK} className="p-3 text-center">
                                                    <div className={`rounded-lg py-2 px-3 ${cellColor(cfK, bdiK, count)}`}>
                                                        <div className="text-lg font-bold leading-none">{count}</div>
                                                        <div className="text-xs opacity-70 mt-0.5">{pct(count)}</div>
                                                    </div>
                                                </td>
                                            );
                                        })}
                                        <td className="p-3 text-center">
                                            <span className="text-sm font-semibold text-gray-600">{rowSum}</span>
                                            <div className="text-xs text-gray-400">{pct(rowSum)}</div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                        <tfoot>
                            <tr className="border-t-2 border-gray-200">
                                <td className="p-3 text-xs font-bold text-gray-500 uppercase">Total BDI</td>
                                {KATEGORI.map(bdiK => {
                                    const colSum = KATEGORI.reduce((s, i) => s + matrix[i][bdiK], 0);
                                    return (
                                        <td key={bdiK} className="p-3 text-center">
                                            <span className="text-sm font-semibold text-gray-600">{colSum}</span>
                                            <div className="text-xs text-gray-400">{pct(colSum)}</div>
                                        </td>
                                    );
                                })}
                                <td className="p-3 text-center">
                                    <span className="text-sm font-bold text-gray-900">{total}</span>
                                </td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                {/* Legend */}
                <div className="flex items-center gap-6 text-xs text-gray-500">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-green-100 border border-green-300" />
                        <span>Prediksi benar (diagonal)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-red-50 border border-red-200" />
                        <span>Prediksi salah (off-diagonal)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded bg-white border border-gray-200" />
                        <span>Tidak ada data</span>
                    </div>
                </div>

                {/* Per-class Metrics */}
                <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">
                        Metrik Per Kategori
                    </h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    {['Kategori', 'TP', 'FP', 'FN', 'TN', 'Precision', 'Recall', 'F1-Score', 'Accuracy'].map(h => (
                                        <th key={h} className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {metrics.map(({ k, tp, fp, fn, tn, precision, recall, f1, accuracy }) => (
                                    <tr key={k} className="hover:bg-gray-50">
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-semibold ${KATEGORI_COLOR[k]}`}>
                                                {KATEGORI_LABEL[k]}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-mono text-sm text-green-700 font-semibold">{tp}</td>
                                        <td className="px-4 py-3 font-mono text-sm text-red-600">{fp}</td>
                                        <td className="px-4 py-3 font-mono text-sm text-orange-600">{fn}</td>
                                        <td className="px-4 py-3 font-mono text-sm text-gray-600">{tn}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-gray-100 rounded-full h-1.5 w-16">
                                                    <div className="bg-blue-500 h-full rounded-full" style={{ width: `${precision * 100}%` }} />
                                                </div>
                                                <span className="font-mono text-xs text-gray-700 w-10">{fmt(precision)}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-gray-100 rounded-full h-1.5 w-16">
                                                    <div className="bg-indigo-500 h-full rounded-full" style={{ width: `${recall * 100}%` }} />
                                                </div>
                                                <span className="font-mono text-xs text-gray-700 w-10">{fmt(recall)}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-gray-100 rounded-full h-1.5 w-16">
                                                    <div className="bg-purple-500 h-full rounded-full" style={{ width: `${f1 * 100}%` }} />
                                                </div>
                                                <span className="font-mono text-xs text-gray-700 w-10">{fmt(f1)}</span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-1 bg-gray-100 rounded-full h-1.5 w-16">
                                                    <div className="bg-green-500 h-full rounded-full" style={{ width: `${accuracy * 100}%` }} />
                                                </div>
                                                <span className="font-mono text-xs text-gray-700 w-10">{fmt(accuracy)}</span>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            {/* Macro Average */}
                            <tfoot>
                                <tr className="border-t-2 border-gray-200 bg-gray-50">
                                    <td className="px-4 py-3 text-xs font-bold text-gray-700 uppercase">Macro Avg</td>
                                    <td className="px-4 py-3 font-mono text-sm font-bold text-green-700">{totalTP}</td>
                                    <td colSpan={3} />
                                    <td className="px-4 py-3 font-mono text-xs font-bold text-blue-700">
                                        {fmt(metrics.reduce((s, m) => s + m.precision, 0) / 4)}
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs font-bold text-indigo-700">
                                        {fmt(metrics.reduce((s, m) => s + m.recall, 0) / 4)}
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs font-bold text-purple-700">
                                        {fmt(metrics.reduce((s, m) => s + m.f1, 0) / 4)}
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs font-bold text-green-700">
                                        {overallAcc.toFixed(1)}%
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Interpretasi */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                    <p className="font-semibold text-blue-900 mb-1">Interpretasi untuk Laporan</p>
                    <p>
                        Confusion matrix di atas membandingkan prediksi metode <strong>Certainty Factor (CF)</strong> terhadap
                        ground truth <strong>BDI-II</strong>. Nilai diagonal menunjukkan prediksi yang tepat.
                        Overall accuracy sebesar <strong>{overallAcc.toFixed(1)}%</strong> menunjukkan tingkat kesesuaian kedua metode secara keseluruhan.
                        Macro-average F1-Score mencerminkan performa rata-rata CF dalam mengklasifikasikan semua kategori depresi.
                    </p>
                </div>

            </div>
        </div>
    );
}
