<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MemoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'caption' => $this->caption,
            'memory_date' => $this->memory_date->toDateString(),
            'image_url' => "/api/memories/{$this->id}/image?v={$this->updated_at->timestamp}",
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
