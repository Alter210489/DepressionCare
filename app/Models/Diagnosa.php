<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Diagnosa extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     */
    protected $table = 'diagnosa';

    /**
     * The primary key for the model.
     */
    protected $primaryKey = 'id_diagnosa';

    /**
     * The attributes that are mass assignable.
     */
    protected $fillable = [
        'nama_diagnosa',
        'deskripsi',
    ];

    /**
     * The attributes that should be cast.
     */
    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
    ];

    /**
     * Get all gejala yang terkait dengan diagnosa ini.
     * Sementara dinonaktifkan sampai pivot table dibuat.
     */
    public function gejala()
    {
        return $this->belongsToMany(Gejala::class, 'diagnosa_gejala', 'id_diagnosa', 'id_gejala')
                    ->withTimestamps();
    }

    /**
     * Get all riwayat konsultasi yang menghasilkan diagnosa ini.
     */
    public function riwayatKonsultasi()
    {
        return $this->hasMany(RiwayatKonsultasi::class, 'id_diagnosa', 'id_diagnosa');
    }

    /**
     * Scope untuk mencari diagnosa berdasarkan nama.
     */
    public function scopeSearch($query, $search)
    {
        return $query->where('nama_diagnosa', 'like', '%' . $search . '%')
                    ->orWhere('deskripsi', 'like', '%' . $search . '%');
    }

    /**
     * Scope untuk mengurutkan berdasarkan nama diagnosa.
     */
    public function scopeOrderByName($query, $direction = 'asc')
    {
        return $query->orderBy('nama_diagnosa', $direction);
    }

    /**
     * Get jumlah gejala yang terkait dengan diagnosa ini.
     */
    public function getJumlahGejalaAttribute()
    {
        return $this->gejala()->count();
    }

    /**
     * Get jumlah konsultasi yang menghasilkan diagnosa ini.
     */
    public function getJumlahKonsultasiAttribute()
    {
        return $this->riwayatKonsultasi()->count();
    }

    /**
     * Format nama diagnosa untuk tampilan.
     */
    public function getFormattedNameAttribute()
    {
        return ucwords(strtolower($this->nama_diagnosa));
    }

    /**
     * Get deskripsi singkat (100 karakter pertama).
     */
    public function getShortDescriptionAttribute()
    {
        return strlen($this->deskripsi) > 100
            ? substr($this->deskripsi, 0, 100) . '...'
            : $this->deskripsi;
    }

    /**
     * Check apakah diagnosa ini memiliki gejala.
     */
    public function hasGejala()
    {
        return $this->gejala()->exists();
    }

    /**
     * Check apakah diagnosa ini pernah digunakan dalam konsultasi.
     */
    public function hasBeenUsedInConsultation()
    {
        return $this->riwayatKonsultasi()->exists();
    }

    /**
     * Get statistik diagnosa ini.
     */
    public function getStatistik()
    {
        return [
            'jumlah_konsultasi' => $this->jumlah_konsultasi,
            'has_been_used' => $this->hasBeenUsedInConsultation(),
        ];
    }

    /**
     * Get semua gejala untuk diagnosa ini.
     */
    public function getAllGejala()
    {
        return $this->gejala()
                    ->orderBy('nama_gejala', 'asc')
                    ->get();
    }

    /**
     * Get route key name for model binding.
     */
    public function getRouteKeyName()
    {
        return 'id_diagnosa';
    }

    /**
     * Static method untuk mendapatkan statistik umum diagnosa.
     */
    public static function getOverallStatistics()
    {
        return [
            'total_diagnosa' => self::count(),
            'diagnosa_with_gejala' => self::has('gejala')->count(),
            'diagnosa_used_in_consultation' => self::has('riwayatKonsultasi')->count(),
            'avg_gejala_per_diagnosa' => self::withCount('gejala')->avg('gejala_count'),
        ];
    }

    /**
     * Static method untuk mencari diagnosa berdasarkan gejala.
     */
    public static function findByGejala($gejalaIds)
    {
        if (empty($gejalaIds)) {
            return collect();
        }

        return self::whereHas('gejala', function ($query) use ($gejalaIds) {
            $query->whereIn('gejala.id_gejala', $gejalaIds);
        })->with('gejala')->get();
    }

    /**
     * Get diagnosa yang paling sering muncul dalam konsultasi.
     */
    public static function getMostFrequent($limit = 10)
    {
        return self::withCount('riwayatKonsultasi')
                   ->orderBy('riwayat_konsultasi_count', 'desc')
                   ->limit($limit)
                   ->get();
    }

    /**
     * Boot method untuk model events.
     */
    protected static function boot()
    {
        parent::boot();

        // No special handling needed for JSON columns
    }
}
