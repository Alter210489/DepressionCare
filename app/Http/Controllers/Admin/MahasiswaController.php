<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Mahasiswa;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

/**
 * Controller untuk mengelola data mahasiswa dari sisi admin
 */
class MahasiswaController extends Controller
{
    /**
     * Display a listing of mahasiswa.
     */
    public function index(Request $request): Response
    {
        $query = Mahasiswa::with('user')
            ->when($request->input('search'), function ($query, $search) {
                $query->where('nama', 'like', "%{$search}%")
                    ->orWhere('nim', 'like', "%{$search}%")
                    ->orWhere('fakultas', 'like', "%{$search}%")
                    ->orWhere('program_studi', 'like', "%{$search}%");
            })
            ->when($request->input('fakultas'), function ($query, $fakultas) {
                $query->where('fakultas', $fakultas);
            })
            ->orderBy('created_at', 'desc');

        $mahasiswa = $query->paginate(10)->withQueryString();

        // Get unique fakultas for filter
        $fakultasList = Mahasiswa::distinct()->pluck('fakultas');

        return Inertia::render('admin/Mahasiswa/Index', [
            'mahasiswa' => $mahasiswa,
            'fakultasList' => $fakultasList,
            'filters' => $request->only(['search', 'fakultas'])
        ]);
    }

    /**
     * Show the form for creating a new mahasiswa.
     */
    public function create(): Response
    {
        return Inertia::render('admin/Mahasiswa/Create');
    }

