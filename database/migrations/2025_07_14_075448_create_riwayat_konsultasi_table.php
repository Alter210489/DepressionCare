<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateRiwayatKonsultasiTable extends Migration
{
    public function up()
    {
        Schema::create('riwayat_konsultasi', function (Blueprint $table) {
            $table->id('id_konsultasi'); // Primary Key dengan AUTO_INCREMENT
            $table->unsignedBigInteger('id_mahasiswa'); // Foreign Key
            $table->unsignedBigInteger('id_diagnosa')->nullable(); // Foreign Key ke tabel diagnosa
            $table->datetime('tanggal_konsultasi'); // Tanggal konsultasi
            $table->string('hasil_diagnosa', 255); // Hasil diagnosis sistem
            $table->string('tingkat_keparahan', 100)->default('Minimal (Normal)'); // Tingkat keparahan depresi

            $table->json('rekomendasi'); // ✅ Ubah ke JSON untuk array rekomendasi
            $table->decimal('nilai_cf', 8, 8); // ✅ Perbesar presisi untuk CF
            $table->longText('detail')->nullable(); // ✅ Ubah ke longText untuk data besar
            $table->softDeletes();
            $table->timestamps(); // created_at dan updated_at

            // Foreign Key constraints
            $table->foreign('id_mahasiswa')
                  ->references('id_mahasiswa')
                  ->on('mahasiswa')
                  ->onDelete('cascade');

            $table->foreign('id_diagnosa')
                  ->references('id_diagnosa')
                  ->on('diagnosa')
                  ->onDelete('set null');

            // Index untuk optimasi query
            $table->index('id_mahasiswa');
            $table->index('id_diagnosa');
            $table->index('tanggal_konsultasi');
        });
    }

    public function down()
    {
        Schema::dropIfExists('riwayat_konsultasi');
    }
}
