import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@headlessui/react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save, X, Stethoscope } from 'lucide-react';
import { FormEvent, useState } from 'react';

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
        title: 'Tambah Diagnosa',
        href: '/admin/diagnosa/create',
    },
];

interface CreateDiagnosaProps {
    // Tidak ada props khusus yang dibutuhkan untuk create
}

export default function CreateDiagnosa({}: CreateDiagnosaProps) {
    const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        nama_diagnosa: '',
        deskripsi: '',
    });

    // Handle form submission
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        setIsSubmitting(true);

        post(route('admin.diagnosa.store'), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                reset();
                setIsSubmitting(false);
                // Redirect akan ditangani oleh controller
            },
            onError: (errors) => {
                setIsSubmitting(false);
                console.error('Validation errors:', errors);
            },
            onFinish: () => {
                setIsSubmitting(false);
            }
        });
    };

    // Handle input changes
    const handleInputChange = (field: string, value: string) => {
        setData(field as keyof typeof data, value);
    };

    // Handle form reset
    const handleReset = () => {
        reset();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Diagnosa - Admin" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Tambah Diagnosa</h1>
                        <p className="text-gray-600 mt-1">Buat diagnosa baru untuk sistem deteksi depresi</p>
                    </div>
                    <Link
                        href={route('admin.diagnosa.index')}
                        className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                    >
                        <ArrowLeft size={18} />
                        Kembali
                    </Link>
                </div>

                {/* Flash Messages */}
                {flash?.error && (
                    <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
                        <AlertDescription className="font-medium">
                            {flash.error}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Form Card */}
                <div className="bg-white rounded-lg shadow-sm border">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            <div className="flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                    <Stethoscope className="h-5 w-5 text-blue-600" />
                                </div>
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Form Tambah Diagnosa</h2>
                                <p className="text-sm text-gray-600">Lengkapi informasi diagnosa di bawah ini</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Nama Diagnosa Field */}
                        <div className="space-y-2">
                            <label
                                htmlFor="nama_diagnosa"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Nama Diagnosa <span className="text-red-500">*</span>
                            </label>
                            <Input
                                id="nama_diagnosa"
                                type="text"
                                value={data.nama_diagnosa}
                                onChange={(e) => handleInputChange('nama_diagnosa', e.target.value)}
                                className={`w-full ${errors.nama_diagnosa ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                                placeholder="Masukkan nama diagnosa (contoh: Depresi Ringan, Depresi Sedang, dll)"
                                required
                                maxLength={255}
                            />
                            {errors.nama_diagnosa && (
                                <p className="text-sm text-red-600 mt-1">{errors.nama_diagnosa}</p>
                            )}
                            <p className="text-xs text-gray-500">
                                Maksimal 255 karakter. Gunakan nama yang jelas dan mudah dipahami.
                            </p>
                        </div>

                        {/* Deskripsi Field */}
                        <div className="space-y-2">
                            <label
                                htmlFor="deskripsi"
                                className="block text-sm font-medium text-gray-700"
                            >
                                Deskripsi <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="deskripsi"
                                value={data.deskripsi}
                                onChange={(e) => handleInputChange('deskripsi', e.target.value)}
                                className={`w-full min-h-[120px] px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical ${
                                    errors.deskripsi ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : 'border-gray-300'
                                }`}
                                placeholder="Masukkan deskripsi detail tentang diagnosa ini..."
                                required
                                maxLength={1000}
                                rows={5}
                            />
                            {errors.deskripsi && (
                                <p className="text-sm text-red-600 mt-1">{errors.deskripsi}</p>
                            )}
                            <div className="flex justify-between items-center">
                                <p className="text-xs text-gray-500">
                                    Jelaskan karakteristik, gejala, dan informasi penting lainnya tentang diagnosa ini.
                                </p>
                                <span className="text-xs text-gray-400">
                                    {data.deskripsi.length}/1000
                                </span>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                            <Button
                                type="button"
                                onClick={handleReset}
                                disabled={processing || isSubmitting}
                                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <X size={18} />
                                Reset Form
                            </Button>

                            <div className="flex items-center gap-3">
                                <Link
                                    href={route('admin.diagnosa.index')}
                                    className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                                >
                                    Batal
                                </Link>
                                <Button
                                    type="submit"
                                    disabled={processing || isSubmitting || !data.nama_diagnosa.trim() || !data.deskripsi.trim()}
                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {(processing || isSubmitting) ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Menyimpan...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            Simpan Diagnosa
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Help Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-blue-900 mb-2">Tips Pengisian Form:</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Gunakan nama diagnosa yang sesuai dengan standar medis atau psikologis</li>
                        <li>• Deskripsi harus jelas dan informatif untuk membantu identifikasi yang akurat</li>
                        <li>• Pastikan nama diagnosa tidak duplikat dengan yang sudah ada</li>
                        <li>• Sertakan informasi tentang tingkat keparahan jika relevan</li>
                    </ul>
                </div>
            </div>
        </AppLayout>
    );
}
