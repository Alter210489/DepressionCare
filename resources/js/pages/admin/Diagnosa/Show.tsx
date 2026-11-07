import { Alert, AlertDescription } from '@/components/ui/alert';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@headlessui/react';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar, Edit, FileText, Stethoscope, Trash2, User, Clock, Info } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Diagnosa {
    id_diagnosa: number;
    nama_diagnosa: string;
    deskripsi: string;
    created_at: string;
    updated_at: string;
}

interface ShowProps {
    diagnosa: Diagnosa;
}

export default function ShowDiagnosa({ diagnosa }: ShowProps) {
    const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;
    const flashMessage = flash?.success || flash?.error;
    const [showAlert, setShowAlert] = useState(flash?.success || flash?.error ? true : false);

    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Dashboard',
            href: '/admin/dashboard',
        },
        {
            title: 'Manajemen Diagnosa',
            href: '/admin/diagnosa',
        },
        {
            title: 'Detail Diagnosa',
            href: `/admin/diagnosa/${diagnosa.id_diagnosa}`,
        },
    ];

    useEffect(() => {
        if (flashMessage) {
            const timer = setTimeout(() => setShowAlert(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [flashMessage]);

    // Handle Delete with Confirmation
    const handleDelete = () => {
        if (confirm(`Apakah Anda yakin ingin menghapus diagnosa "${diagnosa.nama_diagnosa}"?`)) {
            router.delete(route('admin.diagnosa.destroy', diagnosa.id_diagnosa), {
                onSuccess: () => {
                    router.visit(route('admin.diagnosa.index'));
                },
                onError: (errors) => {
                    console.error('Delete error:', errors);
                }
            });
        }
    };

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Diagnosa - ${diagnosa.nama_diagnosa}`} />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('admin.diagnosa.index')}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                        >
                            <ArrowLeft size={20} />
                            Kembali
                        </Link>
                        <div className="h-6 w-px bg-gray-300" />
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Detail Diagnosa</h1>
                            <p className="text-gray-600 mt-1">Informasi lengkap tentang diagnosa</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={route('admin.diagnosa.edit', diagnosa.id_diagnosa)}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                        >
                            <Edit size={18} />
                            Edit
                        </Link>
                        <Button
                            onClick={handleDelete}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
                        >
                            <Trash2 size={18} />
                            Hapus
                        </Button>
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
                    </Alert>
                )}

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Information */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
                            {/* Header Card */}
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="h-16 w-16 bg-white/20 rounded-full flex items-center justify-center">
                                            <Stethoscope className="h-8 w-8 text-white" />
                                        </div>
                                    </div>
                                    <div className="ml-6">
                                        <h2 className="text-2xl font-bold text-white">
                                            {diagnosa.nama_diagnosa}
                                        </h2>
                                        <p className="text-blue-100 mt-1">
                                            ID: {diagnosa.id_diagnosa}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-6">
                                <div className="space-y-6">
                                    {/* Deskripsi */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <Info className="h-5 w-5 text-gray-400" />
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Deskripsi
                                            </h3>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <p className="text-gray-700 leading-relaxed">
                                                {diagnosa.deskripsi}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Informasi Tambahan */}
                                    <div>
                                        <div className="flex items-center gap-2 mb-3">
                                            <FileText className="h-5 w-5 text-gray-400" />
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Informasi Tambahan
                                            </h3>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Calendar className="h-4 w-4 text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-600">
                                                        Dibuat pada
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-900">
                                                    {formatDate(diagnosa.created_at)}
                                                </p>
                                            </div>
                                            <div className="bg-gray-50 rounded-lg p-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <Clock className="h-4 w-4 text-gray-400" />
                                                    <span className="text-sm font-medium text-gray-600">
                                                        Terakhir diperbarui
                                                    </span>
                                                </div>
                                                <p className="text-sm text-gray-900">
                                                    {formatDate(diagnosa.updated_at)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="space-y-6">
                            {/* Quick Actions */}
                            <div className="bg-white rounded-lg shadow-sm border p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Aksi Cepat
                                </h3>
                                <div className="space-y-3">
                                    <Link
                                        href={route('admin.diagnosa.edit', diagnosa.id_diagnosa)}
                                        className="flex items-center gap-3 w-full text-left p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors"
                                    >
                                        <Edit className="h-5 w-5 text-blue-600" />
                                        <span className="text-sm font-medium text-blue-900">
                                            Edit Diagnosa
                                        </span>
                                    </Link>
                                    <Button
                                        onClick={handleDelete}
                                        className="flex items-center gap-3 w-full text-left p-3 rounded-lg bg-red-50 hover:bg-red-100 transition-colors"
                                    >
                                        <Trash2 className="h-5 w-5 text-red-600" />
                                        <span className="text-sm font-medium text-red-900">
                                            Hapus Diagnosa
                                        </span>
                                    </Button>
                                    <Link
                                        href={route('admin.diagnosa.index')}
                                        className="flex items-center gap-3 w-full text-left p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
                                    >
                                        <ArrowLeft className="h-5 w-5 text-gray-600" />
                                        <span className="text-sm font-medium text-gray-900">
                                            Kembali ke Daftar
                                        </span>
                                    </Link>
                                </div>
                            </div>

                            {/* Statistics */}
                            <div className="bg-white rounded-lg shadow-sm border p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Statistik
                                </h3>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">ID Diagnosa</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            #{diagnosa.id_diagnosa}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Panjang Deskripsi</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {diagnosa.deskripsi.length} karakter
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-gray-600">Kata dalam Deskripsi</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {diagnosa.deskripsi.split(' ').length} kata
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Related Actions */}
                            <div className="bg-white rounded-lg shadow-sm border p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Aksi Terkait
                                </h3>
                                <div className="space-y-3">
                                    <Link
                                        href={route('admin.aturan-diagnosa.index')}
                                        className="flex items-center gap-3 w-full text-left p-3 rounded-lg bg-purple-50 hover:bg-purple-100 transition-colors"
                                    >
                                        <FileText className="h-5 w-5 text-purple-600" />
                                        <div>
                                            <div className="text-sm font-medium text-purple-900">
                                                Aturan Diagnosa
                                            </div>
                                            <div className="text-xs text-purple-700">
                                                Kelola aturan untuk diagnosa ini
                                            </div>
                                        </div>
                                    </Link>
                                    <Link
                                        href={route('admin.riwayat-konsultasi.index')}
                                        className="flex items-center gap-3 w-full text-left p-3 rounded-lg bg-green-50 hover:bg-green-100 transition-colors"
                                    >
                                        <User className="h-5 w-5 text-green-600" />
                                        <div>
                                            <div className="text-sm font-medium text-green-900">
                                                Riwayat Konsultasi
                                            </div>
                                            <div className="text-xs text-green-700">
                                                Lihat konsultasi terkait
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
