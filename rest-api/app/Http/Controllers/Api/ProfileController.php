<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;

class ProfileController extends Controller
{
    /**
     * Update rider profile
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        // Only riders can update profile through this endpoint
        if ($user->role !== 'rider') {
            return response()->json([
                'success' => false,
                'message' => 'Only riders can update profile',
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'full_name' => 'nullable|string|max:255',
            'default_city' => 'nullable|string|max:255',
            'avatar' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Get or create rider profile
        $profile = $user->riderProfile;

        if (!$profile) {
            $profile = $user->riderProfile()->create([
                'full_name' => $user->name,
            ]);
        }

        // Update fields
        if ($request->has('full_name')) {
            $profile->full_name = $request->full_name;
            $user->name = $request->full_name;
            $user->save();
        }

        if ($request->has('default_city')) {
            $profile->default_city = $request->default_city;
        }

        // Handle avatar upload
        if ($request->hasFile('avatar')) {
            // Delete old avatar if exists
            if ($profile->avatar_path) {
                Storage::disk('public')->delete($profile->avatar_path);
            }

            // Store new avatar
            $avatarPath = $request->file('avatar')->store('avatars', 'public');
            $profile->avatar_path = $avatarPath;
        }

        $profile->save();

        return response()->json([
            'success' => true,
            'message' => 'Profile updated successfully',
            'profile' => [
                'full_name' => $profile->full_name,
                'avatar_path' => $profile->avatar_path,
                'avatar_url' => $profile->avatar_path ? Storage::url($profile->avatar_path) : null,
                'default_city' => $profile->default_city,
            ],
        ]);
    }

    /**
     * Get rider profile
     */
    public function getProfile(Request $request)
    {
        $user = $request->user();
        $profile = $user->riderProfile;

        if (!$profile) {
            return response()->json([
                'success' => false,
                'message' => 'Profile not found',
            ], 404);
        }

        return response()->json([
            'success' => true,
            'profile' => [
                'full_name' => $profile->full_name,
                'avatar_path' => $profile->avatar_path,
                'avatar_url' => $profile->avatar_path ? Storage::url($profile->avatar_path) : null,
                'default_city' => $profile->default_city,
            ],
        ]);
    }
}