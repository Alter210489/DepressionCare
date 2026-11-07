import React from 'react';
import { Head } from '@inertiajs/react';
import {
    CheckCircleIcon,
    ExclamationTriangleIcon,
    InformationCircleIcon,
    HeartIcon,
    AcademicCapIcon,
    CalendarDaysIcon,
    BeakerIcon,
    SparklesIcon,
    ShieldCheckIcon,
    CpuChipIcon,
    DocumentTextIcon,
    ChartBarIcon,
    ClipboardDocumentListIcon,
} from '@heroicons/react/24/outline';

interface Diagnosa {
    id_diagnosa: number;
    nama_diagnosa: string;
    deskripsi_diagnosa: string;
}

interface Konsultasi {
    id_konsultasi: number;
    tanggal_konsultasi: string;
    hasil_diagnosa: string;
    nilai_cf: number;
    tingkat_keparahan: string;
    rekomendasi: string | string[];
    diagnosa: Diagnosa;
    detail?: {
        jawaban_gejala?: any[];
        perhitungan_cf?: any[];
        cf_gabungan?: number;
        cf_percentage?: number;
        metode?: string;
        cf_array?: number[];
        statistik?: {
            total_gejala_dijawab: number;
            gejala_dengan_cf_positif: number;
            cf_gabungan: number;
            cf_percentage: number;
        };
    };
}

interface OpsiTerpilih {
    text: string;
    bobot: number;
}

interface GejalaDetail {
    gejala: {
        id_gejala: number;
        kode_gejala: string;
        nama_gejala: string;
        kategori_gejala: string;
        nilai_cf: number;
    };
    opsi_terpilih: OpsiTerpilih;
    bobot_jawaban: number;
    cf_hasil: number;
}

interface ConfidenceLevel {
    label: string;
    color: string;
}

interface Props {
    konsultasi: Konsultasi;
    gejalaDetails: GejalaDetail[];
    cfPercentage: number;
    confidenceLevel: ConfidenceLevel;
    rekomendasi: string[];
}

const safeToNumber = (value: any, defaultValue: number = 0): number => {
    if (typeof value === 'number' && !isNaN(value)) {
        return value;
    }
    if (typeof value === 'string') {
        const parsed = parseFloat(value);
        return !isNaN(parsed) ? parsed : defaultValue;
    }
    return defaultValue;
};

const safeToFixed = (value: any, digits: number = 4, defaultValue: string = '0.0000'): string => {
    const numValue = safeToNumber(value);
    try {
        return numValue.toFixed(digits);
    } catch (error) {
        console.warn('Error formatting number:', value, error);
        return defaultValue;
    }
};

