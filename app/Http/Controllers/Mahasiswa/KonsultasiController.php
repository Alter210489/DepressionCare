<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use App\Models\Gejala;
use App\Models\Diagnosa;
use App\Models\RiwayatKonsultasi;
use App\Models\Mahasiswa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;
use Carbon\Carbon;

class KonsultasiController extends Controller
{
    /**
     * Helper method to get mahasiswa data by user_id
     */
    private function getMahasiswaByUserId($userId)
    {
        return Mahasiswa::where('user_id', $userId)->first();
    }

    /**
     * Display konsultasi dashboard for mahasiswa.
     */
    public function index()
    {
        $user = Auth::user();
        $mahasiswa = $this->getMahasiswaByUserId($user->id);

        if (!$mahasiswa) {
            return redirect()->back()->with('error', 'Data mahasiswa tidak ditemukan');
        }

        $recentConsultations = RiwayatKonsultasi::where('id_mahasiswa', $mahasiswa->id_mahasiswa)
            ->with('diagnosa')
            ->orderBy('tanggal_konsultasi', 'desc')
            ->limit(5)
            ->get();

        $stats = [
            'total_konsultasi'      => RiwayatKonsultasi::where('id_mahasiswa', $mahasiswa->id_mahasiswa)->count(),
            'konsultasi_bulan_ini'  => RiwayatKonsultasi::where('id_mahasiswa', $mahasiswa->id_mahasiswa)
                ->whereMonth('tanggal_konsultasi', now()->month)
                ->whereYear('tanggal_konsultasi', now()->year)
                ->count(),
            'last_consultation'     => RiwayatKonsultasi::where('id_mahasiswa', $mahasiswa->id_mahasiswa)
                ->latest('tanggal_konsultasi')
                ->first(),
        ];

        $totalGejala = Gejala::where('is_active', true)->count();

        return Inertia::render('mahasiswa/Konsultasi/Index', [
            'recentConsultations' => $recentConsultations,
            'statistics'          => $stats,
            'totalGejala'         => $totalGejala,
        ]);
    }

    /**
     * Start new consultation session.
     */
    public function start()
    {
        $gejalaByKategori = Gejala::where('is_active', true)
            ->orderBy('kode_gejala')
            ->get()
            ->groupBy('kategori_gejala')
            ->map(function ($gejala) {
                return $gejala->map(function ($item) {
                    return [
                        'id'           => $item->id_gejala,
                        'kode'         => $item->kode_gejala,
                        'nama'         => $item->nama_gejala,
                        'deskripsi'    => $item->deskripsi_gejala,
                        'kategori'     => $item->kategori_gejala,
                        'nilai_cf'     => $item->nilai_cf,
                        'opsi_jawaban' => $item->opsi_jawaban ?? []
                    ];
                });
            });

        $kategoriOptions = Gejala::where('is_active', true)
            ->distinct()
            ->pluck('kategori_gejala')
            ->map(function ($kategori) {
                return [
                    'key'   => $kategori,
                    'label' => ucfirst(str_replace('_', ' ', $kategori))
                ];
            });

        return Inertia::render('mahasiswa/Konsultasi/Start', [
            'gejalaByKategori' => $gejalaByKategori,
            'kategoriOptions'  => $kategoriOptions,
            'totalGejala'      => Gejala::where('is_active', true)->count(),
        ]);
    }

