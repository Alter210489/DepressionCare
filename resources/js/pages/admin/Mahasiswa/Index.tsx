import React, { useState, useEffect } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@headlessui/react';
import {
    Search,
    CirclePlusIcon,
    Eye,
    Pencil,
    Trash2,
    Filter,
    Download,
    FileText,
    X,
    Users,
    UserCheck,
    UserX,
    GraduationCap
} from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
    {
        title: 'Manajemen Mahasiswa',
        href: '/admin/mahasiswa',
    },
];

interface LinkProps {
    active: boolean;
    label: string;
    url: string;
}

interface User {
    id: number;
    name: string;
    email: string;
    is_active?: boolean;
}

interface Mahasiswa {
    id_mahasiswa: number;
    user_id: number;
    nama: string;
    nim: string;
    fakultas: string;
    program_studi: string;
    usia: number;
    jenis_kelamin: 'L' | 'P';
    created_at: string;
    updated_at: string;
    user?: User;
}

interface MahasiswaPagination {
    data: Mahasiswa[];
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
    fakultas: string;
    perPage: string;
    sortBy: string;
    sortOrder: string;
}

interface IndexProps {
    mahasiswa: MahasiswaPagination;
    fakultasList: string[];
    filters: FilterProps;
}

export default function Index({ mahasiswa, fakultasList, filters }: IndexProps) {
    const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;
    const flashMessage = flash?.success || flash?.error;
    const [showAlert, setShowAlert] = useState(flash?.success || flash?.error ? true : false);
    const [showFilters, setShowFilters] = useState(false);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);

    useEffect(() => {
        if (flashMessage) {
            const timer = setTimeout(() => setShowAlert(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [flashMessage]);

    const { data, setData } = useForm({
        search: filters.search || '',
        fakultas: filters.fakultas || '',
        perPage: filters.perPage || '10',
        sortBy: filters.sortBy || 'created_at',
        sortOrder: filters.sortOrder || 'desc',
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
            ...(data.fakultas && { fakultas: data.fakultas }),
            perPage: data.perPage,
            sortBy: data.sortBy,
            sortOrder: data.sortOrder,
        };

        router.get(route('admin.mahasiswa.index'), queryString, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Reset All Filters
    const handleReset = () => {
        setData({
            search: '',
            fakultas: '',
            perPage: '10',
            sortBy: 'created_at',
            sortOrder: 'desc',
        });

        router.get(route('admin.mahasiswa.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Handle Per Page Change
    const handlePerPageChange = (value: string) => {
        setData('perPage', value);

        const queryString = {
            ...(data.search && { search: data.search }),
            ...(data.fakultas && { fakultas: data.fakultas }),
            perPage: value,
            sortBy: data.sortBy,
            sortOrder: data.sortOrder,
        };

        router.get(route('admin.mahasiswa.index'), queryString, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Handle Fakultas Filter Change
    const handleFakultasChange = (value: string) => {
        setData('fakultas', value);

        const queryString = {
            ...(data.search && { search: data.search }),
            ...(value && { fakultas: value }),
            perPage: data.perPage,
            sortBy: data.sortBy,
            sortOrder: data.sortOrder,
        };

        router.get(route('admin.mahasiswa.index'), queryString, {
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
            ...(data.fakultas && { fakultas: data.fakultas }),
            perPage: data.perPage,
            sortBy: column,
            sortOrder: newSortOrder,
        };

        router.get(route('admin.mahasiswa.index'), queryString, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Handle Delete with Confirmation
    const handleDelete = (mhs: Mahasiswa) => {
        if (confirm(`Apakah Anda yakin ingin menghapus data mahasiswa "${mhs.nama}"?`)) {
            router.delete(route('admin.mahasiswa.destroy', { mahasiswa: mhs.id_mahasiswa }), {
                preserveScroll: true,
                onSuccess: () => {
                    console.log('Delete successful');
                },
                onError: (errors) => {
                    console.error('Delete error:', errors);
                },
            });
        }
    };

    // Handle checkbox selection
    const handleSelectItem = (id: number) => {
        setSelectedItems(prev => {
            return prev.includes(id)
                ? prev.filter(item => item !== id)
                : [...prev, id];
        });
    };

    // Handle select all
    const handleSelectAll = () => {
        if (selectedItems.length === mahasiswa.data.length) {
            setSelectedItems([]);
        } else {
            const allIds = mahasiswa.data.map(item => item.id_mahasiswa);
            setSelectedItems(allIds);
        }
    };

    // Handle bulk delete
    const handleBulkDelete = () => {
        if (selectedItems.length > 0 && confirm(`Hapus ${selectedItems.length} data mahasiswa yang dipilih?`)) {
            router.delete(route('admin.mahasiswa.bulk-delete'), {
                data: { ids: selectedItems },
                onSuccess: () => {
                    setSelectedItems([]);
                }
            });
        }
    };

    // Export Data
    const handleExport = () => {
        const queryString = {
            ...(data.search && { search: data.search }),
            ...(data.fakultas && { fakultas: data.fakultas }),
        };

        const params = new URLSearchParams(queryString).toString();
        window.open(`${route('admin.mahasiswa.export')}?${params}`, '_blank');
    };

    // Get Sort Icon
    const getSortIcon = (column: string) => {
        if (data.sortBy !== column) return '↕️';
        return data.sortOrder === 'asc' ? '↑' : '↓';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Mahasiswa - Admin" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Manajemen Mahasiswa</h1>
                        <p className="text-gray-600 mt-1">Kelola data mahasiswa dalam sistem konsultasi</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {selectedItems.length > 0 && (
                            <Button
                                onClick={handleBulkDelete}
                                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                            >
                                <Trash2 size={18} />
                                Hapus Terpilih ({selectedItems.length})
                            </Button>
                        )}
                        {/* <Button
                            onClick={handleExport}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg"
                        >
                            <Download size={18} />
                            Export
                        </Button> */}
                        <Link
                            href={route('admin.mahasiswa.create')}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                        >
                            <CirclePlusIcon size={18} />
                            Tambah Mahasiswa
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
                                    placeholder="Cari berdasarkan nama, NIM, fakultas, atau program studi..."
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
                        <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fakultas
                                </label>
                                <select
                                    value={data.fakultas}
                                    onChange={(e) => handleFakultasChange(e.target.value)}
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
                                    <option value="nama">Nama</option>
                                    <option value="nim">NIM</option>
                                    <option value="fakultas">Fakultas</option>
                                    <option value="program_studi">Program Studi</option>
                                    <option value="created_at">Tanggal Daftar</option>
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
                        </div>
                    )}
                </div>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white rounded-lg shadow-sm border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Mahasiswa</p>
                                <p className="text-2xl font-bold text-blue-600">{mahasiswa.total}</p>
                            </div>
                            <Users className="text-blue-500" size={24} />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Halaman</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {mahasiswa.current_page} / {mahasiswa.last_page}
                                </p>
                            </div>
                            <FileText className="text-green-500" size={24} />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Menampilkan</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {mahasiswa.from} - {mahasiswa.to}
                                </p>
                            </div>
                            <GraduationCap className="text-purple-500" size={24} />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Per Halaman</p>
                                <p className="text-2xl font-bold text-orange-600">{mahasiswa.per_page}</p>
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
                                        <input
                                            type="checkbox"
                                            checked={selectedItems.length === mahasiswa.data.length}
                                            onChange={handleSelectAll}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        #
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('nama')}
                                    >
                                        Mahasiswa {getSortIcon('nama')}
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('fakultas')}
                                    >
                                        Fakultas & Prodi {getSortIcon('fakultas')}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Info Personal
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('created_at')}
                                    >
                                        Tanggal Daftar {getSortIcon('created_at')}
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {mahasiswa.data.length > 0 ? (
                                    mahasiswa.data.map((mhs, index) => (
                                        <tr key={mhs.id_mahasiswa} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems.includes(mhs.id_mahasiswa)}
                                                    onChange={() => handleSelectItem(mhs.id_mahasiswa)}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {mahasiswa.from + index}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {mhs.nama}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        NIM: {mhs.nim}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {mhs.user?.email}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="text-sm text-gray-900 font-medium">
                                                    {mhs.fakultas}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    {mhs.program_studi}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">
                                                    Usia: {mhs.usia} tahun
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                        mhs.jenis_kelamin === 'L'
                                                            ? 'bg-blue-100 text-blue-800'
                                                            : 'bg-pink-100 text-pink-800'
                                                    }`}>
                                                        {mhs.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(mhs.created_at).toLocaleDateString('id-ID')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Link
                                                        href={route('admin.mahasiswa.show', mhs.id_mahasiswa)}
                                                        className="inline-flex items-center p-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                        title="Detail"
                                                    >
                                                        <Eye size={16} />
                                                    </Link>
                                                    <Link
                                                        href={route('admin.mahasiswa.edit', mhs.id_mahasiswa)}
                                                        className="inline-flex items-center p-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                        title="Edit"
                                                    >
                                                        <Pencil size={16} />
                                                    </Link>
                                                    <Button
                                                        onClick={() => handleDelete(mhs)}
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
                                        <td colSpan={7} className="px-6 py-8 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-500">
                                                <Users size={48} className="mb-4 text-gray-300" />
                                                <p className="text-lg font-medium">Tidak ada data mahasiswa</p>
                                                <p className="text-sm">Silakan tambahkan mahasiswa baru atau ubah filter pencarian</p>
                                                <div className="mt-4">
                                                    <Link
                                                        href={route('admin.mahasiswa.create')}
                                                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                                                    >
                                                        <CirclePlusIcon size={16} />
                                                        Tambah Mahasiswa
                                                    </Link>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {mahasiswa.data.length > 0 && (
                    <Pagination
                        gejalas={mahasiswa}
                        perPage={data.perPage}
                        onPerPageChange={handlePerPageChange}
                    />
                )}
            </div>
        </AppLayout>
    );
}
