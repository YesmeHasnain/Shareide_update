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
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Please login first.'
            ], 401);
        }

        // Check if driver already exists for this user (for unique CNIC validation)
        $existingDriver = Driver::where('user_id', $user->id)->first();

        $validator = Validator::make($request->all(), [
            'first_name' => 'required|string|max:255',
            'last_name' => 'required|string|max:255',
            'email' => 'nullable|email',
            'cnic' => 'required|string|size:15|unique:drivers,cnic,' . ($existingDriver ? $existingDriver->id : 'NULL'),
            'address' => 'required|string',
            'city' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Update user name
            $user->name = $request->first_name . ' ' . $request->last_name;
            if ($request->email) {
                $user->email = $request->email;
            }
            $user->save();

            // Create or update driver profile
            // Provide defaults for required fields that will be filled in later steps
            $driverData = [
                'cnic' => $request->cnic,
                'cnic_name' => $request->first_name . ' ' . $request->last_name,
                'address' => $request->address,
                'city' => $request->city,
                'status' => $existingDriver ? $existingDriver->status : 'pending',
            ];

            // Only set defaults for new drivers (existing drivers already have these)
            if (!$existingDriver) {
                $driverData['vehicle_type'] = 'car'; // Default, will be updated in step 2
                $driverData['seats'] = 4; // Default, will be updated in step 2
            }

            $driver = Driver::updateOrCreate(
                ['user_id' => $user->id],
                $driverData
            );

            return response()->json([
                'success' => true,
                'message' => 'Personal information saved successfully',
                'data' => [
                    'driver' => $driver
                ]
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Onboarding personal info error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to save personal information',
                'error' => config('app.debug') ? $e->getMessage() : 'Server error'
            ], 500);
        }
    }

    /**
     * Step 2: Vehicle Information
     * Vehicle info is stored directly in drivers table
     */
    public function vehicleInfo(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized. Please login first.'
            ], 401);
        }

        $driver = $user->driver;

        if (!$driver) {
            return response()->json([
                'success' => false,
                'message' => 'Driver profile not found. Complete personal info first.'
            ], 404);
        }

        // Check for unique plate number (excluding current driver)
        $validator = Validator::make($request->all(), [
            'type' => 'required|in:bike,car,rickshaw',
            'registration_number' => 'required|string|unique:drivers,plate_number,' . $driver->id,
            'make' => 'required|string',
            'model' => 'required|string',
            'year' => 'required|integer|min:1990|max:' . (date('Y') + 1),
            'color' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Update driver with vehicle info (stored in same table)
            $driver->update([
                'vehicle_type' => $request->type,
                'plate_number' => $request->registration_number,
                'vehicle_model' => $request->make . ' ' . $request->model . ' (' . $request->year . ') - ' . $request->color,
                'seats' => $request->type === 'car' ? 4 : ($request->type === 'rickshaw' ? 3 : 2),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Vehicle information saved successfully',
                'data' => [
                    'driver' => $driver->fresh()
                ]
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Onboarding vehicle info error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to save vehicle information',
                'error' => config('app.debug') ? $e->getMessage() : 'Server error'
            ], 500);
        }
    }

    /**
     * Step 3: Upload Documents
     */
    public function uploadDocuments(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

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
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $driver = $user->driver;

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
            \Log::error('Onboarding uploadDocuments error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload documents',
                'error' => config('app.debug') ? $e->getMessage() : 'Server error'
            ], 500);
        }
    }

    /**
     * Step 4: Upload Selfies
     */
    public function uploadSelfies(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        $validator = Validator::make($request->all(), [
            'selfie_with_nic' => 'required|image|mimes:jpeg,png,jpg|max:5120',
            'live_selfie' => 'required|image|mimes:jpeg,png,jpg|max:5120',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $driver = $user->driver;

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
            \Log::error('Onboarding uploadSelfies error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to upload selfies',
                'error' => config('app.debug') ? $e->getMessage() : 'Server error'
            ], 500);
        }
    }

    /**
     * Check Application Status
     */
    public function getStatus(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        try {
            $driver = $user->driver;

            if (!$driver) {
                return response()->json([
                    'success' => false,
                    'message' => 'Driver profile not found'
                ], 404);
            }

            $documents = $driver->documents;

            // Vehicle info is now stored in driver table
            $hasVehicleInfo = !empty($driver->vehicle_type) && !empty($driver->plate_number);

            // Format documents with full URLs
            $formattedDocuments = null;
            if ($documents) {
                $formattedDocuments = [
                    'id' => $documents->id,
                    'nic_front' => $documents->nic_front ? url('storage/' . $documents->nic_front) : null,
                    'nic_back' => $documents->nic_back ? url('storage/' . $documents->nic_back) : null,
                    'license_front' => $documents->license_front ? url('storage/' . $documents->license_front) : null,
                    'license_back' => $documents->license_back ? url('storage/' . $documents->license_back) : null,
                    'vehicle_registration' => $documents->vehicle_registration ? url('storage/' . $documents->vehicle_registration) : null,
                    'selfie_with_nic' => $documents->selfie_with_nic ? url('storage/' . $documents->selfie_with_nic) : null,
                ];
            }

            return response()->json([
                'success' => true,
                'data' => [
                    'status' => $driver->status,
                    'driver' => $driver,
                    'documents' => $formattedDocuments,
                    'steps_completed' => [
                        'personal_info' => !empty($driver->cnic),
                        'vehicle_info' => $hasVehicleInfo,
                        'documents' => $documents && $documents->nic_front !== null,
                        'selfies' => $documents && $documents->selfie_with_nic !== null,
                        'submitted' => in_array($driver->status, ['pending', 'approved', 'rejected']),
                    ]
                ]
            ], 200);

        } catch (\Exception $e) {
            \Log::error('Onboarding getStatus error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to fetch status',
                'error' => config('app.debug') ? $e->getMessage() : 'Server error'
            ], 500);
        }
    }

    /**
     * Submit for Approval (Final Step)
     */
    public function submitForApproval(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized'
            ], 401);
        }

        try {
            $driver = $user->driver;

            if (!$driver) {
                return response()->json([
                    'success' => false,
                    'message' => 'Driver profile not found'
                ], 404);
            }

            // Validate all steps are complete
            $hasVehicleInfo = !empty($driver->vehicle_type) && !empty($driver->plate_number);
            $documents = $driver->documents;

            if (!$hasVehicleInfo || !$documents ||
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
            \Log::error('Onboarding submitForApproval error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to submit application',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}