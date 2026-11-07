<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use App\Models\Gejala;
use Illuminate\Http\Request;
use Inertia\Inertia;

class GejalaController extends Controller
{
    /**
     * Display a listing of the gejala (symptoms).
     * Mahasiswa hanya bisa melihat gejala yang aktif.
     */
    public function index(Request $request)
    {
        $search = $request->get('search');
        $kategori = $request->get('kategori');
        $perPage = $request->get('per_page', 10);

        $gejala = Gejala::query()
            ->active() // Hanya gejala yang aktif
            ->when($search, function ($query, $search) {
                $query->search($search);
            })
            ->when($kategori, function ($query, $kategori) {
                $query->byKategori($kategori);
            })
            ->sortBy('kode_gejala', 'asc')
            ->paginate($perPage)
            ->withQueryString();

        // Get kategori options untuk filter
        $kategoriOptions = Gejala::getKategoriOptions();

        return Inertia::render('mahasiswa/Gejala/Index', [
            'gejala' => $gejala,
            'filters' => [
                'search' => $search,
                'kategori' => $kategori,
            ],
            'kategoriOptions' => $kategoriOptions,
            'statistics' => $this->getGejalaStatistics(),
        ]);
    }

    /**
     * Display the specified gejala.
     * Detail view untuk mahasiswa (read-only).
     */
    public function show($id)
    {
        $gejala = Gejala::active()
            ->where('id_gejala', $id)
            ->firstOrFail();

        // TODO: Implementasi relasi dengan diagnosa jika diperlukan nanti
        // Sementara tidak menampilkan related diagnosa
        $relatedDiagnosa = collect(); // Empty collection

        return Inertia::render('mahasiswa/Gejala/Show', [
            'gejala' => $gejala,
            'relatedDiagnosa' => $relatedDiagnosa,
            'breadcrumb' => [
                'Gejala' => route('mahasiswa.gejala.index'),
                $gejala->nama_gejala => null
            ]
        ]);
    }

    /**
     * Get statistics for gejala dashboard.
     */
    private function getGejalaStatistics()
    {
        $total = Gejala::active()->count();
        $perKategori = Gejala::active()
            ->selectRaw('kategori_gejala, COUNT(*) as total')
            ->groupBy('kategori_gejala')
            ->pluck('total', 'kategori_gejala')
            ->toArray();

        return [
            'total' => $total,
            'per_kategori' => $perKategori,
            'kategori_terbanyak' => $perKategori ? array_keys($perKategori, max($perKategori))[0] : null
        ];
    }

    /**
     * Convert CF value to readable label.
     */
    private function getCfLabel($cfValue)
    {
        if ($cfValue >= 0.8) {
            return 'Sangat Tinggi';
        } elseif ($cfValue >= 0.6) {
            return 'Tinggi';
        } elseif ($cfValue >= 0.4) {
            return 'Sedang';
        } elseif ($cfValue >= 0.2) {
            return 'Rendah';
        } else {
            return 'Sangat Rendah';
        }
    }

    /**
     * Search gejala for autocomplete (AJAX endpoint).
     */
    public function search(Request $request)
    {
        $query = $request->get('q');

        if (strlen($query) < 2) {
            return response()->json([]);
        }

        $gejala = Gejala::active()
            ->search($query)
            ->select('id_gejala', 'kode_gejala', 'nama_gejala', 'kategori_gejala')
            ->limit(10)
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id_gejala,
                    'text' => $item->formatted_kode . ' - ' . $item->nama_gejala,
                    'kategori' => $item->formatted_kategori
                ];
            });

        return response()->json($gejala);
    }
}
