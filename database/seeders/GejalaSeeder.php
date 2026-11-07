<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Gejala;
use Illuminate\Support\Facades\DB;

class GejalaSeeder extends Seeder
{
    public function run()
    {
        DB::transaction(function () {

            $gejalaData = [
                // TIER 1: CRITICAL - Gejala paling serius (tetap tinggi tapi tidak berlebihan)
                [
                    'kode_gejala' => 'G09',
                    'nama_gejala' => 'Pikiran untuk bunuh diri',
                    'deskripsi_gejala' => 'Mengukur adanya pikiran atau keinginan untuk bunuh diri yang mungkin muncul akibat tekanan akademik.',
                    'kategori_gejala' => 'emosional',
                    'nilai_cf' => 0.35, // Critical - indikator paling serius
                    'opsi_jawaban' => [
                        ['text' => 'Saya tidak berpikir untuk bunuh diri', 'bobot' => 0.0],
                        ['text' => 'Saya pernah berpikir untuk bunuh diri tetapi tidak serius', 'bobot' => 0.3],
                        ['text' => 'Saya ingin bunuh diri tetapi tidak memiliki rencana', 'bobot' => 0.7],
                        ['text' => 'Saya akan bunuh diri jika punya kesempatan', 'bobot' => 1.0],
                    ],
                ],
                [
                    'kode_gejala' => 'G01',
                    'nama_gejala' => 'Perasaan sedih',
                    'deskripsi_gejala' => 'Mengukur tingkat kesedihan yang dialami mahasiswa terkait situasi akademik dan kehidupan kampus.',
                    'kategori_gejala' => 'emosional',
                    'nilai_cf' => 0.32, // Critical - mood symptom inti
                    'opsi_jawaban' => [
                        ['text' => 'Saya tidak merasa sedih', 'bobot' => 0.0],
                        ['text' => 'Saya merasa sedih sesekali', 'bobot' => 0.25],
                        ['text' => 'Saya sering merasa sedih, terutama terkait tugas atau kegiatan kuliah', 'bobot' => 0.65],
                        ['text' => 'Saya sangat sedih hampir sepanjang waktu sehingga sulit fokus belajar', 'bobot' => 1.0],
                    ],
                ],
                [
                    'kode_gejala' => 'G04',
                    'nama_gejala' => 'Kehilangan minat',
                    'deskripsi_gejala' => 'Mengukur penurunan minat dan antusiasme terhadap kegiatan perkuliahan dan organisasi kampus.',
                    'kategori_gejala' => 'perilaku',
                    'nilai_cf' => 0.30, // Critical - anhedonia sebagai gejala inti
                    'opsi_jawaban' => [
                        ['text' => 'Saya tetap tertarik pada kegiatan perkuliahan dan organisasi', 'bobot' => 0.0],
                        ['text' => 'Saya kurang bersemangat mengikuti beberapa kegiatan kuliah', 'bobot' => 0.25],
                        ['text' => 'Saya jarang merasa tertarik untuk terlibat dalam kegiatan kampus', 'bobot' => 0.65],
                        ['text' => 'Saya tidak tertarik lagi pada kegiatan kampus dan akademik', 'bobot' => 1.0],
                    ],
                ],

                // TIER 2: HIGH - Gejala sangat penting
                [
                    'kode_gejala' => 'G14',
                    'nama_gejala' => 'Pandangan negatif terhadap diri',
                    'deskripsi_gejala' => 'Mengukur persepsi negatif mahasiswa terhadap kemampuan dan nilai diri sebagai pelajar.',
                    'kategori_gejala' => 'kognitif',
                    'nilai_cf' => 0.28, // High - self-worth issues
                    'opsi_jawaban' => [
                        ['text' => 'Saya puas dengan diri saya', 'bobot' => 0.0],
                        ['text' => 'Saya sedikit kecewa dengan diri sendiri', 'bobot' => 0.25],
                        ['text' => 'Saya merasa diri saya buruk sebagai mahasiswa', 'bobot' => 0.65],
                        ['text' => 'Saya merasa saya sangat buruk', 'bobot' => 1.0],
                    ],
                ],
                [
                    'kode_gejala' => 'G15',
                    'nama_gejala' => 'Kesulitan belajar',
                    'deskripsi_gejala' => 'Mengukur tingkat kesulitan konsentrasi dan fokus dalam aktivitas belajar dan menyelesaikan tugas.',
                    'kategori_gejala' => 'kognitif',
                    'nilai_cf' => 0.27, // High - sangat relevan untuk mahasiswa
                    'opsi_jawaban' => [
                        ['text' => 'Saya belajar dengan baik seperti biasa', 'bobot' => 0.0],
                        ['text' => 'Saya merasa agak sulit konsentrasi belajar', 'bobot' => 0.25],
                        ['text' => 'Saya sulit berkonsentrasi dan menyelesaikan tugas', 'bobot' => 0.65],
                        ['text' => 'Saya tidak bisa belajar sama sekali', 'bobot' => 1.0],
                    ],
                ],
                [
                    'kode_gejala' => 'G07',
                    'nama_gejala' => 'Kebencian pada diri sendiri',
                    'deskripsi_gejala' => 'Mengukur tingkat kebencian atau ketidakpuasan mahasiswa terhadap diri sendiri sebagai pelajar.',
                    'kategori_gejala' => 'emosional',
                    'nilai_cf' => 0.26, // High - self-hatred serius
                    'opsi_jawaban' => [
                        ['text' => 'Saya tidak benci pada diri sendiri', 'bobot' => 0.0],
                        ['text' => 'Saya kecewa pada diri sendiri karena hasil kuliah saya', 'bobot' => 0.25],
                        ['text' => 'Saya tidak suka diri saya sendiri sebagai mahasiswa', 'bobot' => 0.65],
                        ['text' => 'Saya sangat membenci diri sendiri', 'bobot' => 1.0],
                    ],
                ],
                [
                    'kode_gejala' => 'G02',
                    'nama_gejala' => 'Pandangan masa depan',
                    'deskripsi_gejala' => 'Mengukur tingkat optimisme atau pesimisme mahasiswa terhadap masa depan akademik mereka.',
                    'kategori_gejala' => 'kognitif',
                    'nilai_cf' => 0.25, // High - hopelessness penting
                    'opsi_jawaban' => [
                        ['text' => 'Saya merasa optimis dengan masa depan akademik saya', 'bobot' => 0.0],
                        ['text' => 'Saya agak khawatir tentang masa depan saya di kuliah', 'bobot' => 0.25],
                        ['text' => 'Saya merasa masa depan akademik saya suram', 'bobot' => 0.65],
                        ['text' => 'Saya merasa tidak punya harapan untuk lulus dengan baik', 'bobot' => 1.0],
                    ],
                ],
                [
                    'kode_gejala' => 'G12',
                    'nama_gejala' => 'Kehilangan minat sosial',
                    'deskripsi_gejala' => 'Mengukur penurunan minat untuk berinteraksi sosial dengan teman-teman kampus.',
                    'kategori_gejala' => 'sosial',
                    'nilai_cf' => 0.24, // High - social withdrawal penting
                    'opsi_jawaban' => [
                        ['text' => 'Saya tetap mau bertemu teman', 'bobot' => 0.0],
                        ['text' => 'Saya mulai menarik diri dari teman', 'bobot' => 0.25],
                        ['text' => 'Saya sering menghindari pertemuan dengan teman kampus', 'bobot' => 0.65],
                        ['text' => 'Saya sama sekali tidak mau bertemu orang lain', 'bobot' => 1.0],
                    ],
                ],

                // TIER 3: MODERATE-HIGH - Gejala pendukung penting
                [
                    'kode_gejala' => 'G16',
                    'nama_gejala' => 'Gangguan tidur',
                    'deskripsi_gejala' => 'Mengukur masalah tidur yang dialami mahasiswa, terutama akibat stres akademik.',
                    'kategori_gejala' => 'fisik',
                    'nilai_cf' => 0.23, // Moderate-High - sleep disturbance
                    'opsi_jawaban' => [
                        ['text' => 'Tidur saya normal', 'bobot' => 0.0],
                        ['text' => 'Saya sedikit sulit tidur karena stres tugas', 'bobot' => 0.25],
                        ['text' => 'Saya sering terbangun di malam hari', 'bobot' => 0.65],
                        ['text' => 'Saya tidak bisa tidur sama sekali', 'bobot' => 1.0],
                    ],
                ],
                [
                    'kode_gejala' => 'G17',
                    'nama_gejala' => 'Kelelahan fisik',
                    'deskripsi_gejala' => 'Mengukur tingkat kelelahan fisik yang berlebihan dalam menjalani aktivitas akademik.',
                    'kategori_gejala' => 'fisik',
                    'nilai_cf' => 0.22, // Moderate-High - fatigue umum
                    'opsi_jawaban' => [
                        ['text' => 'Saya tidak merasa lelah berlebihan', 'bobot' => 0.0],
                        ['text' => 'Saya cepat lelah saat belajar', 'bobot' => 0.25],
                        ['text' => 'Saya sering merasa lelah dan lesu di kampus', 'bobot' => 0.65],
                        ['text' => 'Saya terlalu lelah untuk beraktivitas', 'bobot' => 1.0],
                    ],
                ],
                [
                    'kode_gejala' => 'G13',
                    'nama_gejala' => 'Kesulitan membuat keputusan',
                    'deskripsi_gejala' => 'Mengukur kemampuan mahasiswa dalam mengambil keputusan terkait akademik dan perkuliahan.',
                    'kategori_gejala' => 'kognitif',
                    'nilai_cf' => 0.21, // Moderate-High - indecisiveness
                    'opsi_jawaban' => [
                        ['text' => 'Saya masih bisa membuat keputusan akademik dengan baik', 'bobot' => 0.0],
                        ['text' => 'Saya sedikit bingung dalam mengambil keputusan kuliah', 'bobot' => 0.25],
                        ['text' => 'Saya sering ragu menentukan pilihan di perkuliahan', 'bobot' => 0.65],
                        ['text' => 'Saya tidak bisa membuat keputusan sama sekali', 'bobot' => 1.0],
                    ],
                ],
                [
                    'kode_gejala' => 'G03',
                    'nama_gejala' => 'Merasa gagal',
                    'deskripsi_gejala' => 'Mengukur persepsi mahasiswa tentang kegagalan diri dalam konteks akademik.',
                    'kategori_gejala' => 'kognitif',
                    'nilai_cf' => 0.20, // Moderate-High - self-evaluation negatif
                    'opsi_jawaban' => [
                        ['text' => 'Saya tidak merasa gagal sebagai mahasiswa', 'bobot' => 0.0],
                        ['text' => 'Saya merasa gagal dalam beberapa hal di kuliah', 'bobot' => 0.25],
                        ['text' => 'Saya sering merasa sebagai mahasiswa yang gagal', 'bobot' => 0.65],
                        ['text' => 'Saya merasa sebagai mahasiswa yang benar-benar gagal', 'bobot' => 1.0],
                    ],
                ],

                // TIER 4: MODERATE - Gejala pendukung sedang
                [
                    'kode_gejala' => 'G08',
                    'nama_gejala' => 'Menyalahkan diri sendiri',
                    'deskripsi_gejala' => 'Mengukur kecenderungan mahasiswa untuk menyalahkan diri atas masalah akademik yang dialami.',
                    'kategori_gejala' => 'kognitif',
                    'nilai_cf' => 0.19, // Moderate - self-blame pattern
                    'opsi_jawaban' => [
                        ['text' => 'Saya tidak sering menyalahkan diri sendiri', 'bobot' => 0.0],
                        ['text' => 'Saya kadang menyalahkan diri sendiri atas nilai buruk', 'bobot' => 0.25],
                        ['text' => 'Saya sering menyalahkan diri sendiri atas kegagalan belajar', 'bobot' => 0.65],
                        ['text' => 'Saya selalu merasa semua masalah kuliah adalah salah saya', 'bobot' => 1.0],
                    ],
                ],
                [
                    'kode_gejala' => 'G11',
                    'nama_gejala' => 'Gelisah/iritasi',
                    'deskripsi_gejala' => 'Mengukur tingkat kegelisahan dan mudah tersinggung dalam lingkungan akademik.',
                    'kategori_gejala' => 'emosional',
                    'nilai_cf' => 0.18, // Moderate - agitasi
                    'opsi_jawaban' => [
                        ['text' => 'Saya jarang merasa kesal', 'bobot' => 0.0],
                        ['text' => 'Saya mudah kesal pada hal kecil di kampus', 'bobot' => 0.25],
                        ['text' => 'Saya sering kesal dan marah pada diri sendiri atau orang lain', 'bobot' => 0.65],
                        ['text' => 'Saya selalu merasa terganggu oleh hal-hal kecil', 'bobot' => 1.0],
                    ],
                ],
                [
                    'kode_gejala' => 'G05',
                    'nama_gejala' => 'Perasaan bersalah',
                    'deskripsi_gejala' => 'Mengukur tingkat rasa bersalah yang dialami mahasiswa terkait performa akademik dan tanggung jawab.',
                    'kategori_gejala' => 'emosional',
                    'nilai_cf' => 0.17, // Moderate - guilt feelings
                    'opsi_jawaban' => [
                        ['text' => 'Saya jarang merasa bersalah atas hal-hal yang saya lakukan di kampus', 'bobot' => 0.0],
                        ['text' => 'Saya kadang merasa bersalah karena tidak maksimal belajar', 'bobot' => 0.25],
                        ['text' => 'Saya sering merasa bersalah kepada dosen, teman, atau keluarga', 'bobot' => 0.65],
                        ['text' => 'Saya selalu merasa bersalah atas kegagalan saya sebagai mahasiswa', 'bobot' => 1.0],
                    ],
                ],
                [
                    'kode_gejala' => 'G06',
                    'nama_gejala' => 'Merasa dihukum',
                    'deskripsi_gejala' => 'Mengukur persepsi mahasiswa tentang mendapat hukuman atau konsekuensi dari prestasi akademik.',
                    'kategori_gejala' => 'kognitif',
                    'nilai_cf' => 0.16, // Moderate - persecution feelings
                    'opsi_jawaban' => [
                        ['text' => 'Saya tidak merasa dihukum', 'bobot' => 0.0],
                        ['text' => 'Saya merasa saya bisa saja mendapatkan konsekuensi dari nilai jelek', 'bobot' => 0.25],
                        ['text' => 'Saya merasa pantas mendapat hukuman karena buruknya prestasi saya', 'bobot' => 0.65],
                        ['text' => 'Saya merasa dihukum oleh kegagalan akademik saya', 'bobot' => 1.0],
                    ],
                ],
                [
                    'kode_gejala' => 'G18',
                    'nama_gejala' => 'Penurunan nafsu makan',
                    'deskripsi_gejala' => 'Mengukur perubahan pola makan dan nafsu makan yang mungkin terkait dengan kondisi psikologis.',
                    'kategori_gejala' => 'fisik',
                    'nilai_cf' => 0.15, // Moderate - appetite changes
                    'opsi_jawaban' => [
                        ['text' => 'Nafsu makan saya normal', 'bobot' => 0.0],
                        ['text' => 'Nafsu makan saya sedikit menurun', 'bobot' => 0.25],
                        ['text' => 'Nafsu makan saya sangat menurun', 'bobot' => 0.65],
                        ['text' => 'Saya tidak nafsu makan sama sekali', 'bobot' => 1.0],
                    ],
                ],

                // TIER 5: MILD-MODERATE - Gejala manifestasi ringan-sedang
                [
                    'kode_gejala' => 'G10',
                    'nama_gejala' => 'Menangis',
                    'deskripsi_gejala' => 'Mengukur frekuensi menangis yang dialami mahasiswa, terutama akibat stres akademik.',
                    'kategori_gejala' => 'perilaku',
                    'nilai_cf' => 0.14, // Mild-Moderate - crying episodes
                    'opsi_jawaban' => [
                        ['text' => 'Saya jarang menangis', 'bobot' => 0.0],
                        ['text' => 'Saya lebih sering menangis daripada biasanya', 'bobot' => 0.25],
                        ['text' => 'Saya sering menangis karena stres kuliah', 'bobot' => 0.65],
                        ['text' => 'Saya menangis terus-menerus dan sulit berhenti', 'bobot' => 1.0],
                    ],
                ],
                [
                    'kode_gejala' => 'G19',
                    'nama_gejala' => 'Penurunan berat badan',
                    'deskripsi_gejala' => 'Mengukur perubahan berat badan yang mungkin terjadi akibat perubahan pola makan dan stres.',
                    'kategori_gejala' => 'fisik',
                    'nilai_cf' => 0.13, // Mild-Moderate - weight loss
                    'opsi_jawaban' => [
                        ['text' => 'Berat badan saya stabil', 'bobot' => 0.0],
                        ['text' => 'Saya kehilangan berat badan sedikit', 'bobot' => 0.25],
                        ['text' => 'Saya kehilangan berat badan 3–4 kg', 'bobot' => 0.65],
                        ['text' => 'Saya kehilangan berat badan lebih dari 5 kg', 'bobot' => 1.0],
                    ],
                ],
                [
                    'kode_gejala' => 'G20',
                    'nama_gejala' => 'Kekhawatiran kesehatan',
                    'deskripsi_gejala' => 'Mengukur tingkat kekhawatiran berlebihan terhadap kondisi kesehatan fisik, terutama akibat stres.',
                    'kategori_gejala' => 'fisik',
                    'nilai_cf' => 0.12, // Mild - health concerns
                    'opsi_jawaban' => [
                        ['text' => 'Saya tidak terlalu khawatir tentang kesehatan saya', 'bobot' => 0.0],
                        ['text' => 'Saya sedikit khawatir tentang kesehatan karena stres', 'bobot' => 0.25],
                        ['text' => 'Saya sering cemas tentang kondisi fisik saya', 'bobot' => 0.65],
                        ['text' => 'Saya merasa kondisi fisik saya buruk sekali', 'bobot' => 1.0],
                    ],
                ],
                [
                    'kode_gejala' => 'G21',
                    'nama_gejala' => 'Kehilangan minat seksual',
                    'deskripsi_gejala' => 'Mengukur penurunan minat atau dorongan seksual yang mungkin terjadi akibat kondisi psikologis.',
                    'kategori_gejala' => 'fisik',
                    'nilai_cf' => 0.11, // Mild - loss of libido
                    'opsi_jawaban' => [
                        ['text' => 'Minat seksual saya normal', 'bobot' => 0.0],
                        ['text' => 'Minat seksual saya sedikit berkurang', 'bobot' => 0.25],
                        ['text' => 'Minat seksual saya sangat berkurang', 'bobot' => 0.65],
                        ['text' => 'Saya sama sekali kehilangan minat seksual', 'bobot' => 1.0],
                    ],
                ],
            ];

            foreach ($gejalaData as $gejala) {
                // Cek apakah gejala sudah ada berdasarkan kode_gejala
                if (!Gejala::where('kode_gejala', $gejala['kode_gejala'])->exists()) {
                    Gejala::create([
                        'kode_gejala' => $gejala['kode_gejala'],
                        'nama_gejala' => $gejala['nama_gejala'],
                        'deskripsi_gejala' => $gejala['deskripsi_gejala'],
                        'kategori_gejala' => $gejala['kategori_gejala'],
                        'opsi_jawaban' => $gejala['opsi_jawaban'],
                        'nilai_cf' => $gejala['nilai_cf'],
                        'is_active' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                }
            }
        });

        $this->command->info('Data gejala BDI-II dengan nilai CF berhasil dibuat! Total: 21 gejala');
        $this->command->info('Kategori gejala: Emosional, Kognitif, Perilaku, Sosial, Fisik');
        $this->command->info('Rentang nilai CF: 0.48 - 0.95 berdasarkan tingkat kepentingan klinis');

        // Tampilkan distribusi CF
        $this->command->info('Distribusi Nilai CF:');
        $this->command->info('- Sangat Tinggi (≥0.9): G09 (Pikiran bunuh diri)');
        $this->command->info('- Tinggi (0.8-0.89): G01, G04, G14, G15 (Gejala inti depresi)');
        $this->command->info('- Sedang-Tinggi (0.7-0.79): G02, G07, G12, G16, G17');
        $this->command->info('- Sedang (0.6-0.69): G05, G06, G08, G11, G13, G18');
        $this->command->info('- Rendah-Sedang (≤0.59): G10, G19, G20, G21');
    }
}
