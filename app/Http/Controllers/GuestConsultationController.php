<?php
namespace App\Http\Controllers;
use App\Http\Controllers\Controller;
use App\Models\Gejala;
use App\Models\Diagnosa;
use App\Models\GuestConsultation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class GuestConsultationController extends Controller
{
    /**
     * Display konsultasi form for guest users.
     */
    public function index()
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

        $fakultasList = GuestConsultation::getFakultasList();

        return Inertia::render('guest/Konsultasi', [
            'gejalaByKategori' => $gejalaByKategori,
            'kategoriOptions'  => $kategoriOptions,
            'fakultasList'     => $fakultasList,
            'totalGejala'      => Gejala::where('is_active', true)->count(),
        ]);
    }

    /**
     * Process guest consultation - MANDATORY ALL FIELDS
     */
    public function process(Request $request)
    {
        \Log::info('=== GUEST CONSULTATION START ===', [
            'session_id'           => session()->getId(),
            'request_data_count'   => count($request->input('jawaban', [])),
        ]);

        $totalGejala = Gejala::where('is_active', true)->count();

        $validator = Validator::make($request->all(), [
            'nama'              => 'required|string|min:2|max:100',
            'email'             => 'required|email|max:255',
            'nim'               => 'required|string|min:8|max:20',
            'fakultas'          => 'required|string|max:100',
            'program_studi'     => 'required|string|min:2|max:150',
            'umur'              => 'required|integer|min:16|max:100',
            'jenis_kelamin'     => 'required|in:L,P',
            'jawaban'           => "required|array|size:{$totalGejala}",
            'jawaban.*.id_gejala'     => 'required|exists:gejala,id_gejala',
            'jawaban.*.opsi_terpilih' => 'required|integer|min:0|max:3',
        ], [
            'nama.required'              => 'Nama Lengkap wajib diisi',
            'nama.min'                   => 'Nama minimal 2 karakter',
            'nama.max'                   => 'Nama maksimal 100 karakter',
            'email.required'             => 'Email wajib diisi',
            'email.email'                => 'Format email tidak valid',
            'email.max'                  => 'Email maksimal 255 karakter',
            'nim.required'               => 'NIM wajib diisi',
            'nim.min'                    => 'NIM minimal 8 karakter',
            'nim.max'                    => 'NIM maksimal 20 karakter',
            'fakultas.required'          => 'Fakultas wajib dipilih',
            'fakultas.max'               => 'Nama fakultas terlalu panjang',
            'program_studi.required'     => 'Program Studi wajib diisi',
            'program_studi.min'          => 'Program Studi minimal 2 karakter',
            'program_studi.max'          => 'Program Studi maksimal 150 karakter',
            'umur.required'              => 'Umur wajib diisi',
            'umur.integer'               => 'Umur harus berupa angka',
            'umur.min'                   => 'Umur minimal 16 tahun',
            'umur.max'                   => 'Umur maksimal 100 tahun',
            'jenis_kelamin.required'     => 'Jenis kelamin wajib dipilih',
            'jenis_kelamin.in'           => 'Jenis kelamin tidak valid',
            'jawaban.required'           => 'Semua gejala wajib dijawab',
            'jawaban.size'               => "Anda harus menjawab semua {$totalGejala} gejala yang tersedia",
            'jawaban.*.id_gejala.required'     => 'ID gejala diperlukan',
            'jawaban.*.id_gejala.exists'       => 'Gejala tidak valid',
            'jawaban.*.opsi_terpilih.required' => 'Setiap gejala harus memiliki jawaban',
            'jawaban.*.opsi_terpilih.integer'  => 'Pilihan jawaban tidak valid',
            'jawaban.*.opsi_terpilih.min'      => 'Pilihan jawaban minimal 0',
            'jawaban.*.opsi_terpilih.max'      => 'Pilihan jawaban maksimal 3',
        ]);

        if (!$validator->fails()) {
            $jawaban         = $request->input('jawaban');
            $activeGejalaIds = Gejala::where('is_active', true)->pluck('id_gejala')->toArray();
            $answeredIds     = collect($jawaban)->pluck('id_gejala')->toArray();
            $missingGejala   = array_diff($activeGejalaIds, $answeredIds);

            if (!empty($missingGejala)) {
                $validator->after(function ($v) use ($missingGejala) {
                    $v->errors()->add('jawaban', 'Masih ada ' . count($missingGejala) . ' gejala yang belum dijawab.');
                });
            }

            $duplicateGejala = collect($answeredIds)->duplicates();
            if ($duplicateGejala->isNotEmpty()) {
                $validator->after(function ($v) {
                    $v->errors()->add('jawaban', 'Terdapat gejala yang dijawab lebih dari sekali.');
                });
            }

            $fakultasList = GuestConsultation::getFakultasList();
            if (!in_array($request->input('fakultas'), $fakultasList)) {
                $validator->after(function ($v) {
                    $v->errors()->add('fakultas', 'Fakultas yang dipilih tidak valid.');
                });
            }
        }

        if ($validator->fails()) {
            \Log::warning('Guest validation failed', ['errors' => $validator->errors()]);
            return back()
                ->withErrors($validator)
                ->withInput()
                ->with('error', 'Data tidak valid. Harap lengkapi semua field.');
        }

        try {
            DB::beginTransaction();
            $jawaban = $request->input('jawaban');

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

            $sessionId = session()->getId() . '_' . time() . '_' . Str::random(8);

            $konsultasi = GuestConsultation::create([
                'session_id'        => $sessionId,
                'nama'              => $request->input('nama'),
                'email'             => $request->input('email'),
                'nim'               => $request->input('nim'),
                'fakultas'          => $request->input('fakultas'),
                'program_studi'     => $request->input('program_studi'),
                'umur'              => $request->input('umur'),
                'jenis_kelamin'     => $request->input('jenis_kelamin'),
                'id_diagnosa'       => $hasilKalkulasi['diagnosa']->id_diagnosa,
                'hasil_diagnosa'    => $hasilKalkulasi['diagnosa']->nama_diagnosa,
                'nilai_cf'          => $hasilKalkulasi['cf_gabungan'],
                'tingkat_keparahan' => $hasilKalkulasi['diagnosa']->nama_diagnosa,
                'rekomendasi'       => json_encode($rekomendasi),
                'gejala_dipilih'    => json_encode($jawaban),
                'detail'            => json_encode([
                    'jawaban_gejala'                  => $jawaban,
                    'perhitungan_cf'                  => $hasilKalkulasi['detail_perhitungan_cf'],
                    'cf_gabungan'                     => $hasilKalkulasi['cf_gabungan'],
                    'cf_percentage'                   => $hasilKalkulasi['cf_percentage'],
                    'metode'                          => 'Certainty_Factor_Only',
                    'recommendation_version'          => 'enhanced_v4',
                    'symptom_based_recommendations'   => true
                ])
            ]);

            if (!$konsultasi) {
                DB::rollBack();
                return back()->with('error', 'Gagal menyimpan data konsultasi');
            }

            DB::commit();

            return redirect()
                ->route('guest.konsultasi.result', $konsultasi->id_guestconsultation)
                ->with('success', 'Konsultasi berhasil diselesaikan!');

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Guest consultation error', [
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
                    'gejala'         => $gejala->nama_gejala,
                    'kode_gejala'    => $gejala->kode_gejala,
                    'nilai_cf_gejala'=> $nilaiCFGejala,
                    'jawaban'        => $opsiTerpilih['text'],
                    'bobot_jawaban'  => $bobotOpsi,
                    'cf_hasil'       => $cfGejala,
                    'masuk_kalkulasi'=> $cfGejala > 0
                ];
            }
        }

        $cfGabungan   = $this->calculateCombinedCF($cfArray);
        $cfPercentage = round($cfGabungan * 100, 2);
        $diagnosa     = $this->getDiagnosisFromCF($cfGabungan);

        return [
            'cf_gabungan'            => round($cfGabungan, 4),
            'cf_percentage'          => $cfPercentage,
            'diagnosa'               => $diagnosa,
            'detail_perhitungan_cf'  => $detailPerhitunganCF,
            'cf_array'               => $cfArray,
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
            'id_diagnosa'  => 0,
            'nama_diagnosa'=> $namaDefault,
            'deskripsi'    => 'Deskripsi tidak tersedia'
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

        $academicRecs  = $this->generateAcademicRecommendations($level);
        $followUpRecs  = $this->generateFollowUpRecommendations($level);
        $resourceRecs  = $this->generateExternalResourceRecommendations($level);

        $all = $this->formatEnhancedRecommendations($baseRecommendations);

        if (!empty($symptomRecs)) {
            $all = array_merge($all, ["", "---", ""], $symptomRecs);
        }

        $all = array_merge($all, ["", "---", ""], $academicRecs);
        $all = array_merge($all, ["", "---", ""], $followUpRecs);
        $all = array_merge($all, ["", "---", ""], $resourceRecs);

        // Hapus trailing kosong
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
                        'Tidur dan bangun pada jam yang sama setiap hari — konsistensi jadwal tidur adalah fondasi kesehatan mental.',
                        'Lakukan aktivitas fisik minimal 30 menit, 3x seminggu. Berjalan kaki di sekitar kampus sudah cukup.',
                        'Catat 3 hal kecil yang Anda syukuri setiap malam sebelum tidur untuk melatih pola pikir positif.',
                        'Bicarakan beban akademik secara rutin dengan **dosen pembimbing akademik** Anda — jangan tunggu hingga menumpuk.',
                        'Simpan nomor darurat **119 ext 8** di HP Anda sekarang, sebagai antisipasi jika suatu saat membutuhkan bantuan segera.',
                    ]
                ],
                'academic_wellness' => [
                    'title'   => 'Tips Seimbang Akademik dan Kesehatan Mental',
                    'content' => 'Keseimbangan adalah kunci agar performa kuliah tetap optimal:',
                    'items'   => [
                        'Gunakan teknik **Pomodoro** (25 menit fokus, 5 menit istirahat) untuk menjaga konsentrasi saat belajar.',
                        'Jangan ragu mengajukan pertanyaan ke dosen saat jam konsultasi — itu hak Anda sebagai mahasiswa.',
                        'Sisihkan minimal 1 jam per hari untuk aktivitas non-akademik: hobi, olahraga, atau sekadar bersantai.',
                        'Hindari membandingkan progres Anda dengan teman — setiap orang memiliki kecepatan belajarnya sendiri.',
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
                        'Beritahu keluarga atau orang tua tentang kondisi Anda sekarang — jangan sembunyikan agar mereka bisa mendukung proses pemulihan.',
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

        // Cek gejala bunuh diri (G09) terlebih dahulu — prioritas tertinggi
        $hasSuicidalIdeation = collect($highScoreSymptoms)
            ->contains(fn($s) => ($s['gejala']['kode_gejala'] ?? '') === 'G09');

        $recs = [
            "## Rekomendasi Berdasarkan Gejala Spesifik Anda",
            "",
            "Berdasarkan analisis gejala yang Anda laporkan, berikut panduan yang disesuaikan dengan kondisi Anda:",
            "",
        ];

        // Peringatan kritis G09 ditampilkan PALING ATAS
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

        // Kelompokkan gejala per kategori
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
                if ($kode === 'G09') continue; // sudah ditangani di atas

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
     * Satu fungsi terpadu untuk rekomendasi per gejala
     * Menggabungkan semua kategori agar mudah dikelola dan tidak ada gejala yang terlewat
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
            'G09' => null, // Ditangani secara khusus di atas (krisis)

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
                $recs[] = "• Ceritakan kondisi dan beban studi Anda secara terbuka — mereka ada untuk membantu.";
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
                $recs[] = "• Fokus pada mata kuliah inti terlebih dahulu — prioritaskan, bukan semua sekaligus.";
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
    // REKOMENDASI TINDAK LANJUT & PEMANTAUAN
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
    // SUMBER DAYA EKSTERNAL (menggantikan campus resource yang tidak ada)
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
                $cfHasil       = $gejala->nilai_cf * $opsiTerpilih['bobot'];
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
            'severe'   => 'Berat',
            'berat'    => 'Berat',
            'moderate' => 'Sedang',
            'sedang'   => 'Sedang',
            'mild'     => 'Ringan',
            'ringan'   => 'Ringan',
            'minimal'  => 'Normal',
            'normal'   => 'Normal',
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
            $konsultasi = GuestConsultation::where('id_guestconsultation', $id)
                ->with('diagnosa')
                ->first();

            if (!$konsultasi) {
                return redirect()->route('guest.konsultasi.index')
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

            // Susun detail gejala untuk tampilan
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

            $cfPercentage   = round($konsultasi->nilai_cf * 100, 2);
            $confidenceLevel = $this->getConfidenceLevel($konsultasi->nilai_cf);

            return Inertia::render('guest/Hasil', [
                'konsultasi' => [
                    'id_guestconsultation' => $konsultasi->id_guestconsultation,
                    'session_id'           => $konsultasi->session_id,
                    'tanggal_konsultasi'   => $konsultasi->created_at,
                    'nama'                 => $konsultasi->nama,
                    'email'                => $konsultasi->email,
                    'nim'                  => $konsultasi->nim,
                    'fakultas'             => $konsultasi->fakultas,
                    'program_studi'        => $konsultasi->program_studi,
                    'umur'                 => $konsultasi->umur,
                    'jenis_kelamin'        => $konsultasi->jenis_kelamin,
                    'hasil_diagnosa'       => $konsultasi->hasil_diagnosa,
                    'nilai_cf'             => $konsultasi->nilai_cf,
                    'tingkat_keparahan'    => $konsultasi->tingkat_keparahan,
                    'diagnosa' => [
                        'id_diagnosa'        => $konsultasi->diagnosa->id_diagnosa ?? 0,
                        'nama_diagnosa'      => $konsultasi->diagnosa->nama_diagnosa ?? $konsultasi->hasil_diagnosa,
                        'deskripsi_diagnosa' => $konsultasi->diagnosa->deskripsi ?? 'Deskripsi tidak tersedia'
                    ],
                ],
                'gejalaDetails'   => $gejalaDetails,
                'cfPercentage'    => $cfPercentage,
                'confidenceLevel' => $confidenceLevel,
                'rekomendasi'     => $rekomendasi,
            ]);

        } catch (\Exception $e) {
            \Log::error('Error loading guest result', [
                'error'                => $e->getMessage(),
                'id_guestconsultation' => $id
            ]);
            return redirect()->route('guest.konsultasi.index')
                ->with('error', 'Terjadi kesalahan saat memuat hasil konsultasi.');
        }
    }

    private function getConfidenceLevel($cfValue)
    {
        if ($cfValue >= 0.70)      return ['label' => 'Sangat Yakin', 'color' => 'red'];
        elseif ($cfValue >= 0.50)  return ['label' => 'Yakin',        'color' => 'orange'];
        elseif ($cfValue >= 0.30)  return ['label' => 'Cukup Yakin',  'color' => 'yellow'];
        else                       return ['label' => 'Tidak Yakin',  'color' => 'green'];
    }

    // =========================================================================
    // EXPORT PDF
    // =========================================================================

    public function exportPdf(Request $request)
    {
        $request->validate([
            'tanggal_dari'   => 'nullable|date',
            'tanggal_sampai' => 'nullable|date|after_or_equal:tanggal_dari',
        ]);

        $startDate = $request->input('tanggal_dari');
        $endDate   = $request->input('tanggal_sampai');

        $query = GuestConsultation::with('diagnosa');

        if ($startDate) $query->whereDate('created_at', '>=', $startDate);
        if ($endDate)   $query->whereDate('created_at', '<=', $endDate);

        $consultations = $query->orderBy('created_at', 'desc')->get();

        $consultations->transform(function ($c) {
            $rekomendasi = $c->rekomendasi;
            if (is_string($rekomendasi)) {
                $decoded = json_decode($rekomendasi, true);
                if (is_array($decoded)) {
                    $rekomendasi = implode("\n", $decoded);
                }
            }
            $c->formatted_rekomendasi = $rekomendasi;
            return $c;
        });

        $pdf = Pdf::loadView('exports.guest-consultation-pdf', [
            'consultations' => $consultations,
            'startDate'     => $startDate,
            'endDate'       => $endDate,
        ]);

        $filename = 'laporan-konsultasi-guest-' . now()->format('Y-m-d') . '.pdf';
        return $pdf->download($filename);
    }
}