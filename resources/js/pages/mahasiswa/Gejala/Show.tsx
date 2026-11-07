import React from 'react';
import { Head, Link } from '@inertiajs/react';
import {
  ChevronLeftIcon,
  InformationCircleIcon,
  TagIcon,
  ClipboardDocumentListIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CalendarIcon,
  ArrowLeftIcon,
  HomeIcon,
  LightBulbIcon,
  CalculatorIcon
} from '@heroicons/react/24/outline';

// ============================================================================
// INTERFACES (Sesuai response backend Laravel)
// ============================================================================

interface OpsiJawaban {
  text: string;
  bobot: number | string | null; // Bobot untuk opsi jawaban (0-1)
  value?: string;
}

interface Gejala {
  id_gejala: number;
  kode_gejala: string;
  nama_gejala: string;
  deskripsi: string;
  deskripsi_gejala?: string;
  kategori_gejala: string;
  opsi_jawaban: OpsiJawaban[];
  status: 'active' | 'inactive';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  formatted_kode?: string;
  formatted_kategori?: string;
  nilai_cf: number | string | null; // ← CF PERTANYAAN/GEJALA (dari tabel gejala)
  formatted_nilai_cf?: string;
  persentase_cf?: string;
}

interface RelatedDiagnosa {
  diagnosa: {
    id_diagnosa: number;
    kode_diagnosa: string;
    nama_diagnosa: string;
    deskripsi: string;
    tingkat_depresi: string;
    rekomendasi: string;
  };
  nilai_cf: number | string | null;
  confidence_level: string;
}

interface Breadcrumb {
  [key: string]: string | null;
}

interface Props {
  gejala: Gejala;
  relatedDiagnosa: RelatedDiagnosa[];
  breadcrumb: Breadcrumb;
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const formatPercent = (val: number | string | null | undefined): string | null => {
  if (val === null || val === undefined || val === '') return null;
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num) || num < 0 || num > 1) return null;
  return (num * 100).toFixed(1) + '%';
};

const getKategoriColor = (kategoriValue: string) => {
  const colors: Record<string, string> = {
    'fisik': 'bg-blue-100 text-blue-800',
    'psikologis': 'bg-purple-100 text-purple-800',
    'sosial': 'bg-green-100 text-green-800',
    'akademik': 'bg-yellow-100 text-yellow-800',
    'emosional': 'bg-red-100 text-red-800',
    'kognitif': 'bg-indigo-100 text-indigo-800',
  };
  return colors[kategoriValue?.toLowerCase()] || 'bg-gray-100 text-gray-800';
};

const getConfidenceColor = (level: string) => {
  const colors: Record<string, string> = {
    'Sangat Tinggi': 'bg-red-100 text-red-800',
    'Tinggi': 'bg-orange-100 text-orange-800',
    'Sedang': 'bg-yellow-100 text-yellow-800',
    'Rendah': 'bg-blue-100 text-blue-800',
    'Sangat Rendah': 'bg-gray-100 text-gray-800',
  };
  return colors[level] || 'bg-gray-100 text-gray-800';
};

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getSeverityLevel = (kategori: string) => {
  const severity: Record<string, { level: string; color: string; icon: React.ReactNode }> = {
    'psikologis': { level: 'Tinggi', color: 'text-red-600', icon: <ExclamationTriangleIcon className="h-5 w-5" /> },
    'emosional': { level: 'Tinggi', color: 'text-red-600', icon: <ExclamationTriangleIcon className="h-5 w-5" /> },
    'fisik': { level: 'Sedang', color: 'text-yellow-600', icon: <InformationCircleIcon className="h-5 w-5" /> },
    'akademik': { level: 'Sedang', color: 'text-yellow-600', icon: <InformationCircleIcon className="h-5 w-5" /> },
    'sosial': { level: 'Rendah', color: 'text-green-600', icon: <CheckCircleIcon className="h-5 w-5" /> },
    'kognitif': { level: 'Sedang', color: 'text-yellow-600', icon: <InformationCircleIcon className="h-5 w-5" /> },
  };
  return severity[kategori?.toLowerCase()] || { level: 'Normal', color: 'text-gray-600', icon: <InformationCircleIcon className="h-5 w-5" /> };
};

