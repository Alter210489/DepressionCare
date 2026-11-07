<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\RiwayatKonsultasi;
use App\Models\User;
use App\Models\Mahasiswa;
use App\Models\Diagnosa;
use App\Models\Gejala;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\RiwayatKonsultasiExport;

class RiwayatKonsultasiController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = RiwayatKonsultasi::with(['mahasiswa.user', 'diagnosa']);

            // Search - perbaiki kolom yang dicari
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('hasil_diagnosa', 'like', "%{$search}%")
                      ->orWhere('tingkat_keparahan', 'like', "%{$search}%")
                      ->orWhere('rekomendasi', 'like', "%{$search}%")
                      ->orWhereHas('mahasiswa', function($mahasiswaQuery) use ($search) {
                          $mahasiswaQuery->where('nama', 'like', "%{$search}%")
                                       ->orWhere('nim', 'like', "%{$search}%");
                      })
                      ->orWhereHas('diagnosa', function($diagnosaQuery) use ($search) {
                          $diagnosaQuery->where('nama_diagnosa', 'like', "%{$search}%");
                      });
                });
            }

            // Filter berdasarkan tingkat keparahan
            if ($request->filled('tingkat_keparahan')) {
                $query->where('tingkat_keparahan', $request->tingkat_keparahan);
            }

            // Filter berdasarkan fakultas
            if ($request->filled('fakultas')) {
                $query->whereHas('mahasiswa', function($mahasiswaQuery) use ($request) {
                    $mahasiswaQuery->where('fakultas', $request->fakultas);
                });
            }

            // Filter berdasarkan tanggal
            if ($request->filled('tanggal_dari')) {
                $query->whereDate('tanggal_konsultasi', '>=', $request->tanggal_dari);
            }

            if ($request->filled('tanggal_sampai')) {
                $query->whereDate('tanggal_konsultasi', '<=', $request->tanggal_sampai);
            }

            // Sorting
            $allowedSortColumns = ['tanggal_konsultasi', 'hasil_diagnosa', 'nilai_cf', 'tingkat_keparahan'];
            $sortBy = $request->get('sortBy', 'tanggal_konsultasi');
            $sortOrder = $request->get('sortOrder', 'desc');

            if (!in_array($sortBy, $allowedSortColumns)) {
                $sortBy = 'tanggal_konsultasi';
            }

            if (!in_array($sortOrder, ['asc', 'desc'])) {
                $sortOrder = 'desc';
            }

            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $perPage = min((int)$request->get('perPage', 10), 100);
            $riwayatKonsultasi = $query->paginate($perPage)->withQueryString();

            // Statistics dengan struktur yang benar
            $totalKonsultasi = RiwayatKonsultasi::count();
            $konsultasiHariIni = RiwayatKonsultasi::whereDate('tanggal_konsultasi', Carbon::today())->count();
            $totalMahasiswa = Mahasiswa::count();

            // Hitung tingkat keparahan dengan benar
            $tingkatKeparahanCounts = RiwayatKonsultasi::select('tingkat_keparahan', DB::raw('COUNT(*) as total'))
                                               ->groupBy('tingkat_keparahan')
                                               ->pluck('total', 'tingkat_keparahan')
                                               ->toArray();

            Log::info('Tingkat keparahan raw data', $tingkatKeparahanCounts);

            // Map semua kemungkinan variasi nama tingkat keparahan
            $normalizedTingkatKeparahan = [
                'normal' => $tingkatKeparahanCounts['Minimal / Normal'] ??
                           $tingkatKeparahanCounts['Minimal (Normal)'] ??
                           $tingkatKeparahanCounts['minimal'] ??
                           $tingkatKeparahanCounts['normal'] ?? 0,

                'ringan' => $tingkatKeparahanCounts['Depresi Ringan'] ??
                           $tingkatKeparahanCounts['Ringan (Mild Depression)'] ??
                           $tingkatKeparahanCounts['ringan'] ?? 0,

                'sedang' => $tingkatKeparahanCounts['Depresi Sedang'] ??
                           $tingkatKeparahanCounts['Sedang (Moderate Depression)'] ??
                           $tingkatKeparahanCounts['sedang'] ?? 0,

                'berat' => $tingkatKeparahanCounts['Depresi Berat'] ??
                          $tingkatKeparahanCounts['Berat (Severe Depression)'] ??
                          $tingkatKeparahanCounts['berat'] ?? 0,
            ];

            $statistics = [
                'totalKonsultasi' => $totalKonsultasi,
                'totalMahasiswa' => $totalMahasiswa,
                'konsultasiHariIni' => $konsultasiHariIni,
                'tingkatKeparahan' => $normalizedTingkatKeparahan,
            ];

            // List fakultas untuk filter
            $fakultasList = Mahasiswa::select('fakultas')
                                    ->distinct()
                                    ->whereNotNull('fakultas')
                                    ->where('fakultas', '!=', '')
                                    ->orderBy('fakultas')
                                    ->pluck('fakultas')
                                    ->toArray();

            $filters = [
                'search' => $request->get('search', ''),
                'perPage' => $request->get('perPage', '10'),
                'sortBy' => $sortBy,
                'sortOrder' => $sortOrder,
                'tingkat_keparahan' => $request->get('tingkat_keparahan', ''),
                'fakultas' => $request->get('fakultas', ''),
                'tanggal_dari' => $request->get('tanggal_dari', ''),
                'tanggal_sampai' => $request->get('tanggal_sampai', ''),
            ];

            Log::info('Admin RiwayatKonsultasi index loaded', [
                'total' => $totalKonsultasi,
                'statistics' => $statistics,
                'current_page' => $riwayatKonsultasi->currentPage(),
                'per_page' => $perPage
            ]);

            return Inertia::render('admin/RiwayatKonsultasi/Index', [
                'riwayatKonsultasi' => $riwayatKonsultasi,
                'statistics' => $statistics,
                'fakultasList' => $fakultasList,
                'filters' => $filters,
            ]);

        } catch (\Exception $e) {
            Log::error('Error in Admin RiwayatKonsultasi index', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);

            return redirect()->back()->with('error', 'Terjadi kesalahan saat memuat data: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource - SESUAI ROUTE: Route::get('/{id}', ...)
     */
    public function show($id)
    {
        try {
            // Load konsultasi dengan relasi yang diperlukan
            $riwayat = RiwayatKonsultasi::with(['mahasiswa.user', 'diagnosa'])
                                      ->findOrFail($id);

            Log::info('Admin RiwayatKonsultasi show - loaded', [
                'id' => $id,
                'mahasiswa' => $riwayat->mahasiswa->nama ?? 'Unknown'
            ]);

            // Parse detail dan load gejala_terpilih
            $detail = [];
            if ($riwayat->detail) {
                $detail = is_string($riwayat->detail) ?
                    json_decode($riwayat->detail, true) :
                    $riwayat->detail;
            }

            // LOAD DATA GEJALA TERPILIH
            $gejalaTerpilih = [];
            if (isset($detail['jawaban_gejala']) && is_array($detail['jawaban_gejala'])) {
                foreach ($detail['jawaban_gejala'] as $jawaban) {
                    $gejala = Gejala::find($jawaban['id_gejala']);
                    if ($gejala) {
                        $opsiJawaban = $gejala->opsi_jawaban ?? [];
                        $opsiTerpilih = null;

                        // Get selected option
                        if (isset($jawaban['opsi_terpilih']) && isset($opsiJawaban[$jawaban['opsi_terpilih']])) {
                            $opsiTerpilih = $opsiJawaban[$jawaban['opsi_terpilih']];
                        }

                        $gejalaTerpilih[] = [
                            'id_gejala' => $gejala->id_gejala,
                            'kode_gejala' => $gejala->kode_gejala,
                            'nama_gejala' => $gejala->nama_gejala,
                            'kategori_gejala' => $gejala->kategori_gejala,
                            'jawaban' => $opsiTerpilih['text'] ?? 'Tidak diketahui',
                            'nilai_cf' => (float) ($opsiTerpilih['bobot'] ?? 0),
                            'deskripsi' => $gejala->deskripsi_gejala ?? null,
                        ];
                    }
                }
            }

            // LOAD DETAIL DIAGNOSA
            $detailDiagnosa = null;
            if ($riwayat->id_diagnosa) {
                $diagnosa = Diagnosa::find($riwayat->id_diagnosa);
                if ($diagnosa) {
                    $detailDiagnosa = [
                        'id_diagnosa' => $diagnosa->id_diagnosa,
                        'kode_diagnosa' => $diagnosa->kode_diagnosa ?? 'N/A',
                        'nama_diagnosa' => $diagnosa->nama_diagnosa,
                        'deskripsi' => $diagnosa->deskripsi_diagnosa ?? 'Deskripsi tidak tersedia',
                        'nilai_cf' => (float) ($diagnosa->nilai_cf ?? $riwayat->nilai_cf),
                        'rekomendasi' => $diagnosa->rekomendasi ?? $riwayat->rekomendasi,
                    ];
                }
            }

            // STRUKTUR DATA YANG KONSISTEN DAN LENGKAP
            $riwayatKonsultasi = [
                'id_konsultasi' => $riwayat->id_konsultasi,
                'id_mahasiswa' => $riwayat->id_mahasiswa,
                'tanggal_konsultasi' => $riwayat->tanggal_konsultasi,
                'hasil_diagnosa' => $riwayat->hasil_diagnosa,
                'tingkat_keparahan' => $riwayat->tingkat_keparahan,
                'nilai_cf' => (float) $riwayat->nilai_cf,
                'rekomendasi' => $riwayat->rekomendasi,
                'created_at' => $riwayat->created_at,
                'updated_at' => $riwayat->updated_at,
                'mahasiswa' => [
                    'id_mahasiswa' => $riwayat->mahasiswa->id_mahasiswa,
                    'nama' => $riwayat->mahasiswa->nama,
                    'nim' => $riwayat->mahasiswa->nim,
                    'fakultas' => $riwayat->mahasiswa->fakultas ?? 'Tidak diketahui',
                    'program_studi' => $riwayat->mahasiswa->jurusan ?? 'Tidak diketahui',
                    'email' => $riwayat->mahasiswa->user->email ??
                             $riwayat->mahasiswa->email ??
                             'Email tidak tersedia'
                ],
                'gejala_terpilih' => $gejalaTerpilih,
                'detail_diagnosa' => $detailDiagnosa,
            ];

            Log::info('Admin RiwayatKonsultasi show data prepared', [
                'id' => $id,
                'gejala_count' => count($gejalaTerpilih),
                'has_detail_diagnosa' => !empty($riwayatKonsultasi['detail_diagnosa']),
                'tingkat_keparahan' => $riwayat->tingkat_keparahan,
                'nilai_cf' => $riwayat->nilai_cf
            ]);

            return Inertia::render('admin/RiwayatKonsultasi/Show', [
                'riwayatKonsultasi' => $riwayatKonsultasi,
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::warning('RiwayatKonsultasi not found', ['id' => $id]);
            return redirect()->route('admin.riwayat-konsultasi.index')
                           ->with('error', 'Data konsultasi tidak ditemukan.');
        } catch (\Exception $e) {
            Log::error('Error in Admin RiwayatKonsultasi show', [
                'id' => $id,
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->route('admin.riwayat-konsultasi.index')
                           ->with('error', 'Terjadi kesalahan saat memuat data: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage - SESUAI ROUTE: Route::delete('/{id}', ...)
     */
    public function destroy($id)
    {
        try {
            $riwayat = RiwayatKonsultasi::findOrFail($id);

            Log::info('Deleting RiwayatKonsultasi', [
                'id' => $id,
                'mahasiswa' => $riwayat->mahasiswa->nama ?? 'Unknown'
            ]);

            $riwayat->delete();

            return redirect()->route('admin.riwayat-konsultasi.index')
                           ->with('success', 'Data riwayat konsultasi berhasil dihapus.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return redirect()->route('admin.riwayat-konsultasi.index')
                           ->with('error', 'Data riwayat konsultasi tidak ditemukan.');
        } catch (\Exception $e) {
            Log::error('Error deleting RiwayatKonsultasi', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);
            return redirect()->route('admin.riwayat-konsultasi.index')
                           ->with('error', 'Gagal menghapus data riwayat konsultasi.');
        }
    }

    /**
     * Generate report - SESUAI ROUTE: Route::get('/reports/generate', ...)
     *
     * PERBAIKAN: Format tanggal yang benar untuk frontend
     */
    public function report(Request $request)
    {
        try {
            // Parse tanggal dengan benar
            $startDate = $request->get('start_date');
            $endDate = $request->get('end_date');

            // Default date range jika tidak ada input
            if (!$startDate) {
                $startDate = Carbon::now()->startOfMonth()->format('Y-m-d');
            }

            if (!$endDate) {
                $endDate = Carbon::now()->endOfMonth()->format('Y-m-d');
            }

            // Pastikan format tanggal benar
            try {
                $startDateParsed = Carbon::createFromFormat('Y-m-d', $startDate)->startOfDay();
                $endDateParsed = Carbon::createFromFormat('Y-m-d', $endDate)->endOfDay();
            } catch (\Exception $dateError) {
                Log::warning('Invalid date format', [
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                    'error' => $dateError->getMessage()
                ]);

                // Fallback ke default dates
                $startDateParsed = Carbon::now()->startOfMonth();
                $endDateParsed = Carbon::now()->endOfMonth();
                $startDate = $startDateParsed->format('Y-m-d');
                $endDate = $endDateParsed->format('Y-m-d');
            }

            Log::info('Report date range', [
                'start_date_input' => $startDate,
                'end_date_input' => $endDate,
                'start_date_parsed' => $startDateParsed->format('Y-m-d H:i:s'),
                'end_date_parsed' => $endDateParsed->format('Y-m-d H:i:s')
            ]);

            $riwayat = RiwayatKonsultasi::with(['mahasiswa.user', 'diagnosa'])
                                      ->whereBetween('tanggal_konsultasi', [$startDateParsed, $endDateParsed])
                                      ->orderBy('tanggal_konsultasi', 'desc')
                                      ->get();

            // Safe calculations untuk menghindari division by zero
            $totalKonsultasi = $riwayat->count();
            $rataRataCf = $totalKonsultasi > 0 ? round($riwayat->avg('nilai_cf'), 3) : 0;
            $cfTertinggi = $totalKonsultasi > 0 ? round($riwayat->max('nilai_cf'), 3) : 0;
            $cfTerendah = $totalKonsultasi > 0 ? round($riwayat->min('nilai_cf'), 3) : 0;

            $stats = [
                'total_konsultasi' => $totalKonsultasi,
                'rata_rata_cf' => $rataRataCf,
                'cf_tertinggi' => $cfTertinggi,
                'cf_terendah' => $cfTerendah,
                'diagnosa_per_kategori' => $riwayat->groupBy('hasil_diagnosa')->map->count()->toArray(),
                'tingkat_keparahan' => $riwayat->groupBy('tingkat_keparahan')->map->count()->toArray(),
                'konsultasi_per_bulan' => $riwayat->groupBy(function($item) {
                    return Carbon::parse($item->tanggal_konsultasi)->format('Y-m');
                })->map->count()->toArray(),
                'mahasiswa_aktif' => $riwayat->groupBy('id_mahasiswa')->count(),
                'fakultas_distribution' => $riwayat->groupBy('mahasiswa.fakultas')->map->count()->toArray(),
            ];

            Log::info('Report generated', [
                'total_records' => $totalKonsultasi,
                'period' => "{$startDate} to {$endDate}",
                'mahasiswa_aktif' => $stats['mahasiswa_aktif']
            ]);

            return Inertia::render('admin/RiwayatKonsultasi/Report', [
                'riwayat' => $riwayat,
                'stats' => $stats,
                'period' => [
                    'start' => $startDate, // Format Y-m-d untuk frontend
                    'end' => $endDate,     // Format Y-m-d untuk frontend
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Error generating report', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'start_date' => $request->get('start_date'),
                'end_date' => $request->get('end_date')
            ]);

            return redirect()->back()->with('error', 'Gagal menggenerate laporan: ' . $e->getMessage());
        }
    }

    /**
     * Export to Excel - PERBAIKAN METHOD
     */
    public function export(Request $request)
    {
        try {
            $startDate = $request->get('tanggal_dari');
            $endDate = $request->get('tanggal_sampai');

            // Log untuk debugging
            \Log::info('Export Excel request', [
                'tanggal_dari' => $startDate,
                'tanggal_sampai' => $endDate,
                'all_params' => $request->all()
            ]);

            // Validasi tanggal
            if ($startDate && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $startDate)) {
                return redirect()->back()->with('error', 'Format tanggal mulai tidak valid. Gunakan format YYYY-MM-DD');
            }

            if ($endDate && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $endDate)) {
                return redirect()->back()->with('error', 'Format tanggal selesai tidak valid. Gunakan format YYYY-MM-DD');
            }

            // Hitung statistik untuk export
            $query = RiwayatKonsultasi::with(['mahasiswa.user', 'diagnosa']);

            if ($startDate) {
                $startDateParsed = Carbon::createFromFormat('Y-m-d', $startDate)->startOfDay();
                $query->where('tanggal_konsultasi', '>=', $startDateParsed);
            }

            if ($endDate) {
                $endDateParsed = Carbon::createFromFormat('Y-m-d', $endDate)->endOfDay();
                $query->where('tanggal_konsultasi', '<=', $endDateParsed);
            }

            // Dapatkan statistik
            $riwayat = $query->get();
            $totalKonsultasi = $riwayat->count();
            $mahasiswaAktif = $riwayat->groupBy('id_mahasiswa')->count();
            $rataRataCf = $totalKonsultasi > 0 ? $riwayat->avg('nilai_cf') : 0;
            $cfTertinggi = $totalKonsultasi > 0 ? $riwayat->max('nilai_cf') : 0;

            $stats = [
                'total_konsultasi' => $totalKonsultasi,
                'mahasiswa_aktif' => $mahasiswaAktif,
                'rata_rata_cf' => $rataRataCf,
                'cf_tertinggi' => $cfTertinggi,
            ];

            // Period info
            $period = null;
            if ($startDate || $endDate) {
                $period = [
                    'start' => $startDate,
                    'end' => $endDate
                ];
            }

            $filename = 'riwayat-konsultasi-' . Carbon::now()->format('Y-m-d-H-i-s') . '.xlsx';

            \Log::info('Starting Excel export', [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'filename' => $filename,
                'total_records' => $totalKonsultasi,
                'stats' => $stats
            ]);

            // PERBAIKAN: Pass parameter yang benar ke constructor
            return Excel::download(
                new RiwayatKonsultasiExport($startDate, $endDate, $stats, $period),
                $filename
            );

        } catch (\Exception $e) {
            \Log::error('Error exporting to Excel', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
                'start_date' => $request->get('tanggal_dari'),
                'end_date' => $request->get('tanggal_sampai')
            ]);

            return redirect()->back()->with('error', 'Gagal export ke Excel: ' . $e->getMessage());
        }
    }

    /**
     * Export to PDF - SESUAI ROUTE: Route::get('/export/pdf', ...)
     */
    public function exportPdf(Request $request)
    {
        try {
            $startDate = $request->get('tanggal_dari');
            $endDate = $request->get('tanggal_sampai');

            // Validasi dan default tanggal
            if (!$startDate || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $startDate)) {
                $startDate = Carbon::now()->startOfMonth()->format('Y-m-d');
            }

            if (!$endDate || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $endDate)) {
                $endDate = Carbon::now()->endOfMonth()->format('Y-m-d');
            }

            // Parse tanggal untuk query
            $startDateParsed = Carbon::createFromFormat('Y-m-d', $startDate)->startOfDay();
            $endDateParsed = Carbon::createFromFormat('Y-m-d', $endDate)->endOfDay();

            Log::info('PDF Export date range', [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'parsed_start' => $startDateParsed->format('Y-m-d H:i:s'),
                'parsed_end' => $endDateParsed->format('Y-m-d H:i:s')
            ]);

            $riwayat = RiwayatKonsultasi::with(['mahasiswa.user', 'diagnosa'])
                                    ->whereBetween('tanggal_konsultasi', [$startDateParsed, $endDateParsed])
                                    ->orderBy('tanggal_konsultasi', 'desc')
                                    ->get();

            $totalKonsultasi = $riwayat->count();
            $rataRataCf = $totalKonsultasi > 0 ? round($riwayat->avg('nilai_cf'), 3) : 0;

            $stats = [
                'total_konsultasi' => $totalKonsultasi,
                'rata_rata_cf' => $rataRataCf,
                'diagnosa_per_kategori' => $riwayat->groupBy('hasil_diagnosa')->map->count()->toArray(),
                'tingkat_keparahan' => $riwayat->groupBy('tingkat_keparahan')->map->count()->toArray(),
            ];

            // Load view dengan error handling
            try {
                $pdf = Pdf::loadView('exports.riwayat-konsultasi-pdf', [
                    'riwayat' => $riwayat,
                    'stats' => $stats,
                    'period' => [
                        'start' => $startDate,
                        'end' => $endDate,
                    ],
                    'generated_at' => Carbon::now(),
                ]);

                $filename = 'riwayat-konsultasi-' . Carbon::now()->format('Y-m-d-H-i-s') . '.pdf';

                Log::info('PDF generated successfully', [
                    'filename' => $filename,
                    'records_count' => $totalKonsultasi
                ]);

                // Cek apakah permintaan untuk print
                if ($request->get('action') === 'print') {
                    return $pdf->stream($filename); // Menggunakan stream untuk print
                }

                return $pdf->download($filename); // Default download

            } catch (\Exception $pdfError) {
                Log::error('Error creating PDF view', [
                    'error' => $pdfError->getMessage(),
                    'file' => $pdfError->getFile(),
                    'line' => $pdfError->getLine()
                ]);

                return redirect()->back()->with('error', 'Gagal membuat PDF. Pastikan template view tersedia.');
            }

        } catch (\Exception $e) {
            Log::error('Error exporting to PDF', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'start_date' => $request->get('tanggal_dari'),
                'end_date' => $request->get('tanggal_sampai')
            ]);

            return redirect()->back()->with('error', 'Gagal export ke PDF: ' . $e->getMessage());
        }
    }

    /**
     * Get analytics data for charts (untuk AJAX calls)
     */
    public function analytics(Request $request)
    {
        try {
            $period = $request->get('period', '6months');

            switch ($period) {
                case '1month':
                    $startDate = Carbon::now()->subMonth();
                    break;
                case '3months':
                    $startDate = Carbon::now()->subMonths(3);
                    break;
                case '6months':
                    $startDate = Carbon::now()->subMonths(6);
                    break;
                case '1year':
                    $startDate = Carbon::now()->subYear();
                    break;
                default:
                    $startDate = Carbon::now()->subMonths(6);
            }

            $konsultasiTrend = RiwayatKonsultasi::select(
                    DB::raw('DATE(tanggal_konsultasi) as date'),
                    DB::raw('COUNT(*) as total')
                )
                ->where('tanggal_konsultasi', '>=', $startDate)
                ->groupBy('date')
                ->orderBy('date')
                ->get();

            $diagnosaDist = RiwayatKonsultasi::select('hasil_diagnosa', DB::raw('COUNT(*) as total'))
                ->where('tanggal_konsultasi', '>=', $startDate)
                ->groupBy('hasil_diagnosa')
                ->orderBy('total', 'desc')
                ->get();

            $cfTrend = RiwayatKonsultasi::select(
                    DB::raw('DATE_FORMAT(tanggal_konsultasi, "%Y-%m") as month'),
                    DB::raw('AVG(nilai_cf) as avg_cf'),
                    DB::raw('COUNT(*) as total_konsultasi')
                )
                ->where('tanggal_konsultasi', '>=', $startDate)
                ->groupBy('month')
                ->orderBy('month')
                ->get();

            $severityTrend = RiwayatKonsultasi::select(
                    'tingkat_keparahan',
                    DB::raw('COUNT(*) as total')
                )
                ->where('tanggal_konsultasi', '>=', $startDate)
                ->groupBy('tingkat_keparahan')
                ->orderBy('total', 'desc')
                ->get();

            return response()->json([
                'konsultasi_trend' => $konsultasiTrend,
                'diagnosa_distribution' => $diagnosaDist,
                'cf_trend' => $cfTrend,
                'severity_trend' => $severityTrend,
                'period_info' => [
                    'start_date' => $startDate->format('Y-m-d'),
                    'end_date' => Carbon::now()->format('Y-m-d'),
                    'period' => $period
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error getting analytics data', [
                'error' => $e->getMessage(),
                'period' => $request->get('period')
            ]);

            return response()->json([
                'error' => 'Gagal memuat data analytics: ' . $e->getMessage()
            ], 500);
        }
    }
}
