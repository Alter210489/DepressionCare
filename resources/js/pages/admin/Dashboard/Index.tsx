import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@headlessui/react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    Users,
    BookOpen,
    Activity,
    TrendingUp,
    TrendingDown,
    AlertTriangle,
    Calendar,
    Clock,
    Filter,
    Download,
    RefreshCw,
    Settings,
    Database,
    X,
    Eye,
    BarChart3,
    PieChart,
    LineChart,
    UserPlus,
    FileText,
    Shield,
    History,
    Heart,
    Brain,
    AlertCircle
} from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
];

interface StatCard {
    value: number;
    change?: number;
    trend?: 'up' | 'down';
    percentage?: number;
    formatted?: string;
}

interface DiagnosaDistribution {
    hasil_diagnosa: string;
    total: number;
}

interface RecentActivity {
    type: 'konsultasi' | 'mahasiswa_baru';
    message: string;
    result?: string;
    name?: string;
    nim?: string;
    timestamp: string;
    cf_value?: number;
}

interface ChartDataPoint {
    date: string;
    total?: number;
    avg_cf?: number;
}

interface TopGejala {
    nama_gejala: string;
    frequency: number;
}

interface Statistics {
    total_mahasiswa: StatCard;
    total_konsultasi: StatCard;
    mahasiswa_aktif: StatCard;
    rata_rata_cf: StatCard;
    total_gejala: number;
    total_diagnosa: number;
    total_aturan: number;
    distribusi_diagnosa: DiagnosaDistribution[];
}

interface ChartData {
    konsultasi_trend: ChartDataPoint[];
    diagnosa_distribution: DiagnosaDistribution[];
    cf_trend: ChartDataPoint[];
    top_gejala: TopGejala[];
    period: string;
}

interface SystemStatus {
    database_status: string;
    storage_usage: {
        used: string;
        total: string;
        percentage: number;
    };
    last_backup: {
        date: string;
        size: string;
        status: string;
    };
    system_uptime: string;
}

interface IndexProps {
    stats: Statistics;
    recent_activity: RecentActivity[];
    chart_data: ChartData;
    system_status: SystemStatus;
}

