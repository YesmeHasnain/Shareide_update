<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\SavedPlace;

class SavedPlacesController extends Controller
{
    /**
     * Get all saved places
     */
    public function index(Request $request)
    {
        try {
            $user = $request->user();

            $places = SavedPlace::where('user_id', $user->id)
                ->orderByRaw("FIELD(type, 'home', 'work', 'other')")
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'places' => $places
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch saved places',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Add a new saved place
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|in:home,work,other',
            'name' => 'required|string|max:255',
            'address' => 'required|string|max:500',
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = $request->user();

            // For home and work, remove existing if any
            if ($request->type === 'home' || $request->type === 'work') {
                SavedPlace::where('user_id', $user->id)
                    ->where('type', $request->type)
                    ->delete();
            }

            $place = SavedPlace::create([
                'user_id' => $user->id,
                'type' => $request->type,
                'name' => $request->name,
                'address' => $request->address,
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'is_default' => $request->type === 'home',
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Place saved successfully',
                'data' => [
                    'place' => $place
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to save place',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update a saved place
     */
    public function update(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'address' => 'sometimes|required|string|max:500',
            'latitude' => 'sometimes|required|numeric|between:-90,90',
            'longitude' => 'sometimes|required|numeric|between:-180,180',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = $request->user();

            $place = SavedPlace::where('user_id', $user->id)
                ->where('id', $id)
                ->firstOrFail();

            $place->update($request->only(['name', 'address', 'latitude', 'longitude']));

            return response()->json([
                'success' => true,
                'message' => 'Place updated successfully',
                'data' => [
                    'place' => $place
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update place',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete a saved place
     */
    public function destroy(Request $request, $id)
    {
        try {
            $user = $request->user();

            $place = SavedPlace::where('user_id', $user->id)
                ->where('id', $id)
                ->firstOrFail();

            $place->delete();

            return response()->json([
                'success' => true,
                'message' => 'Place deleted successfully'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete place',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
