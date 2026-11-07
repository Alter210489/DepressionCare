import React, { useState, useEffect } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import {
    Save,
    ArrowLeft,
    Eye,
    EyeOff,
    UserPlus,
    AlertCircle,
    CheckCircle
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
        title: 'Tambah Mahasiswa',
        href: '/admin/mahasiswa/create',
    },
];

interface CreateProps {
    // Bisa ditambahkan fakultas list dari backend jika diperlukan
}

interface MahasiswaFormData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    nim: string;
    fakultas: string;
    program_studi: string;
    usia: string;
    jenis_kelamin: 'L' | 'P' | '';
}

export default function Create({}: CreateProps) {
    const { errors, flash } = usePage<{
        errors: Record<string, string>;
        flash?: { success?: string; error?: string }
    }>().props;

    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirmation, setShowPasswordConfirmation] = useState(false);
    const [showAlert, setShowAlert] = useState(false);

    const { data, setData, post, processing, reset } = useForm<MahasiswaFormData>({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        nim: '',
        fakultas: '',
        program_studi: '',
        usia: '',
        jenis_kelamin: '',
    });

    useEffect(() => {
        if (flash?.success || flash?.error) {
            setShowAlert(true);
            const timer = setTimeout(() => setShowAlert(false), 5000);
            return () => clearTimeout(timer);
        }
    }, [flash]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('admin.mahasiswa.store'), {
            preserveScroll: true,
            onSuccess: () => {
                // Form akan di-redirect ke index jika berhasil
            },
            onError: () => {
                // Error akan ditampilkan melalui errors prop
            }
        });
    };

    const handleReset = () => {
        reset();
    };

    // Daftar fakultas - bisa dipindah ke backend
    const fakultasList = [
        'Fakultas Teknik',
        'Fakultas Ekonomi dan Bisnis',
        'Fakultas Ilmu Komputer',
        'Fakultas Kedokteran',
        'Fakultas Hukum',
        'Fakultas Psikologi',
        'Fakultas Pendidikan',
        'Fakultas Pertanian',
        'Fakultas MIPA',
        'Fakultas Ilmu Sosial dan Politik'
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Mahasiswa - Admin" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link
                            href={route('admin.mahasiswa.index')}
                            className="inline-flex items-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                                <UserPlus className="text-blue-600" size={32} />
                                Tambah Mahasiswa Baru
                            </h1>
                            <p className="text-gray-600 mt-1">Lengkapi form untuk menambahkan mahasiswa baru</p>
                        </div>
                    </div>
                </div>

                {/* Flash Messages */}
                {showAlert && (flash?.success || flash?.error) && (
                    <Alert
                        variant="default"
                        className={`${
                            flash?.success
                                ? 'bg-green-50 border-green-200 text-green-800'
                                : 'bg-red-50 border-red-200 text-red-800'
                        } transition-all duration-300`}
                    >
                        <div className="flex">
                            {flash?.success ? (
                                <CheckCircle className="h-4 w-4 mr-2" />
                            ) : (
                                <AlertCircle className="h-4 w-4 mr-2" />
                            )}
                            <AlertDescription className="font-medium">
                                {flash?.success || flash?.error}
                            </AlertDescription>
                        </div>
                    </Alert>
                )}

                {/* Form */}
                <div className="bg-white rounded-lg shadow-sm border">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900">Informasi Mahasiswa</h3>
                        <p className="text-sm text-gray-600">Semua field dengan tanda * wajib diisi</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Informasi Akun */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="lg:col-span-2">
                                <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
                                    <div className="w-1 h-6 bg-blue-600 rounded"></div>
                                    Informasi Akun
                                </h4>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nama Lengkap *
                                </label>
                                <Input
                                    type="text"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    className={`${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                                    placeholder="Masukkan nama lengkap mahasiswa"
                                    required
                                />
                                {errors.name && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle size={14} />
                                        {errors.name}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email *
                                </label>
                                <Input
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    className={`${errors.email ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                                    placeholder="contoh@email.com"
                                    required
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle size={14} />
                                        {errors.email}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Password *
                                </label>
                                <div className="relative">
                                    <Input
                                        type={showPassword ? 'text' : 'password'}
                                        value={data.password}
                                        onChange={(e) => setData('password', e.target.value)}
                                        className={`pr-10 ${errors.password ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                                        placeholder="Minimal 8 karakter"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4 text-gray-400" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle size={14} />
                                        {errors.password}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Konfirmasi Password *
                                </label>
                                <div className="relative">
                                    <Input
                                        type={showPasswordConfirmation ? 'text' : 'password'}
                                        value={data.password_confirmation}
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        className={`pr-10 ${errors.password_confirmation ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                                        placeholder="Ulangi password"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPasswordConfirmation(!showPasswordConfirmation)}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                                    >
                                        {showPasswordConfirmation ? (
                                            <EyeOff className="h-4 w-4 text-gray-400" />
                                        ) : (
                                            <Eye className="h-4 w-4 text-gray-400" />
                                        )}
                                    </button>
                                </div>
                                {errors.password_confirmation && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle size={14} />
                                        {errors.password_confirmation}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Informasi Akademik */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="lg:col-span-2">
                                <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
                                    <div className="w-1 h-6 bg-green-600 rounded"></div>
                                    Informasi Akademik
                                </h4>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    NIM *
                                </label>
                                <Input
                                    type="text"
                                    value={data.nim}
                                    onChange={(e) => setData('nim', e.target.value)}
                                    className={`${errors.nim ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                                    placeholder="Contoh: 1234567890"
                                    required
                                />
                                {errors.nim && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle size={14} />
                                        {errors.nim}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Fakultas *
                                </label>
                                <select
                                    value={data.fakultas}
                                    onChange={(e) => setData('fakultas', e.target.value)}
                                    className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        errors.fakultas ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                                    }`}
                                    required
                                >
                                    <option value="">Pilih Fakultas</option>
                                    {fakultasList.map((fakultas) => (
                                        <option key={fakultas} value={fakultas}>
                                            {fakultas}
                                        </option>
                                    ))}
                                </select>
                                {errors.fakultas && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle size={14} />
                                        {errors.fakultas}
                                    </p>
                                )}
                            </div>

                            <div className="lg:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Program Studi *
                                </label>
                                <Input
                                    type="text"
                                    value={data.program_studi}
                                    onChange={(e) => setData('program_studi', e.target.value)}
                                    className={`${errors.program_studi ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                                    placeholder="Contoh: Teknik Informatika"
                                    required
                                />
                                {errors.program_studi && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle size={14} />
                                        {errors.program_studi}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Informasi Personal */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="lg:col-span-2">
                                <h4 className="text-md font-medium text-gray-900 mb-4 flex items-center gap-2">
                                    <div className="w-1 h-6 bg-purple-600 rounded"></div>
                                    Informasi Personal
                                </h4>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Usia *
                                </label>
                                <Input
                                    type="number"
                                    min="16"
                                    max="50"
                                    value={data.usia}
                                    onChange={(e) => setData('usia', e.target.value)}
                                    className={`${errors.usia ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                                    placeholder="Contoh: 20"
                                    required
                                />
                                {errors.usia && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle size={14} />
                                        {errors.usia}
                                    </p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Jenis Kelamin *
                                </label>
                                <select
                                    value={data.jenis_kelamin}
                                    onChange={(e) => setData('jenis_kelamin', e.target.value as 'L' | 'P' | '')}
                                    className={`w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                        errors.jenis_kelamin ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''
                                    }`}
                                    required
                                >
                                    <option value="">Pilih Jenis Kelamin</option>
                                    <option value="L">Laki-laki</option>
                                    <option value="P">Perempuan</option>
                                </select>
                                {errors.jenis_kelamin && (
                                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                                        <AlertCircle size={14} />
                                        {errors.jenis_kelamin}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleReset}
                                className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            >
                                Reset Form
                            </button>
                            <Link
                                href={route('admin.mahasiswa.index')}
                                className="px-6 py-2 text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                Batal
                            </Link>
                            <button
                                type="submit"
                                disabled={processing}
                                className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 ${
                                    processing ? 'opacity-75 cursor-not-allowed' : ''
                                }`}
                            >
                                <Save size={16} />
                                {processing ? 'Menyimpan...' : 'Simpan Mahasiswa'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </AppLayout>
    );
}
