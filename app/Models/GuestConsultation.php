<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class GuestConsultation extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'guest_consultations';
    protected $primaryKey = 'id_guestconsultation';

    protected $fillable = [
        'session_id',
        'nama',
        'email',
        'nim',
        'fakultas',
        'program_studi',
        'umur',
        'jenis_kelamin',
        'id_diagnosa',
        'hasil_diagnosa',
        'tingkat_keparahan',
        'nilai_cf',
        'rekomendasi',
        'gejala_dipilih',
        'detail'
    ];

    protected $casts = [
        'gejala_dipilih' => 'array',
        'rekomendasi' => 'array',
        'detail' => 'array',
        'nilai_cf' => 'decimal:4', // Pastikan cast ke decimal
        'umur' => 'integer',
        'deleted_at' => 'datetime'
    ];

    //memastikan nilai_cf selalu number
    public function getNilaiCfAttribute($value)
    {
        // Pastikan selalu return float, default 0 jika null
        return floatval($value ?? 0);
    }

    //memastikan umur selalu integer
    public function getUmurAttribute($value)
    {
        return intval($value ?? 0);
    }

    /**
     * Relasi ke Diagnosa
     */
    public function diagnosa()
    {
        return $this->belongsTo(Diagnosa::class, 'id_diagnosa', 'id_diagnosa');
    }

    /**
     * Scope untuk menghapus data lama (cleanup)
     */
    public function scopeOlderThan($query, $days = 30)
    {
        return $query->where('created_at', '<', now()->subDays($days));
    }

    /**
     * Scope untuk guest aktif (belum soft deleted)
     */
    public function scopeActive($query)
    {
        return $query->whereNull('deleted_at');
    }

    /**
     * Accessor untuk CF percentage (untuk display)
     */
    public function getCfPercentageAttribute()
    {
        return round(floatval($this->nilai_cf) * 100, 2);
    }

    /**
     * Accessor untuk confidence level
     */
    public function getConfidenceLevelAttribute()
    {
        $cfValue = floatval($this->nilai_cf);

        if ($cfValue >= 0.8) return ['label' => 'Sangat Yakin', 'color' => 'red'];
        elseif ($cfValue >= 0.6) return ['label' => 'Yakin', 'color' => 'orange'];
        elseif ($cfValue >= 0.4) return ['label' => 'Cukup Yakin', 'color' => 'yellow'];
        elseif ($cfValue >= 0.2) return ['label' => 'Kurang Yakin', 'color' => 'blue'];
        else return ['label' => 'Tidak Yakin', 'color' => 'green'];
    }

    /**
     * Mutator untuk memastikan session_id unik
     */
    public function setSessionIdAttribute($value)
    {
        $originalValue = $value;
        $counter = 1;

        while (static::where('session_id', $value)->exists()) {
            $value = $originalValue . '_' . $counter;
            $counter++;
        }

        $this->attributes['session_id'] = $value;
    }

    /**
     * Static method untuk mendapatkan daftar fakultas
     */
    public static function getFakultasList()
    {
        return [
            'Fakultas Teknik',
            'Fakultas Hukum',
            'Fakultas Kesehatan',
            'Fakultas Kedokteran',
            'Fakultas Keguruan dan Ilmu Pendidikan',
            'Fakultas Pertanian',
            'Fakultas Perikanan dan Ilmu Kelautan',
            'Fakultas Ekonomi'
        ];
    }

    /**
     * Scope untuk filter berdasarkan fakultas
     */
    public function scopeByFakultas($query, $fakultas)
    {
        return $query->where('fakultas', $fakultas);
    }

    /**
     * Accessor untuk mendapatkan nama lengkap dengan NIM
     */
    public function getNamaLengkapAttribute()
    {
        if ($this->nim) {
            return "{$this->nama} ({$this->nim})";
        }
        return $this->nama;
    }
}
