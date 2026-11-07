<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class RiwayatKonsultasi extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'riwayat_konsultasi';
    protected $primaryKey = 'id_konsultasi';
    protected $keyType = 'int';
    public $incrementing = true;
    public $timestamps = true;

    protected $fillable = [
        'id_mahasiswa',
        'id_diagnosa', // Tambahkan kolom ini
        'tanggal_konsultasi',
        'hasil_diagnosa',
        'tingkat_keparahan', // Tambahkan kolom yang ada di migration
        'rekomendasi',
        'nilai_cf',
        'detail',
    ];

    protected $casts = [
        'tanggal_konsultasi' => 'datetime',
        'detail' => 'array',
        'nilai_cf' => 'decimal:4',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    /**
     * Relasi ke Mahasiswa
     */
    public function mahasiswa()
    {
        return $this->belongsTo(Mahasiswa::class, 'id_mahasiswa', 'id_mahasiswa');
    }

    /**
     * Relasi ke Diagnosa
     */
    public function diagnosa()
    {
        return $this->belongsTo(Diagnosa::class, 'id_diagnosa', 'id_diagnosa');
    }

    /**
     * Accessor untuk format hasil CF
     */
    public function getNilaiCfFormattedAttribute()
    {
        return number_format($this->nilai_cf * 100, 2) . '%';
    }

    /**
     * Accessor untuk format tingkat keparahan dengan warna
     */
    public function getTingkatKeparahanColorAttribute()
    {
        $colors = [
            'Minimal / Normal' => 'success',
            'Depresi Ringan' => 'warning',
            'Depresi Sedang' => 'danger',
            'Depresi Berat' => 'dark'
        ];

        return $colors[$this->tingkat_keparahan] ?? 'secondary';
    }

    /**
     * Scope untuk filter berdasarkan tingkat keparahan
     */
    public function scopeByTingkatKeparahan($query, $tingkat)
    {
        return $query->where('tingkat_keparahan', $tingkat);
    }

    /**
     * Scope untuk filter berdasarkan tanggal
     */
    public function scopeByDateRange($query, $startDate, $endDate)
    {
        return $query->whereBetween('tanggal_konsultasi', [$startDate, $endDate]);
    }

    /**
     * Scope untuk filter berdasarkan diagnosa
     */
    public function scopeByDiagnosa($query, $idDiagnosa)
    {
        return $query->where('id_diagnosa', $idDiagnosa);
    }

    /**
     * Scope untuk search
     */
    public function scopeSearch($query, $search)
    {
        return $query->where(function($q) use ($search) {
            $q->where('hasil_diagnosa', 'like', "%{$search}%")
              ->orWhere('rekomendasi', 'like', "%{$search}%")
              ->orWhere('tingkat_keparahan', 'like', "%{$search}%")
              ->orWhereHas('mahasiswa', function($mahasiswaQuery) use ($search) {
                  $mahasiswaQuery->where('nama', 'like', "%{$search}%")
                               ->orWhere('nim', 'like', "%{$search}%");
              })
              ->orWhereHas('diagnosa', function($diagnosaQuery) use ($search) {
                  $diagnosaQuery->where('nama_diagnosa', 'like', "%{$search}%");
              });
        });
    }

    /**
     * Scope untuk data terbaru
     */
    public function scopeLatest($query)
    {
        return $query->orderBy('tanggal_konsultasi', 'desc');
    }

    /**
     * Scope untuk data dengan nilai CF tinggi
     */
    public function scopeHighConfidence($query, $threshold = 0.7)
    {
        return $query->where('nilai_cf', '>=', $threshold);
    }

    /**
     * Get statistik berdasarkan tingkat keparahan
     */
    public static function getStatistikTingkatKeparahan()
    {
        return self::selectRaw('tingkat_keparahan, COUNT(*) as total')
                   ->groupBy('tingkat_keparahan')
                   ->pluck('total', 'tingkat_keparahan')
                   ->toArray();
    }

    /**
     * Get rata-rata nilai CF
     */
    public static function getAverageConfidence()
    {
        return self::avg('nilai_cf');
    }
}