const PrintResult: React.FC<Props> = ({
    konsultasi,
    gejalaDetails = [],
    cfPercentage = 0,
    confidenceLevel = { label: 'Tidak Diketahui', color: 'gray' },
    rekomendasi = []
}) => {

    React.useEffect(() => {
        // Auto print on load
        const timer = setTimeout(() => {
            window.print();
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    if (!konsultasi || !konsultasi.id_konsultasi) {
        return (
            <>
                <Head title="Hasil Konsultasi" />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Memuat data untuk dicetak...</p>
                    </div>
                </div>
            </>
        );
    }

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Tanggal tidak tersedia';
        try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) {
                return 'Format tanggal tidak valid';
            }
            return date.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Format tanggal tidak valid';
        }
    };

    const getSeverityColors = (severity: string) => {
        const colors: { [key: string]: { bg: string; text: string; border: string; icon: string } } = {
            'Normal': { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300', icon: '✅' },
            'Minimal': { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300', icon: '✅' },
            'Ringan': { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300', icon: '⚠️' },
            'Mild': { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300', icon: '⚠️' },
            'Sedang': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300', icon: '🚨' },
            'Moderate': { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300', icon: '🚨' },
            'Berat': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', icon: '🔴' },
            'Severe': { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300', icon: '🔴' }
        };

        if (colors[severity]) return colors[severity];

        for (const [key, value] of Object.entries(colors)) {
            if (severity && severity.toLowerCase().includes(key.toLowerCase())) {
                return value;
            }
        }

        return colors['Normal'];
    };

    // Safe data extraction
    const tingkatKeparahan = konsultasi?.tingkat_keparahan || 'Tidak Diketahui';
    const hasilDiagnosa = konsultasi?.hasil_diagnosa || 'Diagnosis tidak tersedia';
    const tanggalKonsultasi = konsultasi?.tanggal_konsultasi || '';
    const idKonsultasi = konsultasi?.id_konsultasi || 0;

    const cfGabungan = safeToNumber(konsultasi?.nilai_cf, 0);
    const cfPercentageDisplay = safeToNumber(cfPercentage, cfGabungan * 100);
    const formattedCfGabungan = safeToFixed(cfGabungan, 4);

    const diagnosaDeskripsi = konsultasi?.diagnosa?.deskripsi_diagnosa || 'Deskripsi tidak tersedia';
    const diagnosaNama = konsultasi?.diagnosa?.nama_diagnosa || hasilDiagnosa;

    const statistik = konsultasi?.detail?.statistik || {
        total_gejala_dijawab: gejalaDetails?.length || 0,
        gejala_dengan_cf_positif: gejalaDetails?.filter(g => g.cf_hasil > 0).length || 0,
        cf_gabungan: cfGabungan,
        cf_percentage: cfPercentageDisplay
    };

    // Parse recommendations
    let rekomendasiArray: string[] = [];
    if (Array.isArray(rekomendasi)) {
        rekomendasiArray = rekomendasi;
    } else if (typeof rekomendasi === 'string' && rekomendasi.length > 0) {
        try {
            const parsed = JSON.parse(rekomendasi);
            if (Array.isArray(parsed)) {
                rekomendasiArray = parsed;
            } else {
                rekomendasiArray = [rekomendasi];
            }
        } catch {
            rekomendasiArray = [rekomendasi];
        }
    } else if (konsultasi?.rekomendasi) {
        if (typeof konsultasi.rekomendasi === 'string') {
            try {
                const parsed = JSON.parse(konsultasi.rekomendasi);
                if (Array.isArray(parsed)) {
                    rekomendasiArray = parsed;
                } else {
                    rekomendasiArray = [konsultasi.rekomendasi];
                }
            } catch {
                rekomendasiArray = [konsultasi.rekomendasi];
            }
        } else if (Array.isArray(konsultasi.rekomendasi)) {
            rekomendasiArray = konsultasi.rekomendasi;
        }
    }

    const severityColors = getSeverityColors(tingkatKeparahan);

    return (
        <>
            <Head title="Hasil Konsultasi" />

            <style>{`
                @media print {
                    body { -webkit-print-color-adjust: exact; color-adjust: exact; }
                    .print-page { page-break-after: always; }
                    .no-print { display: none !important; }
                    .print-only { display: block !important; }
                    @page {
                        size: A4;
                        margin: 1cm 1.5cm;
                    }
                }
                @media screen {
                    .print-only { display: none; }
                    .no-print { display: block; }
                }
                .print-container {
                    max-width: 210mm;
                    min-height: 297mm;
                    margin: 0 auto;
                    background: white;
                    font-family: 'Inter', sans-serif;
                }
            `}</style>

            <div className="print-container bg-white text-black">
                {/* Header */}
                <div className="border-b-2 border-blue-600 pb-6 mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-4">
                            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                                <AcademicCapIcon className="h-8 w-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Mental Health Detection System</h1>
                                <p className="text-gray-600">Laporan Hasil Konsultasi</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                        <div className="grid grid-cols-3 gap-6 text-sm">
                            <div>
                                <p className="font-semibold text-blue-900 mb-1">Tanggal Konsultasi</p>
                                <p className="text-blue-800">{formatDate(tanggalKonsultasi)}</p>
                            </div>
                            <div>
                                <p className="font-semibold text-blue-900 mb-1">Metode Analisis</p>
                                <p className="text-blue-800">Certainty Factor (CF)</p>
                            </div>
                            <div>
                                <p className="font-semibold text-blue-900 mb-1">Status</p>
                                <p className="text-blue-800">Selesai</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Result */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <SparklesIcon className="h-6 w-6 mr-3 text-blue-600" />
                        Hasil Diagnosis
                    </h2>

                    <div className="bg-gray-50 rounded-lg p-6 border border-gray-200 mb-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`inline-flex items-center px-4 py-2 rounded-lg border ${severityColors.bg} ${severityColors.text} ${severityColors.border}`}>
                                <span className="mr-2">{severityColors.icon}</span>
                                <span className="font-bold">{diagnosaNama}</span>
                            </div>
                        </div>

                        <p className="text-gray-700 leading-relaxed mb-4">
                            {diagnosaDeskripsi}
                        </p>

                        <div className="bg-white rounded-lg p-4 border border-gray-100">
                            <h4 className="font-semibold text-gray-900 mb-3">Metrik Analisis</h4>
                            <div className="grid grid-cols-2 gap-6 text-sm">
                                <div>
                                    <p className="text-gray-600 mb-1">Indeks Keyakinan Sistem</p>
                                    <p className="text-2xl font-bold text-purple-600">
                                        {cfPercentageDisplay.toFixed(1)}%
                                    </p>
                                    <p className="text-xs text-gray-500">Status: {confidenceLevel?.label || 'Tidak Diketahui'}</p>
                                </div>
                                <div>
                                    <p className="text-gray-600 mb-1">Nilai CF Gabungan</p>
                                    <p className="text-xl font-mono font-bold text-gray-900">
                                        {formattedCfGabungan}
                                    </p>
                                    <p className="text-xs text-gray-500">Gejala Relevan: {statistik.gejala_dengan_cf_positif}/{statistik.total_gejala_dijawab}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recommendations */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <HeartIcon className="h-6 w-6 mr-3 text-emerald-600" />
                        Rekomendasi Tindakan
                    </h2>

                    <div className="space-y-3">
                        {rekomendasiArray && rekomendasiArray.length > 0 ? (
                            rekomendasiArray.map((item, index) => (
                                <div key={index} className="flex items-start space-x-3 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                                    <div className="w-6 h-6 bg-emerald-600 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                        <CheckCircleIcon className="h-4 w-4 text-white" />
                                    </div>
                                    <p className="text-gray-700 leading-relaxed">{item}</p>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
                                <p>Tidak ada rekomendasi khusus saat ini</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Technical Details */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <CpuChipIcon className="h-6 w-6 mr-3 text-indigo-600" />
                        Detail Teknis Analisis
                    </h2>

                    <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                        <div className="grid grid-cols-2 gap-8 mb-6">
                            <div>
                                <h4 className="font-semibold text-blue-900 mb-3">Statistik Evaluasi</h4>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-blue-800">Total Gejala Dievaluasi:</span>
                                        <span className="font-bold text-blue-900">{statistik.total_gejala_dijawab}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-blue-800">Gejala Relevan (CF &gt; 0):</span>
                                        <span className="font-bold text-blue-900">{statistik.gejala_dengan_cf_positif}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-blue-800">Akurasi Sistem:</span>
                                        <span className="font-bold text-blue-900">
                                            {cfPercentageDisplay.toFixed(1)}%
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h4 className="font-semibold text-blue-900 mb-3">Metodologi CF</h4>
                                <div className="space-y-2 text-sm text-blue-800">
                                    <p>• Formula: CF = CF1 + CF2 × (1 - CF1)</p>
                                    <p>• Threshold Kategori:</p>
                                    <div className="ml-4 space-y-1 text-xs">
                                        <p>≥98%: Berat (Severe)</p>
                                        <p>85-97%: Sedang (Moderate)</p>
                                        <p>50-84%: Ringan (Mild)</p>
                                        <p>0-49%: Normal/Minimal</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer & Disclaimers */}
                <div className="border-t-2 border-gray-200 pt-6 mt-8">
                    <div className="grid grid-cols-2 gap-8">
                        <div>
                            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                                <div className="flex items-start space-x-3">
                                    <ExclamationTriangleIcon className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-amber-900 mb-2">Disclaimer Medis</h4>
                                        <div className="text-xs text-amber-800 space-y-1">
                                            <p>• Hasil ini adalah screening awal menggunakan AI</p>
                                            <p>• Bukan diagnosis medis resmi</p>
                                            <p>• Konsultasi dengan profesional kesehatan mental direkomendasikan</p>
                                            <p>• Untuk evaluasi lebih lanjut hubungi konselor/psikolog</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                                <div className="flex items-start space-x-3">
                                    <ShieldCheckIcon className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-green-900 mb-2">Privasi & Keamanan</h4>
                                        <div className="text-xs text-green-800 space-y-1">
                                            <p>• Data konsultasi dijaga kerahasiaannya</p>
                                            <p>• Analisis dilakukan secara anonim</p>
                                            <p>• Tidak ada informasi personal yang dibagikan</p>
                                            <p>• Laporan ini untuk referensi pribadi</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="text-center mt-6 pt-4 border-t border-gray-200">
                        <p className="text-xs text-gray-500">
                            Mental Health Detection System | Universitas
                        </p>
                        <p className="text-xs text-gray-400">
                            Dokumen ini dicetak secara otomatis dari sistem dan tidak memerlukan tanda tangan
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
};

export default PrintResult;
