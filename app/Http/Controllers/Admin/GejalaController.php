<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Gejala;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class GejalaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Gejala::query();

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('kode_gejala', 'LIKE', "%{$search}%")
                  ->orWhere('nama_gejala', 'LIKE', "%{$search}%");
            });
        }

        // Filter by CF range
        if ($request->has('min_cf') && $request->min_cf !== null) {
            $query->where('nilai_cf', '>=', $request->min_cf);
        }

        if ($request->has('max_cf') && $request->max_cf !== null) {
            $query->where('nilai_cf', '<=', $request->max_cf);
        }

        // Sorting
        $sortBy = $request->get('sortBy', 'kode_gejala');
        $sortOrder = $request->get('sortOrder', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        // Pagination
        $perPage = $request->get('perPage', 10);
        $gejalas = $query->paginate($perPage);

        return Inertia::render('admin/Gejala/Index', [
            'gejalas' => $gejalas,
            'filters' => [
                'search' => $request->get('search', ''),
                'perPage' => $request->get('perPage', '10'),
                'sortBy' => $sortBy,
                'sortOrder' => $sortOrder,
                'min_cf' => $request->get('min_cf', ''),
                'max_cf' => $request->get('max_cf', ''),
            ],
            'statistik' => Gejala::getStatistik(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('admin/Gejala/Create', [
            'kategoriOptions' => Gejala::getKategoriOptions(),
            'defaultOpsiJawaban' => Gejala::getDefaultOpsiJawaban(),
            'nilaiCfOptions' => Gejala::getNilaiCfOptions(),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        Log::info('Gejala store request:', $request->all());

        $validator = Validator::make($request->all(), [
            'kode_gejala' => 'required|string|max:10|unique:gejala,kode_gejala',
            'nama_gejala' => 'required|string|max:255',
            'deskripsi_gejala' => 'nullable|string',
            'kategori_gejala' => 'nullable|string|max:50',
            'opsi_jawaban' => 'required|array|size:4',
            'opsi_jawaban.*.text' => 'required|string|max:100',
            'opsi_jawaban.*.bobot' => 'required|numeric|min:0|max:1',
            'nilai_cf' => 'required|numeric|min:0|max:1',
        ], [
            'opsi_jawaban.required' => 'Opsi jawaban harus diisi',
            'opsi_jawaban.size' => 'Harus ada tepat 4 opsi jawaban',
            'opsi_jawaban.*.text.required' => 'Teks opsi jawaban harus diisi',
            'opsi_jawaban.*.bobot.required' => 'Bobot opsi jawaban harus diisi',
            'opsi_jawaban.*.bobot.min' => 'Bobot minimal 0',
            'opsi_jawaban.*.bobot.max' => 'Bobot maksimal 1',
            'nilai_cf.required' => 'Nilai CF harus diisi',
            'nilai_cf.min' => 'Nilai CF minimal 0',
            'nilai_cf.max' => 'Nilai CF maksimal 1',
        ]);

        if ($validator->fails()) {
            Log::warning('Gejala validation failed:', $validator->errors()->toArray());
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        try {
            DB::beginTransaction();

            // Validasi opsi jawaban
            $gejala = new Gejala();
            if (!$gejala->validateOpsiJawaban($request->opsi_jawaban)) {
                return redirect()->back()
                    ->with('error', 'Format opsi jawaban tidak valid')
                    ->withInput();
            }

            // Validasi nilai CF
            if (!$gejala->validateNilaiCf($request->nilai_cf)) {
                return redirect()->back()
                    ->with('error', 'Nilai CF harus berada dalam rentang 0.0 - 1.0')
                    ->withInput();
            }

            $gejala = Gejala::create([
                'kode_gejala' => strtoupper($request->kode_gejala),
                'nama_gejala' => $request->nama_gejala,
                'deskripsi_gejala' => $request->deskripsi_gejala,
                'kategori_gejala' => $request->kategori_gejala,
                'opsi_jawaban' => $request->opsi_jawaban,
                'nilai_cf' => $request->nilai_cf,
                'is_active' => true,
            ]);

            Log::info('Gejala created successfully:', [
                'id' => $gejala->id_gejala,
                'nilai_cf' => $gejala->nilai_cf
            ]);

            DB::commit();

            return redirect()->route('admin.gejala.index')
                ->with('success', 'Gejala berhasil ditambahkan dengan nilai CF: ' . $gejala->formatted_nilai_cf);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Gejala store error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()
                ->with('error', 'Terjadi kesalahan saat menyimpan data: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Gejala $gejala)
    {
        return Inertia::render('admin/Gejala/Show', [
            'gejala' => $gejala,
            'kategoriOptions' => Gejala::getKategoriOptions(),
            'nilaiCfOptions' => Gejala::getNilaiCfOptions(),
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Gejala $gejala)
    {
        return Inertia::render('admin/Gejala/Edit', [
            'gejala' => $gejala,
            'kategoriOptions' => Gejala::getKategoriOptions(),
            'nilaiCfOptions' => Gejala::getNilaiCfOptions(),
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Gejala $gejala)
    {
        Log::info('Gejala update request:', [
            'id' => $gejala->id_gejala,
            'data' => $request->all()
        ]);

        $validator = Validator::make($request->all(), [
            'kode_gejala' => 'required|string|max:10|unique:gejala,kode_gejala,' . $gejala->id_gejala . ',id_gejala',
            'nama_gejala' => 'required|string|max:255',
            'deskripsi_gejala' => 'nullable|string',
            'kategori_gejala' => 'nullable|string|max:50',
            'opsi_jawaban' => 'required|array|size:4',
            'opsi_jawaban.*.text' => 'required|string|max:100',
            'opsi_jawaban.*.bobot' => 'required|numeric|min:0|max:1',
            'nilai_cf' => 'required|numeric|min:0|max:1',
        ], [
            'opsi_jawaban.required' => 'Opsi jawaban harus diisi',
            'opsi_jawaban.size' => 'Harus ada tepat 4 opsi jawaban',
            'opsi_jawaban.*.text.required' => 'Teks opsi jawaban harus diisi',
            'opsi_jawaban.*.bobot.required' => 'Bobot opsi jawaban harus diisi',
            'opsi_jawaban.*.bobot.min' => 'Bobot minimal 0',
            'opsi_jawaban.*.bobot.max' => 'Bobot maksimal 1',
            'nilai_cf.required' => 'Nilai CF harus diisi',
            'nilai_cf.min' => 'Nilai CF minimal 0',
            'nilai_cf.max' => 'Nilai CF maksimal 1',
        ]);

        if ($validator->fails()) {
            Log::warning('Gejala update validation failed:', $validator->errors()->toArray());
            return redirect()->back()
                ->withErrors($validator)
                ->withInput();
        }

        try {
            DB::beginTransaction();

            // Validasi opsi jawaban
            if (!$gejala->validateOpsiJawaban($request->opsi_jawaban)) {
                return redirect()->back()
                    ->with('error', 'Format opsi jawaban tidak valid')
                    ->withInput();
            }

            // Validasi nilai CF
            if (!$gejala->validateNilaiCf($request->nilai_cf)) {
                return redirect()->back()
                    ->with('error', 'Nilai CF harus berada dalam rentang 0.0 - 1.0')
                    ->withInput();
            }

            $gejala->update([
                'kode_gejala' => strtoupper($request->kode_gejala),
                'nama_gejala' => $request->nama_gejala,
                'deskripsi_gejala' => $request->deskripsi_gejala,
                'kategori_gejala' => $request->kategori_gejala,
                'opsi_jawaban' => $request->opsi_jawaban,
                'nilai_cf' => $request->nilai_cf,
            ]);

            Log::info('Gejala updated successfully:', [
                'id' => $gejala->id_gejala,
                'nilai_cf' => $gejala->nilai_cf
            ]);

            DB::commit();

            return redirect()->route('admin.gejala.index')
                ->with('success', 'Gejala berhasil diperbarui dengan nilai CF: ' . $gejala->formatted_nilai_cf);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Gejala update error:', [
                'id' => $gejala->id_gejala,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->back()
                ->with('error', 'Terjadi kesalahan saat memperbarui data: ' . $e->getMessage())
                ->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($id)
    {
        try {
            DB::beginTransaction();

            $gejala = Gejala::findOrFail($id);

            Log::info('Hard deleting gejala:', ['id' => $gejala->id_gejala]);

            // HARD DELETE - menghapus permanent dari database
            $gejala->forceDelete();

            DB::commit();

            Log::info('Gejala hard deleted successfully:', ['id' => $id]);

            return redirect()->route('admin.gejala.index')
                ->with('success', 'Gejala berhasil dihapus permanen');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Gejala delete error:', [
                'id' => $id,
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return redirect()->route('admin.gejala.index')
                ->with('error', 'Terjadi kesalahan saat menghapus data: ' . $e->getMessage());
        }
    }

    /**
     * Search gejala for API/AJAX calls
     */
    public function search(Request $request)
    {
        $query = $request->get('q', '');
        $limit = $request->get('limit', 10);

        $gejala = Gejala::where(function ($q) use ($query) {
                $q->where('kode_gejala', 'LIKE', "%{$query}%")
                  ->orWhere('nama_gejala', 'LIKE', "%{$query}%");
            })
            ->select('id_gejala', 'kode_gejala', 'nama_gejala', 'opsi_jawaban', 'nilai_cf')
            ->limit($limit)
            ->get();

        return response()->json([
            'data' => $gejala->map(function ($item) {
                return [
                    'id_gejala' => $item->id_gejala,
                    'kode_gejala' => $item->kode_gejala,
                    'nama_gejala' => $item->nama_gejala,
                    'opsi_jawaban' => $item->opsi_jawaban,
                    'nilai_cf' => $item->nilai_cf,
                    'formatted_nilai_cf' => $item->formatted_nilai_cf,
                    'persentase_cf' => $item->persentase_cf,
                ];
            }),
            'total' => $gejala->count()
        ]);
    }

    /**
     * Get CF statistics
     */
    public function cfStatistics()
    {
        $statistics = [
            'count_by_cf_range' => [
                'sangat_rendah' => Gejala::where('nilai_cf', '<', 0.3)->count(),
                'rendah' => Gejala::whereBetween('nilai_cf', [0.3, 0.5])->count(),
                'sedang' => Gejala::whereBetween('nilai_cf', [0.5, 0.7])->count(),
                'tinggi' => Gejala::whereBetween('nilai_cf', [0.7, 0.9])->count(),
                'sangat_tinggi' => Gejala::where('nilai_cf', '>=', 0.9)->count(),
            ],
            'avg_cf' => round(Gejala::avg('nilai_cf'), 3),
            'min_cf' => Gejala::min('nilai_cf'),
            'max_cf' => Gejala::max('nilai_cf'),
            'total_gejala' => Gejala::count(),
        ];

        return response()->json($statistics);
    }

    /**
     * Export gejala data
     */
    public function export(Request $request)
    {
        $query = Gejala::query();

        // Apply same filters as index
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('kode_gejala', 'LIKE', "%{$search}%")
                  ->orWhere('nama_gejala', 'LIKE', "%{$search}%");
            });
        }

        // Filter by CF range
        if ($request->has('min_cf') && $request->min_cf !== null) {
            $query->where('nilai_cf', '>=', $request->min_cf);
        }

        if ($request->has('max_cf') && $request->max_cf !== null) {
            $query->where('nilai_cf', '<=', $request->max_cf);
        }

        $sortBy = $request->get('sortBy', 'kode_gejala');
        $sortOrder = $request->get('sortOrder', 'asc');
        $query->orderBy($sortBy, $sortOrder);

        $gejalas = $query->get();

        $filename = 'gejala_' . date('Y-m-d_H-i-s') . '.csv';

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="' . $filename . '"',
        ];

        $callback = function() use ($gejalas) {
            $file = fopen('php://output', 'w');

            // Header CSV
            fputcsv($file, [
                'No',
                'Kode Gejala',
                'Nama Gejala',
                'Deskripsi',
                'Kategori',
                'Nilai CF',
                'Persentase CF',
                'Opsi 1', 'Bobot 1',
                'Opsi 2', 'Bobot 2',
                'Opsi 3', 'Bobot 3',
                'Opsi 4', 'Bobot 4',
                'Status',
                'Tanggal Dibuat'
            ]);

            // Data
            foreach ($gejalas as $index => $gejala) {
                $opsi = $gejala->opsi_jawaban ?? [];
                $row = [
                    $index + 1,
                    $gejala->kode_gejala,
                    $gejala->nama_gejala,
                    $gejala->deskripsi_gejala,
                    $gejala->kategori_gejala,
                    $gejala->nilai_cf,
                    $gejala->persentase_cf,
                ];

                // Add opsi jawaban data
                for ($i = 0; $i < 4; $i++) {
                    if (isset($opsi[$i])) {
                        $row[] = $opsi[$i]['text'] ?? '';
                        $row[] = $opsi[$i]['bobot'] ?? '';
                    } else {
                        $row[] = '';
                        $row[] = '';
                    }
                }

                $row[] = $gejala->status;
                $row[] = $gejala->created_at->format('d/m/Y H:i:s');

                fputcsv($file, $row);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Bulk update CF values
     */
    public function bulkUpdateCf(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'gejala_ids' => 'required|array|min:1',
            'gejala_ids.*' => 'exists:gejala,id_gejala',
            'nilai_cf' => 'required|numeric|min:0|max:1',
        ], [
            'gejala_ids.required' => 'Pilih minimal satu gejala',
            'gejala_ids.*.exists' => 'Gejala tidak ditemukan',
            'nilai_cf.required' => 'Nilai CF harus diisi',
            'nilai_cf.min' => 'Nilai CF minimal 0',
            'nilai_cf.max' => 'Nilai CF maksimal 1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi gagal',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            DB::beginTransaction();

            $updatedCount = Gejala::whereIn('id_gejala', $request->gejala_ids)
                ->update(['nilai_cf' => $request->nilai_cf]);

            DB::commit();

            Log::info('Bulk CF update successful:', [
                'count' => $updatedCount,
                'nilai_cf' => $request->nilai_cf,
                'gejala_ids' => $request->gejala_ids
            ]);

            return response()->json([
                'success' => true,
                'message' => "Berhasil memperbarui nilai CF untuk {$updatedCount} gejala",
                'updated_count' => $updatedCount
            ]);

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Bulk CF update error:', [
                'message' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat memperbarui data'
            ], 500);
        }
    }

    /**
     * Calculate certainty value based on user answer and symptom CF
     */
    public function calculateCertaintyValue(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'id_gejala' => 'required|exists:gejala,id_gejala',
            'bobot_jawaban' => 'required|numeric|min:0|max:1',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $gejala = Gejala::findOrFail($request->id_gejala);
            $nilaiKepercayaan = $gejala->hitungNilaiKepercayaan($request->bobot_jawaban);

            return response()->json([
                'success' => true,
                'data' => [
                    'gejala' => [
                        'id_gejala' => $gejala->id_gejala,
                        'kode_gejala' => $gejala->kode_gejala,
                        'nama_gejala' => $gejala->nama_gejala,
                        'nilai_cf' => $gejala->nilai_cf,
                    ],
                    'bobot_jawaban' => $request->bobot_jawaban,
                    'nilai_kepercayaan' => $nilaiKepercayaan,
                    'formula' => "CF Gejala ({$gejala->nilai_cf}) × Bobot Jawaban ({$request->bobot_jawaban}) = {$nilaiKepercayaan}"
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Calculate certainty value error:', [
                'message' => $e->getMessage(),
                'request' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat menghitung nilai kepercayaan'
            ], 500);
        }
    }
}
