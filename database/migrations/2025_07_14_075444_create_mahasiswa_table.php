<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMahasiswaTable extends Migration
{
    public function up()
    {
        Schema::create('mahasiswa', function (Blueprint $table) {
            $table->id('id_mahasiswa'); // Primary Key dengan AUTO_INCREMENT
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->string('nama', 100); // Nama lengkap mahasiswa
            $table->string('nim', 15)->unique(); // Nomor Induk Mahasiswa (unik)
            $table->string('fakultas', 100); // Fakultas mahasiswa
            $table->string('program_studi', 100); // Program studi mahasiswa
            $table->integer('usia'); // Usia mahasiswa
            $table->enum('jenis_kelamin', ['L', 'P']); // Jenis kelamin (L: Laki-laki, P: Perempuan)
            $table->timestamps(); // created_at dan updated_at

            // Index untuk optimasi query
            $table->index('nim');
            $table->index('fakultas');
            $table->index('program_studi');
            $table->index('user_id'); // Tambah index untuk foreign key
        });
    }

    public function down()
    {
        Schema::dropIfExists('mahasiswa');
    }
}
