import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import {
    ArrowLeft,
    User,
    Mail,
    GraduationCap,
    Calendar,
    MapPin,
    Phone,
    BookOpen,
    Users,
    Clock,
    Edit,
    Trash2,
    UserCheck,
    UserX
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
    {
        title: 'Detail Mahasiswa',
        href: '#',
    },
];

interface User {
    id: number;
    name: string;
    email: string;
    is_active?: boolean;
    created_at: string;
    updated_at: string;
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

interface ShowProps {
    mahasiswa: Mahasiswa;
}

export default function Show({ mahasiswa }: ShowProps) {
    // Handle Delete with Confirmation
    const handleDelete = () => {
        if (confirm(`Apakah Anda yakin ingin menghapus data mahasiswa "${mahasiswa.nama}"?`)) {
            router.delete(route('admin.mahasiswa.destroy', { mahasiswa: mahasiswa.id_mahasiswa }), {
                onSuccess: () => {
                    router.visit(route('admin.mahasiswa.index'));
                },
                onError: (errors: any) => {
                    console.error('Delete error:', errors);
                },
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Detail Mahasiswa - ${mahasiswa.nama} - Admin`} />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('admin.mahasiswa.index')}
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <ArrowLeft size={20} />
                            Kembali
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Detail Mahasiswa</h1>
                            <p className="text-gray-600 mt-1">Informasi lengkap data mahasiswa</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={route('admin.mahasiswa.edit', mahasiswa.id_mahasiswa)}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            <Edit size={18} />
                            Edit Data
                        </Link>
                        <button
                            onClick={handleDelete}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                        >
                            <Trash2 size={18} />
                            Hapus
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Student Profile Card */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="text-center">
                                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <User className="text-white" size={40} />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 mb-1">
                                    {mahasiswa.nama}
                                </h2>
                                <p className="text-gray-600 mb-2">NIM: {mahasiswa.nim}</p>
                                <div className="flex justify-center">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                        mahasiswa.user?.is_active
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {mahasiswa.user?.is_active ? (
                                            <>
                                                <UserCheck size={16} className="mr-1" />
                                                Aktif
                                            </>
                                        ) : (
                                            <>
                                                <UserX size={16} className="mr-1" />
                                                Tidak Aktif
                                            </>
                                        )}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 space-y-4">
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Mail size={18} />
                                    <span className="text-sm">{mahasiswa.user?.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Calendar size={18} />
                                    <span className="text-sm">Usia: {mahasiswa.usia} tahun</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-600">
                                    <Users size={18} />
                                    <span className="text-sm">
                                        {mahasiswa.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Details Section */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Academic Information */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <GraduationCap className="text-blue-600" size={20} />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Informasi Akademik</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Nomor Induk Mahasiswa (NIM)
                                    </label>
                                    <p className="text-gray-900 font-medium">{mahasiswa.nim}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Nama Lengkap
                                    </label>
                                    <p className="text-gray-900 font-medium">{mahasiswa.nama}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Fakultas
                                    </label>
                                    <p className="text-gray-900 font-medium">{mahasiswa.fakultas}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Program Studi
                                    </label>
                                    <p className="text-gray-900 font-medium">{mahasiswa.program_studi}</p>
                                </div>
                            </div>
                        </div>

                        {/* Personal Information */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <User className="text-green-600" size={20} />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Informasi Personal</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Usia
                                    </label>
                                    <p className="text-gray-900 font-medium">{mahasiswa.usia} tahun</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Jenis Kelamin
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                            mahasiswa.jenis_kelamin === 'L'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-pink-100 text-pink-800'
                                        }`}>
                                            {mahasiswa.jenis_kelamin === 'L' ? 'Laki-laki' : 'Perempuan'}
                                        </span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Email
                                    </label>
                                    <p className="text-gray-900 font-medium">{mahasiswa.user?.email}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Status Akun
                                    </label>
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                                        mahasiswa.user?.is_active
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-red-100 text-red-800'
                                    }`}>
                                        {mahasiswa.user?.is_active ? (
                                            <>
                                                <UserCheck size={16} className="mr-1" />
                                                Aktif
                                            </>
                                        ) : (
                                            <>
                                                <UserX size={16} className="mr-1" />
                                                Tidak Aktif
                                            </>
                                        )}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* System Information */}
                        <div className="bg-white rounded-lg shadow-sm border p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Clock className="text-purple-600" size={20} />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Informasi Sistem</h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        ID Mahasiswa
                                    </label>
                                    <p className="text-gray-900 font-medium">#{mahasiswa.id_mahasiswa}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        ID User
                                    </label>
                                    <p className="text-gray-900 font-medium">#{mahasiswa.user_id}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Tanggal Pendaftaran
                                    </label>
                                    <p className="text-gray-900 font-medium">
                                        {new Date(mahasiswa.created_at).toLocaleDateString('id-ID', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-1">
                                        Terakhir Diupdate
                                    </label>
                                    <p className="text-gray-900 font-medium">
                                        {new Date(mahasiswa.updated_at).toLocaleDateString('id-ID', {
                                            weekday: 'long',
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="bg-gray-50 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Aksi</h3>
                            <div className="flex flex-wrap gap-3">
                                <Link
                                    href={route('admin.mahasiswa.edit', mahasiswa.id_mahasiswa)}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    <Edit size={16} />
                                    Edit Data Mahasiswa
                                </Link>
                                <Link
                                    href={route('admin.mahasiswa.index')}
                                    className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    <ArrowLeft size={16} />
                                    Kembali ke Daftar
                                </Link>
                                <button
                                    onClick={handleDelete}
                                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                                >
                                    <Trash2 size={16} />
                                    Hapus Data
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
