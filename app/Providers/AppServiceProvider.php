<?php

namespace App\Providers;

use App\Models\JournalEntry;
use App\Models\Memory;
use App\Models\Tag;
use App\Policies\JournalEntryPolicy;
use App\Policies\MemoryPolicy;
use App\Policies\TagPolicy;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\ServiceProvider;
use Laravel\Sanctum\Sanctum;

class AppServiceProvider extends ServiceProvider
{
    public function boot(): void
    {
        config(['sanctum.stateful' => array_merge(
            config('sanctum.stateful', []),
            [Sanctum::$currentRequestHostPlaceholder]
        )]);

        Gate::policy(JournalEntry::class, JournalEntryPolicy::class);
        Gate::policy(Memory::class, MemoryPolicy::class);
        Gate::policy(Tag::class, TagPolicy::class);

        ResetPassword::createUrlUsing(fn ($user, string $token) => url('/reset-password/'.$token).'?email='.urlencode($user->email));
    }
}

