<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $user = User::updateOrCreate(
            ['email' => 'demo@deardiary.test'],
            ['name' => 'Demo Diarist', 'password' => 'password']
        );

        $samples = [
            ['Slow Sunday, warm tea', "Woke up late and let the morning stretch out. Made tea, opened the window, and read three chapters without checking my phone once.\n\nI want more Sundays like this one.", 'calm', ['slow living', 'demo']],
            ['A small win at work', "Finally shipped the thing I have been circling for weeks. Nobody threw a parade, but I felt quietly proud walking home.", 'happy', ['work', 'demo']],
            ['Rain on the window', "The kind of grey day that makes everything feel softer. Called mum, we talked for an hour about nothing and everything.", 'grateful', ['family', 'demo']],
            ['Too many tabs open', "My head felt crowded all day. Tomorrow I will write the list down and tackle one thing at a time.", 'anxious', ['work', 'demo']],
            ['Market day', "Bought peonies I could not really afford and a loaf that was still warm. Sat by the fountain and people-watched.", 'excited', ['slow living', 'demo']],
            ['Early night', "Skipped the plans and went to bed at nine. Sometimes rest is the most productive thing.", 'tired', ['self care', 'demo']],
        ];

        foreach ($samples as $i => [$title, $content, $mood, $tags]) {
            $entry = $user->entries()->firstOrCreate(
                ['title' => $title],
                ['content' => $content, 'mood' => $mood, 'entry_date' => now()->subDays($i)->toDateString()]
            );

            $entry->tags()->sync(collect($tags)->map(
                fn ($name) => $user->tags()->firstOrCreate(['name' => $name])->id
            ));
        }
    }
}
