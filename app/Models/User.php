<?php

namespace App\Models;

use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable implements MustVerifyEmail
{
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed', // Laravel 10+ feature untuk auto-hash password
    ];

    // Helper method untuk cek role
    public function isAdmin(): bool
    {
        return $this->getAttribute('role') === 'admin';
    }

    public function isMahasiswa(): bool
    {
        return $this->getAttribute('role') === 'mahasiswa';
    }

    // Relasi ke data mahasiswa
    public function mahasiswa()
    {
        return $this->hasOne(Mahasiswa::class, 'user_id', 'id');
    }

    // Relasi ke data admin jika ada
    public function admin()
    {
        return $this->hasOne(Admin::class, 'user_id', 'id');
    }

    // Method tambahan untuk kemudahan akses data mahasiswa
    public function getMahasiswaDataAttribute()
    {
        return $this->mahasiswa;
    }

    // Method untuk cek apakah user memiliki data mahasiswa
    public function hasMahasiswaData(): bool
    {
        return $this->mahasiswa !== null;
    }

    // Method untuk cek apakah user memiliki data admin
    public function hasAdminData(): bool
    {
        return $this->admin !== null;
    }

    // Scope untuk filter berdasarkan role
    public function scopeAdmins($query)
    {
        return $query->where('role', 'admin');
    }

    public function scopeMahasiswa($query)
    {
        return $query->where('role', 'mahasiswa');
    }
}
