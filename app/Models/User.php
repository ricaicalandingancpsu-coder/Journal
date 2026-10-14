<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasFactory, Notifiable;

    public const THEMES = ['cream', 'blush', 'lavender', 'night'];

    public const TEXT_SIZES = ['comfortable', 'large'];

    protected $fillable = [
        'name',
        'email',
        'password',
        'theme',
        'text_size',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    public function entries(): HasMany
    {
        return $this->hasMany(JournalEntry::class);
    }

    public function tags(): HasMany
    {
        return $this->hasMany(Tag::class);
    }

    public function memories(): HasMany
    {
        return $this->hasMany(Memory::class);
    }
}
