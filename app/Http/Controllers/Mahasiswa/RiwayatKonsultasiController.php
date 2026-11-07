<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use App\Models\RiwayatKonsultasi;
use App\Models\Mahasiswa;
use App\Models\Gejala;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Log;

class RiwayatKonsultasiController extends Controller
{
    /**
     * Helper method to get mahasiswa data by user_id
     */
    private function getMahasiswaByUserId($userId)
    {
        $mahasiswa = Mahasiswa::where('user_id', $userId)->first();

        \Log::info('Debug getMahasiswaByUserId', [
            'user_id' => $userId,
            'mahasiswa_found' => $mahasiswa ? 'Yes' : 'No',
            'mahasiswa_data' => $mahasiswa
        ]);

        return $mahasiswa;
    }

    /**
     * Display a listing of the resource (hanya milik mahasiswa yang login).
     */
    public function index(Request $request)
    {
        try {
            $user = Auth::user();
            $mahasiswa = $this->getMahasiswaByUserId($user->id);

            if (!$mahasiswa) {
                \Log::error('Mahasiswa not found for user_id: ' . $user->id);
                return redirect()->back()->with('error', 'Data mahasiswa tidak ditemukan');
            }

            $mahasiswaId = $mahasiswa->id_mahasiswa;

            \Log::info('RiwayatKonsultasi Index - Start', [
                'user_id' => $user->id,
                'mahasiswa_id' => $mahasiswaId
            ]);

            $query = RiwayatKonsultasi::where('id_mahasiswa', $mahasiswaId);

            // Filter berdasarkan tanggal
            if ($request->filled('start_date')) {
                $query->whereDate('tanggal_konsultasi', '>=', $request->start_date);
            }

            if ($request->filled('end_date')) {
                $query->whereDate('tanggal_konsultasi', '<=', $request->end_date);
            }

            // Filter berdasarkan hasil diagnosa
            if ($request->filled('hasil_diagnosa')) {
                $query->where('hasil_diagnosa', 'like', '%' . $request->hasil_diagnosa . '%');
            }

            // Filter berdasarkan nilai CF
            if ($request->filled('min_cf')) {
                $query->where('nilai_cf', '>=', $request->min_cf / 100);
            }

            if ($request->filled('max_cf')) {
                $query->where('nilai_cf', '<=', $request->max_cf / 100);
            }

            // Search
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where('hasil_diagnosa', 'like', "%{$search}%");
            }

            // Sorting
            $sortBy = $request->get('sort_by', 'tanggal_konsultasi');
            $sortOrder = $request->get('sort_order', 'desc');
            $query->orderBy($sortBy, $sortOrder);

            // Debug query
            \Log::info('Query Details', [
                'sql' => $query->toSql(),
                'bindings' => $query->getBindings()
            ]);

            // Pagination
            $perPage = $request->get('per_page', 10);
            $riwayat = $query->paginate($perPage);

            \Log::info('Query Results', [
                'total' => $riwayat->total(),
                'current_page_count' => $riwayat->count(),
                'per_page' => $perPage,
                'current_page' => $riwayat->currentPage()
            ]);

            // Statistics untuk mahasiswa ini
            $stats = [
                'total_konsultasi' => RiwayatKonsultasi::where('id_mahasiswa', $mahasiswaId)->count(),
                'konsultasi_bulan_ini' => RiwayatKonsultasi::where('id_mahasiswa', $mahasiswaId)
                                                          ->whereMonth('tanggal_konsultasi', Carbon::now()->month)
                                                          ->whereYear('tanggal_konsultasi', Carbon::now()->year)
                                                          ->count(),
                'rata_rata_cf' => RiwayatKonsultasi::where('id_mahasiswa', $mahasiswaId)->avg('nilai_cf'),
                'konsultasi_terakhir' => RiwayatKonsultasi::where('id_mahasiswa', $mahasiswaId)
                                                         ->orderBy('tanggal_konsultasi', 'desc')
                                                         ->first(),
            ];

            // Data untuk filter dropdown (hanya hasil diagnosa yang pernah didapat mahasiswa ini)
            $diagnosaList = RiwayatKonsultasi::where('id_mahasiswa', $mahasiswaId)
                                           ->select('hasil_diagnosa')
                                           ->distinct()
                                           ->whereNotNull('hasil_diagnosa')
                                           ->orderBy('hasil_diagnosa')
                                           ->pluck('hasil_diagnosa');

            \Log::info('Final data prepared', [
                'stats' => $stats,
                'diagnosa_list_count' => $diagnosaList->count()
            ]);

            return Inertia::render('mahasiswa/RiwayatKonsultasi/Index', [
                'riwayat' => $riwayat,
                'stats' => $stats,
                'filters' => [
                    'diagnosa_list' => $diagnosaList,
                ],
                'queryParams' => request()->query() ?: [],
            ]);

        } catch (\Exception $e) {
            \Log::error('RiwayatKonsultasi Index Error', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);

            return redirect()->back()->with('error', 'Terjadi kesalahan saat memuat data riwayat konsultasi.');
        }
    }

    /**
     * ✅ FIXED: Display the specified resource with properly loaded gejala data
     */
    public function show($id)
    {
        try {
            $user = Auth::user();
            $mahasiswa = $this->getMahasiswaByUserId($user->id);

            if (!$mahasiswa) {
                return redirect()->route('mahasiswa.riwayat-konsultasi.index')
                    ->with('error', 'Data mahasiswa tidak ditemukan');
            }

            $mahasiswaId = $mahasiswa->id_mahasiswa;

            \Log::info('RiwayatKonsultasi Show - Start', [
                'konsultasi_id' => $id,
                'mahasiswa_id' => $mahasiswaId
            ]);

            // Load konsultasi dengan relasi
            $riwayat = RiwayatKonsultasi::where('id_mahasiswa', $mahasiswaId)
                                      ->where('id_konsultasi', $id)
                                      ->with(['mahasiswa'])
                                      ->first();

            if (!$riwayat) {
                \Log::warning('Riwayat not found', [
                    'konsultasi_id' => $id,
                    'mahasiswa_id' => $mahasiswaId
                ]);

                return redirect()->route('mahasiswa.riwayat-konsultasi.index')
                    ->with('error', 'Data riwayat konsultasi tidak ditemukan');
            }

            // ✅ PERBAIKAN UTAMA: Parse detail dan load gejala_terpilih
            $detail = [];
            if ($riwayat->detail) {
                $detail = is_string($riwayat->detail) ?
                    json_decode($riwayat->detail, true) :
                    $riwayat->detail;
            }

            \Log::info('Detail data', [
                'detail_exists' => !empty($detail),
                'jawaban_gejala_count' => isset($detail['jawaban_gejala']) ? count($detail['jawaban_gejala']) : 0,
                'detail_keys' => array_keys($detail ?: [])
            ]);

            // ✅ LOAD DATA GEJALA TERPILIH
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
                            'nilai_cf' => $opsiTerpilih['bobot'] ?? 0,
                            'deskripsi' => $gejala->deskripsi_gejala ?? null,
                        ];
                    }
                }
            }

            \Log::info('Gejala terpilih loaded', [
                'count' => count($gejalaTerpilih),
                'sample' => array_slice($gejalaTerpilih, 0, 2) // Show first 2 items for debugging
            ]);

            // ✅ LOAD DETAIL DIAGNOSA
            $detailDiagnosa = null;
            if ($riwayat->id_diagnosa) {
                $detailDiagnosa = \App\Models\Diagnosa::find($riwayat->id_diagnosa);
            }

            // Riwayat terkait (konsultasi sebelumnya dari mahasiswa yang sama)
            $relatedKonsultasi = RiwayatKonsultasi::where('id_mahasiswa', $mahasiswaId)
                                                 ->where('id_konsultasi', '!=', $id)
                                                 ->orderBy('tanggal_konsultasi', 'desc')
                                                 ->limit(5)
                                                 ->get(['id_konsultasi', 'tanggal_konsultasi', 'hasil_diagnosa', 'nilai_cf', 'tingkat_keparahan']);

            // ✅ STRUKTUR DATA YANG DIPERBAIKI
            $riwayatData = [
                'id_konsultasi' => $riwayat->id_konsultasi,
                'mahasiswa_id' => $riwayat->id_mahasiswa,
                'tanggal_konsultasi' => $riwayat->tanggal_konsultasi,
                'hasil_diagnosa' => $riwayat->hasil_diagnosa,
                'tingkat_keparahan' => $riwayat->tingkat_keparahan,
                'nilai_cf' => $riwayat->nilai_cf,
                'rekomendasi' => $riwayat->rekomendasi,
                'created_at' => $riwayat->created_at,
                'updated_at' => $riwayat->updated_at,
                'mahasiswa' => $riwayat->mahasiswa ? [
                    'id' => $riwayat->mahasiswa->id_mahasiswa,
                    'nama' => $riwayat->mahasiswa->nama ?? 'Tidak diketahui',
                    'nim' => $riwayat->mahasiswa->nim ?? 'Tidak diketahui',
                    'email' => $riwayat->mahasiswa->email ?? 'Tidak diketahui',
                    'jurusan' => $riwayat->mahasiswa->jurusan ?? null,
                    'angkatan' => $riwayat->mahasiswa->angkatan ?? null,
                ] : null,
                'gejala_terpilih' => $gejalaTerpilih, // ✅ INI YANG PENTING!
                'detail_diagnosa' => $detailDiagnosa ? [
                    'id_diagnosa' => $detailDiagnosa->id_diagnosa,
                    'kode_diagnosa' => $detailDiagnosa->kode_diagnosa ?? 'N/A',
                    'nama_diagnosa' => $detailDiagnosa->nama_diagnosa,
                    'deskripsi' => $detailDiagnosa->deskripsi_diagnosa ?? 'Deskripsi tidak tersedia',
                    'nilai_cf' => $detailDiagnosa->nilai_cf ?? $riwayat->nilai_cf,
                    'rekomendasi' => $detailDiagnosa->rekomendasi ?? $riwayat->rekomendasi,
                ] : null,
            ];

            \Log::info('Final data structure', [
                'riwayat_keys' => array_keys($riwayatData),
                'gejala_count' => count($riwayatData['gejala_terpilih']),
                'has_detail_diagnosa' => !empty($riwayatData['detail_diagnosa']),
                'related_count' => $relatedKonsultasi->count()
            ]);

            return Inertia::render('mahasiswa/RiwayatKonsultasi/Show', [
                'riwayat' => $riwayatData,
                'relatedKonsultasi' => $relatedKonsultasi,
            ]);

        } catch (\Exception $e) {
            \Log::error('RiwayatKonsultasi Show Error', [
                'konsultasi_id' => $id,
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->route('mahasiswa.riwayat-konsultasi.index')
                ->with('error', 'Terjadi kesalahan saat memuat detail riwayat konsultasi: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage (hanya jika milik mahasiswa yang login).
     */
    public function destroy($id)
    {
        try {
            $user = Auth::user();
            $mahasiswa = $this->getMahasiswaByUserId($user->id);

            if (!$mahasiswa) {
                return redirect()->back()->with('error', 'Data mahasiswa tidak ditemukan');
            }

            $mahasiswaId = $mahasiswa->id_mahasiswa;

            $riwayat = RiwayatKonsultasi::where('id_mahasiswa', $mahasiswaId)
                                      ->where('id_konsultasi', $id)
                                      ->first();

            if (!$riwayat) {
                return redirect()->back()->with('error', 'Data riwayat konsultasi tidak ditemukan');
            }

            $riwayat->delete();

            \Log::info('RiwayatKonsultasi deleted', [
                'konsultasi_id' => $id,
                'mahasiswa_id' => $mahasiswaId
            ]);

            return redirect()->route('mahasiswa.riwayat-konsultasi.index')
                           ->with('success', 'Riwayat konsultasi berhasil dihapus.');

        } catch (\Exception $e) {
            \Log::error('RiwayatKonsultasi Delete Error', [
                'konsultasi_id' => $id,
                'error' => $e->getMessage()
            ]);

            return redirect()->back()->with('error', 'Gagal menghapus riwayat konsultasi.');
        }
    }

    /**
     * Print hasil konsultasi - SIMPLIFIED VERSION
     */
    public function print($id)
    {
        try {
            $user = Auth::user();
            $mahasiswa = $this->getMahasiswaByUserId($user->id);

            if (!$mahasiswa) {
                return redirect()->back()->with('error', 'Data mahasiswa tidak ditemukan');
            }

            // Ambil data konsultasi yang sudah tersimpan
            $riwayat = RiwayatKonsultasi::where('id_mahasiswa', $mahasiswa->id_mahasiswa)
                                    ->where('id_konsultasi', $id)
                                    ->with(['mahasiswa', 'diagnosa'])
                                    ->first();

            if (!$riwayat) {
                return redirect()->back()->with('error', 'Data riwayat konsultasi tidak ditemukan');
            }

            // Parse rekomendasi yang sudah tersimpan
            $rekomendasi = [];
            if ($riwayat->rekomendasi) {
                $rekomendasi = is_string($riwayat->rekomendasi) ?
                    json_decode($riwayat->rekomendasi, true) :
                    $riwayat->rekomendasi;
            }

            // Parse detail gejala yang sudah tersimpan (jika ada)
            $detail = [];
            if ($riwayat->detail) {
                $detail = is_string($riwayat->detail) ?
                    json_decode($riwayat->detail, true) :
                    $riwayat->detail;
            }

            // Data untuk PDF - gunakan data yang sudah tersimpan
            $pdfData = [
                'riwayat' => $riwayat,
                'rekomendasi' => $rekomendasi,
                'detail' => $detail,
                'mahasiswa' => $riwayat->mahasiswa,
                'diagnosa' => $riwayat->diagnosa,
                'generated_at' => Carbon::now(),
            ];

            Log::info('Print PDF - Data prepared from saved consultation', [
                'konsultasi_id' => $id,
                'has_rekomendasi' => !empty($rekomendasi),
                'has_detail' => !empty($detail)
            ]);

            // Generate PDF
            $pdf = Pdf::loadView('exports.riwayat-konsultasi-print', $pdfData);
            $pdf->setPaper('A4', 'portrait');

            $filename = 'riwayat-konsultasi-' . $id . '.pdf';

            // PENTING: Stream untuk print (bukan download)
            return $pdf->stream($filename);

        } catch (\Exception $e) {
            Log::error('Print Error', [
                'konsultasi_id' => $id,
                'error' => $e->getMessage()
            ]);

            return redirect()->back()->with('error', 'Gagal mencetak: ' . $e->getMessage());
        }
    }

    /**
     * Download PDF hasil konsultasi
     */
    public function downloadPdf($id)
    {
        try {
            $user = Auth::user();
            $mahasiswa = $this->getMahasiswaByUserId($user->id);

            if (!$mahasiswa) {
                return redirect()->back()->with('error', 'Data mahasiswa tidak ditemukan');
            }

            // Ambil data yang sama seperti print
            $riwayat = RiwayatKonsultasi::where('id_mahasiswa', $mahasiswa->id_mahasiswa)
                                    ->where('id_konsultasi', $id)
                                    ->with(['mahasiswa', 'diagnosa'])
                                    ->first();

            if (!$riwayat) {
                return redirect()->back()->with('error', 'Data tidak ditemukan');
            }

            $rekomendasi = [];
            if ($riwayat->rekomendasi) {
                $rekomendasi = is_string($riwayat->rekomendasi) ?
                    json_decode($riwayat->rekomendasi, true) :
                    $riwayat->rekomendasi;
            }

            $detail = [];
            if ($riwayat->detail) {
                $detail = is_string($riwayat->detail) ?
                    json_decode($riwayat->detail, true) :
                    $riwayat->detail;
            }

            $pdfData = [
                'riwayat' => $riwayat,
                'rekomendasi' => $rekomendasi,
                'detail' => $detail,
                'mahasiswa' => $riwayat->mahasiswa,
                'diagnosa' => $riwayat->diagnosa,
                'generated_at' => Carbon::now(),
            ];

            $pdf = Pdf::loadView('exports.riwayat-konsultasi-print', $pdfData);
            $pdf->setPaper('A4', 'portrait');

            $filename = 'riwayat-konsultasi-' . $id . '-' . Carbon::now()->format('Y-m-d') . '.pdf';

            // Download file
            return $pdf->download($filename);

        } catch (\Exception $e) {
            Log::error('Download PDF Error', [
                'konsultasi_id' => $id,
                'error' => $e->getMessage()
            ]);

            return redirect()->back()->with('error', 'Gagal download: ' . $e->getMessage());
        }
    }

    // ... rest of the methods remain the same
    public function export(Request $request)
    {
        try {
            $user = Auth::user();
            $mahasiswa = $this->getMahasiswaByUserId($user->id);

            if (!$mahasiswa) {
                return redirect()->back()->with('error', 'Data mahasiswa tidak ditemukan');
            }

            $mahasiswaId = $mahasiswa->id_mahasiswa;
            $startDate = $request->get('start_date', Carbon::now()->startOfYear());
            $endDate = $request->get('end_date', Carbon::now()->endOfYear());

            $riwayat = RiwayatKonsultasi::where('id_mahasiswa', $mahasiswaId)
                                      ->whereBetween('tanggal_konsultasi', [$startDate, $endDate])
                                      ->with(['mahasiswa'])
                                      ->orderBy('tanggal_konsultasi', 'desc')
                                      ->get();

            $stats = [
                'total_konsultasi' => $riwayat->count(),
                'rata_rata_cf' => $riwayat->avg('nilai_cf'),
                'diagnosa_per_kategori' => $riwayat->groupBy('hasil_diagnosa')->map->count(),
            ];

            $pdf = Pdf::loadView('mahasiswa.riwayat-konsultasi.export-pdf', [
                'riwayat' => $riwayat,
                'stats' => $stats,
                'mahasiswa' => $mahasiswa,
                'period' => [
                    'start' => $startDate,
                    'end' => $endDate,
                ],
                'generated_at' => Carbon::now(),
            ]);

            $filename = 'riwayat-konsultasi-' . ($mahasiswa->nim ?? 'unknown') . '-' . Carbon::now()->format('Y-m-d') . '.pdf';

            return $pdf->download($filename);

        } catch (\Exception $e) {
            \Log::error('Export Error', [
                'error' => $e->getMessage()
            ]);

            return redirect()->back()->with('error', 'Gagal mengexport riwayat konsultasi');
        }
    }

    public function getProgress(Request $request)
    {
        try {
            $user = Auth::user();
            $mahasiswa = $this->getMahasiswaByUserId($user->id);

            if (!$mahasiswa) {
                return response()->json(['error' => 'Data mahasiswa tidak ditemukan'], 404);
            }

            $mahasiswaId = $mahasiswa->id_mahasiswa;
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

            // Progress nilai CF over time
            $cfProgress = RiwayatKonsultasi::where('id_mahasiswa', $mahasiswaId)
                ->where('tanggal_konsultasi', '>=', $startDate)
                ->select('tanggal_konsultasi', 'nilai_cf', 'hasil_diagnosa')
                ->orderBy('tanggal_konsultasi')
                ->get();

            // Distribusi hasil diagnosa
            $diagnosaDist = RiwayatKonsultasi::where('id_mahasiswa', $mahasiswaId)
                ->where('tanggal_konsultasi', '>=', $startDate)
                ->select('hasil_diagnosa')
                ->selectRaw('COUNT(*) as total')
                ->groupBy('hasil_diagnosa')
                ->orderBy('total', 'desc')
                ->get();

            return response()->json([
                'cf_progress' => $cfProgress,
                'diagnosa_distribution' => $diagnosaDist,
            ]);

        } catch (\Exception $e) {
            \Log::error('GetProgress Error', [
                'error' => $e->getMessage()
            ]);

            return response()->json(['error' => 'Gagal memuat data progress'], 500);
        }
    }

    public function compare()
    {
        try {
            $user = Auth::user();
            $mahasiswa = $this->getMahasiswaByUserId($user->id);

            if (!$mahasiswa) {
                return redirect()->back()->with('error', 'Data mahasiswa tidak ditemukan');
            }

            $mahasiswaId = $mahasiswa->id_mahasiswa;

            // Periode saat ini (3 bulan terakhir)
            $currentPeriodStart = Carbon::now()->subMonths(3);
            $currentPeriodEnd = Carbon::now();

            // Periode sebelumnya (3 bulan sebelum periode saat ini)
            $previousPeriodStart = Carbon::now()->subMonths(6);
            $previousPeriodEnd = Carbon::now()->subMonths(3);

            $currentData = RiwayatKonsultasi::where('id_mahasiswa', $mahasiswaId)
                ->whereBetween('tanggal_konsultasi', [$currentPeriodStart, $currentPeriodEnd])
                ->get();

            $previousData = RiwayatKonsultasi::where('id_mahasiswa', $mahasiswaId)
                ->whereBetween('tanggal_konsultasi', [$previousPeriodStart, $previousPeriodEnd])
                ->get();

            $comparison = [
                'current' => [
                    'total_konsultasi' => $currentData->count(),
                    'rata_rata_cf' => $currentData->avg('nilai_cf'),
                    'diagnosa_terbanyak' => $currentData->groupBy('hasil_diagnosa')->map->count()->sortDesc()->keys()->first(),
                ],
                'previous' => [
                    'total_konsultasi' => $previousData->count(),
                    'rata_rata_cf' => $previousData->avg('nilai_cf'),
                    'diagnosa_terbanyak' => $previousData->groupBy('hasil_diagnosa')->map->count()->sortDesc()->keys()->first(),
                ],
            ];

            return Inertia::render('mahasiswa/RiwayatKonsultasi/Compare', [
                'comparison' => $comparison,
                'periods' => [
                    'current' => [
                        'start' => $currentPeriodStart,
                        'end' => $currentPeriodEnd,
                    ],
                    'previous' => [
                        'start' => $previousPeriodStart,
                        'end' => $previousPeriodEnd,
                    ],
                ],
            ]);

        } catch (\Exception $e) {
            \Log::error('Compare Error', [
                'error' => $e->getMessage()
            ]);

            return redirect()->back()->with('error', 'Gagal memuat data perbandingan');
        }
    }

    public function getSummary()
    {
        try {
            $user = Auth::user();
            $mahasiswa = $this->getMahasiswaByUserId($user->id);

            if (!$mahasiswa) {
                return response()->json(['error' => 'Data mahasiswa tidak ditemukan'], 404);
            }

            $mahasiswaId = $mahasiswa->id_mahasiswa;

            $summary = [
                'total_konsultasi' => RiwayatKonsultasi::where('id_mahasiswa', $mahasiswaId)->count(),
                'konsultasi_terakhir' => RiwayatKonsultasi::where('id_mahasiswa', $mahasiswaId)
                                                         ->latest('tanggal_konsultasi')
                                                         ->first(),
                'trend_cf' => RiwayatKonsultasi::where('id_mahasiswa', $mahasiswaId)
                                             ->orderBy('tanggal_konsultasi', 'desc')
                                             ->limit(5)
                                             ->pluck('nilai_cf')
                                             ->toArray(),
            ];

            return response()->json($summary);

        } catch (\Exception $e) {
            \Log::error('GetSummary Error', [
                'error' => $e->getMessage()
            ]);

            return response()->json(['error' => 'Gagal memuat summary'], 500);
        }
    }
}
