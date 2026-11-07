<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\RiwayatKonsultasi;
use App\Models\Gejala;
use App\Models\Diagnosa;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;

class DashboardController extends Controller
{
    /**
     * Display the admin dashboard.
     */
    public function index()
    {
        // Cache data untuk performa yang lebih baik
        $stats = Cache::remember('admin_dashboard_stats', 300, function () {
            return $this->getGeneralStats();
        });

        $recentActivity = $this->getRecentActivity();
        $chartData = $this->getChartData();
        $systemStatus = $this->getSystemStatus();

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'recent_activity' => $recentActivity,
            'chart_data' => $chartData,
            'system_status' => $systemStatus,
        ]);
    }

    /**
     * Get general statistics for dashboard
     */
    private function getGeneralStats()
    {
        $now = Carbon::now();
        $startOfMonth = $now->copy()->startOfMonth();
        $startOfLastMonth = $now->subMonth()->startOfMonth()->copy();
        $endOfLastMonth = $now->subMonth()->endOfMonth()->copy();

        // Total mahasiswa
        $totalMahasiswa = User::where('role', 'mahasiswa')->count();
        $mahasiswaBulanIni = User::where('role', 'mahasiswa')
            ->whereMonth('created_at', $now->month)
            ->whereYear('created_at', $now->year)
            ->count();
        $mahasiswaBulanLalu = User::where('role', 'mahasiswa')
            ->whereBetween('created_at', [$startOfLastMonth, $endOfLastMonth])
            ->count();

        // Total konsultasi
        $totalKonsultasi = RiwayatKonsultasi::count();
        $konsultasiBulanIni = RiwayatKonsultasi::whereMonth('tanggal_konsultasi', $now->month)
            ->whereYear('tanggal_konsultasi', $now->year)
            ->count();
        $konsultasiBulanLalu = RiwayatKonsultasi::whereBetween('tanggal_konsultasi', [$startOfLastMonth, $endOfLastMonth])
            ->count();

        // Total gejala dan diagnosa
        $totalGejala = Gejala::count();
        $totalDiagnosa = Diagnosa::count();

        // Mahasiswa aktif (konsultasi dalam 30 hari terakhir)
        $mahasiswaAktif = RiwayatKonsultasi::where('tanggal_konsultasi', '>=', $now->subDays(30))
            ->distinct('id_mahasiswa')
            ->count('id_mahasiswa');

        // Rata-rata CF dan distribusi diagnosa
        $rataRataCF = RiwayatKonsultasi::avg('nilai_cf');
        $distribusiDiagnosa = RiwayatKonsultasi::select('hasil_diagnosa', DB::raw('count(*) as total'))
            ->groupBy('hasil_diagnosa')
            ->orderBy('total', 'desc')
            ->get();

        return [
            'total_mahasiswa' => [
                'value' => $totalMahasiswa,
                'change' => $this->calculatePercentageChange($mahasiswaBulanIni, $mahasiswaBulanLalu),
                'trend' => $mahasiswaBulanIni >= $mahasiswaBulanLalu ? 'up' : 'down'
            ],
            'total_konsultasi' => [
                'value' => $totalKonsultasi,
                'change' => $this->calculatePercentageChange($konsultasiBulanIni, $konsultasiBulanLalu),
                'trend' => $konsultasiBulanIni >= $konsultasiBulanLalu ? 'up' : 'down'
            ],
            'mahasiswa_aktif' => [
                'value' => $mahasiswaAktif,
                'percentage' => $totalMahasiswa > 0 ? round(($mahasiswaAktif / $totalMahasiswa) * 100, 1) : 0
            ],
            'rata_rata_cf' => [
                'value' => $rataRataCF ? round($rataRataCF * 100, 1) : 0,
                'formatted' => $rataRataCF ? number_format($rataRataCF * 100, 1) . '%' : '0%'
            ],
            'total_gejala' => $totalGejala,
            'total_diagnosa' => $totalDiagnosa,
            'distribusi_diagnosa' => $distribusiDiagnosa,
        ];
    }

    /**
     * Get recent activity
     */
    private function getRecentActivity()
    {
        // Konsultasi terbaru
        $recentConsultations = RiwayatKonsultasi::with(['mahasiswa'])
            ->orderBy('tanggal_konsultasi', 'desc')
            ->limit(5)
            ->get()
            ->map(function ($konsultasi) {
                return [
                    'type' => 'konsultasi',
                    'message' => $konsultasi->mahasiswa->name . ' melakukan konsultasi',
                    'result' => $konsultasi->hasil_diagnosa,
                    'timestamp' => $konsultasi->tanggal_konsultasi,
                    'cf_value' => $konsultasi->nilai_cf,
                ];
            });

        // Mahasiswa baru
        $newStudents = User::where('role', 'mahasiswa')
            ->orderBy('created_at', 'desc')
            ->limit(3)
            ->get()
            ->map(function ($mahasiswa) {
                return [
                    'type' => 'mahasiswa_baru',
                    'message' => 'Mahasiswa baru terdaftar',
                    'name' => $mahasiswa->name,
                    'nim' => $mahasiswa->nim,
                    'timestamp' => $mahasiswa->created_at,
                ];
            });

        return $recentConsultations->concat($newStudents)
            ->sortByDesc('timestamp')
            ->take(10)
            ->values();
    }

   /**
     * Get chart data for dashboard
     * FIXED: Added nullable Request parameter
     */
    public function getChartData(?Request $request = null)
    {
        $period = $request ? $request->get('period', '30days') : '30days';

        switch ($period) {
            case '7days':
                $days = 7;
                $groupBy = 'DATE(tanggal_konsultasi)';
                $dateFormat = '%Y-%m-%d';
                break;
            case '30days':
                $days = 30;
                $groupBy = 'DATE(tanggal_konsultasi)';
                $dateFormat = '%Y-%m-%d';
                break;
            case '6months':
                $days = 180;
                $groupBy = 'DATE_FORMAT(tanggal_konsultasi, "%Y-%m")';
                $dateFormat = '%Y-%m';
                break;
            case '1year':
                $days = 365;
                $groupBy = 'DATE_FORMAT(tanggal_konsultasi, "%Y-%m")';
                $dateFormat = '%Y-%m';
                break;
            default:
                $days = 30;
                $groupBy = 'DATE(tanggal_konsultasi)';
                $dateFormat = '%Y-%m-%d';
        }

        $startDate = Carbon::now()->subDays($days);

        // Trend konsultasi
        $konsultasiTrend = RiwayatKonsultasi::select(
                DB::raw($groupBy . ' as date'),
                DB::raw('COUNT(*) as total')
            )
            ->where('tanggal_konsultasi', '>=', $startDate)
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Distribusi diagnosa
        $diagnosaDist = RiwayatKonsultasi::select('hasil_diagnosa', DB::raw('COUNT(*) as total'))
            ->where('tanggal_konsultasi', '>=', $startDate)
            ->groupBy('hasil_diagnosa')
            ->orderBy('total', 'desc')
            ->get();

        // Trend CF
        $cfTrend = RiwayatKonsultasi::select(
                DB::raw($groupBy . ' as date'),
                DB::raw('AVG(nilai_cf) as avg_cf')
            )
            ->where('tanggal_konsultasi', '>=', $startDate)
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Top gejala yang sering muncul
        // $topGejala = DB::table('riwayat_konsultasi')
        //     ->join('aturan_diagnosa', function($join) {
        //         $join->on(DB::raw('JSON_EXTRACT(riwayat_konsultasi.detail, "$.gejala_ids")'), 'like', DB::raw('CONCAT("%", aturan_diagnosa.id_gejala, "%")'));
        //     })
        //     ->join('gejala', 'gejala.id_gejala', '=', 'aturan_diagnosa.id_gejala')
        //     ->where('riwayat_konsultasi.tanggal_konsultasi', '>=', $startDate)
        //     ->groupBy('gejala.id_gejala', 'gejala.nama_gejala') // ✅ DAN INI
        //     ->orderBy('frequency', 'desc')
        //     ->limit(10)
        //     ->get();
        $topGejala = collect([]);

        return [
            'konsultasi_trend' => $konsultasiTrend,
            'diagnosa_distribution' => $diagnosaDist,
            'cf_trend' => $cfTrend,
            'top_gejala' => $topGejala,
            'period' => $period,
        ];
    }

    /**
     * Get system status
     */
    private function getSystemStatus()
    {
        return [
            'database_status' => $this->checkDatabaseConnection(),
            'storage_usage' => $this->getStorageUsage(),
            'last_backup' => $this->getLastBackupInfo(),
            'system_uptime' => $this->getSystemUptime(),
        ];
    }

    /**
     * Get statistics for API
     */
    public function statistics(Request $request)
    {
        $period = $request->get('period', '30days');
        $startDate = $this->getStartDateFromPeriod($period);

        $stats = [
            'konsultasi_summary' => [
                'total' => RiwayatKonsultasi::count(),
                'periode' => RiwayatKonsultasi::where('tanggal_konsultasi', '>=', $startDate)->count(),
                'hari_ini' => RiwayatKonsultasi::whereDate('tanggal_konsultasi', today())->count(),
            ],
            'mahasiswa_summary' => [
                'total' => User::where('role', 'mahasiswa')->count(),
                'aktif' => $this->getActiveMahasiswaCount($startDate),
                'baru' => User::where('role', 'mahasiswa')->where('created_at', '>=', $startDate)->count(),
            ],
            'diagnosa_summary' => RiwayatKonsultasi::select('hasil_diagnosa', DB::raw('count(*) as total'))
                ->where('tanggal_konsultasi', '>=', $startDate)
                ->groupBy('hasil_diagnosa')
                ->get(),
        ];

        return response()->json($stats);
    }


    /**
     * Get analytics data
     */
    public function analytics(Request $request)
    {
        $type = $request->get('type', 'overview');

        switch ($type) {
            case 'trends':
                return response()->json($this->getTrendAnalytics($request));
            case 'demographics':
                return response()->json($this->getDemographicsAnalytics());
            case 'performance':
                return response()->json($this->getPerformanceAnalytics());
            default:
                return response()->json($this->getOverviewAnalytics());
        }
    }

    /**
     * Backup system data
     */
    public function backup(Request $request)
    {
        try {
            $backupName = 'backup_' . Carbon::now()->format('Y_m_d_H_i_s');

            // Implement backup logic here
            // This could involve database dumps, file backups, etc.

            return response()->json([
                'success' => true,
                'message' => 'Backup berhasil dibuat',
                'backup_name' => $backupName,
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat backup: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Restore system data
     */
    public function restore(Request $request)
    {
        $request->validate([
            'backup_file' => 'required|string',
        ]);

        try {
            // Implement restore logic here

            return response()->json([
                'success' => true,
                'message' => 'Data berhasil dipulihkan',
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal memulihkan data: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get system settings
     */
    public function settings()
    {
        $settings = [
            'app_name' => config('app.name'),
            'app_version' => '1.0.0',
            'maintenance_mode' => app()->isDownForMaintenance(),
            'max_upload_size' => ini_get('upload_max_filesize'),
            'timezone' => config('app.timezone'),
        ];

        return Inertia::render('Admin/Settings', [
            'settings' => $settings,
        ]);
    }

    /**
     * Update system settings
     */
    public function updateSettings(Request $request)
    {
        $request->validate([
            'app_name' => 'sometimes|string|max:255',
            'timezone' => 'sometimes|string|in:' . implode(',', timezone_identifiers_list()),
        ]);

        try {
            // Update settings logic here

            return redirect()->back()->with('success', 'Pengaturan berhasil diperbarui');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Gagal memperbarui pengaturan');
        }
    }

    // Helper Methods

    private function calculatePercentageChange($current, $previous)
    {
        if ($previous == 0) {
            return $current > 0 ? 100 : 0;
        }

        return round((($current - $previous) / $previous) * 100, 1);
    }

    private function checkDatabaseConnection()
    {
        try {
            DB::connection()->getPdo();
            return 'online';
        } catch (\Exception $e) {
            return 'offline';
        }
    }

    private function getStorageUsage()
    {
        $totalSpace = disk_total_space(storage_path());
        $freeSpace = disk_free_space(storage_path());
        $usedSpace = $totalSpace - $freeSpace;

        return [
            'used' => $this->formatBytes($usedSpace),
            'total' => $this->formatBytes($totalSpace),
            'percentage' => round(($usedSpace / $totalSpace) * 100, 1),
        ];
    }

    private function getLastBackupInfo()
    {
        // Implement backup info retrieval
        return [
            'date' => Carbon::now()->subDays(1),
            'size' => '15.2 MB',
            'status' => 'success',
        ];
    }

    private function getSystemUptime()
    {
        // Simple uptime calculation (you might want to use a more robust method)
        return Carbon::now()->diffForHumans(Carbon::now()->subHours(24));
    }

    private function getStartDateFromPeriod($period)
    {
        switch ($period) {
            case '7days':
                return Carbon::now()->subDays(7);
            case '30days':
                return Carbon::now()->subDays(30);
            case '6months':
                return Carbon::now()->subMonths(6);
            case '1year':
                return Carbon::now()->subYear();
            default:
                return Carbon::now()->subDays(30);
        }
    }

    private function getActiveMahasiswaCount($startDate)
    {
        return RiwayatKonsultasi::where('tanggal_konsultasi', '>=', $startDate)
            ->distinct('id_mahasiswa')
            ->count('id_mahasiswa');
    }

    private function formatBytes($bytes, $precision = 2)
    {
        $units = array('B', 'KB', 'MB', 'GB', 'TB');

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision) . ' ' . $units[$i];
    }

    private function getTrendAnalytics($request)
    {
        // Implement trend analytics
        return [];
    }

    private function getDemographicsAnalytics()
    {
        return [
            'fakultas_distribution' => User::where('role', 'mahasiswa')
                ->select('fakultas', DB::raw('count(*) as total'))
                ->groupBy('fakultas')
                ->get(),
            'gender_distribution' => User::where('role', 'mahasiswa')
                ->select('jenis_kelamin', DB::raw('count(*) as total'))
                ->groupBy('jenis_kelamin')
                ->get(),
            'age_distribution' => User::where('role', 'mahasiswa')
                ->select(
                    DB::raw('CASE
                        WHEN usia < 20 THEN "< 20"
                        WHEN usia BETWEEN 20 AND 22 THEN "20-22"
                        WHEN usia BETWEEN 23 AND 25 THEN "23-25"
                        ELSE "> 25"
                    END as age_range'),
                    DB::raw('count(*) as total')
                )
                ->groupBy('age_range')
                ->get(),
        ];
    }

    private function getPerformanceAnalytics()
    {
        // Implement performance analytics
        return [];
    }

    private function getOverviewAnalytics()
    {
        // Implement overview analytics
        return [];
    }
}
