<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use App\Models\Driver;
use App\Models\Vehicle;
use App\Models\DriverDocument;
use App\Models\Wallet;

class OnboardingController extends Controller
{
    /**
     * Step 1: Personal Information
     */
    public function personalInfo(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'nullable|email',
            'cnic' => 'required|string|size:15|unique:drivers,cnic',
            'address' => 'required|string',
            'city' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $user = $request->user();

            // Update user name
            $user->name = $request->first_name . ' ' . $request->last_name;
            if ($request->email) {
                $user->email = $request->email;
            }
            $user->save();

            // Create or update driver profile
            $driver = Driver::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'cnic' => $request->cnic,
                    'address' => $request->address,
                    'city' => $request->city,
                    'status' => 'pending',
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Personal information saved successfully',
                'data' => [
                    'driver' => $driver
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to save personal information',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Step 2: Vehicle Information
     */
    public function vehicleInfo(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'type' => 'required|in:bike,car,rickshaw',
            'registration_number' => 'required|string|unique:vehicles,registration_number',
            'make' => 'required|string',
            'model' => 'required|string',
            'year' => 'required|integer|min:1990|max:' . (date('Y') + 1),
            'color' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $driver = $request->user()->driver;

            if (!$driver) {
                return response()->json([
                    'success' => false,
                    'message' => 'Driver profile not found. Complete personal info first.'
                ], 404);
            }

            $vehicle = Vehicle::updateOrCreate(
                ['driver_id' => $driver->id],
                [
                    'type' => $request->type,
                    'registration_number' => $request->registration_number,
                    'make' => $request->make,
                    'model' => $request->model,
                    'year' => $request->year,
                    'color' => $request->color,
                    'status' => 'active',
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Vehicle information saved successfully',
                'data' => [
                    'vehicle' => $vehicle
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to save vehicle information',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Step 3: Upload Documents
     */
    public function uploadDocuments(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nic_front' => 'required|image|mimes:jpeg,png,jpg|max:5120',
            'nic_back' => 'required|image|mimes:jpeg,png,jpg|max:5120',
            'license_front' => 'required|image|mimes:jpeg,png,jpg|max:5120',
            'license_back' => 'required|image|mimes:jpeg,png,jpg|max:5120',
            'vehicle_registration' => 'required|image|mimes:jpeg,png,jpg|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $driver = $request->user()->driver;

            if (!$driver) {
                return response()->json([
                    'success' => false,
                    'message' => 'Driver profile not found'
                ], 404);
            }

            $documents = [];

            // Upload each document
            foreach (['nic_front', 'nic_back', 'license_front', 'license_back', 'vehicle_registration'] as $doc) {
                if ($request->hasFile($doc)) {
                    $path = $request->file($doc)->store('documents/' . $driver->id, 'public');
                    $documents[$doc] = $path;
                }
            }

            // Create or update driver documents
            $driverDoc = DriverDocument::updateOrCreate(
                ['driver_id' => $driver->id],
                array_merge($documents, [
                    'verification_status' => 'pending'
                ])
            );

            return response()->json([
                'success' => true,
                'message' => 'Documents uploaded successfully',
                'data' => [
                    'documents' => $driverDoc
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload documents',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Step 4: Upload Selfies
     */
    public function uploadSelfies(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'selfie_with_nic' => 'required|image|mimes:jpeg,png,jpg|max:5120',
            'live_selfie' => 'required|image|mimes:jpeg,png,jpg|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $driver = $request->user()->driver;

            if (!$driver) {
                return response()->json([
                    'success' => false,
                    'message' => 'Driver profile not found'
                ], 404);
            }

            $driverDoc = DriverDocument::where('driver_id', $driver->id)->first();

            if (!$driverDoc) {
                return response()->json([
                    'success' => false,
                    'message' => 'Please upload documents first'
                ], 404);
            }

            // Upload selfies
            $selfieWithNic = $request->file('selfie_with_nic')->store('selfies/' . $driver->id, 'public');
            $liveSelfie = $request->file('live_selfie')->store('selfies/' . $driver->id, 'public');

            $driverDoc->update([
                'selfie_with_nic' => $selfieWithNic,
                'live_selfie' => $liveSelfie,
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Selfies uploaded successfully',
                'data' => [
                    'documents' => $driverDoc
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload selfies',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Check Application Status
     */
    public function getStatus(Request $request)
    {
        try {
            $driver = $request->user()->driver;

            if (!$driver) {
                return response()->json([
                    'success' => false,
                    'message' => 'Driver profile not found'
                ], 404);
            }

            $vehicle = $driver->vehicle;
            $documents = $driver->documents;

            return response()->json([
                'success' => true,
                'data' => [
                    'status' => $driver->status,
                    'driver' => $driver,
                    'vehicle' => $vehicle,
                    'documents' => $documents,
                    'steps_completed' => [
                        'personal_info' => !empty($driver->cnic),
                        'vehicle_info' => $vehicle !== null,
                        'documents' => $documents && $documents->nic_front !== null,
                        'selfies' => $documents && $documents->selfie_with_nic !== null,
                    ]
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch status',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Submit for Approval (Final Step)
     */
    public function submitForApproval(Request $request)
    {
        try {
            $driver = $request->user()->driver;

            if (!$driver) {
                return response()->json([
                    'success' => false,
                    'message' => 'Driver profile not found'
                ], 404);
            }

            // Validate all steps are complete
            $vehicle = $driver->vehicle;
            $documents = $driver->documents;

            if (!$vehicle || !$documents || 
                !$documents->nic_front || 
                !$documents->selfie_with_nic) {
                return response()->json([
                    'success' => false,
                    'message' => 'Please complete all registration steps first'
                ], 400);
            }

            // Update driver status to pending
            $driver->update(['status' => 'pending']);

            // Create wallet for driver
            Wallet::firstOrCreate(
                ['driver_id' => $driver->id],
                [
                    'balance' => 0,
                    'total_earned' => 0,
                    'total_withdrawn' => 0,
                    'pending_amount' => 0,
                ]
            );

            return response()->json([
                'success' => true,
                'message' => 'Application submitted successfully. We will review your documents within 24-48 hours.',
                'data' => [
                    'driver' => $driver
                ]
            ], 200);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit application',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}