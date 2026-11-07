<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAdminTable extends Migration
{
    public function up()
    {
        Schema::create('admin', function (Blueprint $table) {
            $table->id('id_admin'); // Primary Key dengan AUTO_INCREMENT
            $table->unsignedBigInteger('user_id')->nullable(); // Relasi ke users
            $table->string('nama', 100); // Nama admin/konselor
            $table->string('email', 100)->unique(); // Email admin (unik)
            $table->string('password', 255); // Kata sandi terenkripsi
            $table->string('role', 50)->default('admin'); // Role admin
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();
            $table->timestamps(); // created_at dan updated_at

            // Foreign key constraint
            $table->foreign('user_id')->references('id')->on('users')->onDelete('set null');

            // Index untuk optimasi query
            $table->index('email');
            $table->index('user_id');
        });
    }

    public function down()
    {
        Schema::dropIfExists('admin');
    }
}
