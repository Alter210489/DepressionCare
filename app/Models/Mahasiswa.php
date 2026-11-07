<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Mahasiswa extends Model
{
    use HasFactory;

    protected $table = 'mahasiswa';
    protected $primaryKey = 'id_mahasiswa';
    protected $keyType = 'int';
    public $incrementing = true;
    public $timestamps = true;

    protected $fillable = [
        'user_id',
        'nama',
        'nim',
        'fakultas',
        'program_studi',
        'usia',
        'jenis_kelamin',
    ];

    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function riwayatKonsultasi()
    {
        return $this->hasMany(RiwayatKonsultasi::class, 'id_mahasiswa');
    }
}
