<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CalendarController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $data = $request->validate(['month' => ['required', 'date_format:Y-m']]);

        $start = CarbonImmutable::createFromFormat('Y-m', $data['month'])->startOfMonth();

        $entries = $request->user()->entries()
            ->whereBetween('entry_date', [$start->toDateString(), $start->endOfMonth()->toDateString()])
            ->orderBy('entry_date')->orderBy('id')
            ->get(['id', 'title', 'entry_date', 'mood'])
            ->map(fn ($e) => [
                'id' => $e->id,
                'title' => $e->title,
                'entry_date' => $e->entry_date->toDateString(),
                'mood' => $e->mood,
            ]);

        return response()->json(['data' => $entries]);
    }
}
