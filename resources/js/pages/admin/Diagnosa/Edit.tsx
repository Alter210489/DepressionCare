import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@headlessui/react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save, X, Stethoscope, Calendar, Clock } from 'lucide-react';
import { FormEvent, useState } from 'react';

interface Diagnosa {
    id_diagnosa: number;
    nama_diagnosa: string;
    deskripsi: string;
    created_at: string;
    updated_at: string;
}

interface EditDiagnosaProps {
    diagnosa: Diagnosa;
}

export default function EditDiagnosa({ diagnosa }: EditDiagnosaProps) {
    const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;
    const [isSubmitting, setIsSubmitting] = useState(false);

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
            title: 'Edit Diagnosa',
            href: `/admin/diagnosa/${diagnosa.id_diagnosa}/edit`,
        },
    ];

    const { data, setData, put, processing, errors, reset, isDirty } = useForm({
        nama_diagnosa: diagnosa.nama_diagnosa,
        deskripsi: diagnosa.deskripsi,
    });

    // Handle form submission
    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();

        setIsSubmitting(true);

        put(route('admin.diagnosa.update', diagnosa.id_diagnosa), {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                setIsSubmitting(false);
                // Success message akan ditangani oleh flash message
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

    // Check if data has changed
    const hasChanges = isDirty;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit Diagnosa: ${diagnosa.nama_diagnosa} - Admin`} />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Edit Diagnosa</h1>
                        <p className="text-gray-600 mt-1">
                            Perbarui informasi diagnosa: <span className="font-medium">{diagnosa.nama_diagnosa}</span>
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <Link
                            href={route('admin.diagnosa.show', diagnosa.id_diagnosa)}
                            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                        >
                            <Stethoscope size={18} />
                            Lihat Detail
                        </Link>
                        <Link
                            href={route('admin.diagnosa.index')}
                            className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                        >
                            <ArrowLeft size={18} />
                            Kembali
                        </Link>
                    </div>
                </div>

                {/* Flash Messages */}
                {flash?.success && (
                    <Alert className="bg-green-50 border-green-200 text-green-800">
                        <AlertDescription className="font-medium">
                            {flash.success}
                        </AlertDescription>
                    </Alert>
                )}

                {flash?.error && (
                    <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-800">
                        <AlertDescription className="font-medium">
                            {flash.error}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-blue-600" />
                            <div>
                                <p className="text-sm font-medium text-blue-900">Dibuat</p>
                                <p className="text-sm text-blue-700">
                                    {new Date(diagnosa.created_at).toLocaleDateString('id-ID', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-green-600" />
                            <div>
                                <p className="text-sm font-medium text-green-900">Terakhir Diperbarui</p>
                                <p className="text-sm text-green-700">
                                    {new Date(diagnosa.updated_at).toLocaleDateString('id-ID', {
                                        weekday: 'long',
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-lg shadow-sm border">
                    <div className="p-6 border-b border-gray-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="flex-shrink-0">
                                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                        <Stethoscope className="h-5 w-5 text-blue-600" />
                                    </div>
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-gray-900">Form Edit Diagnosa</h2>
                                    <p className="text-sm text-gray-600">
                                        ID: {diagnosa.id_diagnosa} | Perbarui informasi diagnosa
                                    </p>
                                </div>
                            </div>
                            {hasChanges && (
                                <div className="flex items-center gap-2 text-amber-600 bg-amber-50 px-3 py-1 rounded-full">
                                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                                    <span className="text-sm font-medium">Ada perubahan</span>
                                </div>
                            )}
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
                                placeholder="Masukkan nama diagnosa"
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
                                disabled={processing || isSubmitting || !hasChanges}
                                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <X size={18} />
                                Reset ke Awal
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
                                    disabled={processing || isSubmitting || !data.nama_diagnosa.trim() || !data.deskripsi.trim() || !hasChanges}
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
                                            Simpan Perubahan
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Help Section */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-amber-900 mb-2">Peringatan:</h3>
                    <ul className="text-sm text-amber-800 space-y-1">
                        <li>• Perubahan pada diagnosa dapat mempengaruhi hasil konsultasi yang sudah ada</li>
                        <li>• Pastikan perubahan yang dilakukan sudah sesuai dengan standar medis</li>
                        <li>• Konsultasikan dengan ahli jika diperlukan sebelum melakukan perubahan besar</li>
                        <li>• Simpan backup data sebelum melakukan perubahan signifikan</li>
                    </ul>
                </div>
            </div>
        </AppLayout>
    );
}
