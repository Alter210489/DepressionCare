<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use App\Models\RiwayatKonsultasi;
use App\Models\Gejala;
use App\Models\Diagnosa;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Display mahasiswa dashboard with comprehensive statistics and data
     */
    public function Index()
    {
        $user      = Auth::user();
        $mahasiswa = $user->mahasiswa;

        if (!$mahasiswa) {
            return redirect()->route('profile.edit')
                ->with('error', 'Silakan lengkapi data mahasiswa Anda terlebih dahulu.');
        }

        $mahasiswaId = $mahasiswa->id_mahasiswa;

        $stats              = $this->getPersonalStats($mahasiswaId);
        $recentActivity     = $this->getRecentActivity($mahasiswaId);
        $progressData       = $this->getProgressData($mahasiswaId);
        $recommendations    = $this->getPersonalRecommendations($mahasiswaId);
        $upcomingReminders  = $this->getUpcomingReminders($mahasiswaId);

        $latestConsultation = RiwayatKonsultasi::where('id_mahasiswa', $mahasiswaId)
            ->orderBy('tanggal_konsultasi', 'desc')
            ->first();

        $consultationStatus = $this->getConsultationStatus($latestConsultation);

        return Inertia::render('mahasiswa/Dashboard/Index', [
            'user' => [
                'name'          => $user->name,
                'nim'           => $mahasiswa->nim,
                'fakultas'      => $mahasiswa->fakultas,
                'program_studi' => $mahasiswa->program_studi,
                'email'         => $user->email,
                'usia'          => $mahasiswa->usia,
                'jenis_kelamin' => $mahasiswa->jenis_kelamin,
            ],
            'stats'               => $stats,
            'recent_activity'     => $recentActivity,
            'progress_data'       => $progressData,
            'recommendations'     => $recommendations,
            'upcoming_reminders'  => $upcomingReminders,
            'consultation_status' => $consultationStatus,
            'latest_consultation' => $latestConsultation ? [
                'id'                  => $latestConsultation->id_konsultasi,
                'tanggal_konsultasi'  => $latestConsultation->tanggal_konsultasi->format('d M Y, H:i'),
                'hasil_diagnosa'      => $latestConsultation->hasil_diagnosa,
                'nilai_cf'            => $latestConsultation->nilai_cf_formatted
                                            ?? number_format($latestConsultation->nilai_cf * 100, 1) . '%',
                'rekomendasi'         => $latestConsultation->detail['rekomendasi'] ?? null,
                'waktu_lalu'          => $latestConsultation->tanggal_konsultasi->diffForHumans(),
                'exists'              => true,
            ] : [
                'exists' => false,
            ],
            'quick_actions'    => $this->getQuickActions(),
            'has_consultations' => (bool) $latestConsultation,
        ]);
    }

    // =========================================================================
    // STATS
    // =========================================================================

    /**
     * Get comprehensive personal statistics.
     *
     * Perubahan dari versi sebelumnya:
     * - `streak` dihapus, diganti `monitoring_status`
     * - `konsultasi_bulan_ini` sekarang disertai `target_bulan_ini` (2x)
     *   dan `sisa_target` agar frontend bisa menampilkan "1 / 2"
     */
    private function getPersonalStats($mahasiswaId)
    {
        $now = Carbon::now();

        $totalKonsultasi      = RiwayatKonsultasi::where('id_mahasiswa', $mahasiswaId)->count();
        $konsultasiBulanIni   = RiwayatKonsultasi::where('id_mahasiswa', $mahasiswaId)
            ->whereMonth('tanggal_konsultasi', $now->month)
            ->whereYear('tanggal_konsultasi',  $now->year)
            ->count();

        $konsultasiTerakhir   = RiwayatKonsultasi::where('id_mahasiswa', $mahasiswaId)
            ->orderBy('tanggal_konsultasi', 'desc')
            ->first();

        $rataRataCF    = RiwayatKonsultasi::where('id_mahasiswa', $mahasiswaId)->avg('nilai_cf');
        $statusTerakhir = $konsultasiTerakhir ? $konsultasiTerakhir->hasil_diagnosa : 'Belum ada konsultasi';
        $trend          = $this->calculateTrend($mahasiswaId);

        // ── Ganti streak dengan status monitoring ────────────────────────────
        $monitoringStatus = $this->calculateMonitoringStatus($mahasiswaId);

        // ── Target bulan ini: 2x (interval 14 hari × 2 = 28 hari ≈ 1 bulan) ─
        $targetBulanIni = 2;
        $sisaTarget     = max(0, $targetBulanIni - $konsultasiBulanIni);

        $diagnosisDistribution = RiwayatKonsultasi::where('id_mahasiswa', $mahasiswaId)
            ->selectRaw('hasil_diagnosa, COUNT(*) as count')
            ->groupBy('hasil_diagnosa')
            ->get()
            ->pluck('count', 'hasil_diagnosa')
            ->toArray();

        $totalSymptoms = Gejala::count();

        return [
            'total_konsultasi'     => $totalKonsultasi,

            // ── Kartu "Bulan Ini" ─────────────────────────────────────────────
            'konsultasi_bulan_ini' => $konsultasiBulanIni,
            'target_bulan_ini'     => $targetBulanIni,   // selalu 2
            'sisa_target'          => $sisaTarget,        // 0 jika sudah tercapai

            'total_symptoms'       => $totalSymptoms,
            'konsultasi_terakhir'  => $konsultasiTerakhir ? [
                'tanggal'   => $konsultasiTerakhir->tanggal_konsultasi,
                'hasil'     => $konsultasiTerakhir->hasil_diagnosa,
                'nilai_cf'  => $konsultasiTerakhir->nilai_cf,
                'waktu_lalu'=> $konsultasiTerakhir->tanggal_konsultasi->diffForHumans(),
            ] : null,
            'rata_rata_cf' => [
                'value'     => $rataRataCF ? round($rataRataCF * 100, 1) : 0,
                'formatted' => $rataRataCF ? number_format($rataRataCF * 100, 1) . '%' : '0%',
            ],
            'status_terakhir'      => $statusTerakhir,
            'trend'                => $trend,

            // ── Kartu "Status Monitoring" (pengganti streak) ──────────────────
            'monitoring_status'    => $monitoringStatus,

            'diagnosis_distribution' => $diagnosisDistribution,
        ];
    }

    // =========================================================================
    // STATUS MONITORING  (pengganti streak)
    // =========================================================================

    /**
     * Hitung status monitoring berdasarkan interval konsultasi terakhir.
     *
     * Logika:
     *   - Belum pernah konsultasi          → 'never'
     *   - Konsultasi terakhir ≤ 14 hari   → 'on_track'  (Rutin ✓)
     *   - 15–30 hari                        → 'due_soon'  (Jadwalkan)
     *   - > 30 hari                         → 'overdue'   (Terlambat)
     *
     * Dikembalikan bersama metadata yang dibutuhkan frontend.
     */
    private function calculateMonitoringStatus($mahasiswaId)
    {
        $latest = RiwayatKonsultasi::where('id_mahasiswa', $mahasiswaId)
            ->orderBy('tanggal_konsultasi', 'desc')
            ->first();

        if (!$latest) {
            return [
                'status'       => 'never',
                'label'        => 'Belum Konsultasi',
                'description'  => 'Belum pernah melakukan konsultasi',
                'days_since'   => null,
                'next_due'     => null,
                'color'        => 'gray',
                'icon'         => 'question',
            ];
        }

        $daysSince   = (int) $latest->tanggal_konsultasi->diffInDays(now());
        $nextDueDate = $latest->tanggal_konsultasi->copy()->addDays(14);

        if ($daysSince <= 14) {
            return [
                'status'      => 'on_track',
                'label'       => 'Rutin ✓',
                'description' => 'Konsultasi terakhir ' . $daysSince . ' hari lalu',
                'days_since'  => $daysSince,
                'next_due'    => $nextDueDate->format('d M Y'),
                'color'       => 'green',
                'icon'        => 'check',
            ];
        }

        if ($daysSince <= 30) {
            return [
                'status'      => 'due_soon',
                'label'       => 'Perlu Dijadwal',
                'description' => 'Sudah ' . $daysSince . ' hari, saatnya konsultasi ulang',
                'days_since'  => $daysSince,
                'next_due'    => $nextDueDate->format('d M Y'),
                'color'       => 'yellow',
                'icon'        => 'clock',
            ];
        }

        return [
            'status'      => 'overdue',
            'label'       => 'Terlambat',
            'description' => 'Sudah ' . $daysSince . ' hari sejak konsultasi terakhir',
            'days_since'  => $daysSince,
            'next_due'    => $nextDueDate->format('d M Y'),
            'color'       => 'red',
            'icon'        => 'warning',
        ];
    }

    // =========================================================================
    // TREND
    // =========================================================================

    private function calculateTrend($mahasiswaId)
    {
        $recentConsultations = RiwayatKonsultasi::where('id_mahasiswa', $mahasiswaId)
            ->orderBy('tanggal_konsultasi', 'desc')
            ->limit(5)
            ->get();

        if ($recentConsultations->count() < 2) {
            return [
                'direction'          => 'stable',
                'message'            => 'Data tidak cukup untuk analisis tren',
                'percentage'         => 0,
                'analysis'           => 'Butuh minimal 2 konsultasi untuk analisis',
                'data_points'        => $recentConsultations->count(),
                'consultation_dates' => $recentConsultations->pluck('tanggal_konsultasi')
                    ->map(fn($d) => $d->format('d M Y'))->toArray(),
                'cf_values'          => $recentConsultations->pluck('nilai_cf')
                    ->map(fn($cf) => round($cf * 100, 1))->toArray(),
                'severity_levels'    => $recentConsultations
                    ->map(fn($k) => $this->getSeverityLevel($k->hasil_diagnosa))->toArray(),
                'cf_change'          => 0,
                'severity_change'    => 0,
                'pattern'            => 'Data tidak cukup',
                'latest_cf'          => 0,
                'avg_previous_cf'    => 0,
            ];
        }

        $cfValues       = $recentConsultations->pluck('nilai_cf')->toArray();
        $severityLevels = $recentConsultations
            ->map(fn($k) => $this->getSeverityLevel($k->hasil_diagnosa))->toArray();

        $severityMapping = ['normal' => 1, 'mild' => 2, 'moderate' => 3, 'severe' => 4, 'unknown' => 0];
        $severityValues  = array_map(fn($l) => $severityMapping[$l] ?? 0, $severityLevels);

        $latestCF          = $cfValues[0];
        $previousCFs       = array_slice($cfValues, 1);
        $avgPreviousCF     = count($previousCFs) > 0 ? array_sum($previousCFs) / count($previousCFs) : $latestCF;

        $latestSeverity    = $severityValues[0];
        $previousSeverities= array_slice($severityValues, 1);
        $avgPreviousSeverity = count($previousSeverities) > 0
            ? array_sum($previousSeverities) / count($previousSeverities)
            : $latestSeverity;

        $cfChange       = $avgPreviousCF > 0 ? (($latestCF - $avgPreviousCF) / $avgPreviousCF) * 100 : 0;
        $severityChange = $latestSeverity - $avgPreviousSeverity;

        if ($severityChange < -0.3) {
            $direction = 'improving';
            $message   = 'Kondisi kesehatan mental membaik';
        } elseif ($severityChange > 0.3) {
            $direction = 'declining';
            $message   = 'Kondisi memerlukan perhatian lebih';
        } elseif ($cfChange < -10) {
            $direction = 'improving';
            $message   = 'Tingkat kepercayaan diagnosis menurun (membaik)';
        } elseif ($cfChange > 10) {
            $direction = 'declining';
            $message   = 'Tingkat kepercayaan diagnosis meningkat';
        } else {
            $direction = 'stable';
            $message   = 'Kondisi relatif stabil';
        }

        return [
            'direction'          => $direction,
            'message'            => $message,
            'percentage'         => round(abs($cfChange), 1),
            'analysis'           => $this->generateTrendAnalysis($direction, $cfChange, $severityChange),
            'data_points'        => $recentConsultations->count(),
            'consultation_dates' => $recentConsultations->pluck('tanggal_konsultasi')
                ->map(fn($d) => $d->format('d M Y'))->toArray(),
            'cf_values'          => array_map(fn($cf) => round($cf * 100, 1), $cfValues),
            'severity_levels'    => $severityLevels,
            'cf_change'          => round($cfChange, 1),
            'severity_change'    => round($severityChange, 2),
            'pattern'            => $this->analyzeConsultationPattern($recentConsultations),
            'latest_cf'          => round($latestCF * 100, 1),
            'avg_previous_cf'    => round($avgPreviousCF * 100, 1),
        ];
    }

    private function analyzeConsultationPattern($consultations)
    {
        if ($consultations->count() < 2) return 'Data tidak cukup';

        $intervals = [];
        for ($i = 0; $i < $consultations->count() - 1; $i++) {
            $intervals[] = $consultations->get($i)->tanggal_konsultasi
                ->diffInDays($consultations->get($i + 1)->tanggal_konsultasi);
        }
        $avg = array_sum($intervals) / count($intervals);

        if ($avg <= 7)  return 'Konsultasi sangat rutin (mingguan)';
        if ($avg <= 14) return 'Konsultasi rutin (2 mingguan)';
        if ($avg <= 30) return 'Konsultasi rutin (bulanan)';
        if ($avg <= 90) return 'Konsultasi berkala (per 3 bulan)';
        return 'Konsultasi tidak rutin';
    }

    private function generateTrendAnalysis($direction, $cfChange, $severityChange)
    {
        switch ($direction) {
            case 'improving':
                return $severityChange < 0
                    ? 'Tingkat keparahan gejala menurun dari konsultasi sebelumnya. Ini menunjukkan perbaikan kondisi kesehatan mental.'
                    : 'Nilai confidence factor menurun, menunjukkan gejala yang diamati berkurang intensitasnya.';
            case 'declining':
                return $severityChange > 0
                    ? 'Tingkat keparahan gejala meningkat dari konsultasi sebelumnya. Disarankan untuk lebih memperhatikan kondisi mental.'
                    : 'Nilai confidence factor meningkat, menunjukkan gejala yang diamati lebih konsisten atau intensif.';
            default:
                return 'Kondisi kesehatan mental relatif stabil berdasarkan beberapa konsultasi terakhir.';
        }
    }

    // =========================================================================
    // RECENT ACTIVITY
    // =========================================================================

    private function getRecentActivity($mahasiswaId)
    {
        return RiwayatKonsultasi::where('id_mahasiswa', $mahasiswaId)
            ->orderBy('tanggal_konsultasi', 'desc')
            ->limit(5)
            ->get()
            ->map(fn($k) => [
                'id'                  => $k->id_konsultasi,
                'tanggal'             => $k->tanggal_konsultasi,
                'tanggal_formatted'   => $k->tanggal_konsultasi->format('d M Y, H:i'),
                'hasil_diagnosa'      => $k->hasil_diagnosa,
                'nilai_cf'            => $k->nilai_cf,
                'nilai_cf_formatted'  => $k->nilai_cf_formatted ?? number_format($k->nilai_cf * 100, 1) . '%',
                'waktu_lalu'          => $k->tanggal_konsultasi->diffForHumans(),
                'severity_level'      => $this->getSeverityLevel($k->hasil_diagnosa),
            ]);
    }

    // =========================================================================
    // PROGRESS DATA (charts)
    // =========================================================================

    private function getProgressData($mahasiswaId)
    {
        $sixMonthsAgo = Carbon::now()->subMonths(6);

        $monthlyProgress = RiwayatKonsultasi::where('id_mahasiswa', $mahasiswaId)
            ->where('tanggal_konsultasi', '>=', $sixMonthsAgo)
            ->select(
                DB::raw('DATE_FORMAT(tanggal_konsultasi, "%Y-%m") as month'),
                DB::raw('AVG(nilai_cf) as avg_cf'),
                DB::raw('COUNT(*) as total_konsultasi')
            )
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $diagnosaDist = RiwayatKonsultasi::where('id_mahasiswa', $mahasiswaId)
            ->select('hasil_diagnosa', DB::raw('count(*) as total'))
            ->groupBy('hasil_diagnosa')
            ->orderBy('total', 'desc')
            ->get();

        $weeklyTrend = [];
        for ($i = 3; $i >= 0; $i--) {
            $startWeek = Carbon::now()->subWeeks($i)->startOfWeek();
            $endWeek   = Carbon::now()->subWeeks($i)->endOfWeek();
            $weekData  = RiwayatKonsultasi::where('id_mahasiswa', $mahasiswaId)
                ->whereBetween('tanggal_konsultasi', [$startWeek, $endWeek])
                ->selectRaw('AVG(nilai_cf) as avg_cf, COUNT(*) as total')
                ->first();
            $weeklyTrend[] = [
                'week'    => 'Minggu ' . (4 - $i),
                'avg_cf'  => $weekData->avg_cf ? round($weekData->avg_cf * 100, 1) : 0,
                'total'   => $weekData->total ?? 0,
                'period'  => $startWeek->format('d M') . ' - ' . $endWeek->format('d M'),
            ];
        }

        $monthlyTrends = collect();
        for ($i = 5; $i >= 0; $i--) {
            $date  = Carbon::now()->subMonths($i);
            $count = RiwayatKonsultasi::where('id_mahasiswa', $mahasiswaId)
                ->whereYear('tanggal_konsultasi',  $date->year)
                ->whereMonth('tanggal_konsultasi', $date->month)
                ->count();
            $monthlyTrends->push(['month' => $date->format('M Y'), 'count' => $count]);
        }

        return [
            'monthly_progress'    => $monthlyProgress,
            'monthly_trends'      => $monthlyTrends,
            'diagnosa_distribution' => $diagnosaDist,
            'weekly_trend'        => $weeklyTrend,
        ];
    }

    // =========================================================================
    // RECOMMENDATIONS
    // =========================================================================

    /**
     * Get personal recommendations based on consultation history.
     *
     * Setiap rekomendasi menyertakan `steps` (array langkah konkret)
     * agar frontend menampilkan panduan yang actionable.
     */
    private function getPersonalRecommendations($mahasiswaId)
    {
        $latest = RiwayatKonsultasi::where('id_mahasiswa', $mahasiswaId)
            ->orderBy('tanggal_konsultasi', 'desc')
            ->first();

        // ── Belum pernah konsultasi ───────────────────────────────────────────
        if (!$latest) {
            return [[
                'type'        => 'first_consultation',
                'title'       => 'Mulai Konsultasi Pertama',
                'description' => 'Sistem memerlukan data konsultasi untuk memberikan analisis kondisi kesehatan mental Anda.',
                'steps'       => [
                    'Klik tombol "Mulai Konsultasi" di bagian Aksi Cepat',
                    'Jawab semua 21 pertanyaan gejala dengan jujur',
                    'Proses diagnosis dan lihat hasil beserta rekomendasi lengkap',
                    'Simpan atau export PDF hasilnya sebagai dokumentasi',
                ],
                'action'      => 'Mulai Konsultasi Sekarang',
                'url'         => route('mahasiswa.konsultasi.index'),
                'priority'    => 'high',
                'icon'        => 'clipboard-document-list',
            ]];
        }

        $recommendations = [];
        $daysSinceLast   = (int) $latest->tanggal_konsultasi->diffInDays(now());
        $severity        = $this->getSeverityLevel($latest->hasil_diagnosa);

        // ── Rekomendasi berdasarkan severity diagnosis terakhir ───────────────
        switch ($severity) {
            case 'severe':
                $recommendations[] = [
                    'type'        => 'emergency',
                    'title'       => '⚠️ Tindakan Segera Diperlukan',
                    'description' => 'Hasil konsultasi terakhir menunjukkan depresi berat (CF ≥ 70%). Ini membutuhkan perhatian dan tindakan hari ini.',
                    'steps'       => [
                        'Hubungi 119 ext 8 sekarang jika ada pikiran menyakiti diri (gratis, 24 jam, anonim)',
                        'Beritahu keluarga atau orang terdekat kondisi Anda hari ini',
                        'Hubungi dosen pembimbing akademik untuk pengajuan keringanan atau cuti medis',
                        'Buat janji konsultasi via Halodoc atau Alodokter (mulai Rp 30.000)',
                        'Pergi ke UGD RSUD Tarakan jika kondisi memburuk tiba-tiba',
                    ],
                    'action'      => 'Lihat Panduan Bantuan',
                    'url'         => route('mahasiswa.help'),
                    'priority'    => 'high',
                    'icon'        => 'exclamation-circle',
                ];
                break;

            case 'moderate':
                $recommendations[] = [
                    'type'        => 'professional_help',
                    'title'       => 'Konsultasi Profesional Dianjurkan',
                    'description' => 'Hasil terakhir menunjukkan depresi sedang (CF 50–69%). Penanganan lebih lanjut akan sangat membantu.',
                    'steps'       => [
                        'Hubungi dosen pembimbing akademik untuk mendiskusikan kondisi dan opsi keringanan akademik',
                        'Daftar sesi konseling online: Halodoc, Alodokter, atau Riliv',
                        'Beritahu satu orang keluarga atau teman dekat kondisi Anda',
                        'Lakukan konsultasi ulang dalam sistem ini dalam 1 minggu',
                        'Jika kondisi memburuk, hubungi 119 ext 8 (24 jam, gratis)',
                    ],
                    'action'      => 'Lihat Kontak Bantuan',
                    'url'         => route('mahasiswa.help'),
                    'priority'    => 'high',
                    'icon'        => 'exclamation-circle',
                ];
                break;

            case 'mild':
                $recommendations[] = [
                    'type'        => 'self_management',
                    'title'       => 'Kelola Gejala Ringan Sejak Dini',
                    'description' => 'Hasil terakhir menunjukkan depresi ringan (CF 30–49%). Penanganan mandiri yang konsisten dapat mencegah gejala memburuk.',
                    'steps'       => [
                        'Coba teknik grounding 5-4-3-2-1 saat merasa cemas atau sedih berlebihan',
                        'Tulis jurnal perasaan 5 menit setiap malam sebelum tidur',
                        'Pastikan tidur 7–8 jam dan makan teratur setiap hari',
                        'Coba aplikasi gratis: MoodTools (CBT) atau Insight Timer (meditasi)',
                        'Lakukan konsultasi ulang dalam 2 minggu untuk monitoring',
                    ],
                    'action'      => 'Konsultasi Ulang',
                    'url'         => route('mahasiswa.konsultasi.index'),
                    'priority'    => 'medium',
                    'icon'        => 'heart',
                ];
                break;

            default: // normal
                $recommendations[] = [
                    'type'        => 'maintenance',
                    'title'       => 'Pertahankan Kondisi Positif',
                    'description' => 'Hasil terakhir menunjukkan kondisi normal (CF < 30%). Tetap jaga keseimbangan untuk mempertahankannya.',
                    'steps'       => [
                        'Pertahankan rutinitas positif yang sudah berjalan baik',
                        'Lakukan konsultasi monitoring rutin setiap 4 minggu',
                        'Jaga pola tidur 7–8 jam dan aktivitas fisik minimal 3x/minggu',
                        'Perhatikan jika ada gejala baru seperti perubahan nafsu makan atau sulit tidur',
                    ],
                    'action'      => 'Lihat Riwayat',
                    'url'         => route('mahasiswa.riwayat-konsultasi.index'),
                    'priority'    => 'low',
                    'icon'        => 'check-circle',
                ];
        }

        // ── Pengingat konsultasi ulang jika sudah lewat 14 hari ──────────────
        if ($daysSinceLast > 14) {
            $recommendations[] = [
                'type'        => 'follow_up',
                'title'       => 'Saatnya Konsultasi Ulang',
                'description' => 'Sudah ' . $daysSinceLast . ' hari sejak konsultasi terakhir — melebihi interval 2 minggu yang dianjurkan.',
                'steps'       => [
                    'Sisihkan 15–20 menit untuk menjawab semua pertanyaan dengan jujur',
                    'Jawab berdasarkan kondisi 2 minggu terakhir, bukan hanya hari ini',
                    'Bandingkan hasilnya dengan konsultasi sebelumnya untuk melihat tren',
                ],
                'action'      => 'Konsultasi Sekarang',
                'url'         => route('mahasiswa.konsultasi.index'),
                'priority'    => $daysSinceLast > 30 ? 'high' : 'medium',
                'icon'        => 'clock',
            ];
        }

        return $recommendations;
    }

    // =========================================================================
    // REMINDERS
    // =========================================================================

    private function getUpcomingReminders($mahasiswaId)
    {
        $reminders = [];
        $latest    = RiwayatKonsultasi::where('id_mahasiswa', $mahasiswaId)
            ->orderBy('tanggal_konsultasi', 'desc')
            ->first();

        if (!$latest) return $reminders;

        $nextDue = $latest->tanggal_konsultasi->copy()->addDays(14);

        if ($nextDue->isFuture()) {
            $reminders[] = [
                'type'        => 'follow_up_consultation',
                'title'       => 'Konsultasi Berkala (2 Minggu)',
                'description' => 'Konsultasi ulang direkomendasikan pada ' . $nextDue->format('d M Y'),
                'date'        => $nextDue,
                'days_left'   => (int) now()->diffInDays($nextDue),
                'priority'    => 'medium',
            ];
        } else {
            $reminders[] = [
                'type'        => 'overdue_consultation',
                'title'       => 'Konsultasi Tertunda',
                'description' => 'Anda melewati jadwal konsultasi 2 minggu yang direkomendasikan',
                'date'        => $nextDue,
                'days_overdue'=> (int) $nextDue->diffInDays(now()),
                'priority'    => 'high',
            ];
        }

        return $reminders;
    }

    // =========================================================================
    // HELPERS
    // =========================================================================

    private function getConsultationStatus($consultation)
    {
        if (!$consultation) {
            return ['status' => 'no_consultation', 'message' => 'Belum pernah melakukan konsultasi',
                    'color' => 'gray', 'icon' => 'question-mark-circle'];
        }

        $d = strtolower($consultation->hasil_diagnosa);

        if (str_contains($d, 'normal') || str_contains($d, 'minimal'))
            return ['status' => 'normal',   'message' => 'Kondisi mental dalam keadaan normal',
                    'color' => 'green',  'icon' => 'check-circle'];
        if (str_contains($d, 'ringan'))
            return ['status' => 'mild',     'message' => 'Terdeteksi gejala depresi ringan',
                    'color' => 'yellow', 'icon' => 'exclamation-triangle'];
        if (str_contains($d, 'sedang'))
            return ['status' => 'moderate', 'message' => 'Terdeteksi gejala depresi sedang',
                    'color' => 'orange', 'icon' => 'exclamation-circle'];
        if (str_contains($d, 'berat'))
            return ['status' => 'severe',   'message' => 'Terdeteksi gejala depresi berat',
                    'color' => 'red',    'icon' => 'x-circle'];

        return ['status' => 'unknown', 'message' => 'Status tidak dapat ditentukan',
                'color' => 'gray', 'icon' => 'question-mark-circle'];
    }

    private function getSeverityLevel($diagnosis)
    {
        $d = strtolower($diagnosis ?? '');
        if (str_contains($d, 'normal') || str_contains($d, 'minimal')) return 'normal';
        if (str_contains($d, 'ringan'))  return 'mild';
        if (str_contains($d, 'sedang'))  return 'moderate';
        if (str_contains($d, 'berat'))   return 'severe';
        return 'unknown';
    }

    private function getQuickActions()
    {
        return [
            ['title' => 'Mulai Konsultasi',    'description' => 'Lakukan tes diagnosis depresi',
             'route' => 'mahasiswa.konsultasi.index',         'icon' => 'clipboard-document-list', 'color' => 'blue'],
            ['title' => 'Riwayat Konsultasi',  'description' => 'Lihat hasil konsultasi sebelumnya',
             'route' => 'mahasiswa.riwayat-konsultasi.index', 'icon' => 'clock',                   'color' => 'green'],
            ['title' => 'Daftar Gejala',       'description' => 'Pelajari gejala-gejala depresi',
             'route' => 'mahasiswa.gejala.index',             'icon' => 'list-bullet',             'color' => 'purple'],
            ['title' => 'Bantuan',             'description' => 'Panduan penggunaan sistem',
             'route' => 'mahasiswa.help',                     'icon' => 'question-mark-circle',    'color' => 'yellow'],
        ];
    }

    // =========================================================================
    // PAGES
    // =========================================================================

    public function help()
    {
        return Inertia::render('Mahasiswa/Help', [
            'help_sections' => [],  // default dari Help.tsx
            'faqs'          => [],
            'contacts'      => [],
        ]);
    }

    public function faq()
    {
        return Inertia::render('Mahasiswa/FAQ', ['faqs' => []]);
    }

    public function contact()
    {
        return Inertia::render('Mahasiswa/Contact', ['contacts' => []]);
    }
}