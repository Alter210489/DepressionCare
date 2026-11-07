<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateGuestConsultationsTable extends Migration
{
    public function up()
    {
        Schema::create('guest_consultations', function (Blueprint $table) {
            $table->id('id_guestconsultation'); // Primary Key dengan AUTO_INCREMENT - KONSISTEN dengan id_konsultasi
            $table->string('session_id')->unique(); // Untuk tracking guest session

            // Data guest - UPDATED dengan field tambahan
            $table->string('nama', 100)->nullable(); // Nama guest
            $table->string('email', 255)->nullable(); // Email guest
            $table->string('nim', 20)->nullable(); // NIM mahasiswa
            $table->string('fakultas', 100)->nullable(); // Fakultas
            $table->string('program_studi', 150)->nullable(); // Program Studi
            $table->integer('umur')->nullable(); // Umur guest
            $table->enum('jenis_kelamin', ['L', 'P'])->nullable(); // Jenis kelamin

            // Relasi ke diagnosa
            $table->unsignedBigInteger('id_diagnosa')->nullable(); // Foreign Key ke tabel diagnosa
            $table->string('hasil_diagnosa', 255); // Hasil diagnosis sistem
            $table->string('tingkat_keparahan', 100)->default('Minimal (Normal)'); // Tingkat keparahan depresi

            // Hasil perhitungan
            $table->decimal('nilai_cf', 8, 8); // ✅ Sama presisi dengan sistem login
            $table->json('rekomendasi'); // ✅ JSON untuk array rekomendasi

            // Data JSON khusus guest
            $table->json('gejala_dipilih'); // Store jawaban gejala yang dipilih
            $table->longText('detail')->nullable(); // ✅ Detail perhitungan (sama dengan sistem login)

            // Soft delete dan timestamps
            $table->softDeletes();
            $table->timestamps(); // created_at dan updated_at

            // Foreign Key constraints
            $table->foreign('id_diagnosa')
                  ->references('id_diagnosa')
                  ->on('diagnosa') // Sesuai dengan table name yang ada
                  ->onDelete('set null');

            // Index untuk optimasi query
            $table->index('session_id');
            $table->index('id_diagnosa');
            $table->index('email'); // Index untuk email
            $table->index('nim'); // Index untuk NIM
            $table->index('fakultas'); // Index untuk fakultas
            $table->index('created_at'); // Untuk cleanup data lama
            $table->index(['session_id', 'created_at']); // Composite index
        });
    }

    public function down()
    {
        Schema::dropIfExists('guest_consultations');
    }
}
