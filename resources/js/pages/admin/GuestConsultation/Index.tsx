import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@headlessui/react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    Eye,
    Search,
    Trash2,
    X,
    Filter,
    Download,
    FileText,
    History,
    UserCheck,
    Calendar,
    Activity,
    TrendingUp,
    AlertTriangle,
    BarChart3
} from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
    {
        title: 'Konsultasi Guest',
        href: '/admin/guest-consultation',
    },
];

interface LinkProps {
    active: boolean;
    label: string;
    url: string;
}

interface Diagnosa {
    id_diagnosa: number;
    nama_diagnosa: string;
    kode_diagnosa: string;
}

interface GuestConsultation {
    id_guestconsultation: number;
    session_id: string;
    nama: string;
    email: string;
    nim?: string;
    fakultas?: string;
    program_studi?: string;
    umur: number;
    jenis_kelamin: 'Laki-laki' | 'Perempuan';
    hasil_diagnosa: string;
    tingkat_keparahan: string;
    nilai_cf: number;
    rekomendasi: string | object;
    created_at: string;
    updated_at: string;
    diagnosa?: Diagnosa;
}

interface GuestConsultationPagination {
    data: GuestConsultation[];
    links: LinkProps[];
    from: number;
    to: number;
    total: number;
    current_page: number;
    last_page: number;
    per_page: number;
}

interface FilterProps {
    search: string;
    perPage: string;
    sortBy: string;
    sortOrder: string;
    tingkat_keparahan: string;
    fakultas: string;
    jenis_kelamin: string;
    tanggal_dari: string;
    tanggal_sampai: string;
}

interface IndexProps {
    guestConsultations: GuestConsultationPagination;
    statistics: {
        totalKonsultasi: number;
        konsultasiHariIni: number;
        konsultasiBulanIni: number;
        rataRataCf: number;
        cfTertinggi: number;
        cfTerendah: number;
        tingkatKeparahan: {
            normal: number;
            ringan: number;
            sedang: number;
            berat: number;
        };
        fakultasDistribution: { [key: string]: number };
    };
    fakultasList: string[];
    tingkatKeparahanList: string[];
    filters: FilterProps;
}

