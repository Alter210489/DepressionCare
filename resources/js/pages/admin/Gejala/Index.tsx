import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@headlessui/react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { CirclePlusIcon, Eye, Pencil, Search, Trash2, X, Filter, Download, FileText, MessageSquare, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
    {
        title: 'Manajemen Gejala',
        href: '/admin/gejala',
    },
];

interface LinkProps {
    active: boolean;
    label: string;
    url: string;
}

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
    jumlah_opsi: number;
    nilai_cf: number;
    formatted_nilai_cf?: string;
    persentase_cf?: string;
    status?: string;
    created_at: string;
    updated_at: string;
}

interface GejalaPagination {
    data: Gejala[];
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
    min_cf?: string;
    max_cf?: string;
}

interface Statistik {
    total_gejala: number;
    avg_cf?: number;
    min_cf?: number;
    max_cf?: number;
    count_by_cf_range?: {
        sangat_rendah: number;
        rendah: number;
        sedang: number;
        tinggi: number;
        sangat_tinggi: number;
    };
}

interface IndexProps {
    gejalas: GejalaPagination;
    filters: FilterProps;
    statistik?: Statistik;
}

export default function DaftarGejala({ gejalas, filters, statistik }: IndexProps) {
    const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;
    const flashMessage = flash?.success || flash?.error;
    const [showAlert, setShowAlert] = useState(flash?.success || flash?.error ? true : false);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedGejala, setSelectedGejala] = useState<Gejala | null>(null);
    const [showOpsiModal, setShowOpsiModal] = useState(false);

    useEffect(() => {
        if (flashMessage) {
            const timer = setTimeout(() => setShowAlert(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [flashMessage]);

    const { data, setData } = useForm({
        search: filters.search || '',
        perPage: filters.perPage || '10',
        sortBy: filters.sortBy || 'kode_gejala',
        sortOrder: filters.sortOrder || 'asc',
        min_cf: filters.min_cf || '',
        max_cf: filters.max_cf || '',
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
            ...(data.min_cf && { min_cf: data.min_cf }),
            ...(data.max_cf && { max_cf: data.max_cf }),
            perPage: data.perPage,
            sortBy: data.sortBy,
            sortOrder: data.sortOrder,
        };

        router.get(route('admin.gejala.index'), queryString, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Reset All Filters
    const handleReset = () => {
        setData({
            search: '',
            perPage: '10',
            sortBy: 'kode_gejala',
            sortOrder: 'asc',
            min_cf: '',
            max_cf: '',
        });

        router.get(route('admin.gejala.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Handle Per Page Change
    const handlePerPageChange = (value: string) => {
        setData('perPage', value);

        const queryString = {
            ...(data.search && { search: data.search }),
            ...(data.min_cf && { min_cf: data.min_cf }),
            ...(data.max_cf && { max_cf: data.max_cf }),
            perPage: value,
            sortBy: data.sortBy,
            sortOrder: data.sortOrder,
        };

        router.get(route('admin.gejala.index'), queryString, {
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
            ...(data.min_cf && { min_cf: data.min_cf }),
            ...(data.max_cf && { max_cf: data.max_cf }),
            perPage: data.perPage,
            sortBy: column,
            sortOrder: newSortOrder,
        };

        router.get(route('admin.gejala.index'), queryString, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Handle CF Filter Change
    const handleCfFilterChange = (field: 'min_cf' | 'max_cf', value: string) => {
        setData(field, value);

        const timer = setTimeout(() => {
            const queryString = {
                ...(data.search && { search: data.search }),
                ...(field === 'min_cf' ? { min_cf: value } : { min_cf: data.min_cf }),
                ...(field === 'max_cf' ? { max_cf: value } : { max_cf: data.max_cf }),
                perPage: data.perPage,
                sortBy: data.sortBy,
                sortOrder: data.sortOrder,
            };

            router.get(route('admin.gejala.index'), queryString, {
                preserveState: true,
                preserveScroll: true,
            });
        }, 500);

        return () => clearTimeout(timer);
    };

    // Handle Delete with Confirmation
    const handleDelete = (gejala: Gejala) => {
        if (confirm(`Apakah Anda yakin ingin menghapus gejala "${gejala.nama_gejala}"?`)) {
            router.delete(route('admin.gejala.destroy', { gejala: gejala.id_gejala }), {
                preserveScroll: true,
                onSuccess: () => {
                    console.log('Delete successful');
                },
                onError: (errors) => {
                    console.error('Delete error:', errors);
                },
                onFinish: () => {
                    console.log('Delete request finished');
                }
            });
        }
    };

    // Show Opsi Jawaban Modal
    const handleShowOpsi = (gejala: Gejala) => {
        setSelectedGejala(gejala);
        setShowOpsiModal(true);
    };

    // Export Data
    const handleExport = () => {
        const currentFilters = {
            ...(data.search && { search: data.search }),
            ...(data.min_cf && { min_cf: data.min_cf }),
            ...(data.max_cf && { max_cf: data.max_cf }),
            sortBy: data.sortBy,
            sortOrder: data.sortOrder,
        };

        const queryString = new URLSearchParams(currentFilters).toString();
        window.open(`${route('admin.gejala.export')}?${queryString}`, '_blank');
    };

    // Get Sort Icon
    const getSortIcon = (column: string) => {
        if (data.sortBy !== column) return '↕️';
        return data.sortOrder === 'asc' ? '↑' : '↓';
    };

    // Get Badge Color for Kategori
    const getKategoriBadgeColor = (kategori?: string) => {
        const colors: Record<string, string> = {
            'fisik': 'bg-blue-100 text-blue-800',
            'emosional': 'bg-red-100 text-red-800',
            'kognitif': 'bg-purple-100 text-purple-800',
            'perilaku': 'bg-green-100 text-green-800',
            'sosial': 'bg-yellow-100 text-yellow-800',
        };
        return colors[kategori || ''] || 'bg-gray-100 text-gray-800';
    };

    // Get CF Badge Color
    const getCfBadgeColor = (nilai_cf: number) => {
        if (nilai_cf >= 0.9) return 'bg-red-100 text-red-800';
        if (nilai_cf >= 0.7) return 'bg-orange-100 text-orange-800';
        if (nilai_cf >= 0.5) return 'bg-yellow-100 text-yellow-800';
        if (nilai_cf >= 0.3) return 'bg-blue-100 text-blue-800';
        return 'bg-gray-100 text-gray-800';
    };

    // Get CF Label
    const getCfLabel = (nilai_cf: number) => {
        if (nilai_cf >= 0.9) return 'Sangat Tinggi';
        if (nilai_cf >= 0.7) return 'Tinggi';
        if (nilai_cf >= 0.5) return 'Sedang';
        if (nilai_cf >= 0.3) return 'Rendah';
        return 'Sangat Rendah';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Gejala - Admin" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Manajemen Gejala</h1>
                        <p className="text-gray-600 mt-1">Kelola data gejala depresi mahasiswa dengan nilai CF</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* <Button
                            onClick={handleExport}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                        >
                            <Download size={18} />
                            Export
                        </Button> */}
                        <Link
                            href={route('admin.gejala.create')}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                        >
                            <CirclePlusIcon size={18} />
                            Tambah Gejala
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
                                    placeholder="Cari berdasarkan kode atau nama gejala..."
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
                        <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-5 gap-4">
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
                                    Sort by
                                </label>
                                <select
                                    value={data.sortBy}
                                    onChange={(e) => handleSort(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                >
                                    <option value="kode_gejala">Kode Gejala</option>
                                    <option value="nama_gejala">Nama Gejala</option>
                                    <option value="nilai_cf">Nilai CF</option>
                                    <option value="created_at">Tanggal Dibuat</option>
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
                                    <option value="asc">A-Z (Ascending)</option>
                                    <option value="desc">Z-A (Descending)</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    CF Minimal
                                </label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="1"
                                    value={data.min_cf}
                                    onChange={(e) => handleCfFilterChange('min_cf', e.target.value)}
                                    placeholder="0.00"
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    CF Maksimal
                                </label>
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="1"
                                    value={data.max_cf}
                                    onChange={(e) => handleCfFilterChange('max_cf', e.target.value)}
                                    placeholder="1.00"
                                    className="w-full"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="bg-white rounded-lg shadow-sm border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Gejala</p>
                                <p className="text-2xl font-bold text-blue-600">{statistik?.total_gejala || gejalas.total}</p>
                            </div>
                            <FileText className="text-blue-500" size={24} />
                        </div>
                    </div>

                    {statistik?.avg_cf !== undefined && (
                        <div className="bg-white rounded-lg shadow-sm border p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Rata-rata CF</p>
                                    <p className="text-2xl font-bold text-green-600">
                                        {statistik.avg_cf.toFixed(3)}
                                    </p>
                                </div>
                                <TrendingUp className="text-green-500" size={24} />
                            </div>
                        </div>
                    )}

                    <div className="bg-white rounded-lg shadow-sm border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Halaman</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {gejalas.current_page} / {gejalas.last_page}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Menampilkan</p>
                                <p className="text-2xl font-bold text-orange-600">
                                    {gejalas.from} - {gejalas.to}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Per Halaman</p>
                                <p className="text-2xl font-bold text-gray-600">{gejalas.per_page}</p>
                            </div>
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
                                        onClick={() => handleSort('kode_gejala')}
                                    >
                                        Kode Gejala {getSortIcon('kode_gejala')}
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('nama_gejala')}
                                    >
                                        Nama Gejala {getSortIcon('nama_gejala')}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Kategori
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('nilai_cf')}
                                    >
                                        Nilai CF {getSortIcon('nilai_cf')}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Opsi Jawaban
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Tanggal Dibuat
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {gejalas.data.length > 0 ? (
                                    gejalas.data.map((gejala, index) => (
                                        <tr key={gejala.id_gejala} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {gejalas.from + index}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                    {gejala.kode_gejala}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                <div className="max-w-xs">
                                                    <div className="font-medium" title={gejala.nama_gejala}>
                                                        {gejala.nama_gejala.length > 50
                                                            ? gejala.nama_gejala.substring(0, 50) + '...'
                                                            : gejala.nama_gejala
                                                        }
                                                    </div>
                                                    {gejala.deskripsi_gejala && (
                                                        <div className="text-xs text-gray-500 mt-1" title={gejala.deskripsi_gejala}>
                                                            {gejala.deskripsi_gejala.length > 60
                                                                ? gejala.deskripsi_gejala.substring(0, 60) + '...'
                                                                : gejala.deskripsi_gejala
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {gejala.kategori_gejala ? (
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getKategoriBadgeColor(gejala.kategori_gejala)}`}>
                                                        {gejala.kategori_gejala.charAt(0).toUpperCase() + gejala.kategori_gejala.slice(1)}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400 text-xs">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex flex-col gap-1">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCfBadgeColor(gejala.nilai_cf)}`}>
                                                        CF: {gejala.nilai_cf.toFixed(3)}
                                                    </span>
                                                    <span className="text-xs text-gray-500">
                                                        {getCfLabel(gejala.nilai_cf)}
                                                    </span>
                                                    {gejala.persentase_cf && (
                                                        <span className="text-xs text-gray-600">
                                                            ({gejala.persentase_cf})
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-2">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        {gejala.opsi_jawaban?.length || 0} opsi
                                                    </span>
                                                    <Button
                                                        onClick={() => handleShowOpsi(gejala)}
                                                        className="text-blue-600 hover:text-blue-800 text-xs"
                                                        title="Lihat Opsi Jawaban"
                                                    >
                                                        <MessageSquare size={14} />
                                                    </Button>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(gejala.created_at).toLocaleDateString('id-ID')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Link
                                                        href={route('admin.gejala.show', gejala.id_gejala)}
                                                        className="inline-flex items-center p-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                        title="Detail"
                                                    >
                                                        <Eye size={16} />
                                                    </Link>
                                                    <Link
                                                        href={route('admin.gejala.edit', gejala.id_gejala)}
                                                        className="inline-flex items-center p-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                        title="Edit"
                                                    >
                                                        <Pencil size={16} />
                                                    </Link>
                                                    <Button
                                                        onClick={() => handleDelete(gejala)}
                                                        className="inline-flex items-center p-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
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
                                        <td colSpan={8} className="px-6 py-8 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-500">
                                                <FileText size={48} className="mb-4 text-gray-300" />
                                                <p className="text-lg font-medium">Tidak ada data gejala</p>
                                                <p className="text-sm">Silakan tambahkan gejala baru atau ubah filter pencarian</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {gejalas.data.length > 0 && (
                    <Pagination
                        gejalas={gejalas}
                        perPage={data.perPage}
                        onPerPageChange={handlePerPageChange}
                    />
                )}

                {/* Modal Opsi Jawaban */}
                {showOpsiModal && selectedGejala && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        Opsi Jawaban - {selectedGejala.nama_gejala}
                                    </h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        CF Gejala: {selectedGejala.nilai_cf.toFixed(3)} ({getCfLabel(selectedGejala.nilai_cf)})
                                    </p>
                                </div>
                                <Button
                                    onClick={() => setShowOpsiModal(false)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <X size={20} />
                                </Button>
                            </div>

                            <div className="space-y-3">
                                {selectedGejala.opsi_jawaban?.map((opsi, index) => (
                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                                                {index + 1}
                                            </span>
                                            <span className="text-sm font-medium text-gray-900">
                                                {opsi.text}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                Bobot: {opsi.bobot}
                                            </span>
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                CF: {(selectedGejala.nilai_cf * opsi.bobot).toFixed(3)}
                                            </span>
                                        </div>
                                    </div>
                                )) || (
                                    <div className="text-center py-4 text-gray-500">
                                        Tidak ada opsi jawaban tersedia
                                    </div>
                                )}
                            </div>

                            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                                <h4 className="text-sm font-medium text-blue-900 mb-2">Formula Perhitungan CF</h4>
                                <p className="text-xs text-blue-800">
                                    CF Hasil = CF Gejala × Bobot Jawaban User
                                </p>
                                <p className="text-xs text-blue-700 mt-1">
                                    Contoh: {selectedGejala.nilai_cf.toFixed(3)} × {selectedGejala.opsi_jawaban?.[0]?.bobot || 0} = {((selectedGejala.nilai_cf) * (selectedGejala.opsi_jawaban?.[0]?.bobot || 0)).toFixed(3)}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {/* CF Distribution Chart (if statistics available) */}
                {statistik?.count_by_cf_range && (
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribusi Nilai CF Gejala</h3>
                        <div className="grid grid-cols-5 gap-4">
                            {Object.entries(statistik.count_by_cf_range).map(([range, count]) => {
                                const labels = {
                                    sangat_rendah: 'Sangat Rendah (< 0.3)',
                                    rendah: 'Rendah (0.3-0.5)',
                                    sedang: 'Sedang (0.5-0.7)',
                                    tinggi: 'Tinggi (0.7-0.9)',
                                    sangat_tinggi: 'Sangat Tinggi (≥ 0.9)'
                                };
                                const colors = {
                                    sangat_rendah: 'bg-gray-100 text-gray-800',
                                    rendah: 'bg-blue-100 text-blue-800',
                                    sedang: 'bg-yellow-100 text-yellow-800',
                                    tinggi: 'bg-orange-100 text-orange-800',
                                    sangat_tinggi: 'bg-red-100 text-red-800'
                                };

                                return (
                                    <div key={range} className="text-center">
                                        <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${colors[range as keyof typeof colors]}`}>
                                            {count}
                                        </div>
                                        <p className="text-xs text-gray-600 mt-2">
                                            {labels[range as keyof typeof labels]}
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
