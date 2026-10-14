<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\EntryResource;
use App\Models\JournalEntry;
use App\Models\User;
use App\Support\Moods;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;

class EntryController extends Controller
{
    public function index(Request $request)
    {
        $filters = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'mood' => ['nullable', Rule::in(Moods::keys())],
            'tag' => ['nullable', 'string', 'max:40'],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
            'sort' => ['nullable', Rule::in(['newest', 'oldest', 'title', 'updated'])],
        ]);

        $query = $request->user()->entries()->with('tags');

        if (! empty($filters['q'])) {
            $term = '%'.addcslashes($filters['q'], '%_\\').'%';
            $query->where(fn ($q) => $q->where('title', 'like', $term)->orWhere('content', 'like', $term));
        }
        if (! empty($filters['mood'])) {
            $query->where('mood', $filters['mood']);
        }
        if (! empty($filters['tag'])) {
            $query->whereHas('tags', fn ($q) => $q->where('name', $filters['tag']));
        }
        if (! empty($filters['from'])) {
            $query->whereDate('entry_date', '>=', $filters['from']);
        }
        if (! empty($filters['to'])) {
            $query->whereDate('entry_date', '<=', $filters['to']);
        }

        match ($filters['sort'] ?? 'newest') {
            'oldest' => $query->orderBy('entry_date')->orderBy('id'),
            'title' => $query->orderBy('title'),
            'updated' => $query->orderByDesc('updated_at'),
            default => $query->orderByDesc('entry_date')->orderByDesc('id'),
        };

        return EntryResource::collection($query->paginate(12)->withQueryString());
    }

    public function store(Request $request): JsonResponse
    {
        $data = $this->validated($request);

        $entry = $request->user()->entries()->create(
            $this->attributes($data, $request) + ['visibility' => 'private']
        );
        $this->syncTags($request->user(), $entry, $data['tags'] ?? []);

        return ((new EntryResource($entry->load('tags')))->withContent())->response()->setStatusCode(201);
    }

    public function show(JournalEntry $entry): EntryResource
    {
        Gate::authorize('view', $entry);

        return (new EntryResource($entry->load('tags')))->withContent();
    }

    public function update(Request $request, JournalEntry $entry): EntryResource
    {
        Gate::authorize('update', $entry);

        $data = $this->validated($request);
        $attributes = $this->attributes($data, $request);

        if ($request->hasFile('cover')) {
            $this->deleteCover($entry);
        } elseif ($request->boolean('remove_cover')) {
            $this->deleteCover($entry);
            $attributes['cover_path'] = null;
        }

        $entry->update($attributes);
        $this->syncTags($request->user(), $entry, $data['tags'] ?? []);

        return (new EntryResource($entry->load('tags')))->withContent();
    }

    public function destroy(Request $request, JournalEntry $entry): JsonResponse
    {
        Gate::authorize('delete', $entry);

        $this->deleteCover($entry);
        $entry->delete();
        $this->pruneTags($request->user());

        return response()->json(null, 204);
    }

    public function cover(JournalEntry $entry): StreamedResponse
    {
        Gate::authorize('view', $entry);
        abort_unless($entry->cover_path && Storage::disk('local')->exists($entry->cover_path), 404);

        return Storage::disk('local')->response($entry->cover_path, null, [
            'Cache-Control' => 'private, max-age=86400',
        ]);
    }

    private function validated(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:150'],
            'content' => ['required', 'string', 'max:50000'],
            'entry_date' => ['required', 'date'],
            'mood' => ['nullable', Rule::in(Moods::keys())],
            'tags' => ['nullable', 'array', 'max:10'],
            'tags.*' => ['string', 'max:40'],
            'cover' => ['nullable', 'file', 'image', 'mimes:jpg,jpeg,png,webp,gif', 'max:5120'],
            'remove_cover' => ['nullable', 'boolean'],
        ]);
    }

    private function attributes(array $data, Request $request): array
    {
        $attributes = [
            'title' => $data['title'],
            'content' => $data['content'],
            'entry_date' => $data['entry_date'],
            'mood' => $data['mood'] ?? null,
        ];

        if ($request->hasFile('cover')) {
            $attributes['cover_path'] = $request->file('cover')->store('covers/'.$request->user()->id);
        }

        return $attributes;
    }

    private function syncTags(User $user, JournalEntry $entry, array $names): void
    {
        $ids = collect($names)
            ->map(fn ($name) => trim(ltrim(trim($name), '#')))
            ->filter()
            ->unique(fn ($name) => mb_strtolower($name))
            ->map(fn ($name) => $user->tags()->firstOrCreate(['name' => $name])->id)
            ->all();

        $entry->tags()->sync($ids);
        $this->pruneTags($user);
    }

    private function pruneTags(User $user): void
    {
        $user->tags()->doesntHave('entries')->delete();
    }

    private function deleteCover(JournalEntry $entry): void
    {
        if ($entry->cover_path) {
            Storage::disk('local')->delete($entry->cover_path);
        }
    }
}
