<?php

namespace Tests\Feature;

use App\Models\JournalEntry;
use App\Models\Memory;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DiaryApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->withHeader('Referer', 'http://127.0.0.1:8000/');
    }

    private function png(string $name = 'photo.png'): UploadedFile
    {
        return UploadedFile::fake()->createWithContent($name, base64_decode(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4z8DwHwAFAAH/q842iQAAAABJRU5ErkJggg=='
        ));
    }

    private function entryFor(User $user, array $overrides = []): JournalEntry
    {
        return $user->entries()->create(array_merge([
            'title' => 'A day',
            'content' => 'Some words about the day.',
            'entry_date' => '2026-10-10',
        ], $overrides));
    }

    public function test_registration_login_and_logout(): void
    {
        $this->postJson('/api/register', [
            'name' => 'Rosa', 'email' => 'rosa@example.com',
            'password' => 'secret-pass', 'password_confirmation' => 'secret-pass',
        ])->assertCreated()->assertJsonPath('data.email', 'rosa@example.com');

        $this->postJson('/api/logout')->assertNoContent();
        $this->app['auth']->forgetGuards();
        $this->getJson('/api/user')->assertUnauthorized();

        $this->postJson('/api/login', ['email' => 'rosa@example.com', 'password' => 'wrong'])
            ->assertUnprocessable()->assertJsonValidationErrors('email');

        $this->postJson('/api/login', ['email' => 'rosa@example.com', 'password' => 'secret-pass'])
            ->assertOk();
        $this->getJson('/api/user')->assertOk()->assertJsonPath('data.name', 'Rosa');
    }

    public function test_registration_validates_input(): void
    {
        $this->postJson('/api/register', ['name' => '', 'email' => 'nope', 'password' => 'short'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'email', 'password']);
    }

    public function test_protected_endpoints_require_authentication(): void
    {
        foreach (['/api/entries', '/api/memories', '/api/dashboard', '/api/tags', '/api/calendar?month=2026-10'] as $url) {
            $this->getJson($url)->assertUnauthorized();
        }
    }

    public function test_entry_crud_with_tags_and_cover(): void
    {
        Storage::fake('local');
        $user = User::factory()->create();
        $this->actingAs($user);

        $id = $this->post('/api/entries', [
            'title' => 'Hello',
            'content' => 'First page',
            'entry_date' => '2026-10-12',
            'mood' => 'calm',
            'tags' => ['walks', '#Slow Living'],
            'cover' => $this->png('cover.png'),
        ], ['Accept' => 'application/json'])
            ->assertCreated()
            ->assertJsonPath('data.visibility', 'private')
            ->assertJsonPath('data.tags', ['Slow Living', 'walks'])
            ->json('data.id');

        $entry = JournalEntry::findOrFail($id);
        Storage::disk('local')->assertExists($entry->cover_path);
        $this->get("/api/entries/{$id}/cover")->assertOk();

        $this->post("/api/entries/{$id}", [
            '_method' => 'PUT', 'title' => 'Hello again', 'content' => 'Edited',
            'entry_date' => '2026-10-12', 'tags' => ['walks'], 'remove_cover' => '1',
        ], ['Accept' => 'application/json'])
            ->assertOk()->assertJsonPath('data.title', 'Hello again')->assertJsonPath('data.cover_url', null);

        Storage::disk('local')->assertMissing($entry->cover_path);
        $this->assertDatabaseMissing('tags', ['name' => 'Slow Living']);

        $this->deleteJson("/api/entries/{$id}")->assertNoContent();
        $this->assertDatabaseMissing('journal_entries', ['id' => $id]);
    }

    public function test_entry_validation(): void
    {
        $this->actingAs(User::factory()->create());

        $this->postJson('/api/entries', ['title' => '', 'mood' => 'bogus', 'entry_date' => 'x'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['title', 'content', 'entry_date', 'mood']);

        $this->post('/api/entries', [
            'title' => 'T', 'content' => 'C', 'entry_date' => '2026-10-10',
            'cover' => UploadedFile::fake()->create('notes.pdf', 10, 'application/pdf'),
        ], ['Accept' => 'application/json'])->assertUnprocessable()->assertJsonValidationErrors('cover');
    }

    public function test_users_cannot_touch_each_others_entries(): void
    {
        $owner = User::factory()->create();
        $intruder = User::factory()->create();
        $entry = $this->entryFor($owner);

        $this->actingAs($intruder);
        $this->getJson("/api/entries/{$entry->id}")->assertForbidden();
        $this->putJson("/api/entries/{$entry->id}", [
            'title' => 'Hacked', 'content' => 'x', 'entry_date' => '2026-10-10',
        ])->assertForbidden();
        $this->deleteJson("/api/entries/{$entry->id}")->assertForbidden();
        $this->getJson("/api/entries/{$entry->id}/cover")->assertForbidden();

        $this->getJson('/api/entries')->assertOk()->assertJsonCount(0, 'data');
        $this->assertDatabaseHas('journal_entries', ['id' => $entry->id, 'title' => 'A day']);
    }

    public function test_users_cannot_touch_each_others_memories_or_tags(): void
    {
        Storage::fake('local');
        $owner = User::factory()->create();
        $intruder = User::factory()->create();

        $memory = $owner->memories()->create([
            'caption' => 'Mine', 'memory_date' => '2026-10-01',
            'image_path' => $this->png()->store('memories/'.$owner->id),
        ]);
        $tag = $owner->tags()->create(['name' => 'private']);

        $this->actingAs($intruder);
        $this->getJson("/api/memories/{$memory->id}/image")->assertForbidden();
        $this->putJson("/api/memories/{$memory->id}", ['memory_date' => '2026-10-02'])->assertForbidden();
        $this->deleteJson("/api/memories/{$memory->id}")->assertForbidden();
        $this->deleteJson("/api/tags/{$tag->id}")->assertForbidden();
        $this->getJson('/api/tags')->assertJsonCount(0, 'data');
    }

    public function test_memory_upload_update_delete(): void
    {
        Storage::fake('local');
        $this->actingAs(User::factory()->create());

        $id = $this->post('/api/memories', [
            'image' => $this->png('beach.png'),
            'caption' => 'Beach day', 'memory_date' => '2026-09-01',
        ], ['Accept' => 'application/json'])->assertCreated()->json('data.id');

        $path = Memory::findOrFail($id)->image_path;
        Storage::disk('local')->assertExists($path);

        $this->postJson("/api/memories/{$id}", ['_method' => 'PUT', 'caption' => 'Beach!', 'memory_date' => '2026-09-02'])
            ->assertOk()->assertJsonPath('data.caption', 'Beach!');

        $this->deleteJson("/api/memories/{$id}")->assertNoContent();
        Storage::disk('local')->assertMissing($path);
    }

    public function test_entry_filters_and_sorting(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);
        $this->entryFor($user, ['title' => 'Apple pie', 'entry_date' => '2026-10-01', 'mood' => 'happy']);
        $this->entryFor($user, ['title' => 'Zebra', 'content' => 'stripes', 'entry_date' => '2026-10-05', 'mood' => 'sad']);

        $this->getJson('/api/entries?q=apple')->assertJsonCount(1, 'data')->assertJsonMissingPath('data.0.content');
        $this->getJson('/api/entries')->assertJsonMissingPath('data.1.content');
        $this->getJson('/api/entries?mood=sad')->assertJsonCount(1, 'data')->assertJsonPath('data.0.title', 'Zebra');
        $this->getJson('/api/entries?from=2026-10-03')->assertJsonCount(1, 'data');
        $this->getJson('/api/entries?sort=oldest')->assertJsonPath('data.0.title', 'Apple pie');
        $this->getJson('/api/entries?sort=title')->assertJsonPath('data.0.title', 'Apple pie');
    }

    public function test_dashboard_and_calendar_use_real_data(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user);
        $this->entryFor($user, ['entry_date' => '2026-10-13', 'mood' => 'calm']);
        $this->entryFor($user, ['title' => 'Y', 'entry_date' => '2026-10-12', 'mood' => 'calm']);
        $this->entryFor($user, ['title' => 'Old', 'entry_date' => '2026-08-01']);

        $this->getJson('/api/dashboard?today=2026-10-13')
            ->assertOk()
            ->assertJsonPath('total_entries', 3)
            ->assertJsonPath('entries_this_month', 2)
            ->assertJsonPath('streak', 2)
            ->assertJsonPath('moods.0.mood', 'calm')
            ->assertJsonPath('moods.0.count', 2);

        $this->getJson('/api/calendar?month=2026-10')->assertJsonCount(2, 'data');
    }

    public function test_profile_password_and_preferences(): void
    {
        $user = User::factory()->create(['password' => 'old-password']);
        $this->actingAs($user);

        $this->putJson('/api/profile', ['name' => 'New Name', 'email' => 'new@example.com'])
            ->assertOk()->assertJsonPath('data.name', 'New Name');

        $this->putJson('/api/profile/password', [
            'current_password' => 'nope', 'password' => 'brand-new-pass', 'password_confirmation' => 'brand-new-pass',
        ])->assertUnprocessable()->assertJsonValidationErrors('current_password');

        $this->putJson('/api/profile/password', [
            'current_password' => 'old-password', 'password' => 'brand-new-pass', 'password_confirmation' => 'brand-new-pass',
        ])->assertOk();

        $this->putJson('/api/profile/preferences', ['theme' => 'night', 'text_size' => 'large'])
            ->assertOk()->assertJsonPath('data.theme', 'night');
        $this->putJson('/api/profile/preferences', ['theme' => 'neon', 'text_size' => 'large'])
            ->assertUnprocessable();
    }

    public function test_password_reset_flow(): void
    {
        $user = User::factory()->create();
        $token = null;

        \Illuminate\Support\Facades\Notification::fake();
        $this->postJson('/api/forgot-password', ['email' => $user->email])->assertOk();
        $this->postJson('/api/forgot-password', ['email' => 'ghost@example.com'])->assertOk();

        \Illuminate\Support\Facades\Notification::assertSentTo($user, \Illuminate\Auth\Notifications\ResetPassword::class, function ($n) use (&$token) {
            $token = $n->token;

            return true;
        });

        $this->postJson('/api/reset-password', [
            'token' => $token, 'email' => $user->email,
            'password' => 'fresh-password', 'password_confirmation' => 'fresh-password',
        ])->assertOk();

        $this->postJson('/api/login', ['email' => $user->email, 'password' => 'fresh-password'])->assertOk();
    }
}