export default function GuestConsultationIndex({
    guestConsultations,
    statistics,
    fakultasList = [],
    tingkatKeparahanList = [],
    filters
}: IndexProps) {
    const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;
    const flashMessage = flash?.success || flash?.error;
    const [showAlert, setShowAlert] = useState(flash?.success || flash?.error ? true : false);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        if (flashMessage) {
            const timer = setTimeout(() => setShowAlert(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [flashMessage]);

    const { data, setData } = useForm({
        search: filters.search || '',
        perPage: filters.perPage || '10',
        sortBy: filters.sortBy || 'created_at',
        sortOrder: filters.sortOrder || 'desc',
        tingkat_keparahan: filters.tingkat_keparahan || '',
        fakultas: filters.fakultas || '',
        jenis_kelamin: filters.jenis_kelamin || '',
        tanggal_dari: filters.tanggal_dari || '',
        tanggal_sampai: filters.tanggal_sampai || '',
    });

    // Handle Search Input Change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setData('search', value);

        // Debounce search
        const timer = setTimeout(() => {
            performSearch(value);
        }, 300);

        return () => clearTimeout(timer);
    };

    // Perform Search
    const performSearch = (searchValue: string) => {
        const queryString = {
            ...(searchValue && { search: searchValue }),
            ...(data.tingkat_keparahan && { tingkat_keparahan: data.tingkat_keparahan }),
            ...(data.fakultas && { fakultas: data.fakultas }),
            ...(data.jenis_kelamin && { jenis_kelamin: data.jenis_kelamin }),
            ...(data.tanggal_dari && { tanggal_dari: data.tanggal_dari }),
            ...(data.tanggal_sampai && { tanggal_sampai: data.tanggal_sampai }),
            perPage: data.perPage,
            sortBy: data.sortBy,
            sortOrder: data.sortOrder,
        };

        router.get(route('admin.guest-consultation.index'), queryString, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Handle Filter Change
    const handleFilterChange = (key: string, value: string) => {
        setData(key as any, value);

        const queryString = {
            ...(data.search && { search: data.search }),
            ...(key === 'tingkat_keparahan' ? { tingkat_keparahan: value } : data.tingkat_keparahan && { tingkat_keparahan: data.tingkat_keparahan }),
            ...(key === 'fakultas' ? { fakultas: value } : data.fakultas && { fakultas: data.fakultas }),
            ...(key === 'jenis_kelamin' ? { jenis_kelamin: value } : data.jenis_kelamin && { jenis_kelamin: data.jenis_kelamin }),
            ...(key === 'tanggal_dari' ? { tanggal_dari: value } : data.tanggal_dari && { tanggal_dari: data.tanggal_dari }),
            ...(key === 'tanggal_sampai' ? { tanggal_sampai: value } : data.tanggal_sampai && { tanggal_sampai: data.tanggal_sampai }),
            perPage: data.perPage,
            sortBy: data.sortBy,
            sortOrder: data.sortOrder,
        };

        router.get(route('admin.guest-consultation.index'), queryString, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Reset All Filters
    const handleReset = () => {
        setData({
            search: '',
            perPage: '10',
            sortBy: 'created_at',
            sortOrder: 'desc',
            tingkat_keparahan: '',
            fakultas: '',
            jenis_kelamin: '',
            tanggal_dari: '',
            tanggal_sampai: '',
        });

        router.get(route('admin.guest-consultation.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Handle Per Page Change
    const handlePerPageChange = (value: string) => {
        setData('perPage', value);

        const queryString = {
            ...(data.search && { search: data.search }),
            ...(data.tingkat_keparahan && { tingkat_keparahan: data.tingkat_keparahan }),
            ...(data.fakultas && { fakultas: data.fakultas }),
            ...(data.jenis_kelamin && { jenis_kelamin: data.jenis_kelamin }),
            ...(data.tanggal_dari && { tanggal_dari: data.tanggal_dari }),
            ...(data.tanggal_sampai && { tanggal_sampai: data.tanggal_sampai }),
            perPage: value,
            sortBy: data.sortBy,
            sortOrder: data.sortOrder,
        };

        router.get(route('admin.guest-consultation.index'), queryString, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Handle Sort Change
    const handleSort = (column: string) => {
        const newSortOrder = data.sortBy === column && data.sortOrder === 'asc' ? 'desc' : 'asc';

        setData('sortBy', column);
        setData('sortOrder', newSortOrder);

        const queryString = {
            ...(data.search && { search: data.search }),
            ...(data.tingkat_keparahan && { tingkat_keparahan: data.tingkat_keparahan }),
            ...(data.fakultas && { fakultas: data.fakultas }),
            ...(data.jenis_kelamin && { jenis_kelamin: data.jenis_kelamin }),
            ...(data.tanggal_dari && { tanggal_dari: data.tanggal_dari }),
            ...(data.tanggal_sampai && { tanggal_sampai: data.tanggal_sampai }),
            perPage: data.perPage,
            sortBy: column,
            sortOrder: newSortOrder,
        };

        router.get(route('admin.guest-consultation.index'), queryString, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Handle Delete with Confirmation
    const handleDelete = (consultation: GuestConsultation) => {
        if (confirm(`Apakah Anda yakin ingin menghapus konsultasi guest "${consultation.nama}" pada tanggal ${new Date(consultation.created_at).toLocaleDateString('id-ID')}?`)) {
            router.delete(route('admin.guest-consultation.destroy', consultation.id_guestconsultation), {
                preserveScroll: true,
                onSuccess: () => {
                    // Success message will be handled by flash message
                },
                onError: (errors) => {
                    console.error('Delete error:', errors);
                }
            });
        }
    };

    // Export Data
    const handleExport = () => {
        const queryString = {
            ...(data.search && { search: data.search }),
            ...(data.tingkat_keparahan && { tingkat_keparahan: data.tingkat_keparahan }),
            ...(data.fakultas && { fakultas: data.fakultas }),
            ...(data.jenis_kelamin && { jenis_kelamin: data.jenis_kelamin }),
            ...(data.tanggal_dari && { tanggal_dari: data.tanggal_dari }),
            ...(data.tanggal_sampai && { tanggal_sampai: data.tanggal_sampai }),
        };

        const params = new URLSearchParams(queryString).toString();
        window.open(`${route('admin.guest-consultation.export')}?${params}`, '_blank');
    };

    // Export PDF
    const handleExportPdf = () => {
        const queryString = {
            ...(data.search && { search: data.search }),
            ...(data.tingkat_keparahan && { tingkat_keparahan: data.tingkat_keparahan }),
            ...(data.fakultas && { fakultas: data.fakultas }),
            ...(data.jenis_kelamin && { jenis_kelamin: data.jenis_kelamin }),
            ...(data.tanggal_dari && { tanggal_dari: data.tanggal_dari }),
            ...(data.tanggal_sampai && { tanggal_sampai: data.tanggal_sampai }),
        };

        const params = new URLSearchParams(queryString).toString();
        window.open(`${route('admin.guest-consultation.export-pdf')}?${params}`, '_blank');
    };

    // Get Sort Icon
    const getSortIcon = (column: string) => {
        if (data.sortBy !== column) return '↕️';
        return data.sortOrder === 'asc' ? '↑' : '↓';
    };

    // Get Severity Badge Color
    const getSeverityBadgeColor = (tingkat: string) => {
        const lowerTingkat = tingkat.toLowerCase();
        if (lowerTingkat.includes('normal') || lowerTingkat.includes('minimal')) {
            return 'bg-green-100 text-green-800';
        } else if (lowerTingkat.includes('ringan') || lowerTingkat.includes('mild')) {
            return 'bg-yellow-100 text-yellow-800';
        } else if (lowerTingkat.includes('sedang') || lowerTingkat.includes('moderate')) {
            return 'bg-orange-100 text-orange-800';
        } else if (lowerTingkat.includes('berat') || lowerTingkat.includes('severe')) {
            return 'bg-red-100 text-red-800';
        }
        return 'bg-gray-100 text-gray-800';
    };

    // Truncate text helper
    const truncateText = (text: string, maxLength: number = 100) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Konsultasi Guest - Admin" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Konsultasi Guest</h1>
                        <p className="text-gray-600 mt-1">Kelola dan pantau konsultasi dari guest/pengunjung</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button
                            onClick={handleExportPdf}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                        >
                            <FileText size={18} />
                            Export PDF
                        </Button>
                        <Button
                            onClick={handleExport}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                        >
                            <Download size={18} />
                            Export Excel
                        </Button>
                        <Link
                            href={route('admin.guest-consultation.report')}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                        >
                            <TrendingUp size={18} />
                            Laporan
                        </Link>
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

                {/* Search and Filter Section */}
                <div className="bg-white rounded-lg shadow-sm border p-4">
                    <div className="flex items-center gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                                <Input
                                    type="text"
                                    value={data.search}
                                    onChange={handleSearchChange}
                                    className="pl-10 h-10"
                                    placeholder="Cari berdasarkan nama, email, NIM, atau hasil diagnosis..."
                                />
                            </div>
                        </div>

                        <Button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
                        >
                            <Filter size={18} />
                            Filter
                        </Button>

                        <Button
                            onClick={handleReset}
                            className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg"
                        >
                            <X size={18} />
                            Reset
                        </Button>
                    </div>

                    {/* Advanced Filters */}
                    {showFilters && (
                        <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tingkat Keparahan
                                </label>
                                <select
                                    value={data.tingkat_keparahan}
                                    onChange={(e) => handleFilterChange('tingkat_keparahan', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                >
                                    <option value="">Semua</option>
                                    {tingkatKeparahanList.map((tingkat) => (
                                        <option key={tingkat} value={tingkat}>
                                            {tingkat}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fakultas
                                </label>
                                <select
                                    value={data.fakultas}
                                    onChange={(e) => handleFilterChange('fakultas', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                >
                                    <option value="">Semua Fakultas</option>
                                    {fakultasList.map((fakultas) => (
                                        <option key={fakultas} value={fakultas}>
                                            {fakultas}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Jenis Kelamin
                                </label>
                                <select
                                    value={data.jenis_kelamin}
                                    onChange={(e) => handleFilterChange('jenis_kelamin', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                >
                                    <option value="">Semua</option>
                                    <option value="Laki-laki">Laki-laki</option>
                                    <option value="Perempuan">Perempuan</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Entries per page
                                </label>
                                <select
                                    value={data.perPage}
                                    onChange={(e) => handlePerPageChange(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                >
                                    <option value="5">5</option>
                                    <option value="10">10</option>
                                    <option value="25">25</option>
                                    <option value="50">50</option>
                                    <option value="100">100</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tanggal Dari
                                </label>
                                <input
                                    type="date"
                                    value={data.tanggal_dari}
                                    onChange={(e) => handleFilterChange('tanggal_dari', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tanggal Sampai
                                </label>
                                <input
                                    type="date"
                                    value={data.tanggal_sampai}
                                    onChange={(e) => handleFilterChange('tanggal_sampai', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Sort by
                                </label>
                                <select
                                    value={data.sortBy}
                                    onChange={(e) => handleSort(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                >
                                    <option value="created_at">Tanggal Dibuat</option>
                                    <option value="nama">Nama</option>
                                    <option value="email">Email</option>
                                    <option value="hasil_diagnosa">Hasil Diagnosa</option>
                                    <option value="nilai_cf">Nilai CF</option>
                                    <option value="tingkat_keparahan">Tingkat Keparahan</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Sort order
                                </label>
                                <select
                                    value={data.sortOrder}
                                    onChange={(e) => setData('sortOrder', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                >
                                    <option value="desc">Terbaru</option>
                                    <option value="asc">Terlama</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-8 gap-4">
                    <div className="bg-white rounded-lg shadow-sm border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Konsultasi</p>
                                <p className="text-2xl font-bold text-blue-600">{statistics?.totalKonsultasi || guestConsultations.total}</p>
                            </div>
                            <History className="text-blue-500" size={24} />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Hari Ini</p>
                                <p className="text-2xl font-bold text-green-600">{statistics?.konsultasiHariIni || 0}</p>
                            </div>
                            <Calendar className="text-green-500" size={24} />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Bulan Ini</p>
                                <p className="text-2xl font-bold text-purple-600">{statistics?.konsultasiBulanIni || 0}</p>
                            </div>
                            <Calendar className="text-purple-500" size={24} />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Rata-rata CF</p>
                                <p className="text-2xl font-bold text-indigo-600">{statistics?.rataRataCf?.toFixed(3) || '0.000'}</p>
                            </div>
                            <Activity className="text-indigo-500" size={24} />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Normal</p>
                                <p className="text-2xl font-bold text-green-600">{statistics?.tingkatKeparahan?.normal || 0}</p>
                            </div>
                            <Activity className="text-green-500" size={24} />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Ringan</p>
                                <p className="text-2xl font-bold text-yellow-600">{statistics?.tingkatKeparahan?.ringan || 0}</p>
                            </div>
                            <AlertTriangle className="text-yellow-500" size={24} />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Sedang</p>
                                <p className="text-2xl font-bold text-orange-600">{statistics?.tingkatKeparahan?.sedang || 0}</p>
                            </div>
                            <AlertTriangle className="text-orange-500" size={24} />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Berat</p>
                                <p className="text-2xl font-bold text-red-600">{statistics?.tingkatKeparahan?.berat || 0}</p>
                            </div>
                            <AlertTriangle className="text-red-500" size={24} />
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        #
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('nama')}
                                    >
                                        Guest Info {getSortIcon('nama')}
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('created_at')}
                                    >
                                        Tanggal Konsultasi {getSortIcon('created_at')}
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('hasil_diagnosa')}
                                    >
                                        Hasil Diagnosis {getSortIcon('hasil_diagnosa')}
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('tingkat_keparahan')}
                                    >
                                        Tingkat Keparahan {getSortIcon('tingkat_keparahan')}
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('nilai_cf')}
                                    >
                                        CF Value {getSortIcon('nilai_cf')}
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {guestConsultations.data.length > 0 ? (
                                    guestConsultations.data.map((consultation, index) => (
                                        <tr key={consultation.id_guestconsultation} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {guestConsultations.from + index}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                                            <UserCheck className="h-5 w-5 text-purple-600" />
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {consultation.nama}
                                                        </div>
                                                        <div className="text-sm text-gray-500">
                                                            {consultation.email}
                                                            {consultation.nim && ` • ${consultation.nim}`}
                                                        </div>
                                                        <div className="text-xs text-gray-400">
                                                            {consultation.jenis_kelamin} • {consultation.umur} tahun
                                                            {consultation.fakultas && ` • ${consultation.fakultas}`}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div className="flex items-center">
                                                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                                                    {new Date(consultation.created_at).toLocaleDateString('id-ID', {
                                                        year: 'numeric',
                                                        month: 'short',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                <div className="max-w-xs" title={consultation.hasil_diagnosa}>
                                                    {truncateText(consultation.hasil_diagnosa, 50)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityBadgeColor(consultation.tingkat_keparahan)}`}>
                                                    {consultation.tingkat_keparahan}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                <div className="flex items-center">
                                                    <Activity className="h-4 w-4 text-gray-400 mr-1" />
                                                    <span className="font-mono text-sm">
                                                        {consultation.nilai_cf.toFixed(3)}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Link
                                                        href={route('admin.guest-consultation.show', consultation.id_guestconsultation)}
                                                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                        title="Lihat Detail"
                                                    >
                                                        <Eye size={16} />
                                                    </Link>
                                                    <Button
                                                        onClick={() => handleDelete(consultation)}
                                                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-red-600 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                                        title="Hapus"
                                                    >
                                                        <Trash2 size={16} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center">
                                                <History className="h-12 w-12 text-gray-400 mb-4" />
                                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                                    Tidak ada data konsultasi guest
                                                </h3>
                                                <p className="text-gray-500">
                                                    {data.search || data.tingkat_keparahan || data.fakultas || data.jenis_kelamin || data.tanggal_dari || data.tanggal_sampai
                                                        ? 'Tidak ada data yang sesuai dengan filter yang dipilih.'
                                                        : 'Belum ada konsultasi guest yang tersedia.'}
                                                </p>
                                                {(data.search || data.tingkat_keparahan || data.fakultas || data.jenis_kelamin || data.tanggal_dari || data.tanggal_sampai) && (
                                                    <Button
                                                        onClick={handleReset}
                                                        className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                                                    >
                                                        Reset Filter
                                                    </Button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {guestConsultations.data.length > 0 && (
                        <Pagination
                            gejalas={guestConsultations}
                            perPage={data.perPage}
                            onPerPageChange={handlePerPageChange}
                        />
                    )}
                </div>

                {/* Additional Info Section */}
                <div className="bg-white rounded-lg shadow-sm border p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span className="text-sm text-gray-600">Normal</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                <span className="text-sm text-gray-600">Depresi Ringan</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                                <span className="text-sm text-gray-600">Depresi Sedang</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                <span className="text-sm text-gray-600">Depresi Berat</span>
                            </div>
                        </div>
                        <div className="text-sm text-gray-500">
                            Terakhir diperbarui: {new Date().toLocaleDateString('id-ID', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
