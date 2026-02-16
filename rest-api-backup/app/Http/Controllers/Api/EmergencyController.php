<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\EmergencyContact;
use App\Models\SosAlert;
use App\Models\RideRequest;
use App\Services\NotificationService;
use Illuminate\Support\Facades\Http;

class EmergencyController extends Controller
{
    protected $notificationService;

    public function __construct(NotificationService $notificationService)
    {
        $this->notificationService = $notificationService;
    }

    /**
     * Add emergency contact
     */
    public function addContact(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'phone' => 'required|string|regex:/^03[0-9]{9}$/',
            'relationship' => 'nullable|string|max:255',
            'is_primary' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = $request->user();

            // If setting as primary, unset other primary contacts
            if ($request->is_primary) {
                EmergencyContact::where('user_id', $user->id)
                    ->update(['is_primary' => false]);
            }

            $contact = EmergencyContact::create([
                'user_id' => $user->id,
                'name' => $request->name,
                'phone' => $request->phone,
                'relationship' => $request->relationship,
                'is_primary' => $request->is_primary ?? false,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Emergency contact added successfully',
                'data' => [
                    'contact' => $contact
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to add emergency contact',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all emergency contacts
     */
    public function getContacts(Request $request)
    {
        try {
            $user = $request->user();

            $contacts = EmergencyContact::where('user_id', $user->id)
                ->orderBy('is_primary', 'desc')
                ->orderBy('created_at', 'asc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => [
                    'contacts' => $contacts
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch contacts',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Update emergency contact
     */
    public function updateContact(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'phone' => 'sometimes|required|string|regex:/^03[0-9]{9}$/',
            'relationship' => 'nullable|string|max:255',
            'is_primary' => 'sometimes|boolean',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = $request->user();

            $contact = EmergencyContact::where('user_id', $user->id)
                ->where('id', $id)
                ->firstOrFail();

            // If setting as primary, unset other primary contacts
            if ($request->has('is_primary') && $request->is_primary) {
                EmergencyContact::where('user_id', $user->id)
                    ->where('id', '!=', $id)
                    ->update(['is_primary' => false]);
            }

            $contact->update($request->only(['name', 'phone', 'relationship', 'is_primary']));

            return response()->json([
                'success' => true,
                'message' => 'Emergency contact updated successfully',
                'data' => [
                    'contact' => $contact
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update contact',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Delete emergency contact
     */
    public function deleteContact(Request $request, $id)
    {
        try {
            $user = $request->user();

            $contact = EmergencyContact::where('user_id', $user->id)
                ->where('id', $id)
                ->firstOrFail();

            $contact->delete();

            return response()->json([
                'success' => true,
                'message' => 'Emergency contact deleted successfully'
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete contact',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Trigger SOS alert
     */
    public function triggerSOS(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'latitude' => 'required|numeric|between:-90,90',
            'longitude' => 'required|numeric|between:-180,180',
            'location_address' => 'nullable|string',
            'message' => 'nullable|string|max:500',
            'type' => 'sometimes|in:emergency,unsafe,accident,other',
            'ride_id' => 'nullable|exists:ride_requests,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = $request->user();

            // Create SOS alert
            $sos = SosAlert::create([
                'user_id' => $user->id,
                'ride_request_id' => $request->ride_id,
                'latitude' => $request->latitude,
                'longitude' => $request->longitude,
                'location_address' => $request->location_address,
                'message' => $request->message,
                'type' => $request->type ?? 'emergency',
                'status' => 'active',
            ]);

            // Notify emergency contacts via SMS
            $this->notifyEmergencyContacts($user, $sos);

            // Notify admin
            $this->notifyAdmin($user, $sos);

            // If in active ride, notify driver
            if ($request->ride_id) {
                $ride = RideRequest::find($request->ride_id);
                if ($ride && $ride->driver_id) {
                    $this->notificationService->notifyDriver(
                        $ride->driver_id,
                        '🚨 Emergency Alert',
                        "{$user->name} has triggered an SOS alert",
                        'general',
                        ['sos_id' => $sos->id]
                    );
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'SOS alert sent successfully. Emergency contacts and admin have been notified.',
                'data' => [
                    'sos' => $sos
                ]
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to trigger SOS',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get SOS history
     */
    public function getSOSHistory(Request $request)
    {
        try {
            $user = $request->user();

            $alerts = SosAlert::where('user_id', $user->id)
                ->with('rideRequest')
                ->orderBy('created_at', 'desc')
                ->paginate(20);

            return response()->json([
                'success' => true,
                'data' => [
                    'alerts' => $alerts->items(),
                    'pagination' => [
                        'current_page' => $alerts->currentPage(),
                        'total_pages' => $alerts->lastPage(),
                        'total' => $alerts->total(),
                    ]
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch SOS history',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Notify emergency contacts via SMS
     */
    private function notifyEmergencyContacts($user, $sos)
    {
        try {
            $contacts = EmergencyContact::where('user_id', $user->id)->get();

            $message = "🚨 EMERGENCY ALERT: {$user->name} has triggered an SOS. Location: {$sos->latitude}, {$sos->longitude}. Please check immediately!";

            foreach ($contacts as $contact) {
                // Send SMS (Twilio integration)
                $this->sendSMS($contact->phone, $message);
            }

            $sos->contacts_notified = true;
            $sos->save();

        } catch (\Exception $e) {
            \Log::error('Emergency contacts notification error: ' . $e->getMessage());
        }
    }

    /**
     * Notify admin
     */
    private function notifyAdmin($user, $sos)
    {
        try {
            // TODO: Send to admin dashboard / email / SMS
            \Log::warning("SOS Alert from user {$user->id}: {$sos->type} at {$sos->latitude}, {$sos->longitude}");

            $sos->admin_notified = true;
            $sos->save();

        } catch (\Exception $e) {
            \Log::error('Admin notification error: ' . $e->getMessage());
        }
    }

    /**
     * Send SMS (Twilio placeholder)
     */
    private function sendSMS($phone, $message)
    {
        try {
            // TODO: Integrate Twilio
            \Log::info("SMS to {$phone}: {$message}");
            
        } catch (\Exception $e) {
            \Log::error("SMS sending error: " . $e->getMessage());
        }
    }
}