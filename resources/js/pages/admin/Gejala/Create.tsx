import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Button } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { ArrowLeft, Save, Plus, Trash2, RotateCcw } from 'lucide-react';
import { useState, useEffect } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
    },
    {
        title: 'Manajemen Gejala',
        href: '/admin/gejala',
    },
    {
        title: 'Tambah Gejala',
        href: '/admin/gejala/create',
    },
];

interface OpsiJawaban {
    text: string;
    bobot: number;
}

interface CreateProps {
    kategoriOptions: Record<string, string>;
    defaultOpsiJawaban: OpsiJawaban[];
    nilaiCfOptions?: Record<string, string>;
}

export default function CreateGejala({ kategoriOptions, defaultOpsiJawaban, nilaiCfOptions }: CreateProps) {
    const { errors, flash } = usePage<{
        errors: Record<string, string>;
        flash?: { success?: string; error?: string }
    }>().props;

    const [showAlert, setShowAlert] = useState(false);

    const { data, setData, post, processing, reset } = useForm({
        kode_gejala: '',
        nama_gejala: '',
        deskripsi_gejala: '',
        kategori_gejala: '',
        nilai_cf: 0.5, // Default CF value
        opsi_jawaban: defaultOpsiJawaban || [
            { text: 'Tidak pernah', bobot: 0.0 },
            { text: 'Jarang', bobot: 0.25 },
            { text: 'Sering', bobot: 0.75 },
            { text: 'Selalu', bobot: 1.0 },
        ],
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
        post(route('admin.gejala.store'), {
            preserveScroll: true,
        });
    };

    const updateOpsiJawaban = (index: number, field: 'text' | 'bobot', value: string | number) => {
        const newOpsi = [...data.opsi_jawaban];
        if (field === 'bobot') {
            newOpsi[index][field] = parseFloat(value as string) || 0;
        } else {
            newOpsi[index][field] = value as string;
        }
        setData('opsi_jawaban', newOpsi);
    };

    const addOpsiJawaban = () => {
        if (data.opsi_jawaban.length < 6) {
            setData('opsi_jawaban', [...data.opsi_jawaban, { text: '', bobot: 0 }]);
        }
    };

    const removeOpsiJawaban = (index: number) => {
        if (data.opsi_jawaban.length > 2) {
            const newOpsi = data.opsi_jawaban.filter((_, i) => i !== index);
            setData('opsi_jawaban', newOpsi);
        }
    };

    const resetToDefault = () => {
        setData('opsi_jawaban', defaultOpsiJawaban);
    };

    // Get CF Label
    const getCfLabel = (nilai_cf: number) => {
        if (nilai_cf >= 0.9) return 'Sangat Tinggi';
        if (nilai_cf >= 0.7) return 'Tinggi';
        if (nilai_cf >= 0.5) return 'Sedang';
        if (nilai_cf >= 0.3) return 'Rendah';
        return 'Sangat Rendah';
    };

    // Get CF Color
    const getCfColor = (nilai_cf: number) => {
        if (nilai_cf >= 0.9) return 'text-red-600';
        if (nilai_cf >= 0.7) return 'text-orange-600';
        if (nilai_cf >= 0.5) return 'text-yellow-600';
        if (nilai_cf >= 0.3) return 'text-blue-600';
        return 'text-gray-600';
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tambah Gejala - Admin" />

            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                {/* Page Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Tambah Gejala Baru</h1>
                        <p className="text-gray-600 mt-1">Buat gejala baru dengan opsi jawaban dan nilai CF</p>
                    </div>
                    <Link
                        href={route('admin.gejala.index')}
                        className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg"
                    >
                        <ArrowLeft size={18} />
                        Kembali
                    </Link>
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
                        <AlertDescription className="font-medium">
                            {flash?.success || flash?.error}
                        </AlertDescription>
                    </Alert>
                )}

                {/* Form */}
                <div className="bg-white rounded-lg shadow-sm border">
                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        {/* Basic Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Kode Gejala <span className="text-red-500">*</span>
                                </label>
                                <Input
                                    type="text"
                                    value={data.kode_gejala}
                                    onChange={(e) => setData('kode_gejala', e.target.value.toUpperCase())}
                                    placeholder="Contoh: G001"
                                    className={errors.kode_gejala ? 'border-red-300' : ''}
                                    maxLength={10}
                                />
                                {errors.kode_gejala && (
                                    <p className="mt-1 text-sm text-red-600">{errors.kode_gejala}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Kategori Gejala
                                </label>
                                <select
                                    value={data.kategori_gejala}
                                    onChange={(e) => setData('kategori_gejala', e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="">Pilih Kategori</option>
                                    {Object.entries(kategoriOptions).map(([key, value]) => (
                                        <option key={key} value={key}>{value}</option>
                                    ))}
                                </select>
                                {errors.kategori_gejala && (
                                    <p className="mt-1 text-sm text-red-600">{errors.kategori_gejala}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Nama Gejala <span className="text-red-500">*</span>
                            </label>
                            <Input
                                type="text"
                                value={data.nama_gejala}
                                onChange={(e) => setData('nama_gejala', e.target.value)}
                                placeholder="Masukkan nama gejala"
                                className={errors.nama_gejala ? 'border-red-300' : ''}
                                maxLength={255}
                            />
                            {errors.nama_gejala && (
                                <p className="mt-1 text-sm text-red-600">{errors.nama_gejala}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Deskripsi Gejala
                            </label>
                            <textarea
                                value={data.deskripsi_gejala}
                                onChange={(e) => setData('deskripsi_gejala', e.target.value)}
                                placeholder="Deskripsi detail tentang gejala ini"
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                rows={3}
                            />
                            {errors.deskripsi_gejala && (
                                <p className="mt-1 text-sm text-red-600">{errors.deskripsi_gejala}</p>
                            )}
                        </div>

                        {/* CF Section */}
                        <div className="border-t pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Nilai Certainty Factor (CF) <span className="text-red-500">*</span>
                                    </label>
                                    <div className="space-y-2">
                                        <Input
                                            type="number"
                                            step="0.001"
                                            min="0"
                                            max="1"
                                            value={data.nilai_cf}
                                            onChange={(e) => setData('nilai_cf', parseFloat(e.target.value) || 0)}
                                            placeholder="0.500"
                                            className={errors.nilai_cf ? 'border-red-300' : ''}
                                        />
                                        <div className="flex items-center justify-between text-xs text-gray-600">
                                            <span>0.000 (Tidak Pasti)</span>
                                            <span>1.000 (Sangat Pasti)</span>
                                        </div>
                                        {errors.nilai_cf && (
                                            <p className="mt-1 text-sm text-red-600">{errors.nilai_cf}</p>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tingkat Kepastian
                                    </label>
                                    <div className="p-3 bg-gray-50 rounded-lg">
                                        <div className={`text-lg font-semibold ${getCfColor(data.nilai_cf)}`}>
                                            {getCfLabel(data.nilai_cf)}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            CF: {data.nilai_cf.toFixed(3)} ({(data.nilai_cf * 100).toFixed(1)}%)
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                                            <div
                                                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${data.nilai_cf * 100}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick CF Presets */}
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Preset Nilai CF (Klik untuk menggunakan)
                                </label>
                                <div className="grid grid-cols-5 gap-2">
                                    {[
                                        { value: 0.2, label: 'Sangat Rendah', color: 'bg-gray-100 hover:bg-gray-200 text-gray-700' },
                                        { value: 0.4, label: 'Rendah', color: 'bg-blue-100 hover:bg-blue-200 text-blue-700' },
                                        { value: 0.6, label: 'Sedang', color: 'bg-yellow-100 hover:bg-yellow-200 text-yellow-700' },
                                        { value: 0.8, label: 'Tinggi', color: 'bg-orange-100 hover:bg-orange-200 text-orange-700' },
                                        { value: 0.95, label: 'Sangat Tinggi', color: 'bg-red-100 hover:bg-red-200 text-red-700' }
                                    ].map((preset) => (
                                        <Button
                                            key={preset.value}
                                            type="button"
                                            onClick={() => setData('nilai_cf', preset.value)}
                                            className={`p-2 rounded-lg text-xs font-medium transition-colors ${preset.color}`}
                                        >
                                            <div>{preset.label}</div>
                                            <div className="text-xs opacity-75">{preset.value}</div>
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Opsi Jawaban Section */}
                        <div className="border-t pt-6">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-900">
                                        Opsi Jawaban <span className="text-red-500">*</span>
                                    </h3>
                                    <p className="text-sm text-gray-600">
                                        Harus ada tepat 4 opsi jawaban. Bobot antara 0-1.
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        onClick={resetToDefault}
                                        className="flex items-center gap-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 px-3 py-2 rounded-lg text-sm"
                                    >
                                        <RotateCcw size={16} />
                                        Reset Default
                                    </Button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                {data.opsi_jawaban.map((opsi, index) => (
                                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                        <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                                            {index + 1}
                                        </div>

                                        <div className="flex-1">
                                            <Input
                                                type="text"
                                                value={opsi.text}
                                                onChange={(e) => updateOpsiJawaban(index, 'text', e.target.value)}
                                                placeholder="Teks opsi jawaban"
                                                className={errors[`opsi_jawaban.${index}.text`] ? 'border-red-300' : ''}
                                                maxLength={100}
                                            />
                                            {errors[`opsi_jawaban.${index}.text`] && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors[`opsi_jawaban.${index}.text`]}
                                                </p>
                                            )}
                                        </div>

                                        <div className="w-32">
                                            <Input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="1"
                                                value={opsi.bobot}
                                                onChange={(e) => updateOpsiJawaban(index, 'bobot', e.target.value)}
                                                placeholder="0.00"
                                                className={errors[`opsi_jawaban.${index}.bobot`] ? 'border-red-300' : ''}
                                            />
                                            {errors[`opsi_jawaban.${index}.bobot`] && (
                                                <p className="mt-1 text-sm text-red-600">
                                                    {errors[`opsi_jawaban.${index}.bobot`]}
                                                </p>
                                            )}
                                        </div>

                                        <div className="w-24 text-center">
                                            <div className="text-xs text-gray-600">CF Hasil</div>
                                            <div className="text-sm font-medium text-blue-600">
                                                {(data.nilai_cf * opsi.bobot).toFixed(3)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {errors.opsi_jawaban && (
                                <p className="mt-2 text-sm text-red-600">{errors.opsi_jawaban}</p>
                            )}
                        </div>

                        {/* Preview Section */}
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Preview Pertanyaan</h3>
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="font-medium text-gray-900">
                                        {data.nama_gejala || 'Nama gejala akan muncul di sini'}
                                    </h4>
                                    <span className={`px-2 py-1 rounded text-xs font-medium ${getCfColor(data.nilai_cf)} bg-white`}>
                                        CF: {data.nilai_cf.toFixed(3)}
                                    </span>
                                </div>
                                {data.deskripsi_gejala && (
                                    <p className="text-sm text-gray-600 mb-3">{data.deskripsi_gejala}</p>
                                )}
                                <div className="space-y-2">
                                    {data.opsi_jawaban.map((opsi, index) => (
                                        <label key={index} className="flex items-center justify-between cursor-pointer bg-white p-2 rounded">
                                            <div className="flex items-center gap-3">
                                                <input
                                                    type="radio"
                                                    name="preview"
                                                    className="text-blue-600"
                                                    disabled
                                                />
                                                <span className="text-sm">
                                                    {opsi.text || `Opsi ${index + 1}`}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                Bobot: {opsi.bobot} → CF: {(data.nilai_cf * opsi.bobot).toFixed(3)}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Form Actions */}
                        <div className="flex items-center justify-end gap-4 pt-6 border-t">
                            <Button
                                type="button"
                                onClick={() => reset()}
                                className="px-6 py-2 border border-gray-300 text-gray-700 bg-white rounded-lg hover:bg-gray-50"
                            >
                                Reset Form
                            </Button>
                            <Button
                                type="submit"
                                disabled={processing}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg disabled:opacity-50"
                            >
                                <Save size={18} />
                                {processing ? 'Menyimpan...' : 'Simpan Gejala'}
                            </Button>
                        </div>
                    </form>
                </div>

                {/* Help Section */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h3 className="font-medium text-blue-900 mb-2">💡 Tips Mengisi Form</h3>
                    <ul className="text-sm text-blue-800 space-y-1">
                        <li><strong>Kode Gejala:</strong> Gunakan format yang konsisten (misal: G001, G002)</li>
                        <li><strong>Nama Gejala:</strong> Gunakan kalimat yang jelas dan mudah dipahami</li>
                        <li><strong>Nilai CF:</strong> Semakin tinggi nilai CF, semakin pasti gejala menunjukkan kondisi depresi</li>
                        <li><strong>Opsi Jawaban:</strong> Urutkan dari intensitas rendah ke tinggi</li>
                        <li><strong>Bobot:</strong> 0 = tidak ada gejala, 1 = gejala sangat kuat</li>
                        <li><strong>Formula:</strong> CF Hasil = CF Gejala × Bobot Jawaban User</li>
                    </ul>
                </div>
            </div>
        </AppLayout>
    );
}
