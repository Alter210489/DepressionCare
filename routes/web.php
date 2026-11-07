<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Controllers\Admin\DashboardController as AdminDashboardController;
use App\Http\Controllers\Admin\MahasiswaController as AdminMahasiswaController;
use App\Http\Controllers\Admin\GejalaController as AdminGejalaController;
use App\Http\Controllers\Admin\DiagnosaController as AdminDiagnosaController;
use App\Http\Controllers\Admin\GuestConsultationController as AdminGuestConsultationController;
use App\Http\Controllers\Admin\RiwayatKonsultasiController as AdminRiwayatKonsultasiController;
use App\Http\Controllers\Mahasiswa\DashboardController as MahasiswaDashboardController;
use App\Http\Controllers\Mahasiswa\ProfileController as MahasiswaProfileController;
use App\Http\Controllers\Mahasiswa\KonsultasiController as MahasiswaKonsultasiController;
use App\Http\Controllers\Mahasiswa\RiwayatKonsultasiController as MahasiswaRiwayatKonsultasiController;
use App\Http\Controllers\Mahasiswa\GejalaController as MahasiswaGejalaController;
use App\Http\Controllers\GuestConsultationController;
use App\Http\Controllers\DepressionQuestionnaireController;

// Halaman Utama
Route::get('/', function () {
    return Inertia::render('welcome', [
        'auth' => [
            'user' => Auth::user(),
        ],
    ]);
})->name('home');

// // Beranda page
// Route::get('/beranda', function () {
//     return Inertia::render('Beranda');
// })->name('beranda');

// Tentang page
Route::get('/tentang', function () {
    return Inertia::render('Tentang');
})->name('tentang');

// Edukasi page
Route::get('/edukasi', function () {
    return Inertia::render('Edukasi');
})->name('edukasi');

// Halaman Kuesioner tanpa Login
Route::prefix('guest')->name('guest.')->controller(GuestConsultationController::class)->group(function () {
    Route::get('/konsultasi', 'index')->name('konsultasi.index');
    Route::post('/konsultasi', 'process')->name('konsultasi.process');
    Route::get('/konsultasi/hasil/{id}', 'result')->name('konsultasi.result');
});

// Route untuk depression questionnaire (jika diperlukan)
// Route::get('/studentdepressionquestionnaire', function () {
//     return Inertia::render('studentdepressionquestionnaire');
// });

/*
|--------------------------------------------------------------------------
| Admin Routes
|--------------------------------------------------------------------------
|
| Routes untuk Admin/Konselor yang memiliki akses penuh ke sistem
| Hanya user dengan role 'admin' yang bisa mengakses routes ini
|
*/

Route::middleware(['auth', 'role:admin'])->prefix('admin')->name('admin.')->group(function () {

    // Dashboard Admin
    Route::get('/dashboard', [AdminDashboardController::class, 'index'])->name('dashboard');

    // Manajemen Data Mahasiswa
    Route::resource('mahasiswa', AdminMahasiswaController::class)->names([
        'index' => 'mahasiswa.index',
        'create' => 'mahasiswa.create',
        'store' => 'mahasiswa.store',
        'show' => 'mahasiswa.show',
        'edit' => 'mahasiswa.edit',
        'update' => 'mahasiswa.update',
        'destroy' => 'mahasiswa.destroy',
    ]);

    // Additional Mahasiswa Routes
    Route::prefix('mahasiswa')->name('mahasiswa.')->group(function () {
        Route::post('{mahasiswa}/toggle-status', [AdminMahasiswaController::class, 'toggleStatus'])->name('toggle-status');
        Route::delete('bulk-delete', [AdminMahasiswaController::class, 'bulkDelete'])->name('bulk-delete');
        Route::get('export', [AdminMahasiswaController::class, 'export'])->name('export');
    });

    // Manajemen Data Gejala
    Route::resource('gejala', AdminGejalaController::class)->names([
        'index' => 'gejala.index',
        'create' => 'gejala.create',
        'store' => 'gejala.store',
        'show' => 'gejala.show',
        'edit' => 'gejala.edit',
        'update' => 'gejala.update',
        'destroy' => 'gejala.destroy',
    ]);

    // Manajemen Data Diagnosa
    Route::resource('diagnosa', AdminDiagnosaController::class)->names([
        'index' => 'diagnosa.index',
        'create' => 'diagnosa.create',
        'store' => 'diagnosa.store',
        'show' => 'diagnosa.show',
        'edit' => 'diagnosa.edit',
        'update' => 'diagnosa.update',
        'destroy' => 'diagnosa.destroy',
    ]);

    // Manajemen Riwayat Konsultasi guest (Admin bisa lihat semua)
    Route::prefix('guest-consultation')->name('guest-consultation.')->group(function () {
        Route::get('/', [AdminGuestConsultationController::class, 'index'])->name('index');

        // Semua route statis HARUS di atas /{id}
        Route::get('/bdi-analysis', [AdminGuestConsultationController::class, 'bdiAnalysis'])->name('bdi-analysis');
        Route::get('/reports/generate', [AdminGuestConsultationController::class, 'report'])->name('report');
        Route::get('/export/excel', [AdminGuestConsultationController::class, 'export'])->name('export');
        Route::get('/export/pdf', [AdminGuestConsultationController::class, 'exportPdf'])->name('export-pdf');

        // Route dengan parameter /{id} HARUS paling bawah
        Route::get('/{id}', [AdminGuestConsultationController::class, 'show'])->name('show');
        Route::delete('/{id}', [AdminGuestConsultationController::class, 'destroy'])->name('destroy');
    });
 
    // Manajemen Riwayat Konsultasi (Admin bisa lihat semua)
    Route::prefix('riwayat-konsultasi')->name('riwayat-konsultasi.')->group(function () {
        Route::get('/', [AdminRiwayatKonsultasiController::class, 'index'])->name('index');
        Route::get('/{id}', [AdminRiwayatKonsultasiController::class, 'show'])->name('show');
        Route::delete('/{id}', [AdminRiwayatKonsultasiController::class, 'destroy'])->name('destroy');
        Route::get('/reports/generate', [AdminRiwayatKonsultasiController::class, 'report'])->name('report');
        Route::get('/export/excel', [AdminRiwayatKonsultasiController::class, 'export'])->name('export');
        Route::get('/export/pdf', [AdminRiwayatKonsultasiController::class, 'exportPdf'])->name('export.pdf');
    });

    // Route untuk statistik dan analytics
    Route::get('/statistics', [AdminDashboardController::class, 'statistics'])->name('statistics');
    Route::get('/analytics', [AdminDashboardController::class, 'analytics'])->name('analytics');

    // Route untuk backup dan restore data
    Route::post('/backup', [AdminDashboardController::class, 'backup'])->name('backup');
    Route::post('/restore', [AdminDashboardController::class, 'restore'])->name('restore');

    // Route untuk manajemen sistem
    Route::get('/settings', [AdminDashboardController::class, 'settings'])->name('settings');
    Route::put('/settings', [AdminDashboardController::class, 'updateSettings'])->name('settings.update');
});

