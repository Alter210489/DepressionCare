<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Log;

class Gejala extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'gejala';
    protected $primaryKey = 'id_gejala';
    public $incrementing = true;
    protected $keyType = 'int';

    protected $fillable = [
        'kode_gejala',
        'nama_gejala',
        'deskripsi_gejala',
        'kategori_gejala',
        'opsi_jawaban',
        'nilai_cf',
        'is_active',
    ];

    protected $casts = [
        'opsi_jawaban' => 'array',
        'nilai_cf' => 'float',
        'is_active' => 'boolean',
        'created_at' => 'datetime',
        'updated_at' => 'datetime',
        'deleted_at' => 'datetime',
    ];

    protected $attributes = [
        'is_active' => true,
        'nilai_cf' => 0.8,
    ];

    // PENTING: Route Key untuk binding
    public function getRouteKeyName()
    {
        return 'id_gejala';
    }

    public function resolveRouteBinding($value, $field = null)
    {
        return $this->where('id_gejala', $value)->first();
    }

    public function delete()
    {
        Log::info('Gejala delete method called', [
            'id' => $this->id_gejala,
            'kode' => $this->kode_gejala,
            'nama' => $this->nama_gejala,
            'using_soft_delete' => in_array(SoftDeletes::class, class_uses($this))
        ]);

        $result = parent::delete();

        Log::info('Gejala delete result', [
            'result' => $result,
            'deleted_at' => $this->deleted_at,
            'exists' => $this->exists
        ]);

        return $result;
    }

    // Scopes
    public function scopeSearch($query, $search)
    {
        if ($search) {
            return $query->where(function ($q) use ($search) {
                $q->where('kode_gejala', 'LIKE', "%{$search}%")
                  ->orWhere('nama_gejala', 'LIKE', "%{$search}%")
                  ->orWhere('deskripsi_gejala', 'LIKE', "%{$search}%");
            });
        }
        return $query;
    }

    public function scopeByKategori($query, $kategori)
    {
        if ($kategori) {
            return $query->where('kategori_gejala', $kategori);
        }
        return $query;
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function scopeSortBy($query, $sortBy = 'kode_gejala', $sortOrder = 'asc')
    {
        $allowedSortColumns = ['kode_gejala', 'nama_gejala', 'nilai_cf', 'created_at', 'updated_at'];

        if (!in_array($sortBy, $allowedSortColumns)) {
            $sortBy = 'kode_gejala';
        }

        if (!in_array(strtolower($sortOrder), ['asc', 'desc'])) {
            $sortOrder = 'asc';
        }

        return $query->orderBy($sortBy, $sortOrder);
    }

    // Relationships - ATURAN DIAGNOSA SUDAH DIHAPUS

    public function riwayatKonsultasi()
    {
        return $this->belongsToMany(RiwayatKonsultasi::class, 'gejala_konsultasi', 'id_gejala', 'id_riwayat')
                    ->withPivot('jawaban', 'nilai_kepercayaan', 'is_selected')
                    ->withTimestamps();
    }

    // Accessors
    public function getFormattedKodeAttribute()
    {
        return 'G' . str_pad($this->kode_gejala, 3, '0', STR_PAD_LEFT);
    }

    public function getFormattedKategoriAttribute()
    {
        return ucwords(str_replace('_', ' ', $this->kategori_gejala));
    }

    public function getStatusAttribute()
    {
        return $this->is_active ? 'Aktif' : 'Tidak Aktif';
    }

    // Accessor untuk mendapatkan jumlah opsi jawaban
    public function getJumlahOpsiAttribute()
    {
        return is_array($this->opsi_jawaban) ? count($this->opsi_jawaban) : 0;
    }

    // Accessor untuk format nilai CF
    public function getFormattedNilaiCfAttribute()
    {
        return number_format($this->nilai_cf, 2);
    }

    // Accessor untuk persentase CF
    public function getPersentaseCfAttribute()
    {
        return number_format($this->nilai_cf * 100, 1) . '%';
    }

    // Mutators
    public function setKodeGejalaAttribute($value)
    {
        if (is_null($value) || $value === '') {
            $lastGejala = static::withTrashed()->orderBy('id_gejala', 'desc')->first();
            $nextId = $lastGejala ? $lastGejala->id_gejala + 1 : 1;
            $this->attributes['kode_gejala'] = 'G' . str_pad($nextId, 3, '0', STR_PAD_LEFT);
        } else {
            $this->attributes['kode_gejala'] = strtoupper(trim($value));
        }
    }

    public function setNamaGejalaAttribute($value)
    {
        $this->attributes['nama_gejala'] = ucfirst(trim($value));
    }

    // Mutator untuk nilai CF
    public function setNilaiCfAttribute($value)
    {
        // Pastikan nilai CF berada dalam rentang 0.0 - 1.0
        $cf = floatval($value);
        if ($cf < 0.0) {
            $cf = 0.0;
        } elseif ($cf > 1.0) {
            $cf = 1.0;
        }
        $this->attributes['nilai_cf'] = $cf;
    }

    // Mutator untuk opsi jawaban
    public function setOpsiJawabanAttribute($value)
    {
        if (is_string($value)) {
            $value = json_decode($value, true);
        }

        // Validasi format opsi jawaban
        if (is_array($value)) {
            $validated = [];
            foreach ($value as $index => $opsi) {
                if (isset($opsi['text']) && isset($opsi['bobot'])) {
                    $validated[] = [
                        'text' => trim($opsi['text']),
                        'bobot' => floatval($opsi['bobot']),
                        'skor_bdi' => isset($opsi['skor_bdi']) ? intval($opsi['skor_bdi']) : $index,
                    ];
                }
            }
            $this->attributes['opsi_jawaban'] = json_encode($validated);
        } else {
            $this->attributes['opsi_jawaban'] = json_encode([]);
        }
    }

    // Static methods
    public static function getKategoriOptions()
    {
        return [
            'fisik' => 'Fisik',
            'emosional' => 'Emosional',
            'kognitif' => 'Kognitif',
            'perilaku' => 'Perilaku',
            'sosial' => 'Sosial',
        ];
    }

    public static function getDefaultOpsiJawaban()
    {
        return [
            ['text' => 'Tidak pernah', 'bobot' => 0.0, 'skor_bdi' => 0],
            ['text' => 'Jarang', 'bobot' => 0.25, 'skor_bdi' => 1],
            ['text' => 'Sering', 'bobot' => 0.75, 'skor_bdi' => 2],
            ['text' => 'Selalu', 'bobot' => 1.0, 'skor_bdi' => 3],
        ];
    }

    public static function getNilaiCfOptions()
    {
        return [
            0.2 => 'Sangat Rendah (0.2)',
            0.4 => 'Rendah (0.4)',
            0.6 => 'Sedang (0.6)',
            0.8 => 'Tinggi (0.8)',
            1.0 => 'Sangat Tinggi (1.0)',
        ];
    }

    public static function isKodeGejalaUnique($kode, $excludeId = null)
    {
        $query = static::where('kode_gejala', $kode);

        if ($excludeId) {
            $query->where('id_gejala', '!=', $excludeId);
        }

        return $query->doesntExist();
    }

    public static function getStatistik()
    {
        return [
            'total' => static::count(),
            'aktif' => static::where('is_active', true)->count(),
            'tidak_aktif' => static::where('is_active', false)->count(),
            'terhapus' => static::onlyTrashed()->count(),
            'per_kategori' => static::selectRaw('kategori_gejala, COUNT(*) as total')
                                   ->groupBy('kategori_gejala')
                                   ->pluck('total', 'kategori_gejala'),
            'rata_rata_cf' => static::avg('nilai_cf'),
            'cf_tertinggi' => static::max('nilai_cf'),
            'cf_terendah' => static::min('nilai_cf'),
        ];
    }

    public static function getExportData($filters = [])
    {
        $query = static::query();

        if (!empty($filters['search'])) {
            $query->search($filters['search']);
        }

        if (!empty($filters['kategori'])) {
            $query->byKategori($filters['kategori']);
        }

        if (isset($filters['is_active'])) {
            $query->where('is_active', $filters['is_active']);
        }

        if (isset($filters['min_cf'])) {
            $query->where('nilai_cf', '>=', $filters['min_cf']);
        }

        if (isset($filters['max_cf'])) {
            $query->where('nilai_cf', '<=', $filters['max_cf']);
        }

        $sortBy = $filters['sortBy'] ?? 'kode_gejala';
        $sortOrder = $filters['sortOrder'] ?? 'asc';
        $query->sortBy($sortBy, $sortOrder);

        return $query->get();
    }

    // Method untuk validasi opsi jawaban
    public function validateOpsiJawaban($opsiJawaban)
    {
        if (!is_array($opsiJawaban) || count($opsiJawaban) !== 4) {
            return false;
        }

        foreach ($opsiJawaban as $opsi) {
            if (!isset($opsi['text']) || !isset($opsi['bobot'])) {
                return false;
            }

            if (empty(trim($opsi['text']))) {
                return false;
            }

            $bobot = floatval($opsi['bobot']);
            if ($bobot < 0 || $bobot > 1) {
                return false;
            }
        }

        return true;
    }

    // Method untuk validasi nilai CF
    public function validateNilaiCf($nilaiCf)
    {
        $cf = floatval($nilaiCf);
        return $cf >= 0.0 && $cf <= 1.0;
    }

    // Method untuk menghitung nilai kepercayaan berdasarkan jawaban user dan CF gejala
    public function hitungNilaiKepercayaan($bobotJawaban)
    {
        return $this->nilai_cf * floatval($bobotJawaban);
    }

    protected static function boot()
    {
        parent::boot();

        static::creating(function ($model) {
            if (!isset($model->is_active)) {
                $model->is_active = true;
            }

            if (!isset($model->nilai_cf)) {
                $model->nilai_cf = 0.8;
            }

            // Set default opsi jawaban jika tidak ada
            if (empty($model->opsi_jawaban)) {
                $model->opsi_jawaban = static::getDefaultOpsiJawaban();
            }
        });
    }
}
