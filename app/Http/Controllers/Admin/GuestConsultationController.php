<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\GuestConsultation;
use App\Models\Diagnosa;
use App\Models\Gejala;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;
use Barryvdh\DomPDF\Facade\Pdf;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\GuestConsultationExport;

class GuestConsultationController extends Controller
{
    /**
     * Display a listing of guest consultations
     */
    public function index(Request $request)
    {
        try {
            $query = GuestConsultation::with(['diagnosa']);

            // Search - berdasarkan nama, email, NIM, hasil diagnosa
            if ($request->filled('search')) {
                $search = $request->search;
                $query->where(function($q) use ($search) {
                    $q->where('nama', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%")
                      ->orWhere('nim', 'like', "%{$search}%")
                      ->orWhere('hasil_diagnosa', 'like', "%{$search}%")
                      ->orWhere('tingkat_keparahan', 'like', "%{$search}%")
                      ->orWhere('rekomendasi', 'like', "%{$search}%")
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
                $query->where('fakultas', $request->fakultas);
            }

            // Filter berdasarkan jenis kelamin
            if ($request->filled('jenis_kelamin')) {
                $query->where('jenis_kelamin', $request->jenis_kelamin);
            }

            // Filter berdasarkan tanggal
            if ($request->filled('tanggal_dari')) {
                $query->whereDate('created_at', '>=', $request->tanggal_dari);
            }

            if ($request->filled('tanggal_sampai')) {
                $query->whereDate('created_at', '<=', $request->tanggal_sampai);
            }

            // Sorting
            $allowedSortColumns = ['created_at', 'nama', 'email', 'hasil_diagnosa', 'nilai_cf', 'tingkat_keparahan'];
            $sortBy = $request->get('sortBy', 'created_at');
            $sortOrder = $request->get('sortOrder', 'desc');

            if (!in_array($sortBy, $allowedSortColumns)) {
                $sortBy = 'created_at';
            }

            if (!in_array($sortOrder, ['asc', 'desc'])) {
                $sortOrder = 'desc';
            }

            $query->orderBy($sortBy, $sortOrder);

            // Pagination
            $perPage = min((int)$request->get('perPage', 10), 100);
            $guestConsultations = $query->paginate($perPage)->withQueryString();

            // PERBAIKAN: Transform collection untuk memastikan tipe data yang benar
            $guestConsultations->getCollection()->transform(function ($consultation) {
                // Pastikan nilai_cf selalu float dan tidak null
                $consultation->nilai_cf = floatval($consultation->nilai_cf ?? 0);

                // Pastikan umur selalu integer
                $consultation->umur = intval($consultation->umur ?? 0);

                // Pastikan string fields tidak null
                $consultation->nama = $consultation->nama ?? 'Unknown';
                $consultation->email = $consultation->email ?? '';
                $consultation->nim = $consultation->nim ?? '';
                $consultation->fakultas = $consultation->fakultas ?? '';
                $consultation->program_studi = $consultation->program_studi ?? '';
                $consultation->jenis_kelamin = $consultation->jenis_kelamin ?? 'L';
                $consultation->hasil_diagnosa = $consultation->hasil_diagnosa ?? '';
                $consultation->tingkat_keparahan = $consultation->tingkat_keparahan ?? 'Minimal (Normal)';

                return $consultation;
            });

            // Statistics dengan safe calculations
            $totalKonsultasi = GuestConsultation::count();
            $konsultasiHariIni = GuestConsultation::whereDate('created_at', Carbon::today())->count();
            $konsultasiBulanIni = GuestConsultation::whereMonth('created_at', Carbon::now()->month)
                                                  ->whereYear('created_at', Carbon::now()->year)
                                                  ->count();

            // Safe CF statistics dengan handling null values
            $cfStats = GuestConsultation::selectRaw('
                AVG(COALESCE(nilai_cf, 0)) as avg_cf,
                MAX(COALESCE(nilai_cf, 0)) as max_cf,
                MIN(COALESCE(nilai_cf, 0)) as min_cf
            ')->first();

            $rataRataCf = floatval($cfStats->avg_cf ?? 0);
            $cfTertinggi = floatval($cfStats->max_cf ?? 0);
            $cfTerendah = floatval($cfStats->min_cf ?? 0);

            // Tingkat keparahan distribution dengan handling
            $tingkatKeparahanCounts = GuestConsultation::select('tingkat_keparahan', DB::raw('COUNT(*) as total'))
                                                      ->whereNotNull('tingkat_keparahan')
                                                      ->groupBy('tingkat_keparahan')
                                                      ->pluck('total', 'tingkat_keparahan')
                                                      ->toArray();

            Log::info('Guest consultation tingkat keparahan raw data', $tingkatKeparahanCounts);

            // Normalize tingkat keparahan data dengan default 0
            $normalizedTingkatKeparahan = [
                'normal' => intval($tingkatKeparahanCounts['Minimal (Normal)'] ??
                           $tingkatKeparahanCounts['minimal'] ??
                           $tingkatKeparahanCounts['normal'] ?? 0),

                'ringan' => intval($tingkatKeparahanCounts['Ringan (Mild Depression)'] ??
                           $tingkatKeparahanCounts['ringan'] ?? 0),

                'sedang' => intval($tingkatKeparahanCounts['Sedang (Moderate Depression)'] ??
                           $tingkatKeparahanCounts['sedang'] ?? 0),

                'berat' => intval($tingkatKeparahanCounts['Berat (Severe Depression)'] ??
                          $tingkatKeparahanCounts['berat'] ?? 0),
            ];

            // Faculty distribution dengan handling null
            $fakultasDistribution = GuestConsultation::select('fakultas', DB::raw('COUNT(*) as total'))
                                                    ->whereNotNull('fakultas')
                                                    ->where('fakultas', '!=', '')
                                                    ->groupBy('fakultas')
                                                    ->pluck('total', 'fakultas')
                                                    ->toArray();

            // Safe statistics array
            $statistics = [
                'totalKonsultasi' => intval($totalKonsultasi),
                'konsultasiHariIni' => intval($konsultasiHariIni),
                'konsultasiBulanIni' => intval($konsultasiBulanIni),
                'rataRataCf' => round($rataRataCf, 3),
                'cfTertinggi' => round($cfTertinggi, 3),
                'cfTerendah' => round($cfTerendah, 3),
                'tingkatKeparahan' => $normalizedTingkatKeparahan,
                'fakultasDistribution' => $fakultasDistribution,
            ];

            // List fakultas untuk filter
            $fakultasList = GuestConsultation::select('fakultas')
                                            ->distinct()
                                            ->whereNotNull('fakultas')
                                            ->where('fakultas', '!=', '')
                                            ->orderBy('fakultas')
                                            ->pluck('fakultas')
                                            ->filter()
                                            ->values()
                                            ->toArray();

            // List tingkat keparahan untuk filter
            $tingkatKeparahanList = GuestConsultation::select('tingkat_keparahan')
                                                    ->distinct()
                                                    ->whereNotNull('tingkat_keparahan')
                                                    ->where('tingkat_keparahan', '!=', '')
                                                    ->orderBy('tingkat_keparahan')
                                                    ->pluck('tingkat_keparahan')
                                                    ->filter()
                                                    ->values()
                                                    ->toArray();

            $filters = [
                'search' => $request->get('search', ''),
                'perPage' => $request->get('perPage', '10'),
                'sortBy' => $sortBy,
                'sortOrder' => $sortOrder,
                'tingkat_keparahan' => $request->get('tingkat_keparahan', ''),
                'fakultas' => $request->get('fakultas', ''),
                'jenis_kelamin' => $request->get('jenis_kelamin', ''),
                'tanggal_dari' => $request->get('tanggal_dari', ''),
                'tanggal_sampai' => $request->get('tanggal_sampai', ''),
            ];

            Log::info('Admin GuestConsultation index loaded', [
                'total' => $totalKonsultasi,
                'statistics' => $statistics,
                'current_page' => $guestConsultations->currentPage(),
                'per_page' => $perPage
            ]);

            return Inertia::render('admin/GuestConsultation/Index', [
                'guestConsultations' => $guestConsultations,
                'statistics' => $statistics,
                'fakultasList' => $fakultasList,
                'tingkatKeparahanList' => $tingkatKeparahanList,
                'filters' => $filters,
            ]);

        } catch (\Exception $e) {
            Log::error('Error in Admin GuestConsultation index', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);

            return redirect()->back()->with('error', 'Terjadi kesalahan saat memuat data: ' . $e->getMessage());
        }
    }

    /**
     * Display the specified resource
     */
    public function show($id)
    {
        try {
            $guestConsultation = GuestConsultation::with(['diagnosa'])
                                                ->findOrFail($id);

            Log::info('Admin GuestConsultation show - loaded', [
                'id' => $id,
                'nama' => $guestConsultation->nama ?? 'Unknown'
            ]);

            // Parse detail dan load gejala_terpilih
            $detail = [];
            if ($guestConsultation->detail) {
                $detail = is_string($guestConsultation->detail) ?
                    json_decode($guestConsultation->detail, true) :
                    $guestConsultation->detail;
            }

            // Parse gejala_dipilih
            $gejalaData = [];
            if ($guestConsultation->gejala_dipilih) {
                $gejalaData = is_string($guestConsultation->gejala_dipilih) ?
                    json_decode($guestConsultation->gejala_dipilih, true) :
                    $guestConsultation->gejala_dipilih;
            }

            // LOAD DATA GEJALA TERPILIH dengan safe handling
            $gejalaTerpilih = [];
            if (is_array($gejalaData)) {
                foreach ($gejalaData as $jawaban) {
                    $gejala = Gejala::find($jawaban['id_gejala'] ?? 0);
                    if ($gejala) {
                        $opsiJawaban = $gejala->opsi_jawaban ?? [];
                        $opsiTerpilih = null;

                        // Get selected option dengan safe handling
                        if (isset($jawaban['opsi_terpilih']) && isset($opsiJawaban[$jawaban['opsi_terpilih']])) {
                            $opsiTerpilih = $opsiJawaban[$jawaban['opsi_terpilih']];
                        }

                        $gejalaTerpilih[] = [
                            'id_gejala' => $gejala->id_gejala,
                            'kode_gejala' => $gejala->kode_gejala ?? '',
                            'nama_gejala' => $gejala->nama_gejala ?? 'Unknown',
                            'kategori_gejala' => $gejala->kategori_gejala ?? '',
                            'jawaban' => $opsiTerpilih['text'] ?? 'Tidak diketahui',
                            'nilai_cf' => floatval($opsiTerpilih['bobot'] ?? 0),
                            'deskripsi' => $gejala->deskripsi_gejala ?? null,
                        ];
                    }
                }
            }

            // PERBAIKAN: LOAD DETAIL DIAGNOSA dari relasi dengan proper handling
            $detailDiagnosa = null;
            if ($guestConsultation->diagnosa) {
                // Gunakan data dari relasi diagnosa yang sudah di-load
                $diagnosa = $guestConsultation->diagnosa;
                $detailDiagnosa = [
                    'id_diagnosa' => $diagnosa->id_diagnosa,
                    'kode_diagnosa' => $diagnosa->kode_diagnosa ?? 'N/A',
                    'nama_diagnosa' => $diagnosa->nama_diagnosa ?? 'Unknown',
                    'deskripsi' => $diagnosa->deskripsi_diagnosa ?? 'Deskripsi tidak tersedia',
                    'nilai_cf' => floatval($diagnosa->nilai_cf ?? $guestConsultation->nilai_cf ?? 0),
                    'rekomendasi' => $diagnosa->rekomendasi ?? $guestConsultation->rekomendasi ?? 'Tidak ada rekomendasi',
                ];
            } elseif ($guestConsultation->id_diagnosa) {
                // Fallback: jika relasi tidak ada, load manual
                $diagnosa = Diagnosa::find($guestConsultation->id_diagnosa);
                if ($diagnosa) {
                    $detailDiagnosa = [
                        'id_diagnosa' => $diagnosa->id_diagnosa,
                        'kode_diagnosa' => $diagnosa->kode_diagnosa ?? 'N/A',
                        'nama_diagnosa' => $diagnosa->nama_diagnosa ?? 'Unknown',
                        'deskripsi' => $diagnosa->deskripsi_diagnosa ?? 'Deskripsi tidak tersedia',
                        'nilai_cf' => floatval($diagnosa->nilai_cf ?? $guestConsultation->nilai_cf ?? 0),
                        'rekomendasi' => $diagnosa->rekomendasi ?? $guestConsultation->rekomendasi ?? 'Tidak ada rekomendasi',
                    ];
                }
            }

            // Parse rekomendasi dengan safe handling
            $rekomendasi = [];
            if ($guestConsultation->rekomendasi) {
                $rekomendasi = is_string($guestConsultation->rekomendasi) ?
                    json_decode($guestConsultation->rekomendasi, true) :
                    $guestConsultation->rekomendasi;
            }

            // STRUKTUR DATA YANG KONSISTEN DAN LENGKAP dengan safe values
            $consultationData = [
                'id_guestconsultation' => $guestConsultation->id_guestconsultation,
                'session_id' => $guestConsultation->session_id ?? '',
                'tanggal_konsultasi' => $guestConsultation->created_at,
                'hasil_diagnosa' => $guestConsultation->hasil_diagnosa ?? 'Unknown',
                'tingkat_keparahan' => $guestConsultation->tingkat_keparahan ?? 'Minimal (Normal)',
                'nilai_cf' => floatval($guestConsultation->nilai_cf ?? 0),
                'rekomendasi' => $rekomendasi,
                'created_at' => $guestConsultation->created_at,
                'updated_at' => $guestConsultation->updated_at,
                'guest_info' => [
                    'nama' => $guestConsultation->nama ?? 'Unknown',
                    'email' => $guestConsultation->email ?? '',
                    'nim' => $guestConsultation->nim ?? '',
                    'fakultas' => $guestConsultation->fakultas ?? 'Tidak diketahui',
                    'program_studi' => $guestConsultation->program_studi ?? 'Tidak diketahui',
                    'umur' => intval($guestConsultation->umur ?? 0),
                    'jenis_kelamin' => $guestConsultation->jenis_kelamin ?? 'L',
                ],
                'gejala_terpilih' => $gejalaTerpilih,
                'detail_diagnosa' => $detailDiagnosa,
            ];

            Log::info('Admin GuestConsultation show data prepared', [
                'id' => $id,
                'gejala_count' => count($gejalaTerpilih),
                'has_detail_diagnosa' => !empty($consultationData['detail_diagnosa']),
                'diagnosa_from_relation' => $guestConsultation->diagnosa ? 'YES' : 'NO',
                'diagnosa_id' => $guestConsultation->id_diagnosa,
                'diagnosa_name' => $detailDiagnosa['nama_diagnosa'] ?? 'N/A',
                'tingkat_keparahan' => $guestConsultation->tingkat_keparahan,
                'nilai_cf' => floatval($guestConsultation->nilai_cf ?? 0)
            ]);

            return Inertia::render('admin/GuestConsultation/Show', [
                'guestConsultation' => $consultationData,
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            Log::warning('GuestConsultation not found', ['id' => $id]);
            return redirect()->route('admin.guest-consultation.index')
                        ->with('error', 'Data konsultasi tidak ditemukan.');
        } catch (\Exception $e) {
            Log::error('Error in Admin GuestConsultation show', [
                'id' => $id,
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->route('admin.guest-consultation.index')
                        ->with('error', 'Terjadi kesalahan saat memuat data: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage
     */
    public function destroy($id)
    {
        try {
            $guestConsultation = GuestConsultation::findOrFail($id);

            Log::info('Deleting GuestConsultation', [
                'id' => $id,
                'nama' => $guestConsultation->nama ?? 'Unknown'
            ]);

            $guestConsultation->delete();

            return redirect()->route('admin.guest-consultation.index')
                           ->with('success', 'Data konsultasi guest berhasil dihapus.');
        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return redirect()->route('admin.guest-consultation.index')
                           ->with('error', 'Data konsultasi tidak ditemukan.');
        } catch (\Exception $e) {
            Log::error('Error deleting GuestConsultation', [
                'id' => $id,
                'error' => $e->getMessage()
            ]);
            return redirect()->route('admin.guest-consultation.index')
                           ->with('error', 'Gagal menghapus data konsultasi.');
        }
    }

    /**
     * Generate report dengan safe calculations
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

            Log::info('Guest consultation report date range', [
                'start_date_input' => $startDate,
                'end_date_input' => $endDate,
                'start_date_parsed' => $startDateParsed->format('Y-m-d H:i:s'),
                'end_date_parsed' => $endDateParsed->format('Y-m-d H:i:s')
            ]);

            $guestConsultations = GuestConsultation::with(['diagnosa'])
                                                  ->whereBetween('created_at', [$startDateParsed, $endDateParsed])
                                                  ->orderBy('created_at', 'desc')
                                                  ->get();

            // Transform dengan safe values
            $guestConsultations->transform(function ($consultation) {
                $consultation->nilai_cf = floatval($consultation->nilai_cf ?? 0);
                $consultation->umur = intval($consultation->umur ?? 0);
                return $consultation;
            });

            // Safe calculations dengan handling empty collection
            $totalKonsultasi = $guestConsultations->count();

            $rataRataCf = $totalKonsultasi > 0 ?
                round($guestConsultations->avg('nilai_cf'), 3) : 0;

            $cfTertinggi = $totalKonsultasi > 0 ?
                round($guestConsultations->max('nilai_cf'), 3) : 0;

            $cfTerendah = $totalKonsultasi > 0 ?
                round($guestConsultations->min('nilai_cf'), 3) : 0;

            $stats = [
                'total_konsultasi' => $totalKonsultasi,
                'rata_rata_cf' => $rataRataCf,
                'cf_tertinggi' => $cfTertinggi,
                'cf_terendah' => $cfTerendah,
                'diagnosa_per_kategori' => $guestConsultations->groupBy('hasil_diagnosa')->map->count()->toArray(),
                'tingkat_keparahan' => $guestConsultations->groupBy('tingkat_keparahan')->map->count()->toArray(),
                'konsultasi_per_bulan' => $guestConsultations->groupBy(function($item) {
                    return Carbon::parse($item->created_at)->format('Y-m');
                })->map->count()->toArray(),
                'fakultas_distribution' => $guestConsultations->groupBy('fakultas')->map->count()->toArray(),
                'jenis_kelamin_distribution' => $guestConsultations->groupBy('jenis_kelamin')->map->count()->toArray(),
                'umur_rata_rata' => $totalKonsultasi > 0 ?
                    round($guestConsultations->avg('umur'), 1) : 0,
            ];

            Log::info('Guest consultation report generated', [
                'total_records' => $totalKonsultasi,
                'period' => "{$startDate} to {$endDate}",
            ]);

            return Inertia::render('admin/GuestConsultation/Report', [
                'guestConsultations' => $guestConsultations,
                'stats' => $stats,
                'period' => [
                    'start' => $startDate,
                    'end' => $endDate,
                ],
            ]);

        } catch (\Exception $e) {
            Log::error('Error generating guest consultation report', [
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
     * Export to Excel dengan error handling
     */
    public function export(Request $request)
    {
        try {
            $startDate = $request->get('tanggal_dari');
            $endDate = $request->get('tanggal_sampai');

            Log::info('Export Guest Consultation Excel request', [
                'tanggal_dari' => $startDate,
                'tanggal_sampai' => $endDate,
                'all_params' => $request->all()
            ]);

            // Validasi tanggal dengan error handling
            if ($startDate && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $startDate)) {
                return redirect()->back()->with('error', 'Format tanggal mulai tidak valid. Gunakan format YYYY-MM-DD');
            }

            if ($endDate && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $endDate)) {
                return redirect()->back()->with('error', 'Format tanggal selesai tidak valid. Gunakan format YYYY-MM-DD');
            }

            $filename = 'konsultasi-guest-' . Carbon::now()->format('Y-m-d-H-i-s') . '.xlsx';

            Log::info('Starting Guest Consultation Excel export', [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'filename' => $filename
            ]);

            return Excel::download(
                new GuestConsultationExport($startDate, $endDate),
                $filename
            );

        } catch (\Exception $e) {
            Log::error('Error exporting guest consultation to Excel', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'start_date' => $request->get('tanggal_dari'),
                'end_date' => $request->get('tanggal_sampai')
            ]);

            return redirect()->back()->with('error', 'Gagal export ke Excel: ' . $e->getMessage());
        }
    }

    /**
     * Export to PDF dengan safe handling
     */
    public function exportPdf(Request $request)
    {
        try {
            // Validasi input dengan logging
            $startDate = $request->get('tanggal_dari');
            $endDate = $request->get('tanggal_sampai');

            Log::info('PDF Export Request Received', [
                'tanggal_dari' => $startDate,
                'tanggal_sampai' => $endDate,
                'all_params' => $request->all()
            ]);

            // Validasi dan default tanggal
            if (!$startDate || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $startDate)) {
                $startDate = Carbon::now()->startOfMonth()->format('Y-m-d');
                Log::warning('Invalid start date, using default', ['start_date' => $startDate]);
            }

            if (!$endDate || !preg_match('/^\d{4}-\d{2}-\d{2}$/', $endDate)) {
                $endDate = Carbon::now()->endOfMonth()->format('Y-m-d');
                Log::warning('Invalid end date, using default', ['end_date' => $endDate]);
            }

            $startDateParsed = Carbon::createFromFormat('Y-m-d', $startDate)->startOfDay();
            $endDateParsed = Carbon::createFromFormat('Y-m-d', $endDate)->endOfDay();

            // Query data
            $guestConsultations = GuestConsultation::with(['diagnosa'])
                ->whereBetween('created_at', [$startDateParsed, $endDateParsed])
                ->orderBy('created_at', 'desc')
                ->get();

            Log::info('Query results', [
                'total_records' => $guestConsultations->count(),
                'start' => $startDateParsed->format('Y-m-d H:i:s'),
                'end' => $endDateParsed->format('Y-m-d H:i:s')
            ]);

            // Transform dengan safe values
            $guestConsultations->transform(function ($consultation) {
                $consultation->nilai_cf = floatval($consultation->nilai_cf ?? 0);
                $consultation->umur = intval($consultation->umur ?? 0);
                return $consultation;
            });

            $totalKonsultasi = $guestConsultations->count();
            $rataRataCf = $totalKonsultasi > 0 ? round($guestConsultations->avg('nilai_cf'), 3) : 0;

            $stats = [
                'total_konsultasi' => $totalKonsultasi,
                'rata_rata_cf' => $rataRataCf,
                'cf_tertinggi' => $totalKonsultasi > 0 ? round($guestConsultations->max('nilai_cf'), 3) : 0,
                'cf_terendah' => $totalKonsultasi > 0 ? round($guestConsultations->min('nilai_cf'), 3) : 0,
                'fakultas_distribution' => $guestConsultations->groupBy('fakultas')->map->count()->toArray(),
                'tingkat_keparahan' => $guestConsultations->groupBy('tingkat_keparahan')->map->count()->toArray(),
                'jenis_kelamin_distribution' => $guestConsultations->groupBy('jenis_kelamin')->map->count()->toArray(),
                'umur_rata_rata' => $totalKonsultasi > 0 ? round($guestConsultations->avg('umur'), 1) : 0,
            ];

            // Check if view exists
            $viewPath = resource_path('views/exports/guest-consultation-pdf.blade.php');
            if (!file_exists($viewPath)) {
                Log::error('PDF view not found', ['path' => $viewPath]);
                return redirect()->back()->with('error', 'Template PDF tidak ditemukan. Silakan hubungi administrator.');
            }

            // Generate PDF
            $pdf = Pdf::loadView('exports.guest-consultation-pdf', [
                'guestConsultations' => $guestConsultations,
                'stats' => $stats,
                'period' => [
                    'start' => $startDate,
                    'end' => $endDate,
                ],
                'generated_at' => Carbon::now(),
            ])
            ->setPaper('a4', 'portrait')
            ->setOption('margin-top', '10mm')
            ->setOption('margin-right', '10mm')
            ->setOption('margin-bottom', '10mm')
            ->setOption('margin-left', '10mm')
            ->setOption('enable-local-file-access', true);

            $filename = 'laporan-konsultasi-guest-' . $startDate . '-sampai-' . $endDate . '.pdf';

            Log::info('PDF generated successfully', [
                'filename' => $filename,
                'total_records' => $totalKonsultasi,
                'file_size' => strlen($pdf->output())
            ]);

            // Check if this is a print request
            if ($request->get('action') === 'print') {
                return response($pdf->output(), 200)
                    ->header('Content-Type', 'application/pdf')
                    ->header('Content-Disposition', 'inline; filename="' . $filename . '"');
            }

            // Force download
            return response($pdf->output(), 200)
                ->header('Content-Type', 'application/pdf')
                ->header('Content-Disposition', 'attachment; filename="' . $filename . '"')
                ->header('Cache-Control', 'no-cache, no-store, must-revalidate')
                ->header('Pragma', 'no-cache')
                ->header('Expires', '0');

        } catch (\Exception $e) {
            Log::error('Error exporting guest consultation to PDF', [
                'error' => $e->getMessage(),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString(),
                'start_date' => $request->get('tanggal_dari'),
                'end_date' => $request->get('tanggal_sampai')
            ]);

            return redirect()->back()->with('error', 'Gagal export ke PDF: ' . $e->getMessage());
        }
    }

    /**
     * Get analytics data for charts dengan safe calculations
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

            // Safe query dengan handling null values
            $konsultasiTrend = GuestConsultation::select(
                    DB::raw('DATE(created_at) as date'),
                    DB::raw('COUNT(*) as total')
                )
                ->where('created_at', '>=', $startDate)
                ->groupBy('date')
                ->orderBy('date')
                ->get()
                ->map(function ($item) {
                    return [
                        'date' => $item->date,
                        'total' => intval($item->total ?? 0)
                    ];
                });

            $fakultasDistribution = GuestConsultation::select('fakultas', DB::raw('COUNT(*) as total'))
                ->where('created_at', '>=', $startDate)
                ->whereNotNull('fakultas')
                ->where('fakultas', '!=', '')
                ->groupBy('fakultas')
                ->orderBy('total', 'desc')
                ->get()
                ->map(function ($item) {
                    return [
                        'fakultas' => $item->fakultas ?? 'Unknown',
                        'total' => intval($item->total ?? 0)
                    ];
                });

            // CF trend dengan safe calculations
            $cfTrend = GuestConsultation::select(
                    DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
                    DB::raw('AVG(COALESCE(nilai_cf, 0)) as avg_cf'),
                    DB::raw('COUNT(*) as total_konsultasi')
                )
                ->where('created_at', '>=', $startDate)
                ->groupBy('month')
                ->orderBy('month')
                ->get()
                ->map(function ($item) {
                    return [
                        'month' => $item->month,
                        'avg_cf' => round(floatval($item->avg_cf ?? 0), 3),
                        'total_konsultasi' => intval($item->total_konsultasi ?? 0)
                    ];
                });

            $severityTrend = GuestConsultation::select(
                    'tingkat_keparahan',
                    DB::raw('COUNT(*) as total')
                )
                ->where('created_at', '>=', $startDate)
                ->whereNotNull('tingkat_keparahan')
                ->where('tingkat_keparahan', '!=', '')
                ->groupBy('tingkat_keparahan')
                ->orderBy('total', 'desc')
                ->get()
                ->map(function ($item) {
                    return [
                        'tingkat_keparahan' => $item->tingkat_keparahan ?? 'Unknown',
                        'total' => intval($item->total ?? 0)
                    ];
                });

            return response()->json([
                'konsultasi_trend' => $konsultasiTrend,
                'fakultas_distribution' => $fakultasDistribution,
                'cf_trend' => $cfTrend,
                'severity_trend' => $severityTrend,
                'period_info' => [
                    'start_date' => $startDate->format('Y-m-d'),
                    'end_date' => Carbon::now()->format('Y-m-d'),
                    'period' => $period
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Error getting guest consultation analytics data', [
                'error' => $e->getMessage(),
                'period' => $request->get('period')
            ]);

            return response()->json([
                'error' => 'Gagal memuat data analytics: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Bulk delete multiple consultations
     */
    public function bulkDelete(Request $request)
    {
        try {
            $ids = $request->get('ids', []);

            if (empty($ids) || !is_array($ids)) {
                return redirect()->back()->with('error', 'Tidak ada data yang dipilih untuk dihapus.');
            }

            $deleted = GuestConsultation::whereIn('id_guestconsultation', $ids)->delete();

            Log::info('Bulk delete guest consultations', [
                'ids' => $ids,
                'deleted_count' => $deleted
            ]);

            return redirect()->route('admin.guest-consultation.index')
                           ->with('success', "Berhasil menghapus {$deleted} data konsultasi guest.");

        } catch (\Exception $e) {
            Log::error('Error bulk deleting guest consultations', [
                'error' => $e->getMessage(),
                'ids' => $request->get('ids', [])
            ]);

            return redirect()->back()->with('error', 'Gagal menghapus data: ' . $e->getMessage());
        }
    }

    /**
     * Cleanup old guest consultations
     */
    public function cleanup(Request $request)
    {
        try {
            $days = intval($request->get('days', 30));

            if ($days < 7) {
                return redirect()->back()->with('error', 'Minimal 7 hari untuk cleanup data.');
            }

            $deletedCount = GuestConsultation::where('created_at', '<', Carbon::now()->subDays($days))
                                           ->delete();

            Log::info('Guest consultation cleanup completed', [
                'days' => $days,
                'deleted_count' => $deletedCount
            ]);

            return redirect()->back()->with('success', "Berhasil menghapus {$deletedCount} data konsultasi guest yang lebih dari {$days} hari.");

        } catch (\Exception $e) {
            Log::error('Error cleaning up guest consultations', [
                'error' => $e->getMessage(),
                'days' => $request->get('days')
            ]);

            return redirect()->back()->with('error', 'Gagal cleanup data: ' . $e->getMessage());
        }
    }

    /**
     * Get summary statistics untuk dashboard
     */
    public function getSummary()
    {
        try {
            $today = Carbon::today();
            $thisWeek = Carbon::now()->startOfWeek();
            $thisMonth = Carbon::now()->startOfMonth();

            $summary = [
                'total_all_time' => GuestConsultation::count(),
                'total_today' => GuestConsultation::whereDate('created_at', $today)->count(),
                'total_this_week' => GuestConsultation::where('created_at', '>=', $thisWeek)->count(),
                'total_this_month' => GuestConsultation::where('created_at', '>=', $thisMonth)->count(),
                'avg_cf_this_month' => round(
                    floatval(GuestConsultation::where('created_at', '>=', $thisMonth)->avg('nilai_cf') ?? 0),
                    3
                ),
                'severity_distribution' => GuestConsultation::select('tingkat_keparahan', DB::raw('COUNT(*) as total'))
                    ->whereNotNull('tingkat_keparahan')
                    ->groupBy('tingkat_keparahan')
                    ->pluck('total', 'tingkat_keparahan')
                    ->toArray(),
                'top_faculties' => GuestConsultation::select('fakultas', DB::raw('COUNT(*) as total'))
                    ->whereNotNull('fakultas')
                    ->where('fakultas', '!=', '')
                    ->groupBy('fakultas')
                    ->orderBy('total', 'desc')
                    ->limit(5)
                    ->pluck('total', 'fakultas')
                    ->toArray(),
            ];

            return response()->json($summary);

        } catch (\Exception $e) {
            Log::error('Error getting guest consultation summary', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'error' => 'Gagal memuat summary: ' . $e->getMessage()
            ], 500);
        }
    }

    //BDI-II
    /**
     * Halaman analisis BDI-II untuk keperluan penelitian admin.
     * Menghitung ulang skor BDI-II dari data jawaban yang sudah tersimpan
     * di kolom gejala_dipilih (opsi_terpilih 0–3 = skor BDI per item).
     */
    public function bdiAnalysis(Request $request)
    {
        try {
            $query = GuestConsultation::with(['diagnosa']);

            // Filter tanggal
            if ($request->filled('tanggal_dari')) {
                $query->whereDate('created_at', '>=', $request->tanggal_dari);
            }
            if ($request->filled('tanggal_sampai')) {
                $query->whereDate('created_at', '<=', $request->tanggal_sampai);
            }

            // Filter fakultas
            if ($request->filled('fakultas')) {
                $query->where('fakultas', $request->fakultas);
            }

            // Filter jenis kelamin
            if ($request->filled('jenis_kelamin')) {
                $query->where('jenis_kelamin', $request->jenis_kelamin);
            }

            // Filter kategori BDI (diproses setelah kalkulasi, jadi ambil semua dulu)
            $allConsultations = $query->orderBy('created_at', 'desc')->get();

            // Hitung skor BDI-II untuk setiap konsultasi
            $consultationsWithBdi = $allConsultations->map(function ($consultation) {
                $gejalaData = $consultation->gejala_dipilih;

                if (is_string($gejalaData)) {
                    $gejalaData = json_decode($gejalaData, true);
                }

                $skorBdi = 0;
                $totalItem = 0;

                if (is_array($gejalaData)) {
                    foreach ($gejalaData as $jawaban) {
                        // opsi_terpilih adalah index 0,1,2,3 — langsung jadi skor BDI per item
                        $opsi = intval($jawaban['opsi_terpilih'] ?? 0);
                        $skorBdi += $opsi;
                        $totalItem++;
                    }
                }

                $kategoriBdi = $this->kategoriBdi($skorBdi);

                return [
                    'id'              => $consultation->id_guestconsultation,
                    'nama'            => $consultation->nama ?? 'Unknown',
                    'nim'             => $consultation->nim ?? '',
                    'email'           => $consultation->email ?? '',
                    'fakultas'        => $consultation->fakultas ?? '',
                    'program_studi'   => $consultation->program_studi ?? '',
                    'umur'            => intval($consultation->umur ?? 0),
                    'jenis_kelamin'   => $consultation->jenis_kelamin ?? 'L',
                    'tanggal'         => $consultation->created_at,
                    // Skor CF (existing)
                    'nilai_cf'        => round(floatval($consultation->nilai_cf ?? 0), 4),
                    'cf_percentage'   => round(floatval($consultation->nilai_cf ?? 0) * 100, 2),
                    'kategori_cf'     => $consultation->tingkat_keparahan ?? '',
                    // Skor BDI-II (baru)
                    'skor_bdi'        => $skorBdi,
                    'kategori_bdi'    => $kategoriBdi['label'],
                    'kategori_bdi_en' => $kategoriBdi['key'],
                    'total_item'      => $totalItem,
                ];
            });

            // Filter kategori BDI setelah kalkulasi jika diminta
            if ($request->filled('kategori_bdi')) {
                $consultationsWithBdi = $consultationsWithBdi->filter(
                    fn($c) => $c['kategori_bdi_en'] === $request->kategori_bdi
                )->values();
            }

            // Statistik ringkasan BDI-II
            $total = $consultationsWithBdi->count();

            $distribusiBdi = [
                'minimal' => $consultationsWithBdi->where('kategori_bdi_en', 'minimal')->count(),
                'ringan'  => $consultationsWithBdi->where('kategori_bdi_en', 'ringan')->count(),
                'sedang'  => $consultationsWithBdi->where('kategori_bdi_en', 'sedang')->count(),
                'berat'   => $consultationsWithBdi->where('kategori_bdi_en', 'berat')->count(),
            ];

            $skorBdiValues = $consultationsWithBdi->pluck('skor_bdi');

            $statistikBdi = [
                'total'          => $total,
                'rata_rata'      => $total > 0 ? round($skorBdiValues->avg(), 2) : 0,
                'tertinggi'      => $total > 0 ? $skorBdiValues->max() : 0,
                'terendah'       => $total > 0 ? $skorBdiValues->min() : 0,
                'distribusi'     => $distribusiBdi,
            ];

            // Perbandingan CF vs BDI (untuk keperluan analisis penelitian)
            $perbandingan = $consultationsWithBdi->map(fn($c) => [
                'cf_kategori'  => $this->normalizeCfKategori($c['kategori_cf']),
                'bdi_kategori' => $c['kategori_bdi_en'],
                'sesuai'       => $this->isCfBdiConsistent(
                    $this->normalizeCfKategori($c['kategori_cf']),
                    $c['kategori_bdi_en']
                ),
            ]);

            $totalSesuai = $perbandingan->where('sesuai', true)->count();
            $tingkatKesesuaian = $total > 0 ? round(($totalSesuai / $total) * 100, 2) : 0;

            // Fakultas untuk filter dropdown
            $fakultasList = GuestConsultation::select('fakultas')
                ->distinct()
                ->whereNotNull('fakultas')
                ->where('fakultas', '!=', '')
                ->orderBy('fakultas')
                ->pluck('fakultas')
                ->values()
                ->toArray();

            $filters = [
                'tanggal_dari'  => $request->get('tanggal_dari', ''),
                'tanggal_sampai'=> $request->get('tanggal_sampai', ''),
                'fakultas'      => $request->get('fakultas', ''),
                'jenis_kelamin' => $request->get('jenis_kelamin', ''),
                'kategori_bdi'  => $request->get('kategori_bdi', ''),
            ];

            Log::info('BDI Analysis loaded', [
                'total'            => $total,
                'tingkat_kesesuaian' => $tingkatKesesuaian,
            ]);

            return Inertia::render('admin/GuestConsultation/BdiAnalysis', [
                'consultations'      => $consultationsWithBdi->values(),
                'statistikBdi'       => $statistikBdi,
                'tingkatKesesuaian'  => $tingkatKesesuaian,
                'totalSesuai'        => $totalSesuai,
                'fakultasList'       => $fakultasList,
                'filters'            => $filters,
            ]);

        } catch (\Exception $e) {
            Log::error('Error in BDI Analysis', [
                'error' => $e->getMessage(),
                'file'  => $e->getFile(),
                'line'  => $e->getLine(),
            ]);
            return redirect()->back()->with('error', 'Gagal memuat analisis BDI-II: ' . $e->getMessage());
        }
    }


    // =========================================================================
    // PRIVATE HELPERS — BDI-II
    // =========================================================================

    /**
     * Kategorikan skor BDI-II berdasarkan threshold standar Beck (1996).
     *
     * 0–13  : Minimal
     * 14–19 : Ringan (Mild)
     * 20–28 : Sedang (Moderate)
     * 29–63 : Berat (Severe)
     */
    private function kategoriBdi(int $skor): array
    {
        if ($skor <= 13) {
            return ['key' => 'minimal', 'label' => 'Minimal (0–13)'];
        } elseif ($skor <= 19) {
            return ['key' => 'ringan',  'label' => 'Ringan / Mild (14–19)'];
        } elseif ($skor <= 28) {
            return ['key' => 'sedang',  'label' => 'Sedang / Moderate (20–28)'];
        } else {
            return ['key' => 'berat',   'label' => 'Berat / Severe (29–63)'];
        }
    }

    /**
     * Normalisasi nama tingkat keparahan CF ke key yang konsisten.
     */
    private function normalizeCfKategori(string $tingkat): string
    {
        $t = strtolower($tingkat);
        if (str_contains($t, 'berat') || str_contains($t, 'severe'))     return 'berat';
        if (str_contains($t, 'sedang') || str_contains($t, 'moderate'))  return 'sedang';
        if (str_contains($t, 'ringan') || str_contains($t, 'mild'))      return 'ringan';
        return 'minimal';
    }

    /**
     * Cek apakah kategori CF dan BDI-II konsisten (berada di level yang sama).
     * Berguna untuk analisis konkordansi kedua metode.
     */
    private function isCfBdiConsistent(string $cfKategori, string $bdiKategori): bool
    {
        return $cfKategori === $bdiKategori;
    }

}
