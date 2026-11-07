import React, { useState, useEffect, useMemo } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ChevronLeftIcon,
    InformationCircleIcon,
    ExclamationTriangleIcon,
    CheckCircleIcon,
    XMarkIcon,
    ChartBarIcon,
    BeakerIcon,
} from '@heroicons/react/24/outline';

interface OpsiJawaban {
    text: string;
    bobot: number;
}

interface Gejala {
    id: number;
    kode: string;
    nama: string;
    deskripsi: string;
    kategori: string;
    nilai_cf: number;
    opsi_jawaban: OpsiJawaban[];
}

interface GejalaByKategori {
    [kategori: string]: Gejala[];
}

interface KategoriOption {
    key: string;
    label: string;
}

interface JawabanGejala {
    id_gejala: number;
    opsi_terpilih: number;
}

interface Props {
    gejalaByKategori: GejalaByKategori;
    kategoriOptions: KategoriOption[];
    totalGejala: number;
}

const Start: React.FC<Props> = ({
    gejalaByKategori,
    kategoriOptions,
    totalGejala
}) => {
    const [jawaban, setJawaban] = useState<{ [key: number]: number }>({});
    const [showValidation, setShowValidation] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        jawaban: [] as JawabanGejala[]
    });

    useEffect(() => {
        const jawabanArray = Object.entries(jawaban).map(([gejalaId, opsiTerpilih]) => ({
            id_gejala: parseInt(gejalaId),
            opsi_terpilih: opsiTerpilih
        }));
        setData('jawaban', jawabanArray);
    }, [jawaban, setData]);

    // WAJIB SEMUA PERTANYAAN DIJAWAB
    const canSubmit = useMemo(() => {
        return Object.keys(jawaban).length === totalGejala;
    }, [jawaban, totalGejala]);

    const progressPercentage = useMemo(() => {
        return totalGejala > 0 ? Math.round((Object.keys(jawaban).length / totalGejala) * 100) : 0;
    }, [jawaban, totalGejala]);

    // Hapus minimum required - sekarang WAJIB SEMUA
    const sisaPertanyaan = useMemo(() => {
        return totalGejala - Object.keys(jawaban).length;
    }, [jawaban, totalGejala]);

    const handleGejalaChange = (idGejala: number, opsiTerpilih: number) => {
        setJawaban(prev => ({
            ...prev,
            [idGejala]: opsiTerpilih
        }));
        setShowValidation(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (Object.keys(jawaban).length === 0) {
            setShowValidation(true);
            alert('Anda harus menjawab semua pertanyaan untuk melanjutkan.');
            return;
        }

        // VALIDASI WAJIB SEMUA PERTANYAAN
        if (!canSubmit) {
            setShowValidation(true);
            alert(`Anda harus menjawab SEMUA ${totalGejala} pertanyaan gejala. Sisa ${sisaPertanyaan} pertanyaan lagi.`);
            return;
        }

        post(route('mahasiswa.konsultasi.process'), {
            preserveState: false,
            preserveScroll: false,
            replace: false,
            onError: (errors) => {
                console.error('Form submission errors:', errors);

                let errorMessage = 'Terjadi kesalahan saat memproses data. Silakan coba lagi.';

                if (errors.message) {
                    errorMessage = errors.message;
                } else if (errors.jawaban) {
                    const jawabanError = Array.isArray(errors.jawaban) ? errors.jawaban[0] : errors.jawaban;
                    errorMessage = 'Error pada jawaban: ' + jawabanError;
                } else if (errors['jawaban.0.id_gejala']) {
                    errorMessage = 'Error: ID gejala tidak valid';
                } else if (errors['jawaban.0.opsi_terpilih']) {
                    errorMessage = 'Error: Pilihan jawaban tidak valid';
                } else {
                    const firstErrorKey = Object.keys(errors)[0];
                    if (firstErrorKey && errors[firstErrorKey]) {
                        const errorValue = Array.isArray(errors[firstErrorKey])
                            ? errors[firstErrorKey][0]
                            : errors[firstErrorKey];
                        errorMessage = `Error: ${errorValue}`;
                    }
                }

                alert(errorMessage);
            }
        });
    };

    const clearAnswer = (gejalaId: number) => {
        setJawaban(prev => {
            const newJawaban = { ...prev };
            delete newJawaban[gejalaId];
            return newJawaban;
        });
    };

    const clearAllAnswers = () => {
        if (window.confirm('Apakah Anda yakin ingin menghapus semua jawaban?')) {
            setJawaban({});
        }
    };

    return (
        <>
            <Head title="Konsultasi Mental Health - Mahasiswa" />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
                {/* Header */}
                <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                    <div className="absolute inset-0 bg-black/5"></div>

                    <div className="absolute top-0 right-0 w-24 h-24 sm:w-48 sm:h-48 lg:w-64 lg:h-64 bg-white/10 rounded-full -translate-y-12 translate-x-12 sm:-translate-y-24 sm:translate-x-24 lg:-translate-y-32 lg:translate-x-32"></div>
                    <div className="absolute bottom-0 left-0 w-20 h-20 sm:w-32 sm:h-32 lg:w-48 lg:h-48 bg-white/10 rounded-full translate-y-10 -translate-x-10 sm:translate-y-16 sm:-translate-x-16 lg:translate-y-24 lg:-translate-x-24"></div>

                    <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="py-6 sm:py-8">
                            <div className="mb-4 sm:mb-6">
                                <Link
                                    href={route('mahasiswa.konsultasi.index')}
                                    className="inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-white/20 hover:bg-white/30 border border-white/30 backdrop-blur-sm rounded-lg sm:rounded-xl text-sm font-medium text-white transition-all duration-300 hover:scale-105"
                                >
                                    <ChevronLeftIcon className="h-4 w-4 mr-2" />
                                    Kembali
                                </Link>
                            </div>

                            <div className="text-center sm:text-left">
                                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-3 sm:mb-4 leading-tight text-white">
                                    Konsultasi Mental Health
                                </h1>
                                <p className="text-base sm:text-lg lg:text-xl text-blue-100 mb-4 sm:mb-6 max-w-3xl">
                                    Evaluasi kesehatan mental menggunakan metode Certainty Factor
                                </p>

                                <div className="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-6 text-xs sm:text-sm text-white/90">
                                    <div className="flex items-center space-x-1 sm:space-x-2">
                                        <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                                        <span>100% Anonim</span>
                                    </div>
                                    <div className="flex items-center space-x-1 sm:space-x-2">
                                        <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                                        <span>Hasil Instan</span>
                                    </div>
                                    <div className="flex items-center space-x-1 sm:space-x-2">
                                        <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                                        <span>{totalGejala} Gejala</span>
                                    </div>
                                    <div className="flex items-center space-x-1 sm:space-x-2">
                                        <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                                        <span>WAJIB SEMUA</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    {/* Progress Section */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-white/20 p-4 sm:p-6 mb-6 sm:mb-8">
                        <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Progress Konsultasi</h3>
                            <div className="flex items-center space-x-3">
                                <span className={`text-xl sm:text-2xl font-bold ${canSubmit ? 'text-green-600' : 'text-blue-600'}`}>
                                    {progressPercentage}%
                                </span>
                                {Object.keys(jawaban).length > 0 && (
                                    <button
                                        onClick={clearAllAnswers}
                                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        title="Hapus semua jawaban"
                                    >
                                        <XMarkIcon className="h-4 w-4" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-2 sm:h-3 overflow-hidden mb-2 sm:mb-3">
                            <div
                                className={`h-full rounded-full transition-all duration-700 ease-out ${
                                    canSubmit
                                        ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                                        : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                                }`}
                                style={{ width: `${progressPercentage}%` }}
                            ></div>
                        </div>

                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                <p className="text-sm text-gray-600">
                                    {Object.keys(jawaban).length} dari {totalGejala} gejala terjawab
                                </p>
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                        <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${canSubmit ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                        <span className={`text-xs font-medium ${canSubmit ? 'text-green-600' : 'text-red-600'}`}>
                                            {canSubmit ? 'LENGKAP ✓' : `SISA ${sisaPertanyaan} LAGI`}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Validation Notice - WAJIB SEMUA */}
                    {showValidation || !canSubmit && Object.keys(jawaban).length > 0 ? (
                        <div className={`mb-6 p-4 rounded-lg border-l-4 ${
                            canSubmit
                                ? 'bg-green-50 border-green-400 text-green-800'
                                : 'bg-red-50 border-red-400 text-red-800'
                        }`}>
                            <div className="flex items-center space-x-2">
                                {canSubmit ? (
                                    <CheckCircleIcon className="h-5 w-5 text-green-600" />
                                ) : (
                                    <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                                )}
                                <p className="font-medium">
                                    {canSubmit
                                        ? 'Semua pertanyaan telah dijawab! Anda dapat memulai diagnosa.'
                                        : `WAJIB menjawab ${sisaPertanyaan} pertanyaan lagi untuk melanjutkan diagnosa.`
                                    }
                                </p>
                            </div>
                        </div>
                    ) : null}

                    {/* Error Display */}
                    {Object.keys(errors).length > 0 && (
                        <div className="mb-6 bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-lg sm:rounded-xl shadow-md p-4 sm:p-6">
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-lg flex items-center justify-center">
                                    <ExclamationTriangleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-red-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-sm sm:text-base font-bold text-red-800 mb-2">Terjadi Kesalahan</h3>
                                    <div className="space-y-1">
                                        {Object.entries(errors).map(([key, value]) => (
                                            <div key={key} className="text-xs sm:text-sm text-red-700">
                                                <span className="font-medium">{key}:</span> {Array.isArray(value) ? value.join(', ') : String(value)}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                        {/* Questions Section */}
                        <div className="space-y-6">
                            {Object.entries(gejalaByKategori).map(([kategori, gejalaList]) => {
                                const answeredInCategory = gejalaList.filter(g => jawaban[g.id] !== undefined).length;

                                return (
                                    <div key={kategori} className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-white/20 overflow-hidden">
                                        {/* Category Header */}
                                        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-4 sm:px-6 py-3 sm:py-4">
                                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                                                <h3 className="text-lg sm:text-xl font-bold text-white flex items-center space-x-2">
                                                    <span className="text-base">📊</span>
                                                    <span>{kategori.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                                                </h3>
                                                <div className="flex items-center space-x-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs sm:text-sm font-medium text-white ${
                                                        answeredInCategory === gejalaList.length ? 'bg-green-500/80' : 'bg-white/20'
                                                    }`}>
                                                        {answeredInCategory}/{gejalaList.length} terjawab
                                                    </span>
                                                    {answeredInCategory === gejalaList.length && (
                                                        <CheckCircleIcon className="h-5 w-5 text-green-300" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Questions */}
                                        <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
                                            {gejalaList.map((gejala, index) => {
                                                const isAnswered = jawaban[gejala.id] !== undefined;

                                                return (
                                                    <div
                                                        key={gejala.id}
                                                        className={`rounded-lg sm:rounded-xl p-4 sm:p-6 border-2 transition-all duration-200 ${
                                                            isAnswered
                                                                ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200 shadow-md'
                                                                : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200 shadow-sm hover:shadow-md'
                                                        }`}
                                                    >
                                                        {/* Question Header */}
                                                        <div className="flex items-start justify-between mb-4">
                                                            <div className="flex items-start space-x-3 flex-1">
                                                                <div className={`flex-shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center text-white font-bold text-xs sm:text-sm ${
                                                                    isAnswered
                                                                        ? 'bg-gradient-to-r from-emerald-500 to-green-600'
                                                                        : 'bg-gradient-to-r from-red-500 to-rose-600'
                                                                }`}>
                                                                    {isAnswered ? '✓' : '!'}
                                                                </div>

                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex flex-wrap items-center gap-2 mb-2">
                                                                        <span className="text-blue-600 font-mono text-xs sm:text-sm font-medium">
                                                                            {gejala.kode}
                                                                        </span>
                                                                        {/* <div className="flex items-center space-x-1 text-xs text-gray-500">
                                                                            <BeakerIcon className="h-3 w-3" />
                                                                            <span>CF: {gejala.nilai_cf}</span>
                                                                        </div> */}
                                                                        {!isAnswered && (
                                                                            <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-full font-medium">
                                                                                WAJIB
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <p className="font-semibold text-gray-800 text-sm sm:text-base leading-relaxed mb-2">
                                                                        {gejala.nama}
                                                                    </p>
                                                                    {gejala.deskripsi && (
                                                                        <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                                                                            {gejala.deskripsi}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>

                                                            {/* Clear Answer Button */}
                                                            {isAnswered && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() => clearAnswer(gejala.id)}
                                                                    className="ml-2 p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                                    title="Hapus jawaban"
                                                                >
                                                                    <XMarkIcon className="h-4 w-4" />
                                                                </button>
                                                            )}
                                                        </div>

                                                        {/* Answer Options */}
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
                                                            {gejala.opsi_jawaban?.map((opsi, opsiIndex) => {
                                                                const isSelected = jawaban[gejala.id] === opsiIndex;

                                                                return (
                                                                    <label
                                                                        key={opsiIndex}
                                                                        className={`relative flex items-center p-3 sm:p-4 rounded-lg sm:rounded-xl border cursor-pointer transition-all duration-200 hover:scale-[1.02] ${
                                                                            isSelected
                                                                                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md border-transparent'
                                                                                : 'bg-white hover:bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300'
                                                                        }`}
                                                                    >
                                                                        <input
                                                                            type="radio"
                                                                            name={`gejala_${gejala.id}`}
                                                                            value={opsiIndex}
                                                                            checked={isSelected}
                                                                            onChange={() => handleGejalaChange(gejala.id, opsiIndex)}
                                                                            className="sr-only"
                                                                        />

                                                                        <div className="flex items-center space-x-2 w-full">
                                                                            <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full border-2 flex items-center justify-center ${
                                                                                isSelected ? 'border-current' : 'border-gray-400'
                                                                            }`}>
                                                                                {isSelected && (
                                                                                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-current"></div>
                                                                                )}
                                                                            </div>
                                                                            <div className="flex-1">
                                                                                <span className="text-xs sm:text-sm font-medium block">
                                                                                    {opsi.text}
                                                                                </span>
                                                                                {/* <span className={`text-xs ${isSelected ? 'text-current opacity-75' : 'text-gray-500'}`}>
                                                                                    Bobot: {opsi.bobot}
                                                                                </span> */}
                                                                            </div>
                                                                        </div>

                                                                        {isSelected && (
                                                                            <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-current rounded-full flex items-center justify-center">
                                                                                <CheckCircleIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                                                                            </div>
                                                                        )}
                                                                    </label>
                                                                );
                                                            }) || (
                                                                <div className="col-span-full text-center py-4 text-gray-500 bg-gray-50 rounded-lg">
                                                                    Tidak ada pilihan jawaban tersedia
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Submit Section */}
                        <div className="bg-white/90 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg border border-white/20 p-6 sm:p-8 text-center">
                            <div className="max-w-md mx-auto space-y-4 sm:space-y-6">
                                <div className="space-y-2">
                                    <h3 className="text-lg sm:text-xl font-bold text-gray-800">Siap Diagnosa?</h3>
                                    <div className="text-sm sm:text-base text-gray-600 space-y-1">
                                        <p>{Object.keys(jawaban).length}/{totalGejala} gejala terjawab</p>
                                        <p className={`text-xs font-bold ${canSubmit ? 'text-green-600' : 'text-red-600'}`}>
                                            {canSubmit ? 'SEMUA PERTANYAAN TERJAWAB ✓' : `SISA ${sisaPertanyaan} PERTANYAAN LAGI`}
                                        </p>
                                    </div>

                                    {!canSubmit && (
                                        <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200 font-medium">
                                            WAJIB menjawab SEMUA {totalGejala} pertanyaan untuk melanjutkan diagnosa
                                        </p>
                                    )}
                                </div>

                                <button
                                    type="submit"
                                    disabled={!canSubmit || processing}
                                    className={`w-full py-3 sm:py-4 px-6 sm:px-8 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 ${
                                        !canSubmit || processing
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-gradient-to-r from-emerald-600 to-green-600 text-white hover:from-emerald-700 hover:to-green-700 hover:scale-105 shadow-lg hover:shadow-xl active:scale-95'
                                    }`}
                                >
                                    {processing ? (
                                        <div className="flex items-center justify-center space-x-2">
                                            <svg className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            <span>Memproses...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center space-x-2">
                                            <ChartBarIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                                            <span>
                                                {canSubmit ? 'Mulai Diagnosa' : `Jawab ${sisaPertanyaan} Lagi`}
                                            </span>
                                        </div>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>

                    {/* Info Panel - UPDATE */}
                    <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 mt-6">
                        <div className="flex items-start space-x-3">
                            <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-red-500 to-rose-600 rounded-lg flex items-center justify-center">
                                <ExclamationTriangleIcon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h4 className="text-sm sm:text-base font-bold text-red-900 mb-3">PENTING: Petunjuk Pengisian</h4>
                                <div className="text-xs sm:text-sm text-red-800 space-y-1">
                                    <p>• <strong>WAJIB</strong> menjawab SEMUA {totalGejala} pertanyaan</p>
                                    <p>• Jawab sesuai kondisi 2 minggu terakhir</p>
                                    <p>• Data dijaga kerahasiaannya (100% anonim)</p>
                                    <p>• Tidak dapat melanjutkan jika ada yang kosong</p>
                                    <p>• Menggunakan metode Certainty Factor (CF)</p>
                                    <p>• Hasil diagnosis berdasarkan semua jawaban</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Start;
