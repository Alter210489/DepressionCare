<?php

namespace App\Http\Controllers\Mahasiswa;

use App\Http\Controllers\Controller;
use App\Models\Mahasiswa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class ProfileController extends Controller
{
    public function update(Request $request)
    {
        $user = Auth::user();
        $mahasiswa = Mahasiswa::where('user_id', $user->id)->firstOrFail();

        $validated = $request->validate([
            'nama' => ['required', 'string', 'max:100'],  // ← UBAH dari 'name' ke 'nama'
            'email' => ['required', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'nim' => ['required', 'string', 'max:15', 'unique:mahasiswa,nim,' . $mahasiswa->id_mahasiswa . ',id_mahasiswa'],
            'fakultas' => ['required', 'string', 'max:100'],
            'program_studi' => ['required', 'string', 'max:100'],
            'usia' => ['nullable', 'integer', 'min:17', 'max:100'],  // ← UBAH ke nullable
            'jenis_kelamin' => ['nullable', 'in:L,P'],  // ← UBAH ke nullable
            'password' => ['nullable', 'string', 'confirmed', Password::defaults()],
        ]);

        // Update user table
        $user->update([
            'name' => $validated['nama'],  // ← UBAH dari 'name' ke 'nama'
            'email' => $validated['email'],
        ]);

        // Update password jika diisi
        if (!empty($validated['password'])) {
            $user->update(['password' => Hash::make($validated['password'])]);
        }

        // Update mahasiswa table
        $mahasiswa->update([
            'nama' => $validated['nama'],
            'nim' => $validated['nim'],
            'fakultas' => $validated['fakultas'],
            'program_studi' => $validated['program_studi'],
            'usia' => $validated['usia'] ?? null,  // ← Handle nullable
            'jenis_kelamin' => $validated['jenis_kelamin'] ?? null,  // ← Handle nullable
        ]);

        return redirect()->route('mahasiswa.dashboard')
            ->with('success', 'Profil berhasil diperbarui!');
    }

    public function updatePassword(Request $request)
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ]);

        $user = Auth::user();

        if (!Hash::check($validated['current_password'], $user->password)) {
            return back()->withErrors(['current_password' => 'Password saat ini tidak sesuai.']);
        }

        $user->update(['password' => Hash::make($validated['password'])]);

        return redirect()->route('mahasiswa.dashboard')
            ->with('success', 'Password berhasil diperbarui!');
    }
}
