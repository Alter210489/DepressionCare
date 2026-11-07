<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Mahasiswa;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    /**
     * Display the registration view.
     */
    public function create(): Response
    {
        return Inertia::render('auth/register');
    }

    /**
     * Handle an incoming registration request.
     */
    public function store(Request $request): RedirectResponse
    {
        // Log data yang masuk
        Log::info('Registration attempt:', $request->all());

        $validatedData = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'lowercase', 'email', 'max:255', 'unique:users'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'nim' => ['required', 'string', 'max:15', 'unique:mahasiswa,nim'],
            'fakultas' => ['required', 'string', 'max:100'],
            'program_studi' => ['required', 'string', 'max:100'],
            'usia' => ['required', 'integer', 'min:17', 'max:100'],
            'jenis_kelamin' => ['required', 'in:L,P'],
        ]);

        try {
            DB::beginTransaction();

            // Buat user dengan role mahasiswa
            $user = User::create([
                'name' => $validatedData['name'],
                'email' => $validatedData['email'],
                'password' => Hash::make($validatedData['password']),
                'role' => 'mahasiswa',
            ]);

            Log::info('User created successfully:', [
                'user_id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role
            ]);

            // Data untuk mahasiswa
            $mahasiswaData = [
                'user_id' => $user->id,
                'nama' => $validatedData['name'],
                'nim' => $validatedData['nim'],
                'fakultas' => $validatedData['fakultas'],
                'program_studi' => $validatedData['program_studi'],
                'usia' => (int) $validatedData['usia'],
                'jenis_kelamin' => $validatedData['jenis_kelamin'],
            ];

            Log::info('Attempting to create mahasiswa with data:', $mahasiswaData);

            // Buat data mahasiswa
            $mahasiswa = Mahasiswa::create($mahasiswaData);

            Log::info('Mahasiswa created successfully:', [
                'mahasiswa_id' => $mahasiswa->id_mahasiswa,
                'user_id' => $mahasiswa->user_id,
                'nim' => $mahasiswa->nim
            ]);

            DB::commit();

            // Fire event registered
            event(new Registered($user));

            // Login user otomatis setelah registrasi
            Auth::login($user);

            Log::info('User logged in successfully after registration');

            // Redirect ke dashboard mahasiswa
            return redirect()->route('mahasiswa.dashboard')->with('success', 'Registrasi berhasil! Selamat datang di sistem.');

        } catch (\Exception $e) {
            DB::rollback();

            Log::error('Registration failed:', [
                'error' => $e->getMessage(),
                'line' => $e->getLine(),
                'file' => $e->getFile(),
                'trace' => $e->getTraceAsString()
            ]);

            return back()->withErrors([
                'error' => 'Registrasi gagal: ' . $e->getMessage()
            ])->withInput($request->except('password', 'password_confirmation'));
        }
    }
}
