import React, { useState, useEffect } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    EyeIcon,
    TrashIcon,
    PrinterIcon,
    ArrowDownTrayIcon,
    ChartBarIcon,
    PlusIcon,
    ClipboardDocumentListIcon,
    CalendarIcon,
    InformationCircleIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XMarkIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    Bars3Icon,
    ListBulletIcon,
    ClockIcon,
    DocumentTextIcon,
    BeakerIcon,
    HeartIcon,
    HomeIcon,
    UserIcon,
    AcademicCapIcon,
    ArrowLeftIcon,
} from '@heroicons/react/24/outline';

interface RiwayatKonsultasi {
    id_konsultasi: number;
    tanggal_konsultasi: string;
    hasil_diagnosa: string;
    tingkat_keparahan: string;
    nilai_cf: number;
    rekomendasi: string;
    created_at: string;
    updated_at: string;
}

interface PaginationData {
    data: RiwayatKonsultasi[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
    links: any[];
}

interface Stats {
    total_konsultasi: number;
    konsultasi_bulan_ini: number;
    rata_rata_cf: number;
    konsultasi_terakhir: RiwayatKonsultasi | null;
    distribusi_tingkat: Record<string, number>;
    trend_bulan: Array<{ bulan: string; jumlah: number }>;
}

interface Filters {
    search?: string;
    hasil_diagnosa?: string;
    tingkat_keparahan?: string;
    start_date?: string;
    end_date?: string;
}

interface Props {
    riwayat: PaginationData;
    stats: Stats;
    filters: {
        diagnosa_list: string[];
        tingkat_list: string[];
    };
    queryParams: Filters;
}

const Index: React.FC<Props> = ({ riwayat, stats, filters, queryParams }) => {
    const [search, setSearch] = useState(queryParams.search || '');
    const [hasilDiagnosa, setHasilDiagnosa] = useState(queryParams.hasil_diagnosa || '');
    const [tingkatKeparahan, setTingkatKeparahan] = useState(queryParams.tingkat_keparahan || '');
    const [startDate, setStartDate] = useState(queryParams.start_date || '');
    const [endDate, setEndDate] = useState(queryParams.end_date || '');
    const [showFilters, setShowFilters] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [loading, setLoading] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Check mobile screen size
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Handle search
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        router.get(route('mahasiswa.riwayat-konsultasi.index'), {
            search,
            hasil_diagnosa: hasilDiagnosa,
            tingkat_keparahan: tingkatKeparahan,
            start_date: startDate,
            end_date: endDate,
            per_page: riwayat.per_page
        }, {
            preserveState: true,
            replace: true,
            onFinish: () => setLoading(false),
        });
    };

    // Handle filter change
    const handleFilterChange = (key: string, value: string) => {
        const newParams = {
            search,
            hasil_diagnosa: hasilDiagnosa,
            tingkat_keparahan: tingkatKeparahan,
            start_date: startDate,
            end_date: endDate,
            per_page: riwayat.per_page,
            [key]: value
        };

        // Update local state
        switch (key) {
            case 'hasil_diagnosa':
                setHasilDiagnosa(value);
                break;
            case 'tingkat_keparahan':
                setTingkatKeparahan(value);
                break;
            case 'start_date':
                setStartDate(value);
                break;
            case 'end_date':
                setEndDate(value);
                break;
        }

        setLoading(true);
        router.get(route('mahasiswa.riwayat-konsultasi.index'), newParams, {
            preserveState: true,
            replace: true,
            onFinish: () => setLoading(false),
        });
    };

    // Handle per page change
    const handlePerPageChange = (perPage: number) => {
        setLoading(true);
        router.get(route('mahasiswa.riwayat-konsultasi.index'), {
            search,
            hasil_diagnosa: hasilDiagnosa,
            tingkat_keparahan: tingkatKeparahan,
            start_date: startDate,
            end_date: endDate,
            per_page: perPage
        }, {
            preserveState: true,
            replace: true,
            onFinish: () => setLoading(false),
        });
    };

    // Clear filters
    const clearFilters = () => {
        setSearch('');
        setHasilDiagnosa('');
        setTingkatKeparahan('');
        setStartDate('');
        setEndDate('');
        setLoading(true);
        router.get(route('mahasiswa.riwayat-konsultasi.index'), {}, {
            preserveState: true,
            replace: true,
            onFinish: () => setLoading(false),
        });
    };