// ============================================================================
// COMPONENT: CF Value Display Card (Reusable)
// ============================================================================

interface CFValueCardProps {
  title: string;
  value: number | string | null;
  description: string;
  icon: React.ReactNode;
  showFormula?: boolean;
  secondValue?: number | string | null;
  secondLabel?: string;
}

const CFValueCard: React.FC<CFValueCardProps> = ({
  title,
  value,
  description,
  icon,
  showFormula = false,
  secondValue,
  secondLabel
}) => {
  const percent = formatPercent(value);
  const secondPercent = secondValue ? formatPercent(secondValue) : null;

  const getBadgeColor = (p: string | null) => {
    if (!p) return 'bg-gray-100 text-gray-800';
    const num = parseFloat(p);
    if (num >= 80) return 'bg-red-100 text-red-800';
    if (num >= 60) return 'bg-orange-100 text-orange-800';
    if (num >= 40) return 'bg-yellow-100 text-yellow-800';
    if (num >= 20) return 'bg-blue-100 text-blue-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-200">
      <div className="flex items-start gap-3 mb-3">
        <div className="p-2 bg-blue-100 rounded-lg shrink-0">
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-gray-900">{title}</h4>
          <p className="text-xs text-gray-600 mt-1">{description}</p>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-3">
        <span className={`px-4 py-2 text-lg font-bold rounded-xl ${getBadgeColor(percent)}`}>
          {percent || '-'}
        </span>
        {showFormula && secondPercent && (
          <>
            <span className="text-gray-400">×</span>
            <span className={`px-3 py-1.5 text-sm font-semibold rounded-lg ${getBadgeColor(secondPercent)}`}>
              {secondLabel || 'Bobot'}: {secondPercent}
            </span>
            <span className="text-gray-400">=</span>
            <span className="px-3 py-1.5 text-sm font-bold bg-green-100 text-green-800 rounded-lg">
              {percent && secondPercent ? (parseFloat(percent) * parseFloat(secondPercent) / 100).toFixed(1) + '%' : '-'}
            </span>
          </>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const Show: React.FC<Props> = ({ gejala, relatedDiagnosa, breadcrumb }) => {
  const severity = getSeverityLevel(gejala.kategori_gejala);
  const gejalaCF = formatPercent(gejala.nilai_cf);

  return (
    <>
      <Head title={`Detail Gejala - ${gejala.nama_gejala}`} />

      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
        {/* ==================== HEADER ==================== */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 shadow-xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24"></div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            <div className="mb-6">
              <Link
                href={route('mahasiswa.gejala.index')}
                className="group inline-flex items-center space-x-3 bg-white/10 hover:bg-white/20 backdrop-blur-xl text-white px-4 py-3 rounded-xl border border-white/20 hover:border-white/30 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <ArrowLeftIcon className="h-5 w-5 group-hover:-translate-x-1 transition-transform duration-200" />
                <span className="font-semibold">Kembali ke Daftar</span>
              </Link>
            </div>

            <nav className="flex text-sm text-blue-100 mb-4" aria-label="Breadcrumb">
              <Link href={route('mahasiswa.dashboard')} className="hover:text-white transition-colors duration-200 flex items-center">
                <HomeIcon className="h-4 w-4 mr-1" />
                Dashboard
              </Link>
              <span className="mx-2">/</span>
              <Link href={route('mahasiswa.gejala.index')} className="hover:text-white transition-colors duration-200">
                Daftar Gejala
              </Link>
              <span className="mx-2">/</span>
              <span className="text-white font-medium">Detail Gejala</span>
            </nav>

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="max-w-3xl">
                <div className="flex items-center space-x-2 mb-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-xl">
                    <InformationCircleIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-3">
                  Detail Gejala
                </h1>
                <p className="text-lg sm:text-xl text-blue-100 leading-relaxed">
                  Informasi lengkap dan detail tentang gejala yang dipilih
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Link
                  href={route('mahasiswa.konsultasi.start')}
                  className="group bg-white hover:bg-gray-50 text-blue-600 hover:text-blue-700 px-4 sm:px-6 py-3 rounded-xl hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 border-2 border-white shadow-lg hover:shadow-xl font-semibold"
                >
                  <ClipboardDocumentListIcon className="h-5 w-5 group-hover:scale-110 transition-transform" />
                  <span>Mulai Konsultasi</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ==================== MAIN CONTENT ==================== */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">

            {/* ----- KOLOM KIRI: Informasi Gejala & Diagnosa ----- */}
            <div className="xl:col-span-2 space-y-6">

              {/* Card: Informasi Gejala */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6 sm:p-8 hover:shadow-xl transition-all duration-300">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0 mb-6">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className="px-3 py-2 text-sm font-medium bg-gray-100 text-gray-800 rounded-xl">
                        {gejala.formatted_kode || gejala.kode_gejala}
                      </span>
                      <span className={`px-3 py-2 text-sm font-medium rounded-xl ${getKategoriColor(gejala.kategori_gejala)}`}>
                        {gejala.formatted_kategori || gejala.kategori_gejala}
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 leading-tight">
                      {gejala.nama_gejala}
                    </h2>
                  </div>
                  <div className={`flex items-center space-x-2 px-4 py-3 rounded-xl border-2 shrink-0 ${
                    severity.color === 'text-red-600' ? 'bg-red-50 border-red-200' :
                    severity.color === 'text-yellow-600' ? 'bg-yellow-50 border-yellow-200' :
                    'bg-green-50 border-green-200'
                  }`}>
                    {severity.icon}
                    {/* <span className={`text-sm font-medium ${severity.color}`}>
                      Tingkat: {severity.level}
                    </span> */}
                  </div>
                </div>

                {/* ✅ NEW: Display NILAI CF PERTANYAAN (dari tabel gejala) */}
                {gejala.nilai_cf !== null && gejala.nilai_cf !== undefined && (
                  <div className="mb-6">
                    <CFValueCard
                      title="Nilai CF Pertanyaan"
                      value={gejala.nilai_cf}
                      description="Tingkat kepastian bahwa gejala ini relevan dengan diagnosa depresi (dari basis pengetahuan)"
                      icon={<CalculatorIcon className="h-5 w-5 text-blue-600" />}
                    />
                  </div>
                )}

                {/* Deskripsi */}
                <div className="prose max-w-none">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">Deskripsi</h3>
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                    <p className="text-gray-700 leading-relaxed text-base">
                      {gejala.deskripsi || gejala.deskripsi_gejala || 'Deskripsi tidak tersedia'}
                    </p>
                  </div>
                </div>

                {/* Opsi Jawaban + Bobot */}
                {gejala.opsi_jawaban && gejala.opsi_jawaban.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-gray-200">
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6 flex items-center">
                      <ClipboardDocumentListIcon className="h-6 w-6 mr-2 text-blue-600" />
                      Opsi Jawaban & Bobot
                    </h3>

                    {/* ✅ Info: Cara Perhitungan */}
                    <div className="mb-4 p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
                      <p className="text-sm text-indigo-900 flex items-start gap-2">
                        <LightBulbIcon className="h-4 w-4 inline mt-0.5 shrink-0" />
                        <span>
                          <strong>Cara Hitung:</strong> Nilai Kepercayaan = CF Pertanyaan ({gejalaCF || '-'}) × Bobot Jawaban yang dipilih
                        </span>
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {gejala.opsi_jawaban.map((opsi, index) => {
                        const bobotPercent = formatPercent(opsi.bobot);
                        const isValid = bobotPercent !== null;

                        return (
                          <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-white/60 backdrop-blur-xl rounded-xl border border-gray-200 hover:shadow-lg transition-all duration-300">
                            <div className="flex-1 mb-2 sm:mb-0">
                              <span className="text-gray-700 font-medium">{opsi.text}</span>
                              {isValid && gejalaCF && (
                                <p className="text-xs text-gray-500 mt-1">
                                  Jika dipilih: {gejalaCF} × {bobotPercent} = <strong className="text-green-700">{(parseFloat(gejalaCF) * parseFloat(bobotPercent) / 100).toFixed(1)}%</strong>
                                </p>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-xs text-gray-500">Bobot:</span>
                              {isValid ? (
                                <span className={`px-3 py-2 text-sm font-bold rounded-xl ${
                                  parseFloat(bobotPercent) >= 80 ? 'bg-red-100 text-red-800' :
                                  parseFloat(bobotPercent) >= 60 ? 'bg-orange-100 text-orange-800' :
                                  parseFloat(bobotPercent) >= 40 ? 'bg-yellow-100 text-yellow-800' :
                                  parseFloat(bobotPercent) >= 20 ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {bobotPercent}
                                </span>
                              ) : (
                                <span className="px-3 py-2 text-sm font-medium bg-gray-50 text-gray-400 rounded-xl border border-gray-200">
                                  -
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Card: Diagnosa Terkait */}
              {relatedDiagnosa.length > 0 && (
                <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6 sm:p-8 hover:shadow-xl transition-all duration-300">
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-6 flex items-center">
                    <TagIcon className="h-6 w-6 mr-2 text-purple-600" />
                    Diagnosa Terkait
                  </h3>
                  <div className="space-y-6">
                    {relatedDiagnosa.map((item, index) => {
                      const cfPercent = formatPercent(item.nilai_cf);
                      const isValid = cfPercent !== null;

                      return (
                        <div key={index} className="bg-white/60 backdrop-blur-xl border border-gray-200 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-3 sm:space-y-0 mb-4">
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-3">
                                <span className="text-sm font-medium text-gray-600 bg-gray-100 px-3 py-1 rounded-lg">
                                  {item.diagnosa.kode_diagnosa}
                                </span>
                                {isValid ? (
                                  <span className={`px-3 py-1 text-xs font-medium rounded-lg ${getConfidenceColor(item.confidence_level)}`}>
                                    CF: {cfPercent}
                                  </span>
                                ) : (
                                  <span className="px-3 py-1 text-xs font-medium bg-gray-100 text-gray-400 rounded-lg">CF: -</span>
                                )}
                              </div>
                              <h4 className="text-lg font-bold text-gray-900 mb-3">
                                {item.diagnosa.nama_diagnosa}
                              </h4>
                              <p className="text-gray-600 leading-relaxed">
                                {item.diagnosa.deskripsi}
                              </p>
                            </div>
                            <span className={`px-4 py-2 text-sm font-bold rounded-xl shrink-0 ${getConfidenceColor(item.confidence_level)}`}>
                              {item.confidence_level}
                            </span>
                          </div>
                          {item.diagnosa.rekomendasi && (
                            <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg">
                              <p className="text-sm text-blue-900">
                                <strong>Rekomendasi:</strong> {item.diagnosa.rekomendasi}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* ----- KOLOM KANAN: Sidebar ----- */}
            <div className="space-y-6">

              {/* Card: Status Gejala */}
              {/* <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <CheckCircleIcon className="h-5 w-5 mr-2 text-green-600" />
                  Status Gejala
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-700">Status</span>
                    <span className={`px-3 py-2 text-sm font-bold rounded-xl ${gejala.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {gejala.is_active ? 'Aktif' : 'Tidak Aktif'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-700">Kategori</span>
                    <span className={`text-sm font-bold capitalize px-3 py-2 rounded-xl ${getKategoriColor(gejala.kategori_gejala)}`}>
                      {gejala.formatted_kategori || gejala.kategori_gejala}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-700">Tingkat</span>
                    <span className={`text-sm font-bold px-3 py-2 rounded-xl ${severity.color === 'text-red-600' ? 'bg-red-100 text-red-800' : severity.color === 'text-yellow-600' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                      {severity.level}
                    </span>
                  </div>
                </div>
              </div> */}

              {/* ✅ Ringkasan Nilai CF*/}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-50 backdrop-blur-xl rounded-2xl shadow-lg border border-indigo-200/50 p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <LightBulbIcon className="h-5 w-5 text-indigo-600" />
                    Cara Kerja Sistem CF
                </h3>

                <div className="space-y-4">
                    {/* 🔢 Rumus & Penjelasan Singkat */}
                    <div className="bg-white/80 rounded-xl p-4 border border-indigo-100">
                    <p className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <CalculatorIcon className="h-4 w-4 text-indigo-500" />
                        Rumus Perhitungan
                    </p>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-center">
                        <code className="text-sm font-mono text-gray-700">
                        CF<sub>hasil</sub> = CF<sub>gejala</sub> × Bobot<sub>jawaban</sub>
                        </code>
                    </div>
                    <p className="mt-3 text-xs text-gray-600 leading-relaxed">
                        Sistem menghitung tingkat keyakinan dengan mengalikan bobot gejala (berdasarkan basis pengetahuan pakar) dengan tingkat kepastian jawaban yang Anda pilih. Nilai CF adalah indikator kepastian, bukan diagnosis klinis. Hasil askhir diproleh oleh akumulasi CF semua gejala yang dipilih
                    </p>
                    </div>

                    ⚠️ {/* Catatan Penting (Konsolidasi & Penekanan Klinis) */}
                    <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                    <p className="text-sm font-semibold text-amber-900 mb-2 flex items-center gap-2">
                        <InformationCircleIcon className="h-4 w-4 text-amber-600" />
                        Catatan Penting
                    </p>
                    <p className="text-xs text-amber-800 leading-relaxed">
                        Nilai CF menunjukkan tingkat kepastian matematis, <strong>bukan diagnosis klinis</strong>. Hasil akhir merupakan akumulasi dari seluruh gejala yang dipilih dan ditujukan sebagai <span className="font-semibold underline decoration-amber-400">skrining awal</span>. Selalu konsultasikan dengan tenaga profesional untuk evaluasi menyeluruh.
                    </p>
                    </div>
                </div>
              </div>

              {/* Card: Informasi Tambahan */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <InformationCircleIcon className="h-5 w-5 mr-2 text-blue-600" />
                  Informasi Tambahan
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl">
                    <CalendarIcon className="h-5 w-5 text-gray-400 mt-1 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900">Dibuat</p>
                      <p className="text-sm text-gray-600 break-words">{formatDate(gejala.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-xl">
                    <ClockIcon className="h-5 w-5 text-gray-400 mt-1 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-900">Terakhir Diperbarui</p>
                      <p className="text-sm text-gray-600 break-words">{formatDate(gejala.updated_at)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card: Tindakan */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6 hover:shadow-xl transition-all duration-300">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">Tindakan</h3>
                <div className="space-y-4">
                  <Link
                    href={route('mahasiswa.konsultasi.start')}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-4 rounded-xl hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 shadow-lg hover:shadow-xl font-semibold"
                  >
                    <ClipboardDocumentListIcon className="h-5 w-5" />
                    <span>Mulai Konsultasi</span>
                  </Link>
                  <Link
                    href={route('mahasiswa.gejala.index')}
                    className="w-full bg-white/80 backdrop-blur-xl text-gray-700 px-6 py-4 rounded-xl hover:bg-white hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 border border-gray-300 shadow-lg hover:shadow-xl font-semibold"
                  >
                    <ChevronLeftIcon className="h-5 w-5" />
                    <span>Kembali ke Daftar</span>
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Show;
