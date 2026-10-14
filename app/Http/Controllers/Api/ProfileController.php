<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Password as PasswordRule;

class ProfileController extends Controller
{
    public function update(Request $request): UserResource
    {
        $user = $request->user();

        $data = $request->validate([
            'name' => ['required', 'string', 'max:100'],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
        ]);

        $user->update($data);

        return new UserResource($user);
    }

    public function updatePassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'current_password' => ['required', 'current_password:web'],
            'password' => ['required', 'confirmed', PasswordRule::min(8), 'different:current_password'],
        ]);

        $request->user()->update(['password' => $data['password']]);

        return response()->json(['message' => 'Password updated.']);
    }

    public function updatePreferences(Request $request): UserResource
    {
        $data = $request->validate([
            'theme' => ['required', Rule::in(User::THEMES)],
            'text_size' => ['required', Rule::in(User::TEXT_SIZES)],
        ]);

        $request->user()->update($data);

        return new UserResource($request->user());
    }
}
