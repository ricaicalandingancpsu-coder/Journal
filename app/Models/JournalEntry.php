<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Support\Str;

class JournalEntry extends Model
{
    protected $fillable = ['title', 'content', 'entry_date', 'mood', 'cover_path', 'visibility'];

    protected function casts(): array
    {
        return ['entry_date' => 'date:Y-m-d'];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class, 'journal_entry_tag')->orderBy('name');
    }

    protected function excerpt(): Attribute
    {
        return Attribute::get(fn () => Str::limit(trim(preg_replace('/\s+/', ' ', $this->content)), 170));
    }
}
