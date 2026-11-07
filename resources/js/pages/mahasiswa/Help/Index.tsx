import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import {
  QuestionMarkCircleIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  ClockIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ShieldCheckIcon,
  HeartIcon,
  AcademicCapIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ArrowLeftIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  CheckCircleIcon,
  ArrowTopRightOnSquareIcon,
  BookOpenIcon,
  LightBulbIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

interface HelpSection {
  title: string;
  content: string;
  icon: string;
  steps?: string[];
  tips?: string[];
}

interface FAQ {
  question: string;
  answer: string;
  category: string;
}

interface Contact {
  type: string;
  name: string;
  email?: string;
  phone: string;
  available: string;
  emergency?: boolean;
}

interface Props {
  help_sections?: HelpSection[];
  faqs?: FAQ[];
  contacts?: Contact[];
}

const Help: React.FC<Props> = ({ help_sections = [], faqs = [], contacts = [] }) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'faq' | 'contact' | 'about'>('guide');
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // =========================================================================
  // DEFAULT DATA — disesuaikan dengan sistem yang sebenarnya
  // =========================================================================

  const defaultHelpSections: HelpSection[] = [
    {
      title: 'Cara Melakukan Konsultasi',
      content: 'Panduan lengkap untuk melakukan konsultasi diagnosis depresi menggunakan sistem pakar Certainty Factor.',
      icon: 'clipboard-document-list',
      steps: [
        'Buka halaman "Konsultasi" dari dashboard mahasiswa',
        'Klik "Mulai Konsultasi Baru" untuk memulai sesi diagnosis',
        'Baca instruksi dengan teliti sebelum memulai',
        'Jawab SEMUA pertanyaan gejala dengan jujur sesuai kondisi 2 minggu terakhir',
        'Pilih tingkat keyakinan untuk setiap gejala: 0 = Tidak Pernah, 1 = Jarang, 2 = Sering, 3 = Selalu',
        'Sistem menghitung nilai CF (Certainty Factor) untuk setiap gejala secara otomatis',
        'Klik "Proses Diagnosis" setelah semua pertanyaan dijawab',
        'Sistem menampilkan hasil diagnosis lengkap beserta rekomendasi yang disesuaikan',
      ],
      tips: [
        'Wajib menjawab SEMUA gejala — sistem tidak akan memproses jika ada yang terlewat',
        'Jawab berdasarkan kondisi 2 minggu terakhir, bukan hanya hari ini',
        'Pilih "Tidak Pernah" jika benar-benar tidak pernah mengalami gejala tersebut',
        'Lakukan di tempat yang tenang dan privat agar refleksi lebih akurat',
        'Sisihkan waktu 15–20 menit untuk konsultasi yang lengkap dan teliti',
      ],
    },
    {
      title: 'Memahami Hasil & Nilai CF',
      content: 'Penjelasan cara membaca hasil diagnosis dan nilai Certainty Factor yang ditampilkan sistem.',
      icon: 'chart-bar',
      steps: [
        'Nilai CF Gabungan dihitung dari kombinasi semua gejala yang Anda laporkan',
        'CF Gabungan menunjukkan tingkat keyakinan sistem terhadap diagnosis (0–100%)',
        'CF < 30% → Diagnosis Normal (tidak ada gejala signifikan)',
        'CF 30–49% → Diagnosis Depresi Ringan',
        'CF 50–69% → Diagnosis Depresi Sedang',
        'CF ≥ 70% → Diagnosis Depresi Berat',
        'Rekomendasi diberikan dalam 5 bagian: kondisi umum, gejala spesifik, akademik, tindak lanjut, dan sumber bantuan',
      ],
      tips: [
        'CF ≥ 50% memerlukan konsultasi dengan profesional kesehatan mental sesegera mungkin',
        'CF rendah dengan gejala konsisten tetap perlu dipantau secara berkala',
        'Bandingkan hasil antar konsultasi untuk melihat tren perkembangan kondisi Anda',
        'Gunakan fitur export PDF untuk dibawa ke dokter, psikolog, atau dosen pembimbing',
        'Konsultasi rutin setiap 2–4 minggu memberikan data monitoring yang optimal',
      ],
    },
    {
      title: 'Mengelola Riwayat Konsultasi',
      content: 'Cara melihat, mengelola, dan memanfaatkan riwayat konsultasi untuk monitoring kesehatan mental.',
      icon: 'clock',
      steps: [
        'Akses "Riwayat Konsultasi" dari menu navigasi dashboard',
        'Lihat daftar kronologis semua konsultasi yang pernah dilakukan',
        'Klik "Detail" untuk melihat informasi lengkap setiap konsultasi termasuk gejala dan CF per item',
        'Gunakan fitur export CSV untuk mengunduh seluruh data riwayat',
        'Perhatikan tren perubahan nilai CF dari waktu ke waktu',
        'Hapus data lama yang tidak diperlukan melalui tombol hapus — data tidak dapat dikembalikan',
      ],
      tips: [
        'Export data untuk dibawa ke dosen pembimbing atau profesional kesehatan',
        'Perhatikan pola naik-turun nilai CF sebagai indikator kondisi mental Anda',
        'Konsultasi rutin setiap 2–4 minggu memberikan data tren yang bermakna',
        'Simpan hasil PDF penting sebagai dokumentasi pribadi sebelum dihapus',
      ],
    },
    {
      title: 'Fitur Export dan Print PDF',
      content: 'Cara menggunakan fitur export PDF untuk dokumentasi dan keperluan konsultasi profesional.',
      icon: 'user',
      steps: [
        'Pada halaman hasil konsultasi, klik tombol "Export PDF"',
        'PDF berisi: data pribadi, diagnosis, nilai CF, daftar gejala, dan rekomendasi lengkap',
        'Gunakan tombol "Print" untuk mencetak langsung dari browser',
        'File PDF otomatis diberi nama dengan ID konsultasi dan tanggal pembuatan',
        'PDF dapat dibawa ke dosen pembimbing akademik sebagai dokumen pendukung permintaan keringanan akademik',
        'PDF juga dapat ditunjukkan ke dokter/psikolog saat konsultasi profesional pertama',
      ],
      tips: [
        'Bawa hasil PDF ke dosen pembimbing untuk mendiskusikan penyesuaian beban kuliah',
        'Simpan PDF sebagai catatan perkembangan kesehatan mental pribadi',
        'Rekomendasi dalam PDF sudah disesuaikan dengan konteks mahasiswa UBT',
        'Untuk kondisi Sedang atau Berat, PDF berisi informasi RSUD Tarakan dan layanan BPJS',
      ],
    },
  ];

  const defaultFAQs: FAQ[] = [
    // --- Diagnosis ---
    {
      question: 'Apa itu metode Certainty Factor (CF) dan bagaimana sistem menghitung diagnosis?',
      answer: 'Certainty Factor adalah metode matematis dalam sistem pakar untuk mengukur tingkat keyakinan terhadap suatu kesimpulan. Sistem menghitung CF setiap gejala menggunakan rumus: CF_gejala = nilai_cf × bobot_jawaban. Semua CF positif kemudian digabungkan secara berurutan dengan rumus: CF_gabungan = CF1 + CF2 × (1 − CF1). Diagnosis ditentukan berdasarkan CF gabungan akhir: di bawah 30% = Normal, 30–49% = Ringan, 50–69% = Sedang, 70% ke atas = Berat.',
      category: 'diagnosis',
    },
    {
      question: 'Bagaimana cara membaca nilai CF dan label keyakinan di hasil konsultasi?',
      answer: 'Nilai CF ditampilkan sebagai angka desimal (0–1) dan persentase (0–100%). Label keyakinan sistem: CF di bawah 30% = "Tidak Yakin" (hijau, diagnosis Normal), CF 30–49% = "Cukup Yakin" (kuning, Ringan), CF 50–69% = "Yakin" (oranye, Sedang), CF 70% ke atas = "Sangat Yakin" (merah, Berat). Semakin tinggi CF, semakin yakin sistem bahwa gejala yang dilaporkan mengarah ke depresi tingkat tersebut.',
      category: 'diagnosis',
    },
    {
      question: 'Mengapa saya harus menjawab SEMUA pertanyaan gejala?',
      answer: 'Sistem memerlukan jawaban lengkap untuk menghitung CF gabungan yang akurat dan representatif. Setiap gejala berkontribusi pada CF akhir, dan sistem secara teknis akan menolak proses jika ada gejala yang belum dijawab. Jika benar-benar tidak mengalami suatu gejala, pilih jawaban "Tidak Pernah" (bobot 0) — ini tidak akan menambah CF dan tidak memengaruhi hasil secara negatif.',
      category: 'diagnosis',
    },
    {
      question: 'Apa yang dimaksud rekomendasi berdasarkan gejala spesifik?',
      answer: 'Selain rekomendasi umum berdasarkan level diagnosis, sistem juga menganalisis gejala individual yang memiliki CF di atas 0,1. Untuk setiap gejala signifikan tersebut, sistem memberikan saran tindakan yang spesifik. Misalnya, jika Anda mengalami gangguan tidur (G16), sistem memberi panduan sleep hygiene; jika ada kesulitan konsentrasi (G15), sistem menyarankan teknik Pomodoro. Jika terdeteksi pikiran bunuh diri (G09), peringatan darurat muncul paling atas secara otomatis.',
      category: 'diagnosis',
    },

    // --- Penggunaan ---
    {
      question: 'Berapa kali saya bisa melakukan konsultasi dan apakah ada batasan?',
      answer: 'Tidak ada batasan jumlah konsultasi. Sistem merekomendasikan konsultasi berkala setiap 2–4 minggu untuk monitoring yang optimal. Untuk kondisi Normal, cukup setiap 4 minggu. Untuk Ringan, ulangi dalam 2 minggu. Untuk Sedang dan Berat, frekuensi ditentukan bersama profesional yang menangani Anda.',
      category: 'penggunaan',
    },
    {
      question: 'Bisakah saya mengedit atau menghapus riwayat konsultasi?',
      answer: 'Anda dapat menghapus riwayat konsultasi melalui menu Riwayat Konsultasi. Namun perlu diperhatikan bahwa data yang dihapus tidak dapat dikembalikan. Kami menyarankan untuk melakukan export CSV terlebih dahulu sebagai backup sebelum menghapus. Data riwayat berguna untuk melihat tren kondisi mental dari waktu ke waktu.',
      category: 'penggunaan',
    },
    {
      question: 'Bagaimana cara menggunakan fitur export PDF?',
      answer: 'Klik tombol "Export PDF" pada halaman hasil konsultasi. PDF berisi: identitas, tanggal konsultasi, diagnosis, nilai CF, detail gejala yang dijawab, dan rekomendasi lengkap 5 bagian. File ini dapat dibawa ke dosen pembimbing akademik sebagai dokumen pendukung pengajuan keringanan akademik, atau ditunjukkan ke dokter/psikolog saat konsultasi. Untuk kondisi Sedang dan Berat, PDF juga memuat informasi layanan kesehatan di Tarakan.',
      category: 'penggunaan',
    },

    // --- Tindak Lanjut ---
    {
      question: 'Apa yang harus saya lakukan jika hasil menunjukkan depresi sedang atau berat?',
      answer: 'Untuk CF 50–69% (Sedang): segera hubungi dosen pembimbing akademik hari ini, konsultasi dengan psikolog melalui Halodoc atau Alodokter, dan beritahu keluarga. Untuk CF ≥ 70% (Berat): ini kondisi darurat — hubungi 119 ext 8 sekarang, jangan sendirian, dan pergi ke UGD rumah sakit terdekat jika muncul pikiran menyakiti diri. Ingat: UBT tidak memiliki unit konseling kampus, sehingga dosen pembimbing akademik adalah jalur dukungan resmi pertama di lingkungan kampus.',
      category: 'tindak_lanjut',
    },
    {
      question: 'Apakah sistem ini dapat menggantikan konsultasi dengan psikolog profesional?',
      answer: 'Tidak. Sistem ini adalah alat skrining dan monitoring mandiri berbasis metode ilmiah CF. Diagnosis dan penanganan definitif tetap memerlukan evaluasi profesional, terutama untuk CF ≥ 50%. Gunakan sistem sebagai pemahaman awal kondisi diri dan rujukan untuk diskusi dengan dosen pembimbing atau profesional kesehatan mental. Hasil PDF konsultasi dapat menjadi dokumen awal yang membantu proses konsultasi profesional.',
      category: 'tindak_lanjut',
    },
    {
      question: 'Layanan apa saja yang bisa saya akses jika membutuhkan bantuan profesional?',
      answer: 'Untuk layanan darurat gratis: hubungi 119 ext 8 (Into The Light / Sejiwa, 24 jam). Untuk konsultasi online terjangkau: Halodoc, Alodokter, Riliv, Bicarakan.id, atau SehatQ (mulai Rp 30.000 per sesi). Untuk fasilitas di Tarakan: RSUD Tarakan Poli Jiwa (bisa menggunakan BPJS). Untuk dukungan akademik: temui dosen pembimbing akademik untuk penyesuaian beban kuliah, keringanan tenggat, atau proses cuti medis.',
      category: 'tindak_lanjut',
    },

    // --- Keamanan ---
    {
      question: 'Bagaimana sistem menjamin keamanan dan privasi data konsultasi?',
      answer: 'Data konsultasi disimpan dengan aman dan hanya dapat diakses oleh akun Anda. Sistem tidak membagikan informasi pribadi ke pihak ketiga. Anda memiliki kontrol penuh untuk melihat, mengekspor, atau menghapus data konsultasi kapan saja. Untuk keamanan optimal, jangan bagikan akun Anda kepada orang lain.',
      category: 'keamanan',
    },

    // --- Rekomendasi ---
    {
      question: 'Mengapa rekomendasi saya terdiri dari banyak bagian?',
      answer: 'Sistem menggunakan rekomendasi berlapis 5 bagian: (1) Penjelasan status dan langkah utama sesuai level diagnosis, (2) Rekomendasi berdasarkan gejala spesifik yang Anda laporkan, (3) Panduan akademik untuk mahasiswa termasuk cara berkomunikasi dengan dosen pembimbing, (4) Jadwal pemantauan dan tindak lanjut, (5) Daftar sumber bantuan eksternal yang bisa diakses. Dua orang dengan diagnosis yang sama tapi gejala berbeda akan mendapat rekomendasi yang berbeda di bagian gejala spesifik.',
      category: 'rekomendasi',
    },
    {
      question: 'Mengapa rekomendasi konsultasi lama saya berubah saat dibuka kembali?',
      answer: 'Sistem secara otomatis meningkatkan rekomendasi lama ke versi terbaru (enhanced v4) saat halaman hasil dibuka. Ini dilakukan agar Anda selalu mendapatkan panduan yang paling akurat dan relevan. Rekomendasi versi baru lebih spesifik, disesuaikan konteks mahasiswa UBT (tanpa unit konseling kampus), dan mencantumkan layanan eksternal yang konkret.',
      category: 'rekomendasi',
    },
  ];

  const defaultContacts: Contact[] = [
    {
      type: 'Hotline Krisis Nasional',
      name: 'Into The Light / Sejiwa',
      phone: '119 ext. 8',
      available: '24 jam setiap hari, gratis, anonim',
      emergency: true,
    },
    {
      type: 'UGD Rumah Sakit',
      name: 'RSUD Tarakan',
      phone: '0551-21166',
      available: '24 jam setiap hari',
      emergency: true,
    },
    {
      type: 'Konsultasi Online (Psikolog)',
      name: 'Halodoc',
      phone: '1500-455',
      available: '24 jam setiap hari',
      emergency: false,
    },
    {
      type: 'Konsultasi Online (Psikolog)',
      name: 'Alodokter',
      phone: 'Via aplikasi',
      available: 'Setiap hari, 07:00–23:00',
      emergency: false,
    },
    {
      type: 'Konseling Kesehatan Mental Online',
      name: 'Riliv / Bicarakan.id',
      phone: 'Via aplikasi/website',
      available: 'Setiap hari (jadwal terapis bervariasi)',
      emergency: false,
    },
    {
      type: 'Dukungan Akademik Kampus',
      name: 'Dosen Pembimbing Akademik',
      phone: 'Lihat portal akademik UBT',
      available: 'Jam kerja kampus (hubungi via portal/WA)',
      emergency: false,
    },
  ];

  const finalHelpSections = help_sections.length > 0 ? help_sections : defaultHelpSections;
  const finalFAQs         = faqs.length > 0 ? faqs : defaultFAQs;
  const finalContacts     = contacts.length > 0 ? contacts : defaultContacts;

  const filteredFAQs = finalFAQs.filter(faq =>
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getIcon = (iconName: string) => {
    const iconMap: Record<string, React.ComponentType<any>> = {
      'clipboard-document-list': ClipboardDocumentListIcon,
      'chart-bar':               ChartBarIcon,
      'clock':                   ClockIcon,
      'user':                    UserIcon,
      'question-mark-circle':    QuestionMarkCircleIcon,
    };
    return iconMap[iconName] || QuestionMarkCircleIcon;
  };

  const faqCategories = [...new Set(finalFAQs.map(faq => faq.category))];

  const categoryLabel: Record<string, string> = {
    diagnosis:     'Diagnosis & CF',
    penggunaan:    'Penggunaan',
    tindak_lanjut: 'Tindak Lanjut',
    keamanan:      'Keamanan',
    rekomendasi:   'Rekomendasi',
  };

  // Tabel diagnosis — satu sumber kebenaran, dipakai di dua tempat
  const diagnosisTable = [
    { range: '< 30%',   label: 'Normal',  color: 'bg-green-100 text-green-800 border-green-300',   desc: 'Tidak ada gejala signifikan',         badge: 'Tidak Yakin' },
    { range: '30–49%',  label: 'Ringan',  color: 'bg-yellow-100 text-yellow-800 border-yellow-300', desc: 'Gejala ringan, perlu dipantau',        badge: 'Cukup Yakin' },
    { range: '50–69%',  label: 'Sedang',  color: 'bg-orange-100 text-orange-800 border-orange-300', desc: 'Gejala mengganggu, butuh profesional', badge: 'Yakin'       },
    { range: '≥ 70%',   label: 'Berat',   color: 'bg-red-100 text-red-800 border-red-300',          desc: 'Kondisi darurat medis',               badge: 'Sangat Yakin'},
  ];

  return (
    <>
      <Head title="Bantuan - Sistem Konsultasi Kesehatan Mental" />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">

        {/* ================================================================ */}
        {/* HEADER                                                            */}
        {/* ================================================================ */}
        <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-700 to-purple-700">
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-48 translate-x-48" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/10 rounded-full translate-y-36 -translate-x-36" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
            <div className="flex items-center justify-between mb-8">
              <Link
                href={route('mahasiswa.dashboard')}
                className="flex items-center space-x-3 text-white hover:text-blue-200 transition-colors duration-200"
              >
                <ArrowLeftIcon className="h-6 w-6" />
                <span className="font-semibold">Kembali ke Dashboard</span>
              </Link>
            </div>

            <div className="text-center text-white">
              <div className="w-20 h-20 mx-auto mb-6 bg-white/20 rounded-full flex items-center justify-center">
                <QuestionMarkCircleIcon className="h-10 w-10" />
              </div>
              <h1 className="text-4xl font-bold mb-4">Pusat Bantuan</h1>
              <p className="text-xl opacity-90 mb-2 max-w-2xl mx-auto">
                Panduan penggunaan, FAQ, dan kontak dukungan untuk sistem konsultasi kesehatan mental mahasiswa UBT
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* ============================================================== */}
          {/* TABS                                                             */}
          {/* ============================================================== */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-2 mb-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
              {[
                { key: 'guide',   label: 'Panduan Penggunaan', icon: BookOpenIcon },
                { key: 'faq',     label: 'FAQ',                icon: ChatBubbleLeftRightIcon },
                { key: 'contact', label: 'Kontak & Bantuan',   icon: PhoneIcon },
                { key: 'about',   label: 'Tentang Sistem',     icon: InformationCircleIcon },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`flex items-center justify-center space-x-3 px-4 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    activeTab === key
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="hidden sm:inline">{label}</span>
                  <span className="sm:hidden text-xs">{label.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>

          {/* ============================================================== */}
          {/* TAB: PANDUAN PENGGUNAAN                                         */}
          {/* ============================================================== */}
          {activeTab === 'guide' && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Panduan Penggunaan Sistem</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Pelajari cara menggunakan sistem konsultasi kesehatan mental dengan efektif dan aman
                </p>
              </div>

              {/* Tabel threshold CF — referensi cepat */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6 mb-2">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
                  <ChartBarIcon className="h-5 w-5 mr-2 text-blue-600" />
                  Referensi Cepat: Threshold Diagnosis CF
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {diagnosisTable.map((d) => (
                    <div key={d.label} className={`rounded-xl p-4 border text-center ${d.color}`}>
                      <p className="text-xl font-bold mb-1">{d.range}</p>
                      <p className="font-semibold text-base mb-1">{d.label}</p>
                      <p className="text-xs opacity-80">{d.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Help section cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {finalHelpSections.map((section, index) => {
                  const Icon = getIcon(section.icon);
                  return (
                    <div key={index} className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-8">
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                          <Icon className="h-6 w-6 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800">{section.title}</h3>
                      </div>

                      <p className="text-gray-600 mb-6">{section.content}</p>

                      {section.steps && (
                        <div className="mb-6">
                          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                            <DocumentTextIcon className="h-5 w-5 mr-2 text-blue-600" />
                            Langkah-langkah:
                          </h4>
                          <ol className="space-y-2">
                            {section.steps.map((step, stepIndex) => (
                              <li key={stepIndex} className="flex items-start space-x-3">
                                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold">
                                  {stepIndex + 1}
                                </span>
                                <span className="text-gray-700 text-sm">{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      )}

                      {section.tips && (
                        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-4 border border-yellow-200">
                          <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
                            <LightBulbIcon className="h-5 w-5 mr-2 text-yellow-600" />
                            Tips Penting:
                          </h4>
                          <ul className="space-y-1">
                            {section.tips.map((tip, tipIndex) => (
                              <li key={tipIndex} className="flex items-start space-x-2">
                                <CheckCircleIcon className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                                <span className="text-sm text-gray-700">{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Banner bawah */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-2xl p-8">
                <div className="text-center">
                  <HeartIcon className="h-12 w-12 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold mb-4">Ingat: Kesehatan Mental Anda Penting</h3>
                  <p className="text-lg opacity-90 mb-6 max-w-2xl mx-auto">
                    Sistem ini adalah alat bantu skrining mandiri. Jangan ragu untuk menghubungi dosen pembimbing
                    atau layanan profesional jika Anda membutuhkan dukungan lebih lanjut.
                  </p>
                  <div className="flex flex-wrap justify-center gap-4">
                    <div className="bg-white/20 rounded-xl px-4 py-2">
                      <span className="font-semibold">Konsultasi Rutin: Setiap 2–4 Minggu</span>
                    </div>
                    <div className="bg-white/20 rounded-xl px-4 py-2">
                      <span className="font-semibold">Hotline Krisis: 119 ext. 8</span>
                    </div>
                    <div className="bg-white/20 rounded-xl px-4 py-2">
                      <span className="font-semibold">Dukungan Kampus: Dosen Pembimbing Akademik</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB: FAQ                                                         */}
          {/* ============================================================== */}
          {activeTab === 'faq' && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Pertanyaan yang Sering Diajukan</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Temukan jawaban untuk pertanyaan umum tentang sistem konsultasi kesehatan mental mahasiswa UBT
                </p>
              </div>

              {/* Search */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Cari pertanyaan atau kata kunci..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 pl-12 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <QuestionMarkCircleIcon className="h-6 w-6 text-gray-400 absolute left-3 top-3" />
                </div>
              </div>

              {/* Kategori badges */}
              <div className="flex flex-wrap gap-2">
                {faqCategories.map(category => {
                  const count = finalFAQs.filter(faq => faq.category === category).length;
                  return (
                    <span key={category} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                      {categoryLabel[category] ?? category} ({count})
                    </span>
                  );
                })}
              </div>

              {/* FAQ items */}
              <div className="space-y-4">
                {filteredFAQs.map((faq, index) => (
                  <div key={index} className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20">
                    <button
                      onClick={() => setExpandedFAQ(expandedFAQ === index ? null : index)}
                      className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-gray-50 rounded-2xl transition-colors duration-200"
                    >
                      <span className="font-semibold text-gray-800 pr-4">{faq.question}</span>
                      {expandedFAQ === index
                        ? <ChevronUpIcon className="h-6 w-6 text-gray-500 flex-shrink-0" />
                        : <ChevronDownIcon className="h-6 w-6 text-gray-500 flex-shrink-0" />
                      }
                    </button>
                    {expandedFAQ === index && (
                      <div className="px-8 pb-6">
                        <div className="bg-gradient-to-r from-gray-50 to-white rounded-xl p-6 border-l-4 border-blue-500">
                          <p className="text-gray-700 leading-relaxed">{faq.answer}</p>
                          <div className="mt-4">
                            <span className="inline-flex px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                              {categoryLabel[faq.category] ?? faq.category}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {filteredFAQs.length === 0 && (
                <div className="text-center py-12">
                  <QuestionMarkCircleIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">Tidak ditemukan FAQ yang sesuai</p>
                  <p className="text-gray-400 text-sm">Coba gunakan kata kunci yang berbeda</p>
                </div>
              )}
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB: KONTAK & BANTUAN                                           */}
          {/* ============================================================== */}
          {activeTab === 'contact' && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Kontak & Sumber Bantuan</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Hubungi layanan profesional jika Anda memerlukan bantuan segera atau dukungan lebih lanjut
                </p>
              </div>

              {/* Banner darurat */}
              <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl p-6">
                <div className="flex items-start space-x-4">
                  <ExclamationTriangleIcon className="h-8 w-8 text-red-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-lg font-bold text-red-800 mb-2">Dalam Keadaan Darurat</h3>
                    <p className="text-red-700 mb-4">
                      Jika Anda memiliki pikiran untuk menyakiti diri sendiri, atau merasa dalam krisis yang serius,
                      segera hubungi salah satu layanan di bawah ini. Anda tidak harus menanggungnya sendirian.
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <a href="tel:119" className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors">
                        <PhoneIcon className="h-5 w-5" />
                        <span className="font-semibold">119 ext. 8 (Hotline Krisis)</span>
                      </a>
                      <a href="tel:112" className="flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-700 transition-colors">
                        <PhoneIcon className="h-5 w-5" />
                        <span className="font-semibold">112 (Emergency)</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Kartu kontak */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {finalContacts.map((contact, index) => (
                  <div
                    key={index}
                    className={`bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border p-8 ${
                      contact.emergency
                        ? 'border-red-300 bg-gradient-to-r from-red-50 to-rose-50'
                        : 'border-white/20'
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                        contact.emergency
                          ? 'bg-gradient-to-r from-red-500 to-rose-600'
                          : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                      }`}>
                        <PhoneIcon className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-1">
                          <h3 className="text-base font-bold text-gray-800">{contact.type}</h3>
                          {contact.emergency && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">DARURAT</span>
                          )}
                        </div>
                        <p className="text-gray-600 font-medium mb-4">{contact.name}</p>

                        <div className="space-y-2">
                          <a href={`tel:${contact.phone.replace(/\D/g,'')}`} className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors">
                            <PhoneIcon className="h-4 w-4 flex-shrink-0" />
                            <span className="font-semibold text-sm">{contact.phone}</span>
                            <ArrowTopRightOnSquareIcon className="h-3 w-3" />
                          </a>

                          {contact.email && (
                            <a href={`mailto:${contact.email}`} className="flex items-center space-x-3 text-gray-700 hover:text-blue-600 transition-colors">
                              <EnvelopeIcon className="h-4 w-4 flex-shrink-0" />
                              <span className="text-sm truncate">{contact.email}</span>
                            </a>
                          )}

                          <div className="flex items-start space-x-3 text-gray-600">
                            <ClockIcon className="h-4 w-4 flex-shrink-0 mt-0.5" />
                            <span className="text-xs">{contact.available}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Catatan UBT */}
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <div className="flex items-start space-x-4">
                  <InformationCircleIcon className="h-6 w-6 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-blue-800 mb-2">Catatan untuk Mahasiswa UBT</h3>
                    <p className="text-blue-700 text-sm leading-relaxed">
                      Universitas Borneo Tarakan tidak memiliki unit konseling atau psikolog kampus. Jalur dukungan
                      resmi di lingkungan kampus adalah <strong>dosen pembimbing akademik</strong> Anda. Mereka dapat
                      membantu: penyesuaian beban mata kuliah, keringanan tenggat tugas, proses cuti medis, dan
                      merujuk ke layanan profesional eksternal. Hubungi dosen pembimbing Anda melalui portal akademik
                      atau kontak yang tertera di KRS/jadwal kuliah.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sumber daya tambahan */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <InformationCircleIcon className="h-6 w-6 mr-3 text-blue-600" />
                  Sumber Daya Tambahan
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-700">Konsultasi Online Terjangkau:</h4>
                    <ul className="space-y-2 text-sm">
                      {['Halodoc', 'Alodokter', 'SehatQ', 'Riliv', 'Bicarakan.id'].map(app => (
                        <li key={app} className="flex items-center space-x-2">
                          <CheckCircleIcon className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span>{app}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-700">Aplikasi Mandiri (Gratis):</h4>
                    <ul className="space-y-2 text-sm">
                      {['MoodTools (CBT mandiri)', 'Insight Timer (meditasi)', 'Sanvello (stres & cemas)'].map(app => (
                        <li key={app} className="flex items-center space-x-2">
                          <CheckCircleIcon className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span>{app}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-700">Fasilitas di Tarakan:</h4>
                    <ul className="space-y-2 text-sm">
                      {[
                        'RSUD Tarakan – Poli Jiwa',
                        'Puskesmas setempat (minta rujukan)',
                        'BPJS Kesehatan (layanan jiwa ditanggung)',
                      ].map(item => (
                        <li key={item} className="flex items-center space-x-2">
                          <CheckCircleIcon className="h-4 w-4 text-green-600 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* TAB: TENTANG SISTEM                                             */}
          {/* ============================================================== */}
          {activeTab === 'about' && (
            <div className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Tentang Sistem Konsultasi</h2>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Teknologi, metodologi, dan tujuan sistem konsultasi kesehatan mental mahasiswa UBT
                </p>
              </div>

              {/* Overview */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-8">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                    <AcademicCapIcon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-800">Sistem Pakar Kesehatan Mental Mahasiswa</h3>
                </div>

                <p className="text-lg text-gray-700 leading-relaxed mb-6">
                  Sistem ini adalah aplikasi sistem pakar (expert system) yang dirancang khusus untuk melakukan
                  skrining dan monitoring kesehatan mental mahasiswa Universitas Borneo Tarakan, dengan fokus pada
                  deteksi dini gejala depresi menggunakan metodologi Certainty Factor (CF).
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <ChartBarIcon className="h-10 w-10 text-blue-600 mx-auto mb-3" />
                    <h4 className="font-bold text-gray-800 mb-2">Berbasis Bukti</h4>
                    <p className="text-sm text-gray-600">Algoritma CF yang digunakan dalam sistem pakar medis</p>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
                    <ShieldCheckIcon className="h-10 w-10 text-green-600 mx-auto mb-3" />
                    <h4 className="font-bold text-gray-800 mb-2">Privasi Terjaga</h4>
                    <p className="text-sm text-gray-600">Data hanya dapat diakses oleh akun Anda sendiri</p>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-200">
                    <HeartIcon className="h-10 w-10 text-purple-600 mx-auto mb-3" />
                    <h4 className="font-bold text-gray-800 mb-2">Kontekstual UBT</h4>
                    <p className="text-sm text-gray-600">Rekomendasi disesuaikan dengan kondisi & layanan di Tarakan</p>
                  </div>
                </div>
              </div>

              {/* Metodologi CF */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <LightBulbIcon className="h-6 w-6 mr-3 text-yellow-600" />
                  Metodologi Certainty Factor (CF)
                </h3>

                <p className="text-gray-700 leading-relaxed mb-6">
                  Certainty Factor adalah metode dalam sistem pakar untuk mengukur kepastian suatu kesimpulan
                  berdasarkan bukti yang ada. Dalam konteks ini, CF mengukur seberapa yakin sistem bahwa
                  kumpulan gejala yang dilaporkan mengarah ke diagnosis depresi tertentu.
                </p>

                <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 mb-6">
                  <h4 className="font-semibold text-gray-800 mb-4">Rumus Perhitungan:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-700">
                    <div>
                      <p className="font-medium mb-2">CF per gejala:</p>
                      <code className="bg-gray-200 px-3 py-1 rounded text-sm">CF_gejala = nilai_cf × bobot_jawaban</code>
                      <p className="mt-2 text-gray-600">Bobot jawaban: 0 = Tidak Pernah, 0.33 = Jarang, 0.66 = Sering, 1.0 = Selalu</p>
                    </div>
                    <div>
                      <p className="font-medium mb-2">CF gabungan (iteratif):</p>
                      <code className="bg-gray-200 px-3 py-1 rounded text-sm">CF_baru = CF_lama + CF_n × (1 − CF_lama)</code>
                      <p className="mt-2 text-gray-600">Proses diulang untuk semua gejala dengan CF &gt; 0</p>
                    </div>
                  </div>
                </div>

                {/* Tabel interpretasi CF — konsisten dengan controller */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <h4 className="font-semibold text-blue-800 mb-4">Interpretasi Nilai CF — Threshold Diagnosis:</h4>
                  <div className="space-y-3">
                    {diagnosisTable.map((d) => (
                      <div key={d.label} className={`flex items-center justify-between rounded-lg px-4 py-3 border ${d.color}`}>
                        <div className="flex items-center space-x-4">
                          <span className="font-bold text-lg w-20">{d.range}</span>
                          <div>
                            <span className="font-semibold">{d.label}</span>
                            <span className="text-xs ml-2 opacity-70">({d.badge})</span>
                          </div>
                        </div>
                        <span className="text-sm opacity-80 hidden md:block">{d.desc}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-blue-600 mt-3">
                    * Threshold ini konsisten dengan yang digunakan di controller sistem dan ditampilkan di hasil konsultasi.
                  </p>
                </div>
              </div>

              {/* Alur rekomendasi */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-8">
                <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                  <DocumentTextIcon className="h-6 w-6 mr-3 text-indigo-600" />
                  Struktur Rekomendasi (5 Lapisan)
                </h3>
                <div className="space-y-3">
                  {[
                    { no: '1', title: 'Penjelasan Status & Langkah Utama',  desc: 'Berbeda per level diagnosis (Normal / Ringan / Sedang / Berat)' },
                    { no: '2', title: 'Rekomendasi Gejala Spesifik',        desc: 'Berbeda per gejala yang dilaporkan (G01–G21), hanya muncul jika CF gejala > 0.1' },
                    { no: '3', title: 'Panduan Akademik',                   desc: 'Cara berkomunikasi dengan dosen pembimbing, opsi keringanan/cuti medis' },
                    { no: '4', title: 'Pemantauan & Tindak Lanjut',        desc: 'Jadwal skrining ulang dan langkah monitoring sesuai level' },
                    { no: '5', title: 'Sumber Bantuan Eksternal',           desc: 'Layanan darurat, konsultasi online, aplikasi, fasilitas di Tarakan' },
                  ].map((item) => (
                    <div key={item.no} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                      <span className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0 text-sm">
                        {item.no}
                      </span>
                      <div>
                        <p className="font-semibold text-gray-800">{item.title}</p>
                        <p className="text-sm text-gray-600 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Disclaimer */}
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-8 border border-yellow-200">
                <div className="flex items-start space-x-4">
                  <ExclamationCircleIcon className="h-8 w-8 text-yellow-600 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-bold text-yellow-800 mb-4">Batasan dan Disclaimer</h3>
                    <div className="space-y-4 text-yellow-700 text-sm">
                      <div>
                        <h4 className="font-semibold mb-2">Sistem ini BUKAN pengganti diagnosis profesional:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Hasil hanya untuk skrining dan monitoring mandiri</li>
                          <li>Tidak dapat menggantikan evaluasi psikolog atau psikiater</li>
                          <li>Diagnosis definitif memerlukan pemeriksaan klinis langsung</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Keterbatasan teknologi:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Akurasi tergantung pada kejujuran dan pemahaman pengguna saat menjawab</li>
                          <li>Sistem hanya mendeteksi gejala depresi, bukan gangguan mental lainnya</li>
                          <li>Hasil yang sama bisa bermakna berbeda pada individu yang berbeda</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">Penggunaan yang bertanggung jawab:</h4>
                        <ul className="list-disc list-inside space-y-1">
                          <li>Gunakan sebagai alat bantu pemahaman diri, bukan satu-satunya acuan</li>
                          <li>CF ≥ 50% (Sedang) = segera konsultasi profesional, jangan tunda</li>
                          <li>CF ≥ 70% (Berat) = kondisi darurat, hubungi 119 ext 8 atau pergi ke UGD</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Teknologi & Versi */}
              <div className="bg-gradient-to-r from-gray-800 to-slate-900 text-white rounded-2xl p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <h3 className="text-xl font-bold mb-4">Teknologi yang Digunakan</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {['Laravel 12', 'React.js', 'Inertia.js', 'MySQL', 'Tailwind CSS', 'DomPDF'].map(tech => (
                        <div key={tech} className="bg-white/10 rounded-lg p-3 text-center">
                          <span className="font-medium">{tech}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold mb-4">Informasi Sistem</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Versi Rekomendasi</span>
                        <span className="font-semibold">enhanced_v4</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Metode Diagnosis</span>
                        <span className="font-semibold">Certainty Factor (CF)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Konteks</span>
                        <span className="font-semibold">Mahasiswa UBT Tarakan</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Status</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                          <span className="font-semibold">Active</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default Help;