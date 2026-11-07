import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    Download,
    FileText,
    Calendar,
    TrendingUp,
    Users,
    Activity,
    BarChart3,
    PieChart,
    Filter,
    RefreshCw,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Printer,
    ArrowLeft,
    Eye
} from 'lucide-react';
import { useState, useEffect } from 'react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    LineChart,
    Line,
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    Area,
    AreaChart
} from 'recharts';

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
        title: 'Laporan',
        href: '/admin/riwayat-konsultasi/reports/generate',
    },
];

interface Mahasiswa {
    id_mahasiswa: number;
    nama: string;
    nim: string;
    fakultas: string;
    program_studi?: string;
    email: string;
    user?: {
        email: string;
    };
}

interface Diagnosa {
    id_diagnosa: number;
    nama_diagnosa: string;
    kode_diagnosa?: string;
}

interface RiwayatKonsultasi {
    id_konsultasi: number;
    id_mahasiswa: number;
    tanggal_konsultasi: string;
    hasil_diagnosa: string;
    tingkat_keparahan: string;
    nilai_cf: number | string;  // Allow both number and string
    rekomendasi: string;
    created_at: string;
    updated_at: string;
    mahasiswa: Mahasiswa;
    diagnosa?: Diagnosa;
}

interface Stats {
    total_konsultasi: number;
    rata_rata_cf: number | string;  // Allow both types
    cf_tertinggi: number | string;  // Allow both types
    cf_terendah: number | string;   // Allow both types
    diagnosa_per_kategori: Record<string, number>;
    tingkat_keparahan: Record<string, number>;
    konsultasi_per_bulan: Record<string, number>;
    mahasiswa_aktif: number;
    fakultas_distribution: Record<string, number>;
}

interface Period {
    start: string;
    end: string;
}

interface ReportProps {
    riwayat: RiwayatKonsultasi[];
    stats: Stats;
    period: Period;
}

// Helper function untuk format CF values
const formatCF = (value: any): string => {
    const num = parseFloat(value);
    return isNaN(num) ? '0.000' : num.toFixed(3);
};

// Helper function untuk format tanggal ke format yyyy-MM-dd
const formatDateForInput = (dateString: string): string => {
    if (!dateString) return '';

    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            // Fallback jika parsing gagal
            return new Date().toISOString().split('T')[0];
        }
        return date.toISOString().split('T')[0];
    } catch (error) {
        console.error('Error formatting date:', error);
        return new Date().toISOString().split('T')[0];
    }
};

