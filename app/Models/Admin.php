<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class Admin extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $table = 'admin';
    protected $primaryKey = 'id_admin';
    public $timestamps = true;

    protected $fillable = [
        'user_id',
        'nama',
        'email',
        'password',
        'role',
        'email_verified_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    // Relasi ke user
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    // Helper methods
    public function isAdmin()
    {
        return $this->role === 'admin';
    }
}
