<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Memory extends Model
{
    protected $fillable = ['title', 'caption', 'image_path', 'memory_date'];

    protected function casts(): array
    {
        return ['memory_date' => 'date:Y-m-d'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