export default function AdminDashboardIndex({
    stats,
    recent_activity,
    chart_data,
    system_status
}: IndexProps) {
    const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;
    const flashMessage = flash?.success || flash?.error;
    const [showAlert, setShowAlert] = useState(flash?.success || flash?.error ? true : false);
    const [selectedPeriod, setSelectedPeriod] = useState(chart_data.period || '30days');
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        if (flashMessage) {
            const timer = setTimeout(() => setShowAlert(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [flashMessage]);

    const { data, setData } = useForm({
        period: selectedPeriod,
    });

    // Handle Period Change
    const handlePeriodChange = (period: string) => {
        setSelectedPeriod(period);
        setData('period', period);

        router.get(route('admin.dashboard'), { period }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Refresh Dashboard Data
    const handleRefresh = () => {
        setIsRefreshing(true);
        router.reload({
            onFinish: () => setIsRefreshing(false),
        });
    };

    // Export Dashboard Report
    const handleExport = () => {
        const queryString = {
            period: selectedPeriod,
            export: 'dashboard_report',
        };

        const params = new URLSearchParams(queryString).toString();
        window.open(`${route('admin.statistics')}?${params}`, '_blank');
    };

    // Get trend icon and color
    const getTrendIcon = (trend?: 'up' | 'down') => {
        if (trend === 'up') {
            return <TrendingUp className="h-4 w-4 text-green-500" />;
        } else if (trend === 'down') {
            return <TrendingDown className="h-4 w-4 text-red-500" />;
        }
        return null;
    };

    // Get status color
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'online':
            case 'success':
                return 'text-green-600';
            case 'offline':
            case 'error':
                return 'text-red-600';
            case 'warning':
                return 'text-yellow-600';
            default:
                return 'text-gray-600';
        }
    };

    // Get severity badge color for diagnosis
    const getSeverityBadgeColor = (diagnosis: string) => {
        if (diagnosis.toLowerCase().includes('normal') || diagnosis.toLowerCase().includes('minimal')) {
            return 'bg-green-100 text-green-800';
        } else if (diagnosis.toLowerCase().includes('ringan')) {
            return 'bg-yellow-100 text-yellow-800';
        } else if (diagnosis.toLowerCase().includes('sedang')) {
            return 'bg-orange-100 text-orange-800';
        } else if (diagnosis.toLowerCase().includes('berat')) {
            return 'bg-red-100 text-red-800';
        }
        return 'bg-gray-100 text-gray-800';
    };

    // Format number with locale
    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('id-ID').format(num);
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard - Admin" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard Admin</h1>
                        <p className="text-gray-600 mt-1">Selamat datang di panel administrasi sistem diagnosa depresi</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* <Button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg disabled:opacity-50"
                        >
                            <RefreshCw size={18} className={isRefreshing ? 'animate-spin' : ''} />
                            Refresh
                        </Button>
                        <Button
                            onClick={handleExport}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                        >
                            <Download size={18} />
                            Export Laporan
                        </Button> */}
                    </div>
                </div>

                {/* Flash Messages */}
                {showAlert && flashMessage && (
                    <Alert
                        variant="default"
                        className={`${
                            flash?.success
                                ? 'bg-green-50 border-green-200 text-green-800'
                                : 'bg-red-50 border-red-200 text-red-800'
                        } transition-all duration-300`}
                    >
                        <AlertDescription className="font-medium">
                            {flashMessage}
                        </AlertDescription>
                        <Button
                            onClick={() => setShowAlert(false)}
                            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
                        >
                            <X size={16} />
                        </Button>
                    </Alert>
                )}

                {/* Period Filter
                <div className="bg-white rounded-lg shadow-sm border p-4">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium text-gray-900">Filter Periode</h3>
                        <div className="flex items-center gap-2">
                            {['7days', '30days', '6months', '1year'].map((period) => (
                                <Button
                                    key={period}
                                    onClick={() => handlePeriodChange(period)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium ${
                                        selectedPeriod === period
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    {period === '7days' && '7 Hari'}
                                    {period === '30days' && '30 Hari'}
                                    {period === '6months' && '6 Bulan'}
                                    {period === '1year' && '1 Tahun'}
                                </Button>
                            ))}
                        </div>
                    </div>
                </div> */}

                {/* Main Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Mahasiswa</p>
                                <p className="text-3xl font-bold text-blue-600">{formatNumber(stats.total_mahasiswa.value)}</p>
                                {stats.total_mahasiswa.change !== undefined && (
                                    <div className="flex items-center gap-1 mt-1">
                                        {getTrendIcon(stats.total_mahasiswa.trend)}
                                        <span className={`text-sm ${
                                            stats.total_mahasiswa.trend === 'up' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {stats.total_mahasiswa.change > 0 ? '+' : ''}{stats.total_mahasiswa.change}%
                                        </span>
                                    </div>
                                )}
                            </div>
                            <Users className="text-blue-500" size={32} />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Konsultasi</p>
                                <p className="text-3xl font-bold text-green-600">{formatNumber(stats.total_konsultasi.value)}</p>
                                {stats.total_konsultasi.change !== undefined && (
                                    <div className="flex items-center gap-1 mt-1">
                                        {getTrendIcon(stats.total_konsultasi.trend)}
                                        <span className={`text-sm ${
                                            stats.total_konsultasi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                            {stats.total_konsultasi.change > 0 ? '+' : ''}{stats.total_konsultasi.change}%
                                        </span>
                                    </div>
                                )}
                            </div>
                            <BookOpen className="text-green-500" size={32} />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Mahasiswa Aktif</p>
                                <p className="text-3xl font-bold text-purple-600">{formatNumber(stats.mahasiswa_aktif.value)}</p>
                                {stats.mahasiswa_aktif.percentage !== undefined && (
                                    <p className="text-sm text-gray-500 mt-1">
                                        {stats.mahasiswa_aktif.percentage}% dari total
                                    </p>
                                )}
                            </div>
                            <Activity className="text-purple-500" size={32} />
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Rata-rata CF</p>
                                <p className="text-3xl font-bold text-orange-600">{stats.rata_rata_cf.formatted || '0%'}</p>
                                <p className="text-sm text-gray-500 mt-1">Tingkat kepercayaan</p>
                            </div>
                            <Brain className="text-orange-500" size={32} />
                        </div>
                    </div>
                </div>

                {/* System Overview Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Data Master</h3>
                            <Database className="text-gray-500" size={24} />
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Total Gejala</span>
                                <span className="font-medium">{formatNumber(stats.total_gejala)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Total Diagnosa</span>
                                <span className="font-medium">{formatNumber(stats.total_diagnosa)}</span>
                            </div>
                        </div>
                        <Link
                            href={route('admin.gejala.index')}
                            className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Kelola Data Master →
                        </Link>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Status Sistem</h3>
                            <Shield className={`${getStatusColor(system_status.database_status)}`} size={24} />
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Database</span>
                                <span className={`font-medium ${getStatusColor(system_status.database_status)}`}>
                                    {system_status.database_status === 'online' ? 'Online' : 'Offline'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Storage</span>
                                <span className="font-medium">{system_status.storage_usage.percentage}%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Uptime</span>
                                <span className="font-medium text-green-600">{system_status.system_uptime}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Backup Terakhir</h3>
                            <History className={`${getStatusColor(system_status.last_backup.status)}`} size={24} />
                        </div>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Tanggal</span>
                                <span className="font-medium">{formatDate(system_status.last_backup.date)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Ukuran</span>
                                <span className="font-medium">{system_status.last_backup.size}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Status</span>
                                <span className={`font-medium ${getStatusColor(system_status.last_backup.status)}`}>
                                    {system_status.last_backup.status === 'success' ? 'Berhasil' : 'Gagal'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Charts and Analytics */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Diagnosis Distribution */}
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Distribusi Diagnosa</h3>
                            <PieChart className="text-gray-500" size={24} />
                        </div>
                        <div className="space-y-3">
                            {stats.distribusi_diagnosa.slice(0, 5).map((item, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityBadgeColor(item.hasil_diagnosa)}`}>
                                            {item.hasil_diagnosa}
                                        </span>
                                    </div>
                                    <span className="font-medium">{formatNumber(item.total)}</span>
                                </div>
                            ))}
                        </div>
                        <Link
                            href={route('admin.riwayat-konsultasi.index')}
                            className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Lihat Semua Riwayat →
                        </Link>
                    </div>

                    {/* Top Symptoms */}
                    {/* <div className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-medium text-gray-900">Gejala Tersering</h3>
                            <BarChart3 className="text-gray-500" size={24} />
                        </div>
                        <div className="space-y-3">
                            {chart_data.top_gejala.slice(0, 5).map((item, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <span className="text-sm text-gray-700 flex-1">{item.nama_gejala}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-20 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{
                                                    width: `${Math.min((item.frequency / Math.max(...chart_data.top_gejala.map(g => g.frequency))) * 100, 100)}%`
                                                }}
                                            ></div>
                                        </div>
                                        <span className="text-sm font-medium w-8">{item.frequency}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Link
                            href={route('admin.gejala.index')}
                            className="mt-4 text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                            Kelola Gejala →
                        </Link>
                    </div> */}
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow-sm border">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-medium text-gray-900">Aktivitas Terbaru</h3>
                            <Activity className="text-gray-500" size={24} />
                        </div>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {recent_activity.length > 0 ? (
                            recent_activity.slice(0, 10).map((activity, index) => (
                                <div key={index} className="p-6 hover:bg-gray-50">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-start gap-3">
                                            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                                                activity.type === 'konsultasi' ? 'bg-blue-100' : 'bg-green-100'
                                            }`}>
                                                {activity.type === 'konsultasi' ? (
                                                    <BookOpen className={`w-4 h-4 ${
                                                        activity.type === 'konsultasi' ? 'text-blue-600' : 'text-green-600'
                                                    }`} />
                                                ) : (
                                                    <UserPlus className="w-4 h-4 text-green-600" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                                                {activity.result && (
                                                    <p className="text-xs text-gray-500 mt-1">Hasil: {activity.result}</p>
                                                )}
                                                {activity.name && activity.nim && (
                                                    <p className="text-xs text-gray-500 mt-1">{activity.name} ({activity.nim})</p>
                                                )}
                                                {activity.cf_value && (
                                                    <p className="text-xs text-gray-500 mt-1">CF: {(activity.cf_value * 100).toFixed(1)}%</p>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-xs text-gray-500 flex-shrink-0">
                                            {formatDate(activity.timestamp)}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-12 text-center">
                                <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada aktivitas</h3>
                                <p className="text-gray-500">Aktivitas terbaru akan muncul di sini</p>
                            </div>
                        )}
                    </div>
                    {recent_activity.length > 10 && (
                        <div className="p-4 border-t border-gray-200 text-center">
                            <Button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                                Lihat Semua Aktivitas
                            </Button>
                        </div>
                    )}
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Aksi Cepat</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <Link
                            href={route('admin.mahasiswa.create')}
                            className="flex items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <UserPlus className="text-blue-600" size={20} />
                            <span className="text-sm font-medium">Tambah Mahasiswa</span>
                        </Link>
                        <Link
                            href={route('admin.gejala.create')}
                            className="flex items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <Heart className="text-red-600" size={20} />
                            <span className="text-sm font-medium">Tambah Gejala</span>
                        </Link>
                        <Link
                            href={route('admin.diagnosa.create')}
                            className="flex items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <Brain className="text-purple-600" size={20} />
                            <span className="text-sm font-medium">Tambah Diagnosa</span>
                        </Link>
                        <Link
                            href={route('admin.riwayat-konsultasi.report')}
                            className="flex items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <FileText className="text-green-600" size={20} />
                            <span className="text-sm font-medium">Buat Laporan</span>
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
