<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Diagnosa;
use App\Models\Gejala;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;

class DiagnosaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Diagnosa::query(); // REMOVED: ->with(['gejala'])

        // Search functionality
        if ($request->filled('search')) {
            $query->search($request->search);
        }

        // Sort functionality
        $sortBy = $request->get('sort_by', 'nama_diagnosa');
        $sortDirection = $request->get('sort_direction', 'asc');

        $allowedSortFields = ['nama_diagnosa', 'created_at', 'updated_at'];
        if (in_array($sortBy, $allowedSortFields)) {
            $query->orderBy($sortBy, $sortDirection);
        }

        // Pagination
        $perPage = $request->get('per_page', 10);
        $diagnosas = $query->paginate($perPage);

        // Add statistics to each diagnosa
        $diagnosas->getCollection()->transform(function ($diagnosa) {
            $diagnosa->statistik = $diagnosa->getStatistik();
            return $diagnosa;
        });

        return Inertia::render('admin/Diagnosa/Index', [
            'diagnosas' => $diagnosas,
            'filters' => $request->only(['search', 'sort_by', 'sort_direction']),
            'totalDiagnosas' => Diagnosa::count(),
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $gejala = Gejala::orderBy('nama_gejala')->get();

        return Inertia::render('admin/Diagnosa/Create', [
            'gejala' => $gejala,
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nama_diagnosa' => 'required|string|max:255|unique:diagnosa,nama_diagnosa',
            'deskripsi' => 'required|string',
            'gejala' => 'array',
            'gejala.*' => 'exists:gejala,id_gejala',
        ], [
            'nama_diagnosa.required' => 'Nama diagnosa harus diisi.',
            'nama_diagnosa.unique' => 'Nama diagnosa sudah ada.',
            'deskripsi.required' => 'Deskripsi harus diisi.',
            'gejala.*.exists' => 'Gejala tidak valid.',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            DB::beginTransaction();

            // Create diagnosa
            $diagnosa = Diagnosa::create([
                'nama_diagnosa' => $request->nama_diagnosa,
                'deskripsi' => $request->deskripsi,
            ]);

            // TODO: Handle gejala relationship jika diperlukan
            // REMOVED: $diagnosa->gejala()->attach($request->gejala);

            DB::commit();

            return redirect()->route('admin.diagnosa.index')
                ->with('success', 'Diagnosa berhasil ditambahkan.');

        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Terjadi kesalahan: ' . $e->getMessage()])->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $diagnosa = Diagnosa::with(['riwayatKonsultasi.mahasiswa']) // REMOVED: 'gejala'
            ->findOrFail($id);

        $statistik = $diagnosa->getStatistik();

        return Inertia::render('admin/Diagnosa/Show', [
            'diagnosa' => $diagnosa,
            'statistik' => $statistik,
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        $diagnosa = Diagnosa::findOrFail($id); // REMOVED: ->with(['gejala'])
        $gejala = Gejala::orderBy('nama_gejala')->get();

        // TODO: Get existing gejala IDs jika diperlukan
        // REMOVED: $existingGejala = $diagnosa->gejala->pluck('id_gejala')->toArray();

        return Inertia::render('admin/Diagnosa/Edit', [
            'diagnosa' => $diagnosa,
            'gejala' => $gejala,
            // 'existingGejala' => $existingGejala, // REMOVED
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $diagnosa = Diagnosa::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'nama_diagnosa' => [
                'required',
                'string',
                'max:255',
                Rule::unique('diagnosa', 'nama_diagnosa')->ignore($diagnosa->id_diagnosa, 'id_diagnosa'),
            ],
            'deskripsi' => 'required|string',
            'gejala' => 'array',
            'gejala.*' => 'exists:gejala,id_gejala',
        ], [
            'nama_diagnosa.required' => 'Nama diagnosa harus diisi.',
            'nama_diagnosa.unique' => 'Nama diagnosa sudah ada.',
            'deskripsi.required' => 'Deskripsi harus diisi.',
            'gejala.*.exists' => 'Gejala tidak valid.',
        ]);

        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        try {
            DB::beginTransaction();

            // Update diagnosa
            $diagnosa->update([
                'nama_diagnosa' => $request->nama_diagnosa,
                'deskripsi' => $request->deskripsi,
            ]);

            // TODO: Handle gejala relationship jika diperlukan
            // REMOVED: relationship handling

            DB::commit();

            return redirect()->route('admin.diagnosa.index')
                ->with('success', 'Diagnosa berhasil diperbarui.');

        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Terjadi kesalahan: ' . $e->getMessage()])->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $diagnosa = Diagnosa::findOrFail($id);

            // Check if diagnosa is being used in consultations
            if ($diagnosa->hasBeenUsedInConsultation()) {
                return back()->withErrors(['error' => 'Diagnosa tidak dapat dihapus karena sudah digunakan dalam konsultasi.']);
            }

            DB::beginTransaction();

            // REMOVED: $diagnosa->gejala()->detach();

            // Delete diagnosa
            $diagnosa->delete();

            DB::commit();

            return redirect()->route('admin.diagnosa.index')
                ->with('success', 'Diagnosa berhasil dihapus.');

        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Terjadi kesalahan: ' . $e->getMessage()]);
        }
    }

    /**
     * Search diagnosa for API/AJAX calls.
     */
    public function search(Request $request)
    {
        $query = $request->get('q', '');
        $limit = $request->get('limit', 10);

        $diagnosas = Diagnosa::search($query)
            ->orderBy('nama_diagnosa')
            ->limit($limit)
            ->get(['id_diagnosa', 'nama_diagnosa', 'deskripsi']);

        return response()->json([
            'data' => $diagnosas,
            'total' => $diagnosas->count(),
        ]);
    }

    /**
     * Get diagnosa statistics.
     */
    public function getStatistics()
    {
        $totalDiagnosas = Diagnosa::count();
        // REMOVED: $diagnosaWithGejala = Diagnosa::has('gejala')->count();
        $diagnosaUsedInConsultation = Diagnosa::has('riwayatKonsultasi')->count();
        // REMOVED: $avgGejalaPerdDiagnosa = Diagnosa::withCount('gejala')->avg('gejala_count');

        return response()->json([
            'total_diagnosas' => $totalDiagnosas,
            // 'diagnosa_with_gejala' => $diagnosaWithGejala, // REMOVED
            'diagnosa_used_in_consultation' => $diagnosaUsedInConsultation,
            // 'avg_gejala_per_diagnosa' => round($avgGejalaPerdDiagnosa, 2), // REMOVED
        ]);
    }

    /**
     * Bulk delete diagnosas.
     */
    public function bulkDelete(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'ids' => 'required|array',
            'ids.*' => 'exists:diagnosa,id_diagnosa',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        try {
            DB::beginTransaction();

            $diagnosas = Diagnosa::whereIn('id_diagnosa', $request->ids)->get();

            foreach ($diagnosas as $diagnosa) {
                if ($diagnosa->hasBeenUsedInConsultation()) {
                    return response()->json([
                        'error' => "Diagnosa '{$diagnosa->nama_diagnosa}' tidak dapat dihapus karena sudah digunakan dalam konsultasi."
                    ], 422);
                }
            }

            // REMOVED: Detach gejala relationships

            // Delete diagnosas
            Diagnosa::whereIn('id_diagnosa', $request->ids)->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Diagnosa berhasil dihapus.'
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json(['error' => 'Terjadi kesalahan: ' . $e->getMessage()], 500);
        }
    }

    /**
     * Duplicate diagnosa.
     */
    public function duplicate(string $id)
    {
        try {
            $originalDiagnosa = Diagnosa::findOrFail($id); // REMOVED: ->with('gejala')

            DB::beginTransaction();

            // Create new diagnosa
            $newDiagnosa = Diagnosa::create([
                'nama_diagnosa' => $originalDiagnosa->nama_diagnosa . ' (Copy)',
                'deskripsi' => $originalDiagnosa->deskripsi,
            ]);

            // TODO: Copy relationships jika diperlukan nanti

            DB::commit();

            return redirect()->route('admin.diagnosa.edit', $newDiagnosa->id_diagnosa)
                ->with('success', 'Diagnosa berhasil diduplikasi.');

        } catch (\Exception $e) {
            DB::rollback();
            return back()->withErrors(['error' => 'Terjadi kesalahan: ' . $e->getMessage()]);
        }
    }
}