    /**
     * Store a newly created mahasiswa in storage.
     */
    public function store(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'nim' => ['required', 'string', 'max:15', 'unique:mahasiswa,nim'],
            'fakultas' => ['required', 'string', 'max:100'],
            'program_studi' => ['required', 'string', 'max:100'],
            'usia' => ['required', 'integer', 'min:16', 'max:50'],
            'jenis_kelamin' => ['required', 'in:L,P'],
        ]);

        // Create user account
        /** @var \App\Models\User $user */
        $user = User::create([
            'name' => $request->input('name'),
            'email' => $request->input('email'),
            'password' => Hash::make($request->input('password')),
            'role' => 'mahasiswa',
        ]);

        // Create mahasiswa profile
        Mahasiswa::create([
            'user_id' => $user->getKey(),
            'nama' => $request->input('name'),
            'nim' => $request->input('nim'),
            'fakultas' => $request->input('fakultas'),
            'program_studi' => $request->input('program_studi'),
            'usia' => $request->input('usia'),
            'jenis_kelamin' => $request->input('jenis_kelamin'),
        ]);

        return redirect()->route('admin.mahasiswa.index')
            ->with('success', 'Data mahasiswa berhasil ditambahkan.');
    }

    /**
     * Display the specified mahasiswa.
     */
    public function show(Mahasiswa $mahasiswa): Response
    {
        $mahasiswa->load(['user']);

        return Inertia::render('admin/Mahasiswa/Show', [
            'mahasiswa' => $mahasiswa
        ]);
    }

    /**
     * Show the form for editing the specified mahasiswa.
     */
    public function edit(Mahasiswa $mahasiswa): Response
    {
        $mahasiswa->load(['user']);

        return Inertia::render('admin/Mahasiswa/Edit', [
            'mahasiswa' => $mahasiswa
        ]);
    }

    /**
     * Update the specified mahasiswa in storage.
     */
    public function update(Request $request, Mahasiswa $mahasiswa): RedirectResponse
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users,email,' . $mahasiswa->user->getKey()],
            'nim' => ['required', 'string', 'max:15', 'unique:mahasiswa,nim,' . $mahasiswa->getKey() . ',id_mahasiswa'],
            'fakultas' => ['required', 'string', 'max:100'],
            'program_studi' => ['required', 'string', 'max:100'],
            'usia' => ['required', 'integer', 'min:16', 'max:50'],
            'jenis_kelamin' => ['required', 'in:L,P'],
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
        ]);

        // Update user data
        $userData = [
            'name' => $request->input('name'),
            'email' => $request->input('email'),
        ];

        // Only update password if provided
        if ($request->filled('password')) {
            $userData['password'] = Hash::make($request->input('password'));
        }

        $mahasiswa->user->update($userData);

        // Update mahasiswa data
        $mahasiswa->update([
            'nama' => $request->input('name'),
            'nim' => $request->input('nim'),
            'fakultas' => $request->input('fakultas'),
            'program_studi' => $request->input('program_studi'),
            'usia' => $request->input('usia'),
            'jenis_kelamin' => $request->input('jenis_kelamin'),
        ]);

        return redirect()->route('admin.mahasiswa.index')
            ->with('success', 'Data mahasiswa berhasil diperbarui.');
    }

    /**
     * Remove the specified mahasiswa from storage.
     */
    public function destroy(Mahasiswa $mahasiswa): RedirectResponse
    {
        try {
            // Delete user account (will cascade delete mahasiswa due to foreign key)
            $mahasiswa->user->delete();

            return redirect()->route('admin.mahasiswa.index')
                ->with('success', 'Data mahasiswa berhasil dihapus.');
        } catch (\Exception $e) {
            return redirect()->route('admin.mahasiswa.index')
                ->with('error', 'Gagal menghapus data mahasiswa. Error: ' . $e->getMessage());
        }
    }

    /**
     * Toggle active status of mahasiswa account
     */
    public function toggleStatus(Mahasiswa $mahasiswa): RedirectResponse
    {
        $currentStatus = $mahasiswa->user->getAttribute('is_active') ?? true;

        $mahasiswa->user->update([
            'is_active' => !$currentStatus
        ]);

        $status = !$currentStatus ? 'diaktifkan' : 'dinonaktifkan';

        return redirect()->back()
            ->with('success', "Akun mahasiswa berhasil {$status}.");
    }

    /**
     * Bulk delete selected mahasiswa
     */
    public function bulkDelete(Request $request): RedirectResponse
    {
        $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['exists:mahasiswa,id_mahasiswa']
        ]);

        try {
            $mahasiswaIds = $request->input('ids');
            $userIds = Mahasiswa::whereIn('id_mahasiswa', $mahasiswaIds)->pluck('user_id');

            // Delete users (will cascade delete mahasiswa)
            User::whereIn('id', $userIds)->delete();

            $count = count($mahasiswaIds);

            return redirect()->route('admin.mahasiswa.index')
                ->with('success', "{$count} data mahasiswa berhasil dihapus.");
        } catch (\Exception $e) {
            return redirect()->route('admin.mahasiswa.index')
                ->with('error', 'Gagal menghapus data mahasiswa. Error: ' . $e->getMessage());
        }
    }

    /**
     * Export mahasiswa data to CSV
     */
    public function export(Request $request)
    {
        $query = Mahasiswa::with('user')
            ->when($request->input('search'), function ($query, $search) {
                $query->where('nama', 'like', "%{$search}%")
                    ->orWhere('nim', 'like', "%{$search}%");
            })
            ->when($request->input('fakultas'), function ($query, $fakultas) {
                $query->where('fakultas', $fakultas);
            });

        $mahasiswa = $query->get();

        $headers = [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => 'attachment; filename="data_mahasiswa_' . date('Y-m-d') . '.csv"',
        ];

        $callback = function() use ($mahasiswa) {
            $file = fopen('php://output', 'w');

            // CSV Headers
            fputcsv($file, [
                'No',
                'NIM',
                'Nama',
                'Email',
                'Fakultas',
                'Program Studi',
                'Usia',
                'Jenis Kelamin',
                'Tanggal Daftar'
            ]);

            // CSV Data
            foreach ($mahasiswa as $index => $mhs) {
                fputcsv($file, [
                    $index + 1,
                    $mhs->nim ?? '',
                    $mhs->nama ?? '',
                    $mhs->user->email ?? '',
                    $mhs->fakultas ?? '',
                    $mhs->program_studi ?? '',
                    $mhs->usia ?? '',
                    ($mhs->jenis_kelamin ?? '') === 'L' ? 'Laki-laki' : 'Perempuan',
                    optional($mhs->created_at)->format('d/m/Y H:i') ?? ''
                ]);
            }

            fclose($file);
        };

        return response()->stream($callback, 200, $headers);
    }

    /**
     * Search mahasiswa for API/AJAX calls
     */
    public function search(Request $request)
    {
        $query = $request->get('q', '');
        $limit = $request->get('limit', 10);

        $mahasiswa = Mahasiswa::with(['user:id,name,email'])
            ->when($query, function ($queryBuilder) use ($query) {
                $queryBuilder->where(function ($subQuery) use ($query) {
                    $subQuery->where('nama', 'like', "%{$query}%")
                        ->orWhere('nim', 'like', "%{$query}%")
                        ->orWhere('fakultas', 'like', "%{$query}%")
                        ->orWhere('program_studi', 'like', "%{$query}%");
                });
            })
            ->select(['id_mahasiswa', 'user_id', 'nama', 'nim', 'fakultas', 'program_studi'])
            ->limit($limit)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $mahasiswa->map(function ($mhs) {
                return [
                    'id' => $mhs->id_mahasiswa ?? null,
                    'nama' => $mhs->nama ?? '',
                    'nim' => $mhs->nim ?? '',
                    'fakultas' => $mhs->fakultas ?? '',
                    'program_studi' => $mhs->program_studi ?? '',
                    'email' => $mhs->user?->email ?? '',
                    'label' => ($mhs->nama ?? '') . " (" . ($mhs->nim ?? '') . ")",
                    'value' => $mhs->id_mahasiswa ?? null
                ];
            })
        ]);
    }
}
