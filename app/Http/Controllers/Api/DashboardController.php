<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\EntryResource;
use App\Models\JournalEntry;
use App\Support\Moods;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $data = $request->validate(['today' => ['nullable', 'date_format:Y-m-d']]);
        $user = $request->user();
        $today = CarbonImmutable::parse($data['today'] ?? now()->toDateString())->startOfDay();

        $entries = $user->entries();

        $moodCounts = $user->entries()
            ->whereNotNull('mood')
            ->whereBetween('entry_date', [$today->subDays(29)->toDateString(), $today->toDateString()])
            ->selectRaw('mood, count(*) as total')
            ->groupBy('mood')
            ->orderByDesc('total')
            ->pluck('total', 'mood');

        return response()->json([
            'total_entries' => (clone $entries)->count(),
            'entries_this_month' => (clone $entries)
                ->whereBetween('entry_date', [$today->startOfMonth()->toDateString(), $today->endOfMonth()->toDateString()])
                ->count(),
            'memories_count' => $user->memories()->count(),
            'streak' => $this->streak($user->entries()->pluck('entry_date'), $today),
            'moods' => collect($moodCounts)->map(fn ($total, $mood) => [
                'mood' => $mood,
                'label' => Moods::ALL[$mood] ?? $mood,
                'count' => $total,
            ])->values(),
            'recent_entries' => EntryResource::collection(
                $user->entries()->with('tags')->orderByDesc('entry_date')->orderByDesc('id')->limit(4)->get()
            ),
        ]);
    }

    private function streak($dates, CarbonImmutable $today): int
    {
        $days = $dates->map(fn ($d) => CarbonImmutable::parse($d)->toDateString())->unique()->flip();

        $cursor = $days->has($today->toDateString()) ? $today : $today->subDay();
        $count = 0;

        while ($days->has($cursor->toDateString())) {
            $count++;
            $cursor = $cursor->subDay();
        }

        return $count;
    }
}