/*
|--------------------------------------------------------------------------
| Mahasiswa Routes
|--------------------------------------------------------------------------
|
| Routes untuk Mahasiswa yang memiliki akses terbatas
| Hanya user dengan role 'mahasiswa' yang bisa mengakses routes ini
|
*/

Route::middleware(['auth', 'role:mahasiswa'])->prefix('mahasiswa')->name('mahasiswa.')->group(function () {

    // Dashboard Mahasiswa
    Route::get('/dashboard', [MahasiswaDashboardController::class, 'Index'])->name('dashboard');

    // Manajemen Profile Mahasiswa
    Route::prefix('profile')->name('profile.')->group(function () {
        Route::put('/update', [MahasiswaProfileController::class, 'update'])->name('update');
    });

    // Konsultasi dan Diagnosa
    Route::prefix('konsultasi')->name('konsultasi.')->group(function () {
        // Route utama konsultasi (dashboard konsultasi)
        Route::get('/', [MahasiswaKonsultasiController::class, 'index'])->name('index');

        // Route untuk memulai konsultasi baru
        Route::get('/start', [MahasiswaKonsultasiController::class, 'start'])->name('start');

        // Route untuk memproses hasil konsultasi
        Route::post('/process', [MahasiswaKonsultasiController::class, 'process'])->name('process');

        // Route untuk menampilkan hasil konsultasi
        Route::get('/result/{id}', [MahasiswaKonsultasiController::class, 'result'])->name('result');

        // Enhanced PDF Export routes - sesuai dengan yang digunakan di React
        Route::get('/result/export/pdf', [MahasiswaKonsultasiController::class, 'exportResultPdf'])
            ->name('result.export.pdf');

        // Print route dengan parameter ID
        Route::get('/{id}/result/print', [MahasiswaKonsultasiController::class, 'printResult'])
            ->name('result.print');

        // Legacy support (deprecated but maintained for compatibility)
        Route::get('/{id}/download-pdf', [MahasiswaKonsultasiController::class, 'downloadPDF'])
            ->name('download.pdf');
        // Additional Routes untuk AJAX dan validasi
        Route::get('/gejala/list', [MahasiswaKonsultasiController::class, 'getGejalaList'])->name('gejala.list');
        Route::post('/validate-answers', [MahasiswaKonsultasiController::class, 'validateAnswers'])->name('validate.answers');
    });

    // Riwayat Konsultasi Mahasiswa (hanya milik sendiri)
    Route::prefix('riwayat-konsultasi')->name('riwayat-konsultasi.')->group(function () {
        Route::get('/', [MahasiswaRiwayatKonsultasiController::class, 'index'])->name('index');
        Route::get('/{id}', [MahasiswaRiwayatKonsultasiController::class, 'show'])->name('show');
        Route::get('/{id}/print', [MahasiswaRiwayatKonsultasiController::class, 'print'])->name('print');
        Route::delete('/{id}', [MahasiswaRiwayatKonsultasiController::class, 'destroy'])->name('destroy');
    });

    // Daftar Gejala (Read Only untuk Mahasiswa)
    Route::prefix('gejala')->name('gejala.')->group(function () {
        Route::get('/', [MahasiswaGejalaController::class, 'index'])->name('index');
        Route::get('/{id}', [MahasiswaGejalaController::class, 'show'])->name('show');
    });

    // Informasi dan Bantuan
    Route::get('/help', [MahasiswaDashboardController::class, 'help'])->name('help');
    Route::get('/faq', [MahasiswaDashboardController::class, 'faq'])->name('faq');
    Route::get('/contact', [MahasiswaDashboardController::class, 'contact'])->name('contact');
});

