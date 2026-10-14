<?php

namespace App\Policies;

use App\Models\Memory;
use App\Models\User;

class MemoryPolicy
{
    public function view(User $user, Memory $memory): bool
    {
        return $memory->user_id === $user->id;
    }

    public function update(User $user, Memory $memory): bool
    {
        return $memory->user_id === $user->id;
    }

    public function delete(User $user, Memory $memory): bool
    {
        return $memory->user_id === $user->id;
    }
}