export default function Report({ riwayat, stats, period }: ReportProps) {
    const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;
    const [selectedPeriod, setSelectedPeriod] = useState('custom');
    const [isLoading, setIsLoading] = useState(false);

    // Format tanggal dengan benar untuk input date
    const defaultStartDate = period.start
        ? formatDateForInput(period.start)
        : new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().split('T')[0];

    const defaultEndDate = period.end
        ? formatDateForInput(period.end)
        : new Date().toISOString().split('T')[0];

    const { data, setData, processing } = useForm({
        start_date: defaultStartDate,
        end_date: defaultEndDate,
    });

    // Chart colors
    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];
    const SEVERITY_COLORS = {
        'Minimal / Normal': '#10B981',
        'Depresi Ringan': '#F59E0B',
        'Depresi Sedang': '#F97316',
        'Depresi Berat': '#EF4444'
    };

    // Generate report with new date range
    const handleGenerateReport = () => {
        setIsLoading(true);
        router.get(route('admin.riwayat-konsultasi.report'), {
            start_date: data.start_date,
            end_date: data.end_date
        }, {
            preserveState: true,
            onFinish: () => setIsLoading(false),
            onError: (errors) => {
                console.error('Error generating report:', errors);
                setIsLoading(false);
            }
        });
    };

    // Set predefined periods
    const setPredefinedPeriod = (period: string) => {
        const now = new Date();
        let startDate = new Date();

        switch (period) {
            case 'today':
                startDate = new Date();
                break;
            case 'week':
                startDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(now.getMonth() - 1);
                break;
            case '3months':
                startDate.setMonth(now.getMonth() - 3);
                break;
            case '6months':
                startDate.setMonth(now.getMonth() - 6);
                break;
            case 'year':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
            default:
                return;
        }

        setSelectedPeriod(period);
        setData({
            start_date: startDate.toISOString().split('T')[0],
            end_date: now.toISOString().split('T')[0]
        });
    };

    // Prepare chart data
    const monthlyData = Object.entries(stats.konsultasi_per_bulan || {}).map(([month, count]) => ({
        month: new Date(month + '-01').toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }),
        konsultasi: count,
        originalMonth: month
    })).sort((a, b) => a.originalMonth.localeCompare(b.originalMonth));

    const severityData = Object.entries(stats.tingkat_keparahan || {}).map(([severity, count]) => ({
        name: severity,
        value: count,
        color: SEVERITY_COLORS[severity as keyof typeof SEVERITY_COLORS] || '#8884d8'
    }));

    const facultyData = Object.entries(stats.fakultas_distribution || {}).map(([faculty, count]) => ({
        name: faculty || 'Tidak Diketahui',
        value: count
    }));

    // Export functions
    const handleExportExcel = () => {
        try {
            const params = new URLSearchParams({
                tanggal_dari: data.start_date,
                tanggal_sampai: data.end_date
            }).toString();

            const url = `${route('admin.riwayat-konsultasi.export')}?${params}`;
            window.open(url, '_blank');
        } catch (error) {
            console.error('Error exporting Excel:', error);
            alert('Terjadi kesalahan saat export Excel');
        }
    };

    const handleExportPDF = () => {
        try {
            const params = new URLSearchParams({
                tanggal_dari: data.start_date,
                tanggal_sampai: data.end_date
            }).toString();

            const url = `${route('admin.riwayat-konsultasi.export.pdf')}?${params}`;
            window.open(url, '_blank');
        } catch (error) {
            console.error('Error exporting PDF:', error);
            alert('Terjadi kesalahan saat export PDF');
        }
    };

    const handlePrint = async () => {
    try {
        // 1. Fetch PDF sebagai blob
        const params = new URLSearchParams({
        tanggal_dari: data.start_date,
        tanggal_sampai: data.end_date,
        action: 'print' // Tambahkan parameter khusus
        });

        const response = await fetch(`${route('admin.riwayat-konsultasi.export.pdf')}?${params}`);
        const blob = await response.blob();

        // 2. Buat URL objek dari blob
        const pdfUrl = URL.createObjectURL(blob);

        // 3. Buat iframe tersembunyi
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.src = pdfUrl;

        document.body.appendChild(iframe);

        // 4. Ketika PDF siap, trigger print
        iframe.onload = () => {
        setTimeout(() => {
            iframe.contentWindow?.print();
            // Bersihkan memori setelah 10 detik
            setTimeout(() => {
            URL.revokeObjectURL(pdfUrl);
            iframe.remove();
            }, 10000);
        }, 500);
        };

    } catch (error) {
        console.error('Print error:', error);
        alert('Gagal memproses print');
    }
    };


    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Laporan Riwayat Konsultasi - Admin" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('admin.riwayat-konsultasi.index')}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                            <ArrowLeft size={20} />
                            Kembali
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Laporan Riwayat Konsultasi</h1>
                            <p className="text-gray-600 mt-1">
                                Periode: {new Date(data.start_date).toLocaleDateString('id-ID')} - {new Date(data.end_date).toLocaleDateString('id-ID')}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            <Printer size={18} />
                            Print
                        </button>
                        <button
                            onClick={handleExportPDF}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            <FileText size={18} />
                            Export PDF
                        </button>
                        <button
                            onClick={handleExportExcel}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            <Download size={18} />
                            Export Excel
                        </button>
                    </div>
                </div>

                {/* Flash Messages */}
                {flash?.error && (
                    <Alert variant="destructive">
                        <AlertDescription>{flash.error}</AlertDescription>
                    </Alert>
                )}

                {flash?.success && (
                    <Alert>
                        <AlertDescription>{flash.success}</AlertDescription>
                    </Alert>
                )}

                {/* Period Selection */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center gap-4 mb-4">
                        <h2 className="text-lg font-semibold text-gray-900">Filter Periode</h2>
                        <div className="flex items-center gap-2 flex-wrap">
                            {[
                                { key: 'today', label: 'Hari Ini' },
                                { key: 'week', label: '1 Minggu' },
                                { key: 'month', label: '1 Bulan' },
                                { key: '3months', label: '3 Bulan' },
                                { key: '6months', label: '6 Bulan' },
                                { key: 'year', label: '1 Tahun' }
                            ].map((periodOption) => (
                                <button
                                    key={periodOption.key}
                                    onClick={() => setPredefinedPeriod(periodOption.key)}
                                    className={`px-3 py-1 text-sm rounded-md transition-colors ${
                                        selectedPeriod === periodOption.key
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {periodOption.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Mulai</label>
                            <Input
                                type="date"
                                value={data.start_date}
                                onChange={(e) => {
                                    setData('start_date', e.target.value);
                                    setSelectedPeriod('custom');
                                }}
                                className="w-full"
                                max={data.end_date}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal Selesai</label>
                            <Input
                                type="date"
                                value={data.end_date}
                                onChange={(e) => {
                                    setData('end_date', e.target.value);
                                    setSelectedPeriod('custom');
                                }}
                                className="w-full"
                                min={data.start_date}
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                onClick={handleGenerateReport}
                                disabled={isLoading || processing}
                                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {isLoading ? (
                                    <RefreshCw size={18} className="animate-spin" />
                                ) : (
                                    <TrendingUp size={18} />
                                )}
                                Generate Laporan
                            </button>
                        </div>
                    </div>
                </div>

                {/* Summary Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Konsultasi</p>
                                <p className="text-3xl font-bold text-blue-600">{stats.total_konsultasi || 0}</p>
                            </div>
                            <Activity className="text-blue-500" size={32} />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Mahasiswa Aktif</p>
                                <p className="text-3xl font-bold text-green-600">{stats.mahasiswa_aktif || 0}</p>
                            </div>
                            <Users className="text-green-500" size={32} />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Rata-rata CF</p>
                                <p className="text-3xl font-bold text-purple-600">{formatCF(stats.rata_rata_cf)}</p>
                            </div>
                            <TrendingUp className="text-purple-500" size={32} />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">CF Tertinggi</p>
                                <p className="text-3xl font-bold text-orange-600">{formatCF(stats.cf_tertinggi)}</p>
                            </div>
                            <AlertTriangle className="text-orange-500" size={32} />
                        </div>
                    </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Monthly Consultation Trend */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <BarChart3 className="text-blue-500" size={20} />
                            Tren Konsultasi Bulanan
                        </h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="month" />
                                    <YAxis />
                                    <Tooltip />
                                    <Area
                                        type="monotone"
                                        dataKey="konsultasi"
                                        stroke="#3B82F6"
                                        fill="#93C5FD"
                                        fillOpacity={0.3}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Severity Distribution */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <PieChart className="text-green-500" size={20} />
                            Distribusi Tingkat Keparahan
                        </h3>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsPieChart>
                                    <Pie
                                        dataKey="value"
                                        data={severityData}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        label={({ name, value, percent }) =>
                                            `${name}: ${value} (${(percent * 100).toFixed(1)}%)`
                                        }
                                    >
                                        {severityData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </RechartsPieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Faculty Distribution Chart - Now takes full width */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Users className="text-orange-500" size={20} />
                        Distribusi per Fakultas
                    </h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={facultyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="value" fill="#F59E0B" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Detailed Statistics Table */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistik Detail</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                            <h4 className="font-medium text-gray-800 mb-3">Tingkat Keparahan</h4>
                            <div className="space-y-2">
                                {Object.entries(stats.tingkat_keparahan || {}).map(([severity, count]) => (
                                    <div key={severity} className="flex justify-between items-center">
                                        <span className="text-sm text-gray-600">{severity}</span>
                                        <span className="font-semibold text-gray-900">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h4 className="font-medium text-gray-800 mb-3">Nilai CF</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Rata-rata</span>
                                    <span className="font-semibold text-gray-900">{formatCF(stats.rata_rata_cf)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Tertinggi</span>
                                    <span className="font-semibold text-gray-900">{formatCF(stats.cf_tertinggi)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Terendah</span>
                                    <span className="font-semibold text-gray-900">{formatCF(stats.cf_terendah)}</span>
                                </div>
                            </div>
                        </div>

                        <div>
                            <h4 className="font-medium text-gray-800 mb-3">Ringkasan</h4>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Total Konsultasi</span>
                                    <span className="font-semibold text-gray-900">{stats.total_konsultasi || 0}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Mahasiswa Aktif</span>
                                    <span className="font-semibold text-gray-900">{stats.mahasiswa_aktif || 0}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Rata-rata per Mahasiswa</span>
                                    <span className="font-semibold text-gray-900">
                                        {(stats.mahasiswa_aktif && stats.mahasiswa_aktif > 0) ? ((stats.total_konsultasi || 0) / stats.mahasiswa_aktif).toFixed(1) : '0.0'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Consultations */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Konsultasi Terbaru (10 Terakhir)</h3>
                        <Link
                            href={route('admin.riwayat-konsultasi.index')}
                            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                        >
                            Lihat Semua →
                        </Link>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mahasiswa</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Hasil Diagnosis</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tingkat</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">CF</th>
                                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {riwayat.slice(0, 10).map((konsultasi) => (
                                    <tr key={konsultasi.id_konsultasi} className="hover:bg-gray-50">
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            {new Date(konsultasi.tanggal_konsultasi).toLocaleDateString('id-ID')}
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            <div>
                                                <div className="font-medium">{konsultasi.mahasiswa.nama}</div>
                                                <div className="text-gray-500 text-xs">{konsultasi.mahasiswa.nim}</div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900">
                                            {konsultasi.hasil_diagnosa.length > 50
                                                ? konsultasi.hasil_diagnosa.substring(0, 50) + '...'
                                                : konsultasi.hasil_diagnosa
                                            }
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                konsultasi.tingkat_keparahan === 'Minimal / Normal' ? 'bg-green-100 text-green-800' :
                                                konsultasi.tingkat_keparahan === 'Depresi Ringan' ? 'bg-yellow-100 text-yellow-800' :
                                                konsultasi.tingkat_keparahan === 'Depresi Sedang' ? 'bg-orange-100 text-orange-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {konsultasi.tingkat_keparahan}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                                            {formatCF(konsultasi.nilai_cf)}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <Link
                                                href={route('admin.riwayat-konsultasi.show', konsultasi.id_konsultasi)}
                                                className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 transition-colors"
                                                title="Lihat Detail"
                                            >
                                                <Eye size={14} />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                                {riwayat.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                                            Tidak ada data konsultasi pada periode ini
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-white rounded-lg shadow-sm border p-4">
                    <div className="text-center text-sm text-gray-500">
                        Laporan dihasilkan pada: {new Date().toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            timeZoneName: 'short'
                        })}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
