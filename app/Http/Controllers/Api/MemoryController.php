<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MemoryResource;
use App\Models\Memory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;

class MemoryController extends Controller
{
    public function index(Request $request)
    {
        $request->validate(['q' => ['nullable', 'string', 'max:100']]);

        $query = $request->user()->memories()->orderByDesc('memory_date')->orderByDesc('id');

        if ($request->filled('q')) {
            $term = '%'.addcslashes($request->query('q'), '%_\\').'%';
            $query->where(fn ($q) => $q->where('title', 'like', $term)->orWhere('caption', 'like', $term));
        }

        return MemoryResource::collection($query->paginate(18)->withQueryString());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'image' => ['required', 'file', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:5120'],
            ...$this->detailRules(),
        ]);

        $memory = $request->user()->memories()->create([
            'title' => $data['title'] ?? null,
            'caption' => $data['caption'] ?? null,
            'memory_date' => $data['memory_date'],
            'image_path' => $request->file('image')->store('memories/'.$request->user()->id),
        ]);

        return (new MemoryResource($memory))->response()->setStatusCode(201);
    }

    public function update(Request $request, Memory $memory): MemoryResource
    {
        Gate::authorize('update', $memory);

        $data = $request->validate([
            'image' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:5120'],
            ...$this->detailRules(),
        ]);

        $attributes = [
            'title' => $data['title'] ?? null,
            'caption' => $data['caption'] ?? null,
            'memory_date' => $data['memory_date'],
        ];

        if ($request->hasFile('image')) {
            Storage::disk('local')->delete($memory->image_path);
            $attributes['image_path'] = $request->file('image')->store('memories/'.$request->user()->id);
        }

        $memory->update($attributes);

        return new MemoryResource($memory);
    }

    public function destroy(Memory $memory): JsonResponse
    {
        Gate::authorize('delete', $memory);

        Storage::disk('local')->delete($memory->image_path);
        $memory->delete();

        return response()->json(null, 204);
    }

    public function image(Memory $memory): StreamedResponse
    {
        Gate::authorize('view', $memory);
        abort_unless(Storage::disk('local')->exists($memory->image_path), 404);

        return Storage::disk('local')->response($memory->image_path, null, [
            'Cache-Control' => 'private, max-age=86400',
        ]);
    }

    private function detailRules(): array
    {
        return [
            'title' => ['nullable', 'string', 'max:150'],
            'caption' => ['nullable', 'string', 'max:500'],
            'memory_date' => ['required', 'date'],
        ];
    }
}