    /**
     * Process consultation and calculate diagnosis using ONLY CF formula.
     */
    public function process(Request $request)
    {
        Log::info('=== PROCESS CONSULTATION START ===', [
            'user_id'            => Auth::id(),
            'request_data_count' => count($request->input('jawaban', [])),
        ]);

        $totalGejalaAktif = Gejala::where('is_active', true)->count();

        $validator = Validator::make($request->all(), [
            'jawaban'                     => 'required|array|size:' . $totalGejalaAktif,
            'jawaban.*.id_gejala'         => 'required|exists:gejala,id_gejala',
            'jawaban.*.opsi_terpilih'     => 'required|integer|min:0|max:3',
        ], [
            'jawaban.size'                        => "Anda harus menjawab semua {$totalGejalaAktif} pertanyaan gejala.",
            'jawaban.required'                    => 'Jawaban tidak boleh kosong.',
            'jawaban.*.id_gejala.required'        => 'ID gejala harus diisi.',
            'jawaban.*.id_gejala.exists'          => 'Gejala tidak valid.',
            'jawaban.*.opsi_terpilih.required'    => 'Pilihan jawaban harus diisi.',
            'jawaban.*.opsi_terpilih.integer'     => 'Pilihan jawaban harus berupa angka.',
            'jawaban.*.opsi_terpilih.min'         => 'Pilihan jawaban minimal 0.',
            'jawaban.*.opsi_terpilih.max'         => 'Pilihan jawaban maksimal 3.',
        ]);

        if ($validator->fails()) {
            Log::warning('Validation failed', [
                'errors'                => $validator->errors(),
                'total_jawaban'         => count($request->input('jawaban', [])),
                'total_gejala_required' => $totalGejalaAktif
            ]);
            return back()
                ->withErrors($validator)
                ->withInput()
                ->with('error', 'Data tidak valid: ' . $validator->errors()->first());
        }

        $jawabanGejalaIds = collect($request->input('jawaban'))->pluck('id_gejala')->toArray();
        $gejalaAktifIds   = Gejala::where('is_active', true)->pluck('id_gejala')->toArray();
        $missingGejala    = array_diff($gejalaAktifIds, $jawabanGejalaIds);

        if (!empty($missingGejala)) {
            Log::warning('Missing gejala in answers', ['missing_gejala_ids' => $missingGejala]);
            return back()
                ->withInput()
                ->with('error', 'Beberapa gejala belum dijawab. Harap jawab semua pertanyaan.');
        }

        try {
            DB::beginTransaction();

            $user      = Auth::user();
            $mahasiswa = $this->getMahasiswaByUserId($user->id);

            if (!$mahasiswa) {
                DB::rollBack();
                return back()->with('error', 'Data mahasiswa tidak ditemukan');
            }

            $jawaban        = $request->input('jawaban');
            $hasilKalkulasi = $this->calculateCFBasedDiagnosis($jawaban);

            if (!$hasilKalkulasi) {
                DB::rollBack();
                return back()->with('error', 'Gagal menghitung diagnosis');
            }

            $gejalaDetails = $this->processSymptomDetails($jawaban);
            $rekomendasi   = $this->generateRekomendasi(
                $hasilKalkulasi['diagnosa']->nama_diagnosa,
                $gejalaDetails
            );

            $konsultasi = RiwayatKonsultasi::create([
                'id_mahasiswa'      => $mahasiswa->id_mahasiswa,
                'id_diagnosa'       => $hasilKalkulasi['diagnosa']->id_diagnosa,
                'tanggal_konsultasi'=> now(),
                'hasil_diagnosa'    => $hasilKalkulasi['diagnosa']->nama_diagnosa,
                'nilai_cf'          => $hasilKalkulasi['cf_gabungan'],
                'tingkat_keparahan' => $hasilKalkulasi['diagnosa']->nama_diagnosa,
                'rekomendasi'       => json_encode($rekomendasi),
                'detail'            => json_encode([
                    'jawaban_gejala'                => $jawaban,
                    'perhitungan_cf'                => $hasilKalkulasi['detail_perhitungan_cf'],
                    'cf_gabungan'                   => $hasilKalkulasi['cf_gabungan'],
                    'cf_percentage'                 => $hasilKalkulasi['cf_percentage'],
                    'metode'                        => 'Certainty_Factor_Only',
                    'recommendation_version'        => 'enhanced_v4',
                    'symptom_based_recommendations' => true
                ])
            ]);

            if (!$konsultasi) {
                DB::rollBack();
                return back()->with('error', 'Gagal menyimpan data konsultasi');
            }

            DB::commit();

            return redirect()
                ->route('mahasiswa.konsultasi.result', $konsultasi->id_konsultasi)
                ->with('success', 'Konsultasi berhasil diselesaikan!');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Process consultation error', [
                'error' => $e->getMessage(),
                'file'  => $e->getFile(),
                'line'  => $e->getLine()
            ]);
            return back()
                ->withInput()
                ->with('error', 'Terjadi kesalahan sistem: ' . $e->getMessage());
        }
    }

    // =========================================================================
    // PERHITUNGAN CF
    // =========================================================================

    private function calculateCFBasedDiagnosis($jawabanGejala)
    {
        $cfArray             = [];
        $detailPerhitunganCF = [];

        foreach ($jawabanGejala as $jawaban) {
            $gejala = Gejala::find($jawaban['id_gejala']);
            if (!$gejala) continue;

            $opsiJawaban  = $gejala->opsi_jawaban ?? [];
            $opsiTerpilih = $opsiJawaban[$jawaban['opsi_terpilih']] ?? null;

            if ($opsiTerpilih && isset($opsiTerpilih['bobot'])) {
                $bobotOpsi     = floatval($opsiTerpilih['bobot']);
                $nilaiCFGejala = floatval($gejala->nilai_cf);
                $cfGejala      = $nilaiCFGejala * $bobotOpsi;

                if ($cfGejala > 0) {
                    $cfArray[] = $cfGejala;
                }

                $detailPerhitunganCF[] = [
                    'gejala'          => $gejala->nama_gejala,
                    'kode_gejala'     => $gejala->kode_gejala,
                    'nilai_cf_gejala' => $nilaiCFGejala,
                    'jawaban'         => $opsiTerpilih['text'],
                    'bobot_jawaban'   => $bobotOpsi,
                    'cf_hasil'        => $cfGejala,
                    'masuk_kalkulasi' => $cfGejala > 0
                ];
            }
        }

        $cfGabungan   = $this->calculateCombinedCF($cfArray);
        $cfPercentage = round($cfGabungan * 100, 2);
        $diagnosa     = $this->getDiagnosisFromCF($cfGabungan);

        return [
            'cf_gabungan'           => round($cfGabungan, 4),
            'cf_percentage'         => $cfPercentage,
            'diagnosa'              => $diagnosa,
            'detail_perhitungan_cf' => $detailPerhitunganCF,
            'cf_array'              => $cfArray,
            'statistik'             => [
                'total_gejala_dijawab'      => count($jawabanGejala),
                'gejala_dengan_cf_positif'  => count($cfArray),
                'cf_gabungan'               => $cfGabungan,
                'cf_percentage'             => $cfPercentage
            ]
        ];
    }

    private function calculateCombinedCF($cfArray)
    {
        if (empty($cfArray)) return 0;
        if (count($cfArray) === 1) return $cfArray[0];

        $cfGabungan = $cfArray[0];
        for ($i = 1; $i < count($cfArray); $i++) {
            $cfGabungan = $cfGabungan + ($cfArray[$i] * (1 - $cfGabungan));
        }
        return $cfGabungan;
    }

    private function getDiagnosisFromCF($cfGabungan)
    {
        if ($cfGabungan >= 0.70) {
            $diagnosa = Diagnosa::where('nama_diagnosa', 'LIKE', '%Berat%')->first();
            return $diagnosa ?: $this->getDefaultDiagnosa('Berat (Severe Depression)');
        } elseif ($cfGabungan >= 0.50) {
            $diagnosa = Diagnosa::where('nama_diagnosa', 'LIKE', '%Sedang%')->first();
            return $diagnosa ?: $this->getDefaultDiagnosa('Sedang (Moderate Depression)');
        } elseif ($cfGabungan >= 0.30) {
            $diagnosa = Diagnosa::where('nama_diagnosa', 'LIKE', '%Ringan%')->first();
            return $diagnosa ?: $this->getDefaultDiagnosa('Ringan (Mild Depression)');
        } else {
            $diagnosa = Diagnosa::where('nama_diagnosa', 'LIKE', '%Normal%')->first();
            return $diagnosa ?: $this->getDefaultDiagnosa('Normal');
        }
    }

    private function getDefaultDiagnosa($namaDefault)
    {
        $diagnosa = Diagnosa::where('nama_diagnosa', 'LIKE', "%{$namaDefault}%")->first();
        if ($diagnosa) return $diagnosa;

        $diagnosa = Diagnosa::first();
        if ($diagnosa) return $diagnosa;

        return (object)[
            'id_diagnosa'   => 0,
            'nama_diagnosa' => $namaDefault,
            'deskripsi'     => 'Deskripsi tidak tersedia'
        ];
    }

    // =========================================================================
    // REKOMENDASI UTAMA
    // =========================================================================

    private function generateRekomendasi($diagnosisName, $gejalaDetails = null)
    {
        $baseRecommendations = $this->getComprehensiveRecommendations($diagnosisName);
        $level               = $this->normalizeDiagnosisName($diagnosisName);

        $symptomRecs = [];
        if ($gejalaDetails) {
            $symptomRecs = $this->generateSymptomBasedRecommendations($gejalaDetails, $level);
        }

        $academicRecs = $this->generateAcademicRecommendations($level);
        $followUpRecs = $this->generateFollowUpRecommendations($level);
        $resourceRecs = $this->generateExternalResourceRecommendations($level);

        $all = $this->formatEnhancedRecommendations($baseRecommendations);

        if (!empty($symptomRecs)) {
            $all = array_merge($all, ["", "---", ""], $symptomRecs);
        }

        $all = array_merge($all, ["", "---", ""], $academicRecs);
        $all = array_merge($all, ["", "---", ""], $followUpRecs);
        $all = array_merge($all, ["", "---", ""], $resourceRecs);

        while (!empty($all) && in_array(end($all), ["", "---"])) {
            array_pop($all);
        }

        return $all;
    }

    // =========================================================================
    // REKOMENDASI DASAR PER LEVEL DIAGNOSIS
    // =========================================================================

    private function getComprehensiveRecommendations($diagnosisName)
    {
        $level = $this->normalizeDiagnosisName($diagnosisName);

        $map = [

            // -----------------------------------------------------------------
            'Normal' => [
                'status_explanation' => [
                    'title'   => 'Status Kesehatan Mental Anda: Normal',
                    'content' => 'Hasil skrining menunjukkan tidak ada gejala depresi yang signifikan saat ini. '
                               . 'Kondisi mental Anda tergolong sehat. Pertahankan kebiasaan positif yang sudah '
                               . 'berjalan dan tetap waspada terhadap tekanan akademik yang bisa muncul kapan saja.',
                ],
                'preventive_strategies' => [
                    'title'   => 'Strategi Menjaga Kesehatan Mental',
                    'content' => 'Langkah-langkah konkret yang bisa Anda terapkan sekarang:',
                    'items'   => [
                        'Tidur dan bangun pada jam yang sama setiap hari, konsistensi jadwal tidur adalah fondasi kesehatan mental.',
                        'Lakukan aktivitas fisik minimal 30 menit, 3x seminggu. Berjalan kaki di sekitar kampus sudah cukup.',
                        'Catat 3 hal kecil yang Anda syukuri setiap malam sebelum tidur untuk melatih pola pikir positif.',
                        'Bicarakan beban akademik secara rutin dengan **dosen pembimbing akademik** Anda, jangan tunggu hingga menumpuk.',
                        'Simpan nomor darurat **119 ext 8** di HP Anda sekarang, sebagai antisipasi jika suatu saat membutuhkan bantuan segera.',
                    ]
                ],
                'academic_wellness' => [
                    'title'   => 'Tips Seimbang Akademik dan Kesehatan Mental',
                    'content' => 'Keseimbangan adalah kunci agar performa kuliah tetap optimal:',
                    'items'   => [
                        'Gunakan teknik **Pomodoro** (25 menit fokus, 5 menit istirahat) untuk menjaga konsentrasi saat belajar.',
                        'Jangan ragu mengajukan pertanyaan ke dosen saat jam konsultas, itu hak Anda sebagai mahasiswa.',
                        'Sisihkan minimal 1 jam per hari untuk aktivitas non-akademik: hobi, olahraga, atau sekadar bersantai.',
                        'Hindari membandingkan progres Anda dengan teman, setiap orang memiliki kecepatan belajarnya sendiri.',
                    ]
                ],
            ],

            // -----------------------------------------------------------------
            'Ringan' => [
                'critical_understanding' => [
                    'title'   => 'Depresi Ringan: Butuh Perhatian Serius',
                    'content' => 'Gejala yang Anda alami sudah mulai mengganggu beberapa aspek kehidupan sehari-hari — '
                               . 'baik produktivitas, suasana hati, maupun energi. Meski belum memerlukan rawat inap, '
                               . 'intervensi dini sangat penting agar tidak berkembang ke tingkat yang lebih berat. '
                               . 'Strategi mandiri saja mungkin tidak cukup — pertimbangkan bantuan profesional.',
                ],
                'action_steps' => [
                    'title'   => 'Tindakan yang Harus Diambil dalam 7 Hari',
                    'content' => '',
                    'items'   => [
                        '**Temui dosen pembimbing akademik Anda segera.** Jelaskan bahwa Anda sedang tidak baik secara mental dan butuh penyesuaian — misalnya keringanan tenggat tugas atau pengurangan beban pertemuan.',
                        '**Konsultasi dengan psikolog melalui layanan online** seperti Halodoc, Alodokter, atau SehatQ. Sesi pertama biasanya terjangkau dan bisa dilakukan dari mana saja.',
                        'Jika tidak mampu membayar sesi berbayar, hubungi **Into The Light Indonesia** di 119 ext 8 — layanan konseling gratis tersedia.',
                        'Beritahu satu orang terpercaya (keluarga atau teman dekat) tentang kondisi Anda — jangan tanggung sendirian.',
                        '**Jika muncul pikiran menyakiti diri sendiri, segera hubungi 119 ext 8 tanpa menunggu.**',
                    ]
                ],
                'daily_structure' => [
                    'title'   => 'Bangun Struktur Harian yang Mendukung Pemulihan',
                    'content' => 'Rutinitas adalah obat alami untuk depresi ringan:',
                    'items'   => [
                        'Bangun dan tidur pada jam yang sama setiap hari — bahkan di akhir pekan.',
                        'Makan 3x sehari secara teratur. Jika tidak lapar, cukup makan camilan bergizi seperti buah atau roti.',
                        'Lakukan 1 aktivitas menyenangkan setiap hari, sekecil apa pun — mendengarkan lagu favorit, menggambar, atau berjalan 10 menit.',
                        'Hindari isolasi: kirim pesan singkat kepada teman setiap hari, meski hanya "Hai, apa kabar?"',
                        'Kurangi kafein dan hindari begadang — keduanya memperparah suasana hati.',
                    ]
                ],
            ],

            // -----------------------------------------------------------------
            'Sedang' => [
                'severity_recognition' => [
                    'title'   => '⚠️ PERINGATAN: Depresi Sedang — Bantuan Profesional Wajib',
                    'content' => 'Kondisi Anda sudah sangat mengganggu kehidupan sehari-hari: kuliah, hubungan sosial, '
                               . 'dan fungsi dasar seperti tidur dan makan kemungkinan sudah terdampak. '
                               . 'Strategi mandiri TIDAK CUKUP pada tahap ini. '
                               . 'Anda membutuhkan bantuan dari profesional kesehatan mental sesegera mungkin.',
                ],
                'urgent_actions' => [
                    'title'   => 'Tindakan Mendesak (Dalam 48 Jam)',
                    'content' => '',
                    'items'   => [
                        '**Hubungi dosen pembimbing akademik hari ini.** Minta surat keterangan atau bantuan untuk proses cuti medis/pengurangan beban mata kuliah. Anda berhak mendapatkan dukungan ini.',
                        '**Konsultasi dengan psikolog atau psikiater** melalui Halodoc, Alodokter, atau kunjungi Puskesmas/klinik terdekat — layanan kesehatan jiwa tersedia di fasilitas kesehatan tingkat pertama.',
                        'Beritahu keluarga atau orang tua tentang kondisi Anda sekarang, jangan sembunyikan agar mereka bisa mendukung proses pemulihan.',
                        '**Jika muncul pikiran untuk menyakiti diri sendiri, hubungi 119 ext 8 SEGERA atau pergi ke UGD rumah sakit terdekat.**',
                        'Singkirkan atau kurangi akses ke benda yang berpotensi berbahaya di sekitar Anda sebagai langkah pencegahan.',
                    ]
                ],
                'support_network' => [
                    'title'   => 'Bangun Jaringan Dukungan Sekarang',
                    'content' => 'Jangan hadapi ini sendirian:',
                    'items'   => [
                        'Tentukan 1–2 orang terdekat yang bisa Anda hubungi kapan saja saat kondisi memburuk.',
                        'Minta mereka untuk menemani Anda ke sesi konsultasi pertama jika memungkinkan.',
                        'Bagikan nomor 119 ext 8 kepada orang terdekat agar mereka juga tahu harus menghubungi siapa dalam situasi darurat.',
                    ]
                ],
            ],

            // -----------------------------------------------------------------
            'Berat' => [
                'medical_emergency' => [
                    'title'   => '🚨 KEADAAN DARURAT MEDIS — DEPRESI BERAT',
                    'content' => 'Ini adalah kondisi yang mengancam keselamatan jiwa dan membutuhkan penanganan segera. '
                               . 'Tolong jangan tunda tindakan. Anda tidak harus menanggung ini sendirian.',
                ],
                'immediate_safety' => [
                    'title'   => 'Langkah Keselamatan SEKARANG JUGA',
                    'content' => '',
                    'items'   => [
                        '📞 **Hubungi 119 ext 8 (Into The Light / Sejiwa) — layanan krisis tersedia 24 jam, gratis.**',
                        '🏥 **Pergi ke UGD rumah sakit terdekat** bersama seseorang yang Anda percaya — jangan pergi sendirian.',
                        '👥 **Jangan tinggal sendirian.** Segera temui anggota keluarga, teman kos, atau pergi ke tempat ramai.',
                        '🚫 **Jauhkan diri dari benda berbahaya** di sekitar Anda — pisau, obat-obatan dalam jumlah besar, atau benda lain yang bisa digunakan untuk menyakiti diri.',
                        '📲 **Hubungi orang tua atau keluarga sekarang** dan minta mereka datang atau menemani Anda.',
                    ]
                ],
                'professional_care' => [
                    'title'   => 'Perawatan Profesional yang Diperlukan',
                    'content' => 'Setelah kondisi akut tertangani:',
                    'items'   => [
                        'Konsultasi dengan **psikiater** (bukan hanya psikolog) untuk evaluasi kemungkinan terapi obat yang dapat menstabilkan kondisi lebih cepat.',
                        'Minta rujukan ke psikiater melalui Puskesmas — ini bisa ditanggung BPJS Kesehatan.',
                        'Rencanakan sesi terapi rutin minimal 2x seminggu selama fase pemulihan awal.',
                        'Libatkan keluarga dalam proses pemulihan — komunikasi terbuka dengan orang tua sangat penting.',
                    ]
                ],
                'academic_pause' => [
                    'title'   => 'Hentikan Aktivitas Akademik Sementara',
                    'content' => 'Kuliah bisa dilanjutkan nanti — kesehatan jiwa Anda tidak bisa ditunda:',
                    'items'   => [
                        'Hubungi dosen pembimbing akademik dan sampaikan bahwa Anda butuh **cuti medis segera**.',
                        'Minta surat keterangan dari dokter/psikiater sebagai dokumen pendukung pengajuan cuti.',
                        'Cuti medis resmi melindungi IPK Anda — ini bukan kegagalan, tapi langkah yang bijak.',
                        'Gunakan hasil skrining ini sebagai salah satu dokumen pendukung pengajuan cuti ke akademik.',
                    ]
                ],
            ],
        ];

        return $map[$level] ?? $map['Normal'];
    }

    // =========================================================================
    // REKOMENDASI BERBASIS GEJALA SPESIFIK
    // =========================================================================

    private function generateSymptomBasedRecommendations($gejalaDetails, $diagnosisLevel)
    {
        if (empty($gejalaDetails)) return [];

        $highScoreSymptoms = array_filter($gejalaDetails, fn($d) => ($d['cf_hasil'] ?? 0) > 0.1);
        if (empty($highScoreSymptoms)) return [];

        $hasSuicidalIdeation = collect($highScoreSymptoms)
            ->contains(fn($s) => ($s['gejala']['kode_gejala'] ?? '') === 'G09');

        $recs = [
            "## Rekomendasi Berdasarkan Gejala Spesifik Anda",
            "",
            "Berdasarkan analisis gejala yang Anda laporkan, berikut panduan yang disesuaikan dengan kondisi Anda:",
            "",
        ];

        // G09 ditampilkan PALING ATAS
        if ($hasSuicidalIdeation) {
            $recs = array_merge($recs, [
                "### 🚨 PERINGATAN KRITIS — PIKIRAN BUNUH DIRI TERDETEKSI",
                "",
                "Pikiran untuk mengakhiri hidup adalah sinyal darurat medis. Ini bukan kelemahan — ini tanda bahwa Anda sedang sangat kesakitan dan membutuhkan bantuan segera.",
                "",
                "**Lakukan INI sekarang:**",
                "• 📞 Hubungi **119 ext 8** (Into The Light / Sejiwa) — gratis, 24 jam, anonim",
                "• 👥 Temui seseorang yang Anda percaya **sekarang juga** — jangan tunggu",
                "• 🏥 Jika pikiran tersebut sangat kuat atau disertai rencana, **pergi ke UGD rumah sakit terdekat**",
                "• 🚫 Jauhkan diri dari benda berbahaya di sekitar Anda",
                "• 📲 Beritahu orang tua atau keluarga tentang kondisi Anda hari ini",
                "",
                "**Yang perlu Anda ketahui:**",
                "• Pikiran bunuh diri bisa diatasi dengan bantuan yang tepat — banyak orang sudah melewatinya",
                "• Anda tidak harus menanggung ini sendirian",
                "• Menghubungi bantuan adalah tanda keberanian, bukan kelemahan",
                "",
                "---",
                "",
            ]);
        }

        // Kelompokkan per kategori
        $grouped = collect($highScoreSymptoms)->groupBy('gejala.kategori_gejala');

        foreach ($grouped as $kategori => $symptoms) {
            $sectionTitle = match($kategori) {
                'fisik'     => '### Mengatasi Gejala Fisik',
                'emosional' => '### Mengelola Gejala Emosional',
                'kognitif'  => '### Mengatasi Gejala Kognitif',
                'perilaku'  => '### Mengubah Pola Perilaku',
                'sosial'    => '### Mempertahankan Koneksi Sosial',
                default     => '### Gejala Lainnya',
            };

            $recs[] = $sectionTitle;
            $recs[] = "";

            foreach ($symptoms as $s) {
                $kode = $s['gejala']['kode_gejala'] ?? '';
                $nama = $s['gejala']['nama_gejala'] ?? '';
                if ($kode === 'G09') continue;

                $rec = $this->getSymptomRecommendation($kode, $nama, $kategori, $diagnosisLevel);
                if ($rec) {
                    $recs[] = "**{$nama}:**";
                    $recs[] = $rec;
                    $recs[] = "";
                }
            }
        }

        return $recs;
    }

    /**
     * Fungsi terpadu rekomendasi per gejala (semua kategori dalam satu map)
     */
    private function getSymptomRecommendation($kodeGejala, $namaGejala, $kategori, $diagnosisLevel)
    {
        $map = [
            // === EMOSIONAL ===
            'G01' => "Izinkan diri Anda merasakan kesedihan tanpa menghakimi — emosi ini valid. "
                   . "Coba teknik **grounding 5-4-3-2-1**: sebutkan 5 benda yang Anda lihat, 4 yang bisa Anda sentuh, 3 yang bisa Anda dengar, 2 yang bisa Anda cium, 1 yang bisa Anda rasakan. "
                   . "Catat 1 hal kecil yang positif setiap malam.",

            'G05' => "Perasaan bersalah berlebihan adalah gejala umum depresi — bukan cerminan kenyataan. "
                   . "Latih belas kasih diri: perlakukan diri Anda seperti sahabat yang sedang berjuang. "
                   . "Buat daftar hal positif yang telah Anda lakukan, sekecil apa pun.",

            'G07' => "Kebencian pada diri sendiri adalah gejala yang serius dan perlu ditangani bersama profesional. "
                   . "Segera konsultasikan ke psikolog melalui Halodoc atau Alodokter. "
                   . "Sementara itu, gunakan aplikasi **MoodTools** (gratis) untuk latihan CBT mandiri. "
                   . "Ceritakan kondisi ini kepada **dosen pembimbing** agar beban akademik dapat disesuaikan.",

            'G11' => "Mudah tersinggung atau marah adalah respons umum terhadap kelelahan emosional. "
                   . "Gunakan teknik pernapasan **4-7-8**: hirup 4 hitungan, tahan 7 hitungan, hembuskan 8 hitungan. "
                   . "Identifikasi pemicu utama kemarahan Anda dan buat rencana menghindari atau meresponsnya secara berbeda.",

            // === KOGNITIF ===
            'G02' => "Pikiran bahwa masa depan terasa suram adalah distorsi kognitif — bukan kenyataan. "
                   . "Tantang pikiran ini dengan fakta: 'Saya pernah melewati masa sulit sebelumnya.' "
                   . "Fokus pada rencana 1 minggu ke depan, bukan segalanya sekaligus.",

            'G03' => "Merasa seperti kegagalan tidak berarti Anda benar-benar gagal. "
                   . "Catat 3 pencapaian kecil setiap hari — lulus kuliah hari ini, mengerjakan 1 soal, atau sekadar bangun pagi sudah dihitung. "
                   . "Kegagalan akademik bukan kegagalan sebagai manusia.",

            'G06' => "Perasaan dihukum atau tidak layak mendapat kebaikan adalah gejala depresi, bukan kebenaran. "
                   . "Diskusikan tekanan ini dengan **dosen pembimbing** Anda. "
                   . "Ingat: stres akademik yang berat sering memunculkan pikiran seperti ini secara tidak adil.",

            'G08' => "Latih pola pikir seimbang: pisahkan apa yang di luar kendali Anda dari apa yang bisa Anda ubah. "
                   . "Fokus energi hanya pada hal yang bisa Anda pengaruhi hari ini.",

            'G13' => "Kesulitan mengambil keputusan adalah gejala umum depresi, bukan tanda kelemahan. "
                   . "Pecah keputusan besar menjadi langkah kecil. Gunakan daftar pro-kontra sederhana. "
                   . "Untuk keputusan yang tidak mendesak, beri diri Anda 24 jam sebelum memutuskan.",

            'G14' => "Perasaan tidak berharga perlu ditantang dengan bukti nyata. "
                   . "Tanyakan pada diri sendiri: 'Apa yang pernah orang lain apresiasi dari saya?' "
                   . "Minta feedback dari dosen atau teman jika sulit menemukannya sendiri.",

            'G15' => "Konsentrasi yang buruk adalah gejala yang sangat umum pada depresi dan bukan karena Anda malas. "
                   . "Pecah sesi belajar menjadi 15–20 menit dengan jeda pendek. "
                   . "Bicarakan kesulitan ini kepada **dosen pembimbing** untuk mendapatkan keringanan atau perpanjangan tenggat tugas.",

            // === FISIK ===
            'G09' => null, // ditangani khusus di atas

            'G16' => "Terapkan kebersihan tidur: tidur dan bangun di jam yang sama setiap hari termasuk akhir pekan. "
                   . "Hindari layar HP/laptop minimal 1 jam sebelum tidur — cahaya biru mengganggu produksi melatonin. "
                   . "Jika gangguan tidur berlanjut lebih dari 2 minggu, diskusikan dengan **dosen pembimbing** untuk penyesuaian beban kuliah.",

            'G17' => "Kelelahan kronis adalah sinyal tubuh bahwa sistem Anda kelebihan beban. "
                   . "Mulai aktivitas fisik ringan 5–10 menit per hari (jalan kaki singkat di kampus sudah membantu). "
                   . "Pastikan tidur cukup 7–8 jam. Jika kelelahan mengganggu kemampuan kuliah, ajukan penyesuaian beban ke **dosen pembimbing**.",

            'G18' => "Kehilangan nafsu makan atau makan berlebihan adalah respons stres yang umum. "
                   . "Makan dalam porsi kecil tapi sering (5–6x sehari). Gunakan alarm sebagai pengingat makan. "
                   . "Pilih makanan bergizi ringan seperti buah, kacang, atau yogurt jika tidak selera makan banyak.",

            'G19' => "Pantau berat badan seminggu sekali. Jika turun atau naik lebih dari 3 kg dalam sebulan, "
                   . "pertimbangkan konsultasi melalui Halodoc atau SehatQ dan beritahu **dosen pembimbing** agar beban akademik dapat disesuaikan.",

            'G20' => "Kekhawatiran berlebihan tentang kesehatan fisik sering dipicu stres akademik. "
                   . "Batasi pencarian gejala di internet (tidak lebih dari 5 menit per hari). "
                   . "Lakukan pemeriksaan kesehatan umum di Puskesmas untuk memastikan tidak ada masalah fisik yang nyata.",

            'G21' => "Penurunan minat atau dorongan seksual adalah respons umum terhadap depresi dan stres berat. "
                   . "Kondisi ini biasanya membaik seiring pemulihan suasana hati secara keseluruhan. "
                   . "Fokus pada pemulihan kesehatan mental — ini adalah prioritas utama.",

            // === PERILAKU ===
            'G04' => "Kehilangan minat pada aktivitas yang dulu menyenangkan adalah gejala utama depresi. "
                   . "Mulai dengan versi paling sederhana dari aktivitas tersebut — bahkan hanya 5 menit. "
                   . "Memaksa diri sedikit pada awalnya adalah normal dan justru membantu pemulihan.",

            'G10' => "Menangis adalah cara sehat melepaskan emosi — jangan ditahan. "
                   . "Namun jika tangisan datang tanpa henti dan mengganggu aktivitas penting, "
                   . "ini tanda bahwa Anda perlu bantuan profesional segera.",

            // === SOSIAL ===
            'G12' => "Menarik diri dari orang-orang justru memperparah depresi, meski terasa lebih mudah. "
                   . "Mulai dengan kontak sosial berenergi rendah: kirim 1 pesan ke teman setiap hari. "
                   . "Pilih aktivitas sosial ringan seperti belajar bersama, makan siang bareng, atau jalan sore. "
                   . "Beri tahu teman dekat tentang kondisi Anda — Anda tidak harus menjelaskan semuanya, cukup 'aku lagi kurang baik-baik saja'.",
        ];

        return $map[$kodeGejala] ?? null;
    }

    // =========================================================================
    // REKOMENDASI AKADEMIK
    // =========================================================================

    private function generateAcademicRecommendations($diagnosisLevel)
    {
        $recs   = [];
        $recs[] = "## Panduan Akademik untuk Mahasiswa";
        $recs[] = "";

        switch ($diagnosisLevel) {
            case 'Normal':
                $recs[] = "### Menjaga Performa Akademik Secara Proaktif";
                $recs[] = "";
                $recs[] = "**Manajemen Waktu:**";
                $recs[] = "• Gunakan kalender digital untuk mencatat semua tenggat waktu di awal semester.";
                $recs[] = "• Terapkan teknik **time-blocking**: blok waktu spesifik untuk setiap mata kuliah.";
                $recs[] = "• Lakukan evaluasi mingguan: apa yang sudah selesai, apa yang perlu dikejar.";
                $recs[] = "";
                $recs[] = "**Komunikasi dengan Dosen Pembimbing:**";
                $recs[] = "• Jadwalkan pertemuan rutin dengan dosen pembimbing akademik minimal 1x per bulan.";
                $recs[] = "• Ceritakan kondisi dan beban studi Anda secara terbuka, mereka ada untuk membantu.";
                $recs[] = "• Jangan tunggu nilai turun sebelum meminta bantuan.";
                break;

            case 'Ringan':
                $recs[] = "### Penyesuaian Akademik untuk Kondisi Ringan";
                $recs[] = "";
                $recs[] = "**Segera Temui Dosen Pembimbing Akademik:**";
                $recs[] = "• Jelaskan bahwa Anda sedang mengalami tekanan mental yang memengaruhi konsentrasi dan produktivitas.";
                $recs[] = "• Minta pertimbangan untuk: perpanjangan tenggat tugas, keringanan kehadiran, atau pengurangan beban SKS.";
                $recs[] = "• Dosen pembimbing adalah satu-satunya jalur resmi di kampus untuk mendapatkan penyesuaian akademik.";
                $recs[] = "";
                $recs[] = "**Modifikasi Cara Belajar:**";
                $recs[] = "• Gunakan sesi belajar lebih pendek (15 menit) dengan jeda lebih sering.";
                $recs[] = "• Jadwalkan belajar pada jam puncak energi Anda (biasanya pagi hari).";
                $recs[] = "• Fokus pada mata kuliah inti terlebih dahulu. prioritaskan, bukan semua sekaligus.";
                break;

            case 'Sedang':
                $recs[] = "### Manajemen Krisis Akademik";
                $recs[] = "";
                $recs[] = "**Langkah dengan Dosen Pembimbing:**";
                $recs[] = "• **Temui dosen pembimbing hari ini** — ini mendesak, bukan opsional.";
                $recs[] = "• Minta bantuan untuk proses pengajuan cuti sakit atau pengurangan beban mata kuliah secara resmi.";
                $recs[] = "• Bawa dokumen hasil skrining ini sebagai pendukung jika diperlukan.";
                $recs[] = "";
                $recs[] = "**Pertimbangan Akademik:**";
                $recs[] = "• Fokus hanya pada mata kuliah yang wajib untuk kelulusan — lepas yang pilihan dulu.";
                $recs[] = "• Komunikasikan kondisi Anda kepada dosen pengampu mata kuliah (melalui dosen pembimbing jika perlu).";
                $recs[] = "• Pertimbangkan nilai 'belum lengkap/incomplete' yang bisa diselesaikan di semester berikutnya.";
                break;

            case 'Berat':
                $recs[] = "### Penghentian Aktivitas Akademik Sementara";
                $recs[] = "";
                $recs[] = "**Cuti Medis adalah Pilihan Terbaik Sekarang:**";
                $recs[] = "• Hubungi dosen pembimbing dan sampaikan bahwa Anda membutuhkan **cuti medis segera**.";
                $recs[] = "• Siapkan surat keterangan dokter/psikiater sebagai syarat pengajuan cuti resmi.";
                $recs[] = "• Cuti medis melindungi status mahasiswa dan IPK Anda — ini bukan kegagalan.";
                $recs[] = "";
                $recs[] = "**Rencana Kembali Kuliah:**";
                $recs[] = "• Tentukan target kembali kuliah bersama tim medis yang menangani — tidak perlu terburu-buru.";
                $recs[] = "• Saat kembali, mulai dengan beban SKS minimal hingga kondisi benar-benar stabil.";
                $recs[] = "• Pastikan sistem dukungan (keluarga, teman, profesional) sudah terpasang sebelum kembali.";
                break;
        }

        return $recs;
    }

    // =========================================================================
    // REKOMENDASI TINDAK LANJUT
    // =========================================================================

    private function generateFollowUpRecommendations($diagnosisLevel)
    {
        $recs   = [];
        $recs[] = "## Pemantauan dan Tindak Lanjut";
        $recs[] = "";

        switch ($diagnosisLevel) {
            case 'Normal':
                $recs[] = "### Jadwal Pemantauan Mandiri";
                $recs[] = "";
                $recs[] = "• Lakukan pengecekan suasana hati mingguan — skala 1–10 sudah cukup.";
                $recs[] = "• Ulangi skrining ini setiap **4 minggu sekali** atau kapan pun Anda merasa kondisi berubah.";
                $recs[] = "• Perhatikan perubahan pola tidur, nafsu makan, atau semangat sebagai sinyal awal.";
                break;

            case 'Ringan':
                $recs[] = "### Pemantauan Aktif";
                $recs[] = "";
                $recs[] = "• Catat suasana hati dan tingkat energi harian di jurnal atau aplikasi catatan.";
                $recs[] = "• Ulangi skrining ini dalam **2 minggu** — jika tidak membaik, segera konsultasi profesional.";
                $recs[] = "• Lakukan minimal 1 sesi konsultasi online dalam bulan ini.";
                $recs[] = "• Evaluasi efektivitas langkah-langkah yang sudah Anda ambil setiap minggu.";
                break;

            case 'Sedang':
                $recs[] = "### Pemantauan Intensif";
                $recs[] = "";
                $recs[] = "• Konsultasi dengan psikolog minimal **2x per minggu** selama fase awal.";
                $recs[] = "• Minta orang terdekat (keluarga/teman kos) untuk memantau kondisi Anda setiap hari.";
                $recs[] = "• Simpan nomor kontak darurat di HP: **119 ext 8**, kontak keluarga, kontak teman terdekat.";
                $recs[] = "• Jangan buat keputusan besar (putus kuliah, pindah kos, dll) saat kondisi sedang tidak stabil.";
                break;

            case 'Berat':
                $recs[] = "### Pemantauan Kritis";
                $recs[] = "";
                $recs[] = "• Komunikasi harian dengan anggota keluarga tentang kondisi Anda.";
                $recs[] = "• Jangan sendirian dalam jangka waktu lama — minta keluarga atau teman menemani.";
                $recs[] = "• Ikuti semua instruksi dari psikiater yang menangani Anda.";
                $recs[] = "• Pemulihan butuh waktu — target minggu pertama adalah tetap aman, bukan sudah baik-baik saja.";
                break;
        }

        $recs[] = "";
        $recs[] = "### Hal yang Perlu Selalu Dipantau:";
        $recs[] = "• **Kualitas tidur** — apakah membaik, memburuk, atau berubah pola?";
        $recs[] = "• **Nafsu makan** — apakah stabil, meningkat, atau menurun drastis?";
        $recs[] = "• **Kemampuan berkonsentrasi** — apakah lebih mudah atau semakin sulit?";
        $recs[] = "• **Pikiran negatif** — apakah intensitasnya berkurang atau meningkat?";
        $recs[] = "• **Aktivitas sosial** — apakah Anda masih berinteraksi atau semakin menarik diri?";

        return $recs;
    }

    // =========================================================================
    // SUMBER DAYA EKSTERNAL
    // =========================================================================

    private function generateExternalResourceRecommendations($diagnosisLevel)
    {
        $recs   = [];
        $recs[] = "## Sumber Bantuan yang Bisa Anda Akses";
        $recs[] = "";

        $recs[] = "### 🆘 Layanan Darurat (Gratis, 24 Jam)";
        $recs[] = "• **119 ext 8** — Into The Light / Sejiwa: hotline krisis kesehatan mental nasional";
        $recs[] = "• **UGD Rumah Sakit terdekat** — untuk kondisi darurat yang mengancam keselamatan jiwa";
        $recs[] = "• **Puskesmas** — layanan kesehatan jiwa dasar, bisa ditanggung BPJS Kesehatan";
        $recs[] = "";

        $recs[] = "### 💻 Konsultasi Online Berbayar (Terjangkau)";
        $recs[] = "• **Halodoc** — konsultasi psikolog/psikiater mulai dari Rp 30.000–Rp 100.000 per sesi";
        $recs[] = "• **Alodokter** — tersedia dokter umum dan spesialis jiwa";
        $recs[] = "• **Riliv** — platform konseling yang dirancang khusus untuk kesehatan mental";
        $recs[] = "• **Bicarakan.id** — layanan konseling online dengan harga terjangkau";
        $recs[] = "• **SehatQ** — konsultasi kesehatan termasuk kesehatan jiwa";
        $recs[] = "";

        $recs[] = "### 📱 Aplikasi Mandiri (Gratis)";
        $recs[] = "• **MoodTools** — panduan CBT (Cognitive Behavioral Therapy) berbasis bukti ilmiah";
        $recs[] = "• **Insight Timer** — meditasi dan mindfulness gratis";
        $recs[] = "• **Sanvello** — manajemen stres, kecemasan, dan depresi ringan";
        $recs[] = "";

        if (in_array($diagnosisLevel, ['Sedang', 'Berat'])) {
            $recs[] = "### 🏥 Fasilitas Kesehatan dengan Layanan Jiwa di Tarakan";
            $recs[] = "• **RSUD Tarakan** — Instalasi Rawat Jalan (Poli Jiwa/Psikiatri)";
            $recs[] = "• **Puskesmas setempat** — minta rujukan ke poli jiwa RSUD";
            $recs[] = "• Bawa **Kartu BPJS** — sebagian besar biaya konsultasi jiwa ditanggung";
            $recs[] = "";
        }

        $recs[] = "### 📚 Sumber Edukasi Mandiri";
        $recs[] = "• **intothelightid.org** — informasi kesehatan mental berbahasa Indonesia";
        $recs[] = "• **Into The Light Indonesia** di media sosial — konten edukasi depresi dan kesehatan jiwa";
        $recs[] = "• **Buku 'Feeling Good'** oleh David Burns — panduan CBT mandiri yang direkomendasikan secara klinis";

        return $recs;
    }

    // =========================================================================
    // HELPER FUNCTIONS
    // =========================================================================

    private function processSymptomDetails($jawaban)
    {
        $gejalaDetails = [];
        foreach ($jawaban as $j) {
            $gejala = Gejala::find($j['id_gejala']);
            if (!$gejala) continue;

            $opsiJawaban  = $gejala->opsi_jawaban ?? [];
            $opsiTerpilih = $opsiJawaban[$j['opsi_terpilih']] ?? null;

            if ($opsiTerpilih && isset($opsiTerpilih['bobot'])) {
                $cfHasil         = $gejala->nilai_cf * $opsiTerpilih['bobot'];
                $gejalaDetails[] = [
                    'gejala' => [
                        'id_gejala'       => $gejala->id_gejala,
                        'kode_gejala'     => $gejala->kode_gejala,
                        'nama_gejala'     => $gejala->nama_gejala,
                        'kategori_gejala' => $gejala->kategori_gejala,
                        'nilai_cf'        => $gejala->nilai_cf,
                    ],
                    'opsi_terpilih' => $opsiTerpilih,
                    'cf_hasil'      => $cfHasil
                ];
            }
        }
        return $gejalaDetails;
    }

    private function formatEnhancedRecommendations($recommendations)
    {
        $formatted = [];
        foreach ($recommendations as $section) {
            $formatted[] = "## " . $section['title'];
            $formatted[] = "";

            if (!empty($section['content'])) {
                $formatted[] = $section['content'];
                $formatted[] = "";
            }

            if (!empty($section['items'])) {
                foreach ($section['items'] as $item) {
                    $formatted[] = "• " . $item;
                }
                $formatted[] = "";
            }

            $formatted[] = "---";
            $formatted[] = "";
        }

        while (!empty($formatted) && in_array(end($formatted), ["", "---"])) {
            array_pop($formatted);
        }

        return $formatted;
    }

    private function normalizeDiagnosisName($diagnosisName)
    {
        $diagnosis = trim(strtolower($diagnosisName));
        $mappings  = [
            'severe'    => 'Berat',
            'berat'     => 'Berat',
            'moderate'  => 'Sedang',
            'sedang'    => 'Sedang',
            'mild'      => 'Ringan',
            'ringan'    => 'Ringan',
            'minimal'   => 'Normal',
            'normal'    => 'Normal',
            'tidak ada' => 'Normal',
            'none'      => 'Normal',
        ];

        foreach ($mappings as $term => $category) {
            if (stripos($diagnosis, $term) !== false) {
                return $category;
            }
        }

        return 'Normal';
    }

    // =========================================================================
    // RESULT PAGE
    // =========================================================================

    public function result($id)
    {
        try {
            $user      = Auth::user();
            $mahasiswa = $this->getMahasiswaByUserId($user->id);

            if (!$mahasiswa) {
                return redirect()->route('mahasiswa.konsultasi.index')
                    ->with('error', 'Data mahasiswa tidak ditemukan.');
            }

            $konsultasi = RiwayatKonsultasi::where('id_konsultasi', $id)
                ->where('id_mahasiswa', $mahasiswa->id_mahasiswa)
                ->with('diagnosa')
                ->first();

            if (!$konsultasi) {
                return redirect()->route('mahasiswa.konsultasi.index')
                    ->with('error', 'Data konsultasi tidak ditemukan.');
            }

            $detail = [];
            if ($konsultasi->detail) {
                $detail = is_string($konsultasi->detail)
                    ? json_decode($konsultasi->detail, true)
                    : $konsultasi->detail;
            }

            $rekomendasi = [];
            if ($konsultasi->rekomendasi) {
                $rekomendasi = is_string($konsultasi->rekomendasi)
                    ? json_decode($konsultasi->rekomendasi, true)
                    : $konsultasi->rekomendasi;
            }

            // Regenerate jika versi lama
            $currentVersion = $detail['recommendation_version'] ?? '';
            if (empty($rekomendasi) || $currentVersion !== 'enhanced_v4') {
                $gejalaDetails = [];
                if (isset($detail['jawaban_gejala']) && is_array($detail['jawaban_gejala'])) {
                    $gejalaDetails = $this->processSymptomDetails($detail['jawaban_gejala']);
                }

                $rekomendasi = $this->generateRekomendasi($konsultasi->tingkat_keparahan, $gejalaDetails);

                $konsultasi->update([
                    'rekomendasi' => json_encode($rekomendasi),
                    'detail'      => json_encode(array_merge($detail, [
                        'recommendation_version'        => 'enhanced_v4',
                        'recommendation_updated_at'     => now(),
                        'symptom_based_recommendations' => true
                    ]))
                ]);
            }

            $gejalaDetails = [];
            if (isset($detail['jawaban_gejala']) && is_array($detail['jawaban_gejala'])) {
                $gejalaDetails = collect($detail['jawaban_gejala'])->map(function ($jawaban) {
                    $gejala = Gejala::find($jawaban['id_gejala']);
                    if (!$gejala) return null;

                    $opsiJawaban  = $gejala->opsi_jawaban ?? [];
                    $opsiTerpilih = $opsiJawaban[$jawaban['opsi_terpilih']] ?? null;

                    return [
                        'gejala' => [
                            'id_gejala'       => $gejala->id_gejala,
                            'kode_gejala'     => $gejala->kode_gejala,
                            'nama_gejala'     => $gejala->nama_gejala,
                            'kategori_gejala' => $gejala->kategori_gejala,
                            'nilai_cf'        => $gejala->nilai_cf,
                        ],
                        'opsi_terpilih' => $opsiTerpilih,
                        'bobot_jawaban' => $opsiTerpilih['bobot'] ?? 0,
                        'cf_hasil'      => ($gejala->nilai_cf ?? 0) * ($opsiTerpilih['bobot'] ?? 0)
                    ];
                })->filter()->values()->toArray();
            }

            $cfPercentage    = round($konsultasi->nilai_cf * 100, 2);
            $confidenceLevel = $this->getConfidenceLevel($konsultasi->nilai_cf);

            return Inertia::render('mahasiswa/Konsultasi/Result', [
                'konsultasi' => [
                    'id_konsultasi'      => $konsultasi->id_konsultasi,
                    'tanggal_konsultasi' => $konsultasi->tanggal_konsultasi,
                    'hasil_diagnosa'     => $konsultasi->hasil_diagnosa,
                    'nilai_cf'           => $konsultasi->nilai_cf,
                    'tingkat_keparahan'  => $konsultasi->tingkat_keparahan,
                    'rekomendasi'        => $konsultasi->rekomendasi,
                    'diagnosa' => [
                        'id_diagnosa'        => $konsultasi->diagnosa->id_diagnosa ?? 0,
                        'nama_diagnosa'      => $konsultasi->diagnosa->nama_diagnosa ?? $konsultasi->hasil_diagnosa,
                        'deskripsi_diagnosa' => $konsultasi->diagnosa->deskripsi ?? 'Deskripsi tidak tersedia'
                    ],
                    'detail' => $detail
                ],
                'gejalaDetails'   => $gejalaDetails,
                'cfPercentage'    => $cfPercentage,
                'confidenceLevel' => $confidenceLevel,
                'rekomendasi'     => $rekomendasi,
            ]);

        } catch (\Exception $e) {
            Log::error('Error loading result page', [
                'error'          => $e->getMessage(),
                'konsultasi_id'  => $id,
                'user_id'        => Auth::id(),
            ]);
            return redirect()->route('mahasiswa.konsultasi.index')
                ->with('error', 'Terjadi kesalahan saat memuat hasil konsultasi.');
        }
    }

    // =========================================================================
    // EXPORT PDF
    // =========================================================================

    public function exportResultPdf(Request $request)
    {
        try {
            $idKonsultasi = $request->get('id_konsultasi');

            if (!$idKonsultasi || !is_numeric($idKonsultasi)) {
                return redirect()->back()->with('error', 'ID konsultasi tidak valid');
            }

            $user      = Auth::user();
            $mahasiswa = $this->getMahasiswaByUserId($user->id);

            if (!$mahasiswa) {
                return redirect()->back()->with('error', 'Data mahasiswa tidak ditemukan');
            }

            $konsultasi = RiwayatKonsultasi::with(['mahasiswa.user', 'diagnosa'])
                ->where('id_konsultasi', $idKonsultasi)
                ->where('id_mahasiswa', $mahasiswa->id_mahasiswa)
                ->first();

            if (!$konsultasi) {
                return redirect()->back()->with('error', 'Data konsultasi tidak ditemukan');
            }

            $detail = [];
            if ($konsultasi->detail) {
                $detail = is_string($konsultasi->detail)
                    ? json_decode($konsultasi->detail, true)
                    : $konsultasi->detail;
            }

            $gejalaTerpilih = [];
            if (isset($detail['jawaban_gejala']) && is_array($detail['jawaban_gejala'])) {
                foreach ($detail['jawaban_gejala'] as $jawaban) {
                    $gejala = Gejala::find($jawaban['id_gejala']);
                    if ($gejala) {
                        $opsiJawaban  = $gejala->opsi_jawaban ?? [];
                        $opsiTerpilih = $opsiJawaban[$jawaban['opsi_terpilih']] ?? null;
                        $gejalaTerpilih[] = [
                            'gejala' => [
                                'id_gejala'       => $gejala->id_gejala,
                                'kode_gejala'     => $gejala->kode_gejala,
                                'nama_gejala'     => $gejala->nama_gejala,
                                'kategori_gejala' => $gejala->kategori_gejala,
                            ],
                            'opsi_terpilih' => $opsiTerpilih,
                            'cf_hasil'      => (float)($opsiTerpilih['bobot'] ?? 0) * ($gejala->nilai_cf ?? 0),
                        ];
                    }
                }
            }

            $cfValue         = (float)$konsultasi->nilai_cf;
            $confidenceLevel = $this->getConfidenceLevel($cfValue);

            $rekomendasiArray = [];
            if ($konsultasi->rekomendasi) {
                $parsed = is_string($konsultasi->rekomendasi)
                    ? json_decode($konsultasi->rekomendasi, true)
                    : $konsultasi->rekomendasi;
                $rekomendasiArray = is_array($parsed) ? $parsed : [$konsultasi->rekomendasi];
            }

            // Regenerate jika versi lama
            $currentVersion = $detail['recommendation_version'] ?? '';
            if (empty($rekomendasiArray) || $currentVersion !== 'enhanced_v4') {
                $gejalaDetailsForRec = $this->processSymptomDetails($detail['jawaban_gejala'] ?? []);
                $rekomendasiArray    = $this->generateRekomendasi($konsultasi->tingkat_keparahan, $gejalaDetailsForRec);
            }

            $pdfData = [
                'konsultasi'             => $konsultasi,
                'gejalaDetails'          => $gejalaTerpilih,
                'confidenceLevel'        => $confidenceLevel,
                'rekomendasi'            => $rekomendasiArray,
                'generated_at'           => Carbon::now(),
                'is_enhanced'            => true,
                'recommendation_version' => $detail['recommendation_version'] ?? 'enhanced_v4'
            ];

            $pdf = Pdf::loadView('exports.result-konsultasi-pdf', $pdfData);
            $pdf->setPaper('A4', 'portrait');
            $pdf->setOptions([
                'isHtml5ParserEnabled' => true,
                'isPhpEnabled'         => true,
                'defaultFont'          => 'DejaVu Sans',
                'dpi'                  => 150,
                'defaultPaperSize'     => 'A4',
                'chroot'               => realpath(base_path()),
            ]);

            $filename = 'hasil-konsultasi-' . $idKonsultasi . '-' . Carbon::now()->format('Y-m-d-H-i-s') . '.pdf';

            if ($request->get('action') === 'print') {
                return $pdf->stream($filename);
            }

            return $pdf->download($filename);

        } catch (\Exception $e) {
            Log::error('Error exporting result to PDF', [
                'id_konsultasi' => $request->get('id_konsultasi'),
                'error'         => $e->getMessage(),
            ]);
            return redirect()->back()->with('error', 'Gagal export ke PDF: ' . $e->getMessage());
        }
    }

    public function printResult($id)
    {
        return $this->exportResultPdf(request()->merge([
            'id_konsultasi' => $id,
            'action'        => 'print'
        ]));
    }

    private function getConfidenceLevel($cfValue)
    {
        if ($cfValue >= 0.70)     return ['label' => 'Sangat Yakin', 'color' => 'red'];
        elseif ($cfValue >= 0.50) return ['label' => 'Yakin',        'color' => 'orange'];
        elseif ($cfValue >= 0.30) return ['label' => 'Cukup Yakin',  'color' => 'yellow'];
        else                      return ['label' => 'Tidak Yakin',  'color' => 'green'];
    }

    // =========================================================================
    // RIWAYAT & UTILITAS
    // =========================================================================

    public function getGejalaList(Request $request)
    {
        $search = $request->get('search');

        $gejala = Gejala::where('is_active', true)
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('nama_gejala', 'like', "%{$search}%")
                      ->orWhere('kode_gejala', 'like', "%{$search}%")
                      ->orWhere('kategori_gejala', 'like', "%{$search}%");
                });
            })
            ->select('id_gejala', 'kode_gejala', 'nama_gejala', 'kategori_gejala', 'nilai_cf', 'opsi_jawaban')
            ->limit(20)
            ->get()
            ->map(function ($item) {
                return [
                    'id'           => $item->id_gejala,
                    'kode'         => $item->kode_gejala,
                    'nama'         => $item->nama_gejala,
                    'kategori'     => ucfirst(str_replace('_', ' ', $item->kategori_gejala)),
                    'nilai_cf'     => $item->nilai_cf,
                    'opsi_jawaban' => $item->opsi_jawaban ?? []
                ];
            });

        return response()->json($gejala);
    }

    public function validateAnswers(Request $request)
    {
        $jawaban    = $request->input('jawaban', []);
        $totalGejala = Gejala::where('is_active', true)->count();

        if (empty($jawaban)) {
            return response()->json(['valid' => false, 'message' => 'Jawab minimal satu pertanyaan untuk melanjutkan.']);
        }

        if (count($jawaban) < $totalGejala) {
            return response()->json([
                'valid'   => false,
                'message' => "Jawab semua {$totalGejala} pertanyaan untuk mendapatkan diagnosis yang akurat."
            ]);
        }

        return response()->json(['valid' => true, 'message' => 'Data valid, siap untuk diproses.', 'total_jawaban' => count($jawaban)]);
    }

    public function history(Request $request)
    {
        $user      = Auth::user();
        $mahasiswa = $this->getMahasiswaByUserId($user->id);

        if (!$mahasiswa) {
            return redirect()->back()->with('error', 'Data mahasiswa tidak ditemukan');
        }

        $limit         = $request->get('limit', 10);
        $consultations = RiwayatKonsultasi::where('id_mahasiswa', $mahasiswa->id_mahasiswa)
            ->with('diagnosa')
            ->orderBy('tanggal_konsultasi', 'desc')
            ->paginate($limit);

        $consultations->getCollection()->transform(function ($konsultasi) {
            return [
                'id_konsultasi'      => $konsultasi->id_konsultasi,
                'tanggal_konsultasi' => $konsultasi->tanggal_konsultasi,
                'hasil_diagnosa'     => $konsultasi->hasil_diagnosa,
                'nilai_cf'           => $konsultasi->nilai_cf,
                'cf_percentage'      => round($konsultasi->nilai_cf * 100, 2),
                'tingkat_keparahan'  => $konsultasi->tingkat_keparahan,
                'diagnosa' => [
                    'id_diagnosa'        => $konsultasi->diagnosa->id_diagnosa ?? 0,
                    'nama_diagnosa'      => $konsultasi->diagnosa->nama_diagnosa ?? $konsultasi->hasil_diagnosa,
                    'deskripsi_diagnosa' => $konsultasi->diagnosa->deskripsi ?? 'Deskripsi tidak tersedia'
                ],
                'confidence_level'              => $this->getConfidenceLevel($konsultasi->nilai_cf),
                'has_enhanced_recommendations'  => $this->hasEnhancedRecommendations($konsultasi)
            ];
        });

        return Inertia::render('mahasiswa/Konsultasi/History', [
            'consultations' => $consultations,
            'filters'       => ['limit' => $limit]
        ]);
    }

    private function hasEnhancedRecommendations($konsultasi)
    {
        if (!$konsultasi->detail) return false;

        $detail = is_string($konsultasi->detail)
            ? json_decode($konsultasi->detail, true)
            : $konsultasi->detail;

        return isset($detail['recommendation_version'])
            && in_array($detail['recommendation_version'], ['enhanced_v2', 'enhanced_v3', 'enhanced_v4']);
    }

    public function exportHistory(Request $request)
    {
        $user      = Auth::user();
        $mahasiswa = $this->getMahasiswaByUserId($user->id);

        if (!$mahasiswa) {
            return redirect()->back()->with('error', 'Data mahasiswa tidak ditemukan');
        }

        $consultations = RiwayatKonsultasi::where('id_mahasiswa', $mahasiswa->id_mahasiswa)
            ->with('diagnosa')
            ->orderBy('tanggal_konsultasi', 'desc')
            ->get();

        $data = $consultations->map(function ($konsultasi) {
            return [
                'Tanggal'            => $konsultasi->tanggal_konsultasi->format('Y-m-d H:i:s'),
                'Diagnosis'          => $konsultasi->hasil_diagnosa,
                'Deskripsi Diagnosis'=> $konsultasi->diagnosa->deskripsi ?? 'Tidak tersedia',
                'Tingkat Keparahan'  => $konsultasi->tingkat_keparahan,
                'CF Keyakinan'       => round($konsultasi->nilai_cf * 100, 2) . '%',
                'Confidence Level'   => $this->getConfidenceLevel($konsultasi->nilai_cf)['label'],
            ];
        });

        $filename = "riwayat_konsultasi_{$mahasiswa->id_mahasiswa}_" . date('Y-m-d') . ".csv";
        $headers  = [
            'Content-Type'        => 'text/csv; charset=utf-8',
            'Content-Disposition' => "attachment; filename=\"{$filename}\"",
        ];

        $callback = function () use ($data) {
            $file = fopen('php://output', 'w');
            fprintf($file, chr(0xEF) . chr(0xBB) . chr(0xBF));
            fputcsv($file, ['Tanggal', 'Diagnosis', 'Deskripsi Diagnosis', 'Tingkat Keparahan', 'CF Keyakinan', 'Confidence Level']);
            foreach ($data as $row) {
                fputcsv($file, $row);
            }
            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    public function deleteConsultation($id)
    {
        $user      = Auth::user();
        $mahasiswa = $this->getMahasiswaByUserId($user->id);

        if (!$mahasiswa) {
            return response()->json(['error' => 'Data mahasiswa tidak ditemukan'], 404);
        }

        $konsultasi = RiwayatKonsultasi::where('id_konsultasi', $id)
            ->where('id_mahasiswa', $mahasiswa->id_mahasiswa)
            ->first();

        if (!$konsultasi) {
            return response()->json(['error' => 'Data konsultasi tidak ditemukan'], 404);
        }

        try {
            $konsultasi->delete();
            return response()->json(['success' => true, 'message' => 'Data konsultasi berhasil dihapus']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Gagal menghapus: ' . $e->getMessage()], 500);
        }
    }

    public function getConsultationDetail($id)
    {
        $user      = Auth::user();
        $mahasiswa = $this->getMahasiswaByUserId($user->id);

        if (!$mahasiswa) {
            return response()->json(['error' => 'Data mahasiswa tidak ditemukan'], 404);
        }

        $konsultasi = RiwayatKonsultasi::where('id_konsultasi', $id)
            ->where('id_mahasiswa', $mahasiswa->id_mahasiswa)
            ->with('diagnosa')
            ->first();

        if (!$konsultasi) {
            return response()->json(['error' => 'Data konsultasi tidak ditemukan'], 404);
        }

        $detail = [];
        if ($konsultasi->detail) {
            $detail = is_string($konsultasi->detail)
                ? json_decode($konsultasi->detail, true)
                : $konsultasi->detail;
        }

        $rekomendasi = [];
        if ($konsultasi->rekomendasi) {
            $rekomendasi = is_string($konsultasi->rekomendasi)
                ? json_decode($konsultasi->rekomendasi, true)
                : $konsultasi->rekomendasi;
        }

        $currentVersion = $detail['recommendation_version'] ?? '';
        if (empty($rekomendasi) || $currentVersion !== 'enhanced_v4') {
            $gejalaDetails = [];
            if (isset($detail['jawaban_gejala']) && is_array($detail['jawaban_gejala'])) {
                $gejalaDetails = $this->processSymptomDetails($detail['jawaban_gejala']);
            }
            $rekomendasi = $this->generateRekomendasi($konsultasi->tingkat_keparahan, $gejalaDetails);
        }

        return response()->json([
            'konsultasi' => [
                'id_konsultasi'                 => $konsultasi->id_konsultasi,
                'tanggal_konsultasi'            => $konsultasi->tanggal_konsultasi->format('Y-m-d H:i:s'),
                'hasil_diagnosa'                => $konsultasi->hasil_diagnosa,
                'nilai_cf'                      => $konsultasi->nilai_cf,
                'cf_percentage'                 => round($konsultasi->nilai_cf * 100, 2),
                'tingkat_keparahan'             => $konsultasi->tingkat_keparahan,
                'diagnosa' => [
                    'id_diagnosa'        => $konsultasi->diagnosa->id_diagnosa ?? 0,
                    'nama_diagnosa'      => $konsultasi->diagnosa->nama_diagnosa ?? $konsultasi->hasil_diagnosa,
                    'deskripsi_diagnosa' => $konsultasi->diagnosa->deskripsi ?? 'Deskripsi tidak tersedia'
                ],
                'confidence_level'              => $this->getConfidenceLevel($konsultasi->nilai_cf),
                'detail'                        => $detail,
                'has_enhanced_recommendations'  => $this->hasEnhancedRecommendations($konsultasi)
            ],
            'rekomendasi' => $rekomendasi,
        ]);
    }

    public function updateConsultationRecommendations($id)
    {
        $user      = Auth::user();
        $mahasiswa = $this->getMahasiswaByUserId($user->id);

        if (!$mahasiswa) {
            return response()->json(['error' => 'Data mahasiswa tidak ditemukan'], 404);
        }

        $konsultasi = RiwayatKonsultasi::where('id_konsultasi', $id)
            ->where('id_mahasiswa', $mahasiswa->id_mahasiswa)
            ->first();

        if (!$konsultasi) {
            return response()->json(['error' => 'Data konsultasi tidak ditemukan'], 404);
        }

        try {
            $detail = [];
            if ($konsultasi->detail) {
                $detail = is_string($konsultasi->detail)
                    ? json_decode($konsultasi->detail, true)
                    : $konsultasi->detail;
            }

            $gejalaDetails = [];
            if (isset($detail['jawaban_gejala']) && is_array($detail['jawaban_gejala'])) {
                $gejalaDetails = $this->processSymptomDetails($detail['jawaban_gejala']);
            }

            $enhanced = $this->generateRekomendasi($konsultasi->tingkat_keparahan, $gejalaDetails);

            $konsultasi->update([
                'rekomendasi' => json_encode($enhanced),
                'detail'      => json_encode(array_merge($detail, [
                    'recommendation_version'        => 'enhanced_v4',
                    'recommendation_updated_at'     => now(),
                    'upgrade_reason'                => 'manual_update',
                    'symptom_based_recommendations' => true
                ]))
            ]);

            return response()->json([
                'success'           => true,
                'message'           => 'Rekomendasi berhasil diperbarui ke versi enhanced v4',
                'rekomendasi_count' => count($enhanced),
                'konsultasi_id'     => $id
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Gagal memperbarui: ' . $e->getMessage()], 500);
        }
    }

    public function bulkUpdateRecommendations()
    {
        $user      = Auth::user();
        $mahasiswa = $this->getMahasiswaByUserId($user->id);

        if (!$mahasiswa) {
            return response()->json(['error' => 'Data mahasiswa tidak ditemukan'], 404);
        }

        try {
            $consultations = RiwayatKonsultasi::where('id_mahasiswa', $mahasiswa->id_mahasiswa)->get();
            $updatedCount  = 0;
            $skippedCount  = 0;

            foreach ($consultations as $konsultasi) {
                $detail = [];
                if ($konsultasi->detail) {
                    $detail = is_string($konsultasi->detail)
                        ? json_decode($konsultasi->detail, true)
                        : $konsultasi->detail;
                }

                if (($detail['recommendation_version'] ?? '') === 'enhanced_v4') {
                    $skippedCount++;
                    continue;
                }

                $gejalaDetails = [];
                if (isset($detail['jawaban_gejala']) && is_array($detail['jawaban_gejala'])) {
                    $gejalaDetails = $this->processSymptomDetails($detail['jawaban_gejala']);
                }

                $enhanced = $this->generateRekomendasi($konsultasi->tingkat_keparahan, $gejalaDetails);

                $konsultasi->update([
                    'rekomendasi' => json_encode($enhanced),
                    'detail'      => json_encode(array_merge($detail, [
                        'recommendation_version'        => 'enhanced_v4',
                        'recommendation_updated_at'     => now(),
                        'upgrade_reason'                => 'bulk_update',
                        'symptom_based_recommendations' => true
                    ]))
                ]);

                $updatedCount++;
            }

            return response()->json([
                'success'            => true,
                'message'            => "Berhasil memperbarui {$updatedCount} konsultasi ke versi enhanced v4",
                'updated_count'      => $updatedCount,
                'skipped_count'      => $skippedCount,
                'total_consultations'=> count($consultations)
            ]);

        } catch (\Exception $e) {
            return response()->json(['error' => 'Gagal bulk update: ' . $e->getMessage()], 500);
        }
    }

    public function getStatistics()
    {
        $user      = Auth::user();
        $mahasiswa = $this->getMahasiswaByUserId($user->id);

        if (!$mahasiswa) {
            return response()->json(['error' => 'Data mahasiswa tidak ditemukan'], 404);
        }

        $totalConsultations      = RiwayatKonsultasi::where('id_mahasiswa', $mahasiswa->id_mahasiswa)->count();
        $consultationsThisMonth  = RiwayatKonsultasi::where('id_mahasiswa', $mahasiswa->id_mahasiswa)
            ->whereMonth('tanggal_konsultasi', now()->month)
            ->whereYear('tanggal_konsultasi', now()->year)
            ->count();
        $lastConsultation        = RiwayatKonsultasi::where('id_mahasiswa', $mahasiswa->id_mahasiswa)
            ->latest('tanggal_konsultasi')->first();
        $diagnosisDistribution   = RiwayatKonsultasi::where('id_mahasiswa', $mahasiswa->id_mahasiswa)
            ->selectRaw('tingkat_keparahan, COUNT(*) as count')
            ->groupBy('tingkat_keparahan')
            ->get()->pluck('count', 'tingkat_keparahan')->toArray();
        $monthlyTrend            = RiwayatKonsultasi::where('id_mahasiswa', $mahasiswa->id_mahasiswa)
            ->selectRaw('YEAR(tanggal_konsultasi) as year, MONTH(tanggal_konsultasi) as month, COUNT(*) as count')
            ->groupBy('year', 'month')
            ->orderBy('year', 'desc')->orderBy('month', 'desc')
            ->limit(6)->get();

        return response()->json([
            'total_konsultasi'       => $totalConsultations,
            'konsultasi_bulan_ini'   => $consultationsThisMonth,
            'last_consultation'      => $lastConsultation ? [
                'tanggal'       => $lastConsultation->tanggal_konsultasi->format('Y-m-d H:i:s'),
                'diagnosis'     => $lastConsultation->hasil_diagnosa,
                'cf_percentage' => round($lastConsultation->nilai_cf * 100, 2)
            ] : null,
            'diagnosis_distribution' => $diagnosisDistribution,
            'monthly_trend'          => $monthlyTrend
        ]);
    }

    /**
     * @deprecated Gunakan exportResultPdf
     */
    public function downloadPDF($id, Request $request)
    {
        Log::warning('Using deprecated downloadPDF method, redirecting to enhanced exportResultPdf', [
            'id'      => $id,
            'user_id' => Auth::id()
        ]);
        return $this->exportResultPdf($request->merge(['id_konsultasi' => $id]));
    }

    /**
     * Get detailed CF calculation for debugging/admin purposes.
     */
    public function getDetailedCFCalculation(Request $request)
    {
        if (!Auth::user()->hasRole('admin')) {
            return response()->json(['error' => 'Unauthorized'], 403);
        }

        $jawaban = $request->input('jawaban', []);

        if (empty($jawaban)) {
            return response()->json(['error' => 'No answers provided'], 400);
        }

        $hasilKalkulasi = $this->calculateCFBasedDiagnosis($jawaban);

        return response()->json([
            'cf_gabungan'           => $hasilKalkulasi['cf_gabungan'],
            'cf_percentage'         => $hasilKalkulasi['cf_percentage'],
            'diagnosis'             => $hasilKalkulasi['diagnosa']->nama_diagnosa,
            'diagnosis_description' => $hasilKalkulasi['diagnosa']->deskripsi ?? 'Deskripsi tidak tersedia',
            'detail_perhitungan_cf' => $hasilKalkulasi['detail_perhitungan_cf'],
            'cf_array'              => $hasilKalkulasi['cf_array'],
            'statistik'             => $hasilKalkulasi['statistik']
        ]);
    }

    /**
     * Debug method - Get raw CF data
     */
    public function debugCFCalculation(Request $request)
    {
        $jawaban = $request->input('jawaban', []);

        if (empty($jawaban)) {
            return response()->json(['error' => 'No answers provided'], 400);
        }

        $cfDetails = [];
        $cfArray   = [];

        foreach ($jawaban as $index => $jawaban_item) {
            $gejala = Gejala::find($jawaban_item['id_gejala']);
            if (!$gejala) continue;

            $opsiJawaban  = $gejala->opsi_jawaban ?? [];
            $opsiTerpilih = $opsiJawaban[$jawaban_item['opsi_terpilih']] ?? null;

            $cfGejala = 0;
            if ($opsiTerpilih && isset($opsiTerpilih['bobot'])) {
                $bobotOpsi     = floatval($opsiTerpilih['bobot']);
                $nilaiCFGejala = floatval($gejala->nilai_cf);
                $cfGejala      = $nilaiCFGejala * $bobotOpsi;

                if ($cfGejala > 0) {
                    $cfArray[] = $cfGejala;
                }
            }

            $cfDetails[] = [
                'index'               => $index + 1,
                'gejala'              => $gejala->nama_gejala,
                'kode'                => $gejala->kode_gejala,
                'nilai_cf_database'   => $gejala->nilai_cf,
                'opsi_terpilih_index' => $jawaban_item['opsi_terpilih'],
                'opsi_text'           => $opsiTerpilih['text'] ?? 'N/A',
                'bobot_jawaban'       => $opsiTerpilih['bobot'] ?? 'N/A',
                'cf_hasil'            => round($cfGejala, 4),
                'masuk_array_cf'      => $cfGejala > 0
            ];
        }

        $cfGabungan = $this->calculateCombinedCF($cfArray);

        return response()->json([
            'total_gejala' => count($jawaban),
            'cf_details'   => $cfDetails,
            'cf_array'     => array_map(fn($cf) => round($cf, 4), $cfArray),
            'cf_gabungan'  => round($cfGabungan, 4),
            'cf_gabungan_percentage' => round($cfGabungan * 100, 2),
            'summary' => [
                'total_cf_positif' => count($cfArray),
                'min_cf'           => !empty($cfArray) ? round(min($cfArray), 4) : 0,
                'max_cf'           => !empty($cfArray) ? round(max($cfArray), 4) : 0,
                'avg_cf'           => !empty($cfArray) ? round(array_sum($cfArray) / count($cfArray), 4) : 0
            ]
        ]);
    }

    /**
     * Get recommendation preview for a specific diagnosis level
     */
    public function getRecommendationPreview(Request $request)
    {
        $diagnosisLevel      = $request->get('diagnosis_level', 'Normal');
        $includeSymptomBased = $request->get('include_symptom_based', false);

        $gejalaDetails = null;
        if ($includeSymptomBased) {
            $gejalaDetails = $this->getMockSymptomDetails($diagnosisLevel);
        }

        $rekomendasi = $this->generateRekomendasi($diagnosisLevel, $gejalaDetails);

        return response()->json([
            'diagnosis_level'       => $diagnosisLevel,
            'recommendation_count'  => count($rekomendasi),
            'includes_symptom_based'=> !is_null($gejalaDetails),
            'rekomendasi'           => array_slice($rekomendasi, 0, 20)
        ]);
    }

    /**
     * Helper method to create mock symptom details for preview
     */
    private function getMockSymptomDetails($diagnosisLevel)
    {
        $mockSymptoms = [
            'Normal'  => ['G01' => 0.05, 'G16' => 0.08],
            'Ringan'  => ['G01' => 0.25, 'G04' => 0.20, 'G15' => 0.18, 'G16' => 0.22],
            'Sedang'  => ['G01' => 0.35, 'G04' => 0.30, 'G07' => 0.25, 'G09' => 0.15],
            'Berat'   => ['G01' => 0.45, 'G04' => 0.40, 'G07' => 0.35, 'G09' => 0.50]
        ];

        $symptoms      = $mockSymptoms[$diagnosisLevel] ?? $mockSymptoms['Normal'];
        $gejalaDetails = [];

        foreach ($symptoms as $kode => $cf) {
            $gejala = Gejala::where('kode_gejala', $kode)->first();
            if ($gejala) {
                $gejalaDetails[] = [
                    'gejala' => [
                        'id_gejala'       => $gejala->id_gejala,
                        'kode_gejala'     => $gejala->kode_gejala,
                        'nama_gejala'     => $gejala->nama_gejala,
                        'kategori_gejala' => $gejala->kategori_gejala,
                        'nilai_cf'        => $gejala->nilai_cf,
                    ],
                    'cf_hasil' => $cf
                ];
            }
        }

        return $gejalaDetails;
    }
}
