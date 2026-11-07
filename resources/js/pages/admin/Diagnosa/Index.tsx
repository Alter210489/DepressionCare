import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Pagination } from '@/components/ui/pagination';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@headlessui/react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { CirclePlusIcon, Eye, Pencil, Search, Trash2, X, Filter, Download, FileText, Stethoscope } from 'lucide-react';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
    {
        title: 'Manajemen Diagnosa',
        href: '/admin/diagnosa',
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
    deskripsi: string;
    created_at: string;
    updated_at: string;
}

interface DiagnosaPagination {
    data: Diagnosa[];
    links: LinkProps[];
    from: number;
    to: number;
    total: number;
    current_page: number;
    last_page: number;
    per_page: number;
}

interface FilterProps {
    search?: string;
    sort_by?: string;
    sort_direction?: string;
}

interface IndexProps {
    diagnosas: DiagnosaPagination;
    filters: FilterProps;
    totalDiagnosas: number;
}

export default function Index({ diagnosas, filters, totalDiagnosas }: IndexProps) {
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
        per_page: '10',
        sort_by: filters.sort_by || 'nama_diagnosa',
        sort_direction: filters.sort_direction || 'asc',
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
            per_page: data.per_page,
            sort_by: data.sort_by,
            sort_direction: data.sort_direction,
        };

        router.get(route('admin.diagnosa.index'), queryString, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Reset All Filters
    const handleReset = () => {
        setData({
            search: '',
            per_page: '10',
            sort_by: 'nama_diagnosa',
            sort_direction: 'asc',
        });

        router.get(route('admin.diagnosa.index'), {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Handle Per Page Change
    const handlePerPageChange = (value: string) => {
        setData('per_page', value);

        const queryString = {
            ...(data.search && { search: data.search }),
            per_page: value,
            sort_by: data.sort_by,
            sort_direction: data.sort_direction,
        };

        router.get(route('admin.diagnosa.index'), queryString, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Handle Sort Change
    const handleSort = (column: string) => {
        const newSortDirection = data.sort_by === column && data.sort_direction === 'asc' ? 'desc' : 'asc';

        setData('sort_by', column);
        setData('sort_direction', newSortDirection);

        const queryString = {
            ...(data.search && { search: data.search }),
            per_page: data.per_page,
            sort_by: column,
            sort_direction: newSortDirection,
        };

        router.get(route('admin.diagnosa.index'), queryString, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Handle Delete with Confirmation
    const handleDelete = (diagnosa: Diagnosa) => {
        if (confirm(`Apakah Anda yakin ingin menghapus diagnosa "${diagnosa.nama_diagnosa}"?`)) {
            router.delete(route('admin.diagnosa.destroy', diagnosa.id_diagnosa), {
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

    // Get Sort Icon
    const getSortIcon = (column: string) => {
        if (data.sort_by !== column) return '↕️';
        return data.sort_direction === 'asc' ? '↑' : '↓';
    };

    // Truncate text helper
    const truncateText = (text: string, maxLength: number = 100) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Manajemen Diagnosa - Admin" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Manajemen Diagnosa</h1>
                        <p className="text-gray-600 mt-1">Kelola data diagnosa depresi mahasiswa</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={route('admin.diagnosa.create')}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                        >
                            <CirclePlusIcon size={18} />
                            Tambah Diagnosa
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
                                    placeholder="Cari berdasarkan nama diagnosa atau deskripsi..."
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
                        <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Entries per page
                                </label>
                                <select
                                    value={data.per_page}
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
                                    value={data.sort_by}
                                    onChange={(e) => handleSort(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                >
                                    <option value="nama_diagnosa">Nama Diagnosa</option>
                                    <option value="created_at">Tanggal Dibuat</option>
                                    <option value="updated_at">Tanggal Diperbarui</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Sort order
                                </label>
                                <select
                                    value={data.sort_direction}
                                    onChange={(e) => setData('sort_direction', e.target.value)}
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
                                <p className="text-sm text-gray-600">Total Diagnosa</p>
                                <p className="text-2xl font-bold text-blue-600">{totalDiagnosas || diagnosas.total}</p>
                            </div>
                            <Stethoscope className="text-blue-500" size={24} />
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Halaman</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {diagnosas.current_page} / {diagnosas.last_page}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Menampilkan</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {diagnosas.from} - {diagnosas.to}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm border p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Per Halaman</p>
                                <p className="text-2xl font-bold text-orange-600">{diagnosas.per_page}</p>
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
                                        onClick={() => handleSort('nama_diagnosa')}
                                    >
                                        Nama Diagnosa {getSortIcon('nama_diagnosa')}
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Deskripsi
                                    </th>
                                    <th
                                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSort('created_at')}
                                    >
                                        Tanggal Dibuat {getSortIcon('created_at')}
                                    </th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {diagnosas.data.length > 0 ? (
                                    diagnosas.data.map((diagnosa, index) => (
                                        <tr key={diagnosa.id_diagnosa} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {diagnosas.from + index}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                                            <Stethoscope className="h-5 w-5 text-indigo-600" />
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {diagnosa.nama_diagnosa}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                <div className="max-w-xs" title={diagnosa.deskripsi}>
                                                    {truncateText(diagnosa.deskripsi)}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {new Date(diagnosa.created_at).toLocaleDateString('id-ID')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Link
                                                        href={route('admin.diagnosa.show', diagnosa.id_diagnosa)}
                                                        className="inline-flex items-center p-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                        title="Detail"
                                                    >
                                                        <Eye size={16} />
                                                    </Link>
                                                    <Link
                                                        href={route('admin.diagnosa.edit', diagnosa.id_diagnosa)}
                                                        className="inline-flex items-center p-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                        title="Edit"
                                                    >
                                                        <Pencil size={16} />
                                                    </Link>
                                                    <Button
                                                        onClick={() => handleDelete(diagnosa)}
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
                                        <td colSpan={5} className="px-6 py-8 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-500">
                                                <Stethoscope size={48} className="mb-4 text-gray-300" />
                                                <p className="text-lg font-medium">Tidak ada data diagnosa</p>
                                                <p className="text-sm">Silakan tambahkan diagnosa baru atau ubah filter pencarian</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Pagination */}
                {diagnosas.data.length > 0 && diagnosas.links && (
                    <div className="mt-4 flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                            Menampilkan {diagnosas.from} sampai {diagnosas.to} dari {diagnosas.total} data
                        </div>
                        <div className="flex items-center space-x-2">
                            {diagnosas.links.map((link, index) => (
                                <Link
                                    key={index}
                                    href={link.url || '#'}
                                    className={`px-3 py-2 text-sm rounded-md ${
                                        link.active 
                                            ? 'bg-primary text-primary-foreground' 
                                            : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                                    }`}
                                    dangerouslySetInnerHTML={{ __html: link.label }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}