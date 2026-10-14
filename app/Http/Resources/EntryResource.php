<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EntryResource extends JsonResource
{
    private bool $withContent = false;

    public function withContent(): static
    {
        $this->withContent = true;

        return $this;
    }

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'excerpt' => $this->excerpt,
            'content' => $this->when($this->withContent, $this->content),
            'entry_date' => $this->entry_date->toDateString(),
            'mood' => $this->mood,
            'visibility' => $this->visibility,
            'tags' => $this->whenLoaded('tags', fn () => $this->tags->pluck('name')->values()),
            'cover_url' => $this->cover_path
                ? "/api/entries/{$this->id}/cover?v={$this->updated_at->timestamp}"
                : null,
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
