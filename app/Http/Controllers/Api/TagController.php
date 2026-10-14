<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Tag;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

class TagController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $tags = $request->user()->tags()->withCount('entries')->orderBy('name')->get()
            ->map(fn (Tag $tag) => [
                'id' => $tag->id,
                'name' => $tag->name,
                'entries_count' => $tag->entries_count,
            ]);

        return response()->json(['data' => $tags]);
    }

    public function destroy(Tag $tag): JsonResponse
    {
        Gate::authorize('delete', $tag);

        $tag->delete();

        return response()->json(null, 204);
    }
}
