<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('gejala', function (Blueprint $table) {
            $table->id('id_gejala');
            $table->string('kode_gejala', 10)->unique();
            $table->string('nama_gejala', 255);
            $table->text('deskripsi_gejala')->nullable();
            $table->string('kategori_gejala', 50)->nullable();

            // Opsi jawaban dalam format JSON
            $table->json('opsi_jawaban')->comment('Array of answer options with text and weight values');

            // Nilai Certainty Factor untuk gejala
            $table->decimal('nilai_cf', 3, 2)->default(0.8)
                  ->comment('Certainty Factor value for this symptom (0.0 to 1.0)');

            $table->boolean('is_active')->default(true);
            $table->softDeletes();
            $table->timestamps();

            // Indexes
            $table->index(['is_active', 'kategori_gejala']);
            $table->index('nilai_cf');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gejala');
    }
};
