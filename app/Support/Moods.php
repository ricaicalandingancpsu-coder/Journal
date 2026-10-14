<?php

namespace App\Support;

class Moods
{
    public const ALL = [
        'happy' => 'Happy',
        'grateful' => 'Grateful',
        'loved' => 'Loved',
        'excited' => 'Excited',
        'calm' => 'Calm',
        'tired' => 'Tired',
        'anxious' => 'Anxious',
        'sad' => 'Sad',
        'angry' => 'Frustrated',
    ];

    public static function keys(): array
    {
        return array_keys(self::ALL);
    }
}