    // Handle delete
    const handleDelete = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus riwayat konsultasi ini?')) {
            router.delete(route('mahasiswa.riwayat-konsultasi.destroy', id));
        }
    };

    // Format functions
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
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
                return 'bg-gradient-to-r from-green-50 to-emerald-50 text-green-800 border-green-200';
            case 'depresi ringan':
            case 'ringan':
                return 'bg-gradient-to-r from-yellow-50 to-amber-50 text-yellow-800 border-yellow-200';
            case 'depresi sedang':
            case 'sedang':
                return 'bg-gradient-to-r from-orange-50 to-red-50 text-orange-800 border-orange-200';
            case 'depresi berat':
            case 'berat':
                return 'bg-gradient-to-r from-red-50 to-pink-50 text-red-800 border-red-200';
            default:
                return 'bg-gradient-to-r from-gray-50 to-slate-50 text-gray-800 border-gray-200';
        }
    };

    const getSeverityIcon = (severity: string) => {
        switch (severity.toLowerCase()) {
            case 'minimal':
            case 'normal':
            case 'minimal / normal':
                return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
            case 'depresi ringan':
            case 'ringan':
                return <InformationCircleIcon className="h-5 w-5 text-yellow-600" />;
            case 'depresi sedang':
            case 'sedang':
                return <ExclamationTriangleIcon className="h-5 w-5 text-orange-600" />;
            case 'depresi berat':
            case 'berat':
                return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
            default:
                return <InformationCircleIcon className="h-5 w-5 text-gray-600" />;
        }
    };

    const getCFProgressColor = (cf: number) => {
        if (cf >= 0.8) return 'bg-gradient-to-r from-red-500 to-red-600';
        if (cf >= 0.6) return 'bg-gradient-to-r from-orange-500 to-orange-600';
        if (cf >= 0.4) return 'bg-gradient-to-r from-yellow-500 to-yellow-600';
        return 'bg-gradient-to-r from-green-500 to-green-600';
    };

    // Pagination component
    const Pagination = () => {
        const { current_page, last_page, from, to, total } = riwayat;

        const getPageNumbers = () => {
            const pages = [];
            const maxVisiblePages = isMobile ? 3 : 5;

            let startPage = Math.max(1, current_page - Math.floor(maxVisiblePages / 2));
            let endPage = Math.min(last_page, startPage + maxVisiblePages - 1);

            if (endPage - startPage + 1 < maxVisiblePages) {
                startPage = Math.max(1, endPage - maxVisiblePages + 1);
            }

            for (let i = startPage; i <= endPage; i++) {
                pages.push(i);
            }

            return pages;
        };

        const goToPage = (page: number) => {
            if (page === current_page) return;
            setLoading(true);
            router.get(route('mahasiswa.riwayat-konsultasi.index'), {
                search,
                hasil_diagnosa: hasilDiagnosa,
                tingkat_keparahan: tingkatKeparahan,
                start_date: startDate,
                end_date: endDate,
                per_page: riwayat.per_page,
                page
            }, {
                preserveState: true,
                replace: true,
                onFinish: () => setLoading(false),
            });
        };

        return (
            <div className="flex items-center justify-between border-t border-gray-200 bg-white/80 backdrop-blur-sm px-4 py-3 sm:px-6 rounded-b-2xl">
                <div className="flex flex-1 justify-between sm:hidden">
                    <button
                        onClick={() => goToPage(current_page - 1)}
                        disabled={current_page === 1}
                        className="relative inline-flex items-center rounded-xl border border-gray-300 bg-white/80 backdrop-blur-sm px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => goToPage(current_page + 1)}
                        disabled={current_page === last_page}
                        className="relative ml-3 inline-flex items-center rounded-xl border border-gray-300 bg-white/80 backdrop-blur-sm px-4 py-2 text-sm font-medium text-gray-700 hover:bg-white transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700">
                            Menampilkan <span className="font-medium">{from}</span> sampai{' '}
                            <span className="font-medium">{to}</span> dari{' '}
                            <span className="font-medium">{total}</span> hasil
                        </p>
                    </div>
                    <div>
                        <nav className="isolate inline-flex -space-x-px rounded-xl shadow-sm" aria-label="Pagination">
                            <button
                                onClick={() => goToPage(current_page - 1)}
                                disabled={current_page === 1}
                                className="relative inline-flex items-center rounded-l-xl px-2 py-2 text-gray-400 bg-white/80 backdrop-blur-sm hover:bg-white focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            >
                                <ChevronLeftIcon className="h-5 w-5" />
                            </button>

                            {getPageNumbers().map((page) => (
                                <button
                                    key={page}
                                    onClick={() => goToPage(page)}
                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold transition-all duration-200 ${
                                        page === current_page
                                            ? 'z-10 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                                            : 'text-gray-900 bg-white/80 backdrop-blur-sm hover:bg-white focus:z-20 focus:outline-offset-0'
                                    }`}
                                >
                                    {page}
                                </button>
                            ))}

                            <button
                                onClick={() => goToPage(current_page + 1)}
                                disabled={current_page === last_page}
                                className="relative inline-flex items-center rounded-r-xl px-2 py-2 text-gray-400 bg-white/80 backdrop-blur-sm hover:bg-white focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                            >
                                <ChevronRightIcon className="h-5 w-5" />
                            </button>
                        </nav>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <>
            <Head title="Riwayat Konsultasi - Mahasiswa" />

            <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
                {/* Enhanced Header */}
                <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 shadow-xl">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32 blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24 blur-2xl"></div>

                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                        {/* Back Button */}
                        <div className="mb-4 sm:mb-6">
                            <Link
                                href={route('mahasiswa.dashboard')}
                                className="group inline-flex items-center space-x-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white px-4 py-3 rounded-xl border border-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                            >
                                <ArrowLeftIcon className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
                                <span className="font-semibold">Kembali ke Dashboard</span>
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
                                        <span className="text-white font-medium">Riwayat Konsultasi</span>
                                    </nav>
                                </div>

                                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-3">
                                    Riwayat Konsultasi
                                </h1>
                                <p className="text-lg sm:text-xl text-blue-100 leading-relaxed mb-4">
                                    Kelola dan lihat semua riwayat konsultasi kesehatan mental Anda
                                </p>
                                <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm">
                                    <div className="flex items-center space-x-2">
                                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                                        <span className="text-blue-100">Total: {stats.total_konsultasi} konsultasi</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></span>
                                        <span className="text-blue-100">Bulan ini: {stats.konsultasi_bulan_ini}</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                                        <span className="text-blue-100">
                                            Rata-rata CF: {stats.rata_rata_cf ? formatCF(stats.rata_rata_cf) : 'N/A'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                <Link
                                    href={route('mahasiswa.konsultasi.start')}
                                    className="group bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 sm:px-6 py-3 rounded-xl hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl font-semibold"
                                >
                                    <PlusIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                                    <span>Konsultasi Baru</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
                    {/* Enhanced Statistics Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                            <div className="flex items-center">
                                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg">
                                    <ChartBarIcon className="h-5 sm:h-6 w-5 sm:w-6" />
                                </div>
                                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-gray-600 truncate">Total Konsultasi</p>
                                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.total_konsultasi}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                            <div className="flex items-center">
                                <div className="p-3 rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg">
                                    <CalendarIcon className="h-5 sm:h-6 w-5 sm:w-6" />
                                </div>
                                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-gray-600 truncate">Bulan Ini</p>
                                    <p className="text-xl sm:text-2xl font-bold text-gray-900">{stats.konsultasi_bulan_ini}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                            <div className="flex items-center">
                                <div className="p-3 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-600 text-white shadow-lg">
                                    <BeakerIcon className="h-5 sm:h-6 w-5 sm:w-6" />
                                </div>
                                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-gray-600 truncate">Rata-rata CF</p>
                                    <p className="text-lg sm:text-xl font-bold text-gray-900">
                                        {stats.rata_rata_cf ? formatCF(stats.rata_rata_cf) : 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                            <div className="flex items-center">
                                <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg">
                                    <ClockIcon className="h-5 sm:h-6 w-5 sm:w-6" />
                                </div>
                                <div className="ml-3 sm:ml-4 min-w-0 flex-1">
                                    <p className="text-sm font-semibold text-gray-600 truncate">Konsultasi Terakhir</p>
                                    <p className="text-xs sm:text-sm font-bold text-gray-900 leading-tight">
                                        {stats.konsultasi_terakhir
                                            ? formatDate(stats.konsultasi_terakhir.tanggal_konsultasi)
                                            : 'Belum ada'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Enhanced Tingkat Keparahan Distribution */}
                    {stats.distribusi_tingkat && Object.keys(stats.distribusi_tingkat).length > 0 && (
                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6">
                            <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center space-x-3">
                                <div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                                    <ChartBarIcon className="h-4 w-4 text-white" />
                                </div>
                                <span>Distribusi Tingkat Keparahan</span>
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
                                {Object.entries(stats.distribusi_tingkat).map(([tingkat, count]) => (
                                    <div key={tingkat} className="text-center group">
                                        <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl mx-auto mb-3 flex items-center justify-center ${getSeverityColor(tingkat)} shadow-lg group-hover:shadow-xl transition-all duration-300 transform group-hover:scale-110 border-2`}>
                                            <span className="text-2xl sm:text-3xl font-bold">{count}</span>
                                        </div>
                                        <p className="text-xs sm:text-sm font-bold text-gray-900 capitalize leading-tight">
                                            {tingkat.replace('_', ' ')}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Enhanced Filters and Search */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6">
                        <div className="flex flex-col space-y-4">
                            {/* Mobile-first search */}
                            <form onSubmit={handleSearch} className="w-full">
                                <div className="relative">
                                    <MagnifyingGlassIcon className="h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        placeholder="Cari berdasarkan hasil diagnosa atau rekomendasi..."
                                        className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl bg-white/50 backdrop-blur-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-500 text-sm sm:text-base"
                                    />
                                </div>
                            </form>

                            {/* Enhanced Filter Controls */}
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 sm:space-x-4">
                                <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                                    <button
                                        onClick={() => setShowFilters(!showFilters)}
                                        className={`flex items-center space-x-2 px-4 py-2.5 bg-white/50 backdrop-blur-sm border border-gray-300 rounded-xl transition-all duration-200 font-medium text-sm ${showFilters ? 'bg-blue-50 border-blue-300 text-blue-700' : 'hover:bg-white text-gray-700'}`}
                                    >
                                        <FunnelIcon className="h-4 w-4" />
                                        <span>{showFilters ? 'Sembunyikan Filter' : 'Tampilkan Filter'}</span>
                                    </button>

                                    <div className="flex items-center space-x-1 bg-white/50 backdrop-blur-sm border border-gray-300 rounded-xl p-1">
                                        <button
                                            onClick={() => setViewMode('grid')}
                                            className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'grid' ? 'bg-blue-100 text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
                                            title="Grid View"
                                        >
                                            <Bars3Icon className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => setViewMode('list')}
                                            className={`p-2 rounded-lg transition-all duration-200 ${viewMode === 'list' ? 'bg-blue-100 text-blue-600 shadow-sm' : 'text-gray-600 hover:bg-gray-100'}`}
                                            title="List View"
                                        >
                                            <ListBulletIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2 sm:space-x-4">
                                    <select
                                        value={riwayat.per_page}
                                        onChange={(e) => handlePerPageChange(Number(e.target.value))}
                                        className="bg-white/50 backdrop-blur-sm border border-gray-300 rounded-xl px-3 sm:px-4 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                    >
                                        <option value={10}>10 per halaman</option>
                                        <option value={25}>25 per halaman</option>
                                        <option value={50}>50 per halaman</option>
                                        <option value={100}>100 per halaman</option>
                                    </select>
                                </div>
                            </div>

                            {/* Enhanced Filter Options */}
                            {showFilters && (
                                <div className="pt-4 border-t border-gray-200 space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Hasil Diagnosa</label>
                                            <select
                                                value={hasilDiagnosa}
                                                onChange={(e) => handleFilterChange('hasil_diagnosa', e.target.value)}
                                                className="w-full bg-white/50 backdrop-blur-sm border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                                            >
                                                <option value="">Semua Diagnosa</option>
                                                {filters.diagnosa_list.map((diagnosa) => (
                                                    <option key={diagnosa} value={diagnosa}>
                                                        {diagnosa}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Tingkat Keparahan</label>
                                            <select
                                                value={tingkatKeparahan}
                                                onChange={(e) => handleFilterChange('tingkat_keparahan', e.target.value)}
                                                className="w-full bg-white/50 backdrop-blur-sm border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                                            >
                                                <option value="">Semua Tingkat</option>
                                                {filters.tingkat_list?.map((tingkat) => (
                                                    <option key={tingkat} value={tingkat}>
                                                        {tingkat}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal Mulai</label>
                                            <input
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => handleFilterChange('start_date', e.target.value)}
                                                className="w-full bg-white/50 backdrop-blur-sm border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Tanggal Akhir</label>
                                            <input
                                                type="date"
                                                value={endDate}
                                                onChange={(e) => handleFilterChange('end_date', e.target.value)}
                                                className="w-full bg-white/50 backdrop-blur-sm border border-gray-300 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-3">
                                        <button
                                            onClick={clearFilters}
                                            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800 px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-all duration-200 font-medium"
                                        >
                                            <XMarkIcon className="h-4 w-4" />
                                            <span>Hapus Filter</span>
                                        </button>
                                        {(search || hasilDiagnosa || tingkatKeparahan || startDate || endDate) && (
                                            <div className="flex items-center space-x-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                                                <InformationCircleIcon className="h-4 w-4" />
                                                <span>Filter aktif</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Loading Indicator */}
                    {loading && (
                        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
                            <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 sm:p-8 flex items-center space-x-4 shadow-2xl border border-white/20 max-w-sm mx-4">
                                <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-4 border-blue-600 border-t-transparent"></div>
                                <span className="text-base sm:text-lg font-semibold text-gray-800">Memuat data...</span>
                            </div>
                        </div>
                    )}

                    {/* Enhanced Content */}
                    {riwayat.data.length > 0 ? (
                        <>
                            {viewMode === 'grid' ? (
                                /* Enhanced Grid View */
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                                    {riwayat.data.map((item) => (
                                        <div key={item.id_konsultasi} className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:scale-105 group">
                                            <div className="p-4 sm:p-6">
                                                {/* Enhanced Header */}
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center space-x-2">
                                                        <span className="px-3 py-1 text-xs font-bold bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 rounded-full border">
                                                            #{item.id_konsultasi}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center space-x-2">
                                                        {getSeverityIcon(item.tingkat_keparahan)}
                                                    </div>
                                                </div>

                                                {/* Enhanced Content */}
                                                <div className="mb-4">
                                                    <div className="flex flex-wrap items-center gap-2 mb-3">
                                                        <span className={`px-3 py-1 text-xs font-bold rounded-full border-2 ${getSeverityColor(item.tingkat_keparahan)}`}>
                                                            {item.tingkat_keparahan}
                                                        </span>
                                                        <span className="text-sm font-bold text-gray-600 bg-gradient-to-r from-blue-100 to-indigo-100 px-3 py-1 rounded-full">
                                                            {formatCF(item.nilai_cf)}
                                                        </span>
                                                    </div>

                                                    <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-3 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors duration-200">
                                                        {item.hasil_diagnosa}
                                                    </h3>

                                                    <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                                                        {item.rekomendasi}
                                                    </p>
                                                </div>

                                                {/* Enhanced Progress Bar */}
                                                <div className="mb-4">
                                                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                                                        <span className="font-medium">Tingkat Keyakinan</span>
                                                        <span className="font-bold">{formatCF(item.nilai_cf)}</span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className={`h-2 rounded-full transition-all duration-500 ${getCFProgressColor(item.nilai_cf)}`}
                                                            style={{ width: `${item.nilai_cf * 100}%` }}
                                                        ></div>
                                                    </div>
                                                </div>

                                                {/* Enhanced Footer */}
                                                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                                    <div className="flex items-center space-x-2 bg-gradient-to-r from-gray-50 to-gray-100 px-3 py-2 rounded-xl">
                                                        <CalendarIcon className="h-4 w-4" />
                                                        <span className="font-medium text-xs sm:text-sm">
                                                            {new Date(item.tanggal_konsultasi).toLocaleDateString('id-ID', {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                year: 'numeric'
                                                            })}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Enhanced Actions */}
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-2 text-xs text-gray-500 bg-blue-50 px-3 py-2 rounded-lg">
                                                        <InformationCircleIcon className="h-4 w-4" />
                                                        <span className="font-medium">Detail tersedia</span>
                                                    </div>
                                                    <div className="flex items-center space-x-1 sm:space-x-2">
                                                        <Link
                                                            href={route('mahasiswa.riwayat-konsultasi.show', item.id_konsultasi)}
                                                            className="text-blue-600 hover:text-blue-800 p-2 rounded-xl bg-blue-50 hover:bg-blue-100 transition-all duration-200 transform hover:scale-110"
                                                            title="Lihat Detail"
                                                        >
                                                            <EyeIcon className="h-4 w-4" />
                                                        </Link>
                                                        {/* <Link
                                                            href={route('mahasiswa.konsultasi.result.print', item.id_konsultasi)}
                                                            className="text-green-600 hover:text-green-800 p-2 rounded-xl bg-green-50 hover:bg-green-100 transition-all duration-200 transform hover:scale-110"
                                                            title="Print Hasil"
                                                        >
                                                            <PrinterIcon className="h-4 w-4" />
                                                        </Link> */}
                                                        <button
                                                            onClick={() => handleDelete(item.id_konsultasi)}
                                                            className="text-red-600 hover:text-red-800 p-2 rounded-xl bg-red-50 hover:bg-red-100 transition-all duration-200 transform hover:scale-110"
                                                            title="Hapus"
                                                        >
                                                            <TrashIcon className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                /* Enhanced List View */
                                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                                                <tr>
                                                    <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                        ID & Tanggal
                                                    </th>
                                                    <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                        Hasil Diagnosa
                                                    </th>
                                                    <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                        Tingkat & CF
                                                    </th>
                                                    <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden lg:table-cell">
                                                        Rekomendasi
                                                    </th>
                                                    <th className="px-4 sm:px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                                        Aksi
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white/50 backdrop-blur-sm divide-y divide-gray-200">
                                                {riwayat.data.map((item) => (
                                                    <tr key={item.id_konsultasi} className="hover:bg-white/80 transition-all duration-200">
                                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                                                            <div className="space-y-2">
                                                                <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                                                    #{item.id_konsultasi}
                                                                </span>
                                                                <p className="text-sm font-medium text-gray-900 leading-tight">
                                                                    {new Date(item.tanggal_konsultasi).toLocaleDateString('id-ID', {
                                                                        day: 'numeric',
                                                                        month: 'short',
                                                                        year: 'numeric'
                                                                    })}
                                                                </p>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 sm:px-6 py-4">
                                                            <p className="text-sm font-semibold text-gray-900 line-clamp-2 max-w-xs leading-relaxed">
                                                                {item.hasil_diagnosa}
                                                            </p>
                                                        </td>
                                                        <td className="px-4 sm:px-6 py-4">
                                                            <div className="space-y-2">
                                                                <div className="flex items-center space-x-2">
                                                                    {getSeverityIcon(item.tingkat_keparahan)}
                                                                    <span className={`inline-flex px-2 py-1 text-xs font-bold rounded-full border ${getSeverityColor(item.tingkat_keparahan)}`}>
                                                                        {item.tingkat_keparahan.length > 15
                                                                            ? item.tingkat_keparahan.substring(0, 15) + '...'
                                                                            : item.tingkat_keparahan
                                                                        }
                                                                    </span>
                                                                </div>
                                                                <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-100 to-indigo-100 px-3 py-1 rounded-xl">
                                                                    <BeakerIcon className="h-3 w-3 text-blue-600" />
                                                                    <span className="text-xs font-bold text-blue-800">{formatCF(item.nilai_cf)}</span>
                                                                </div>
                                                            </div>
                                                        </td>
                                                        <td className="px-4 sm:px-6 py-4 hidden lg:table-cell">
                                                            <p className="text-sm text-gray-600 line-clamp-2 max-w-xs leading-relaxed">
                                                                {item.rekomendasi}
                                                            </p>
                                                        </td>
                                                        <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                            <div className="flex items-center space-x-1 sm:space-x-2">
                                                                <Link
                                                                    href={route('mahasiswa.riwayat-konsultasi.show', item.id_konsultasi)}
                                                                    className="text-blue-600 hover:text-blue-800 p-2 rounded-xl bg-blue-50 hover:bg-blue-100 transition-all duration-200 transform hover:scale-110"
                                                                    title="Lihat Detail"
                                                                >
                                                                    <EyeIcon className="h-4 w-4" />
                                                                </Link>
                                                                <Link
                                                                    href={route('mahasiswa.riwayat-konsultasi.print', item.id_konsultasi)}
                                                                    className="text-green-600 hover:text-green-800 p-2 rounded-xl bg-green-50 hover:bg-green-100 transition-all duration-200 transform hover:scale-110"
                                                                    title="Print Hasil"
                                                                >
                                                                    <PrinterIcon className="h-4 w-4" />
                                                                </Link>
                                                                <button
                                                                    onClick={() => handleDelete(item.id_konsultasi)}
                                                                    className="text-red-600 hover:text-red-800 p-2 rounded-xl bg-red-50 hover:bg-red-100 transition-all duration-200 transform hover:scale-110"
                                                                    title="Hapus"
                                                                >
                                                                    <TrashIcon className="h-4 w-4" />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Enhanced Pagination */}
                            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                                <Pagination />
                            </div>
                        </>
                    ) : (
                        /* Enhanced Empty State */
                        <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-8 sm:p-12 text-center">
                            <div className="max-w-md mx-auto space-y-6">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl mx-auto flex items-center justify-center">
                                    <ClipboardDocumentListIcon className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
                                </div>
                                <h3 className="text-lg sm:text-xl font-bold text-gray-900">
                                    {search || hasilDiagnosa || tingkatKeparahan || startDate || endDate
                                        ? 'Tidak ada riwayat konsultasi yang sesuai'
                                        : 'Belum ada riwayat konsultasi'
                                    }
                                </h3>
                                <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
                                    {search || hasilDiagnosa || tingkatKeparahan || startDate || endDate
                                        ? 'Coba ubah kriteria pencarian atau filter Anda untuk menemukan hasil yang lebih relevan'
                                        : 'Mulai konsultasi pertama Anda untuk melihat riwayat di sini dan mendapatkan diagnosis yang akurat'
                                    }
                                </p>
                                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
                                    {(search || hasilDiagnosa || tingkatKeparahan || startDate || endDate) ? (
                                        <button
                                            onClick={clearFilters}
                                            className="inline-flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 font-semibold shadow-lg transform hover:scale-105"
                                        >
                                            <XMarkIcon className="h-4 w-4" />
                                            <span>Hapus Filter</span>
                                        </button>
                                    ) : (
                                        <Link
                                            href={route('mahasiswa.konsultasi.start')}
                                            className="inline-flex items-center space-x-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-bold shadow-xl transform hover:scale-105"
                                        >
                                            <PlusIcon className="h-5 w-5" />
                                            <span>Mulai Konsultasi</span>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Enhanced Bottom Navigation */}
                    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6">
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                            <Link
                                href={route('mahasiswa.dashboard')}
                                className="inline-flex items-center justify-center px-4 sm:px-6 py-3 bg-white/50 backdrop-blur-sm border border-gray-300 shadow-sm text-sm font-semibold rounded-xl text-gray-700 hover:bg-white transition-all duration-200 transform hover:scale-105"
                            >
                                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                                Kembali ke Dashboard
                            </Link>

                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                                <Link
                                    href={route('mahasiswa.konsultasi.start')}
                                    className="inline-flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 hover:scale-105 shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    <PlusIcon className="h-4 w-4 mr-2" />
                                    Konsultasi Baru
                                </Link>

                                <Link
                                    href={route('mahasiswa.gejala.index')}
                                    className="inline-flex items-center justify-center px-4 sm:px-6 py-3 bg-white/50 backdrop-blur-sm border border-gray-300 shadow-sm text-sm font-semibold rounded-xl text-gray-700 hover:bg-white transition-all duration-200 transform hover:scale-105"
                                >
                                    <DocumentTextIcon className="h-4 w-4 mr-2" />
                                    Lihat Gejala
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Index;