/*
|--------------------------------------------------------------------------
| Shared Authenticated Routes
|--------------------------------------------------------------------------
|
| Routes yang bisa diakses oleh semua user yang sudah login
| Redirect berdasarkan role masing-masing
|
*/

Route::middleware(['auth'])->group(function () {

    // Dashboard redirect berdasarkan role
    Route::get('/dashboard', function () {
        $user = Auth::user();
        if ($user && $user->isAdmin()) {
            return redirect()->route('admin.dashboard');
        } else {
            return redirect()->route('mahasiswa.dashboard');
        }
    })->name('dashboard');

    // Profile redirect berdasarkan role
    Route::get('/profile', function () {
        $user = Auth::user();
        if ($user && $user->isAdmin()) {
            return redirect()->route('admin.settings');
        } else {
            return redirect()->route('mahasiswa.profile.index');
        }
    })->name('profile');

    // Notification routes (untuk semua user)
    Route::get('/notifications', function () {
        $user = Auth::user();
        if (!$user) {
            return response()->json([]);
        }

        // Cast ke model yang memiliki notifications
        /** @var \App\Models\User $user */
        return response()->json($user->notifications);
    })->name('notifications.index');

    Route::post('/notifications/{id}/read', function ($id) {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['status' => 'error', 'message' => 'User not authenticated']);
        }

        /** @var \App\Models\User $user */
        $notification = $user->notifications()->find($id);
        if ($notification) {
            $notification->markAsRead();
        }
        return response()->json(['status' => 'success']);
    })->name('notifications.read');

    // Search global (untuk semua user)
    Route::get('/search', function () {
        $query = request('q');
        // Implementasi search logic
        return response()->json(['results' => []]);
    })->name('search');
});

/*
|--------------------------------------------------------------------------
| API Routes untuk AJAX Calls
|--------------------------------------------------------------------------
|
| Routes untuk handling AJAX requests dari frontend
|
*/

Route::middleware(['auth'])->prefix('api')->name('api.')->group(function () {

    // API untuk autocomplete dan search
    Route::get('/mahasiswa/search', [AdminMahasiswaController::class, 'search'])->name('mahasiswa.search');
    Route::get('/gejala/search', [AdminGejalaController::class, 'search'])->name('gejala.search');
    Route::get('/diagnosa/search', [AdminDiagnosaController::class, 'search'])->name('diagnosa.search');

    // API untuk chart data
    Route::get('/dashboard/stats', [AdminDashboardController::class, 'getDashboardStats'])->name('dashboard.stats');
    Route::get('/dashboard/charts', [AdminDashboardController::class, 'getChartData'])->name('dashboard.charts');

    // API untuk live search konsultasi
    Route::get('/konsultasi/gejala', [MahasiswaKonsultasiController::class, 'getGejalaList'])->name('konsultasi.gejala');
    Route::post('/konsultasi/validate', [MahasiswaKonsultasiController::class, 'validateAnswers'])->name('konsultasi.validate');
});

/*
|--------------------------------------------------------------------------
| Auth Routes
|--------------------------------------------------------------------------
|
| Routes untuk authentication (login, register, dll)
| Sudah di-include dari auth.php
|
*/

require __DIR__.'/auth.php';

/*
|--------------------------------------------------------------------------
| Settings Routes (jika ada)
|--------------------------------------------------------------------------
|
| Routes untuk konfigurasi sistem
|
*/

if (file_exists(__DIR__.'/settings.php')) {
    require __DIR__.'/settings.php';
}

/*
|--------------------------------------------------------------------------
| Fallback Routes
|--------------------------------------------------------------------------
|
| Routes untuk handling 404 dan error pages
|
*/

// Route untuk handle 404 dengan redirect berdasarkan role
Route::fallback(function () {
    if (Auth::check()) {
        $user = Auth::user();
        if ($user && $user->isAdmin()) {
            return redirect()->route('admin.dashboard')->with('error', 'Halaman tidak ditemukan');
        } else {
            return redirect()->route('mahasiswa.dashboard')->with('error', 'Halaman tidak ditemukan');
        }
    }
    return redirect()->route('login');
});
