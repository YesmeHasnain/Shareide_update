<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Driver;
use App\Models\DriverDocument;
use App\Models\RiderProfile;
use App\Models\RideRequest;
use App\Models\Chat;
use App\Models\ChatMessage;
use App\Models\Payment;
use App\Models\SosAlert;
use App\Models\PromoCode;
use Carbon\Carbon;

class DemoDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Creates comprehensive demo data for testing the admin panel
     *
     * Run: php artisan db:seed --class=DemoDataSeeder
     */
    public function run(): void
    {
        $this->command->info('Creating demo data...');

        // 1. Create Admin User
        $admin = User::firstOrCreate(
            ['email' => 'admin@shareide.com'],
            [
                'name' => 'Super Admin',
                'phone' => '+92300' . rand(1000000, 9999999),
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'status' => 'active',
            ]
        );
        $this->command->info('Admin: admin@shareide.com / admin123');

        // 2. Create Riders (Passengers)
        $riders = [];
        $riderNames = [
            ['name' => 'Ahmed Khan', 'phone' => '+923001234567'],
            ['name' => 'Sara Ali', 'phone' => '+923012345678'],
            ['name' => 'Usman Malik', 'phone' => '+923023456789'],
            ['name' => 'Fatima Zahra', 'phone' => '+923034567890'],
            ['name' => 'Hassan Raza', 'phone' => '+923045678901'],
            ['name' => 'Ayesha Noor', 'phone' => '+923056789012'],
        ];

        foreach ($riderNames as $riderData) {
            $rider = User::firstOrCreate(
                ['phone' => $riderData['phone']],
                [
                    'name' => $riderData['name'],
                    'email' => strtolower(str_replace(' ', '.', $riderData['name'])) . '@gmail.com',
                    'password' => Hash::make('password123'),
                    'role' => 'rider',
                    'status' => 'active',
                ]
            );
            $riders[] = $rider;

            RiderProfile::firstOrCreate(
                ['user_id' => $rider->id],
                [
                    'full_name' => $riderData['name'],
                    'default_city' => ['Lahore', 'Karachi', 'Islamabad'][rand(0, 2)],
                ]
            );
        }
        $this->command->info('Created ' . count($riders) . ' riders');

        // 3. Create Drivers with different statuses
        $driverData = [
            // Approved Drivers (Active)
            ['name' => 'Muhammad Ali', 'phone' => '+923101111111', 'status' => 'approved', 'vehicle' => 'Toyota Corolla', 'plate' => 'LEA-1234', 'type' => 'car', 'online' => true],
            ['name' => 'Bilal Ahmed', 'phone' => '+923102222222', 'status' => 'approved', 'vehicle' => 'Honda Civic', 'plate' => 'LEB-5678', 'type' => 'car', 'online' => true],
            ['name' => 'Imran Hussain', 'phone' => '+923103333333', 'status' => 'approved', 'vehicle' => 'Suzuki Alto', 'plate' => 'LEC-9012', 'type' => 'car', 'online' => false],
            ['name' => 'Kamran Shah', 'phone' => '+923104444444', 'status' => 'approved', 'vehicle' => 'Honda CD70', 'plate' => 'LED-3456', 'type' => 'bike', 'online' => true],

            // Pending Drivers (Waiting for approval)
            ['name' => 'Tariq Mehmood', 'phone' => '+923105555555', 'status' => 'pending', 'vehicle' => 'Toyota Yaris', 'plate' => 'LEE-7890', 'type' => 'car', 'online' => false],
            ['name' => 'Asif Nawaz', 'phone' => '+923106666666', 'status' => 'pending', 'vehicle' => 'Suzuki Cultus', 'plate' => 'LEF-1122', 'type' => 'car', 'online' => false],
            ['name' => 'Zahid Iqbal', 'phone' => '+923107777777', 'status' => 'pending', 'vehicle' => 'Honda 125', 'plate' => 'LEG-3344', 'type' => 'bike', 'online' => false],

            // Rejected Drivers
            ['name' => 'Nadeem Khan', 'phone' => '+923108888888', 'status' => 'rejected', 'vehicle' => 'Suzuki Mehran', 'plate' => 'LEH-5566', 'type' => 'car', 'online' => false],
        ];

        $drivers = [];
        $lahoreLocations = [
            ['lat' => 31.5204, 'lng' => 74.3587], // Lahore center
            ['lat' => 31.4697, 'lng' => 74.2728], // DHA
            ['lat' => 31.5497, 'lng' => 74.3436], // Gulberg
            ['lat' => 31.4826, 'lng' => 74.3292], // Model Town
        ];

        foreach ($driverData as $index => $data) {
            $driverUser = User::firstOrCreate(
                ['phone' => $data['phone']],
                [
                    'name' => $data['name'],
                    'email' => strtolower(str_replace(' ', '.', $data['name'])) . '@driver.com',
                    'password' => Hash::make('password123'),
                    'role' => 'driver',
                    'status' => 'active',
                ]
            );

            $location = $lahoreLocations[$index % count($lahoreLocations)];

            $driver = Driver::firstOrCreate(
                ['user_id' => $driverUser->id],
                [
                    'vehicle_type' => $data['type'],
                    'vehicle_model' => $data['vehicle'],
                    'plate_number' => $data['plate'],
                    'seats' => $data['type'] === 'car' ? 4 : 1,
                    'city' => 'Lahore',
                    'status' => $data['status'],
                    'is_online' => $data['online'],
                    'current_lat' => $location['lat'] + (rand(-100, 100) / 10000),
                    'current_lng' => $location['lng'] + (rand(-100, 100) / 10000),
                    'rating_average' => rand(35, 50) / 10,
                    'completed_rides_count' => $data['status'] === 'approved' ? rand(10, 200) : 0,
                ]
            );
            $drivers[$driverUser->id] = $driver;

            // Create documents for pending drivers
            if ($data['status'] === 'pending') {
                DriverDocument::firstOrCreate(
                    ['driver_id' => $driver->id],
                    [
                        'verification_status' => 'pending',
                    ]
                );
            }
        }
        $this->command->info('Created ' . count($drivers) . ' drivers');

        // 4. Create Ride Requests
        $approvedDrivers = Driver::where('status', 'approved')->with('user')->get();
        $rideStatuses = ['completed', 'completed', 'completed', 'in_progress', 'driver_assigned', 'searching', 'cancelled_by_rider'];

        $pickupLocations = [
            ['lat' => 31.5204, 'lng' => 74.3587, 'address' => 'Mall Road, Lahore'],
            ['lat' => 31.4697, 'lng' => 74.2728, 'address' => 'DHA Phase 5, Lahore'],
            ['lat' => 31.5497, 'lng' => 74.3436, 'address' => 'Liberty Market, Lahore'],
            ['lat' => 31.4826, 'lng' => 74.3292, 'address' => 'Model Town, Lahore'],
            ['lat' => 31.5546, 'lng' => 74.3572, 'address' => 'Anarkali Bazaar, Lahore'],
        ];

        $dropLocations = [
            ['lat' => 31.5820, 'lng' => 74.3294, 'address' => 'Lahore Airport'],
            ['lat' => 31.4504, 'lng' => 74.2751, 'address' => 'Packages Mall, Lahore'],
            ['lat' => 31.5103, 'lng' => 74.3416, 'address' => 'Lahore Railway Station'],
            ['lat' => 31.5200, 'lng' => 74.4029, 'address' => 'Jallo Park, Lahore'],
            ['lat' => 31.4278, 'lng' => 74.2646, 'address' => 'Bahria Town, Lahore'],
        ];

        $rideRequests = [];
        for ($i = 0; $i < 25; $i++) {
            $rider = $riders[array_rand($riders)];
            $status = $rideStatuses[array_rand($rideStatuses)];
            $pickup = $pickupLocations[array_rand($pickupLocations)];
            $drop = $dropLocations[array_rand($dropLocations)];
            $price = rand(150, 1500);

            $rideData = [
                'rider_id' => $rider->id,
                'pickup_lat' => $pickup['lat'],
                'pickup_lng' => $pickup['lng'],
                'pickup_address' => $pickup['address'],
                'drop_lat' => $drop['lat'],
                'drop_lng' => $drop['lng'],
                'drop_address' => $drop['address'],
                'seats' => rand(1, 3),
                'status' => $status,
                'estimated_price' => $price,
                'created_at' => Carbon::now()->subDays(rand(0, 30))->subHours(rand(0, 23)),
            ];

            // Assign driver for non-searching rides
            if ($status !== 'searching' && $approvedDrivers->count() > 0) {
                $driver = $approvedDrivers->random();
                $rideData['driver_id'] = $driver->user_id;
            }

            // Set completion data for completed rides
            if ($status === 'completed') {
                $rideData['actual_price'] = $price + rand(-50, 50);
                $rideData['started_at'] = Carbon::parse($rideData['created_at'])->addMinutes(rand(5, 15));
                $rideData['completed_at'] = Carbon::parse($rideData['started_at'])->addMinutes(rand(15, 60));
            } elseif ($status === 'in_progress') {
                $rideData['started_at'] = Carbon::now()->subMinutes(rand(5, 30));
            }

            $ride = RideRequest::create($rideData);
            $rideRequests[] = $ride;
        }
        $this->command->info('Created ' . count($rideRequests) . ' ride requests');

        // 5. Create Chats for completed/in-progress rides
        $ridesWithDriver = RideRequest::whereNotNull('driver_id')
            ->whereIn('status', ['completed', 'in_progress', 'driver_assigned'])
            ->get();

        $chatMessages = [
            'Assalam o Alaikum, I am on my way',
            'OK, I am waiting',
            'I have arrived at pickup location',
            'Coming in 2 minutes',
            'What is your exact location?',
            'I am near the main gate',
            'OK thank you',
            'Please hurry, I am getting late',
            'Traffic is heavy, will take 5 more minutes',
            'No problem, take your time',
        ];

        $chatCount = 0;
        foreach ($ridesWithDriver->take(15) as $ride) {
            $driver = Driver::where('user_id', $ride->driver_id)->first();
            if (!$driver) continue;

            $chat = Chat::firstOrCreate(
                ['ride_request_id' => $ride->id],
                [
                    'rider_id' => $ride->rider_id,
                    'driver_id' => $driver->id,
                    'status' => $ride->status === 'completed' ? 'locked' : 'active',
                    'last_message' => $chatMessages[array_rand($chatMessages)],
                    'last_message_at' => Carbon::now()->subMinutes(rand(5, 120)),
                ]
            );

            // Add some messages to chat
            $numMessages = rand(3, 8);
            for ($j = 0; $j < $numMessages; $j++) {
                $isDriver = rand(0, 1);
                ChatMessage::create([
                    'chat_id' => $chat->id,
                    'sender_id' => $isDriver ? $driver->user_id : $ride->rider_id,
                    'sender_type' => $isDriver ? 'driver' : 'rider',
                    'type' => 'text',
                    'message' => $chatMessages[array_rand($chatMessages)],
                    'is_read' => true,
                    'created_at' => Carbon::parse($chat->last_message_at)->subMinutes($numMessages - $j),
                ]);
            }
            $chatCount++;
        }
        $this->command->info('Created ' . $chatCount . ' chats with messages');

        // 6. Create Payments for completed rides
        $completedRides = RideRequest::where('status', 'completed')
            ->whereNotNull('driver_id')
            ->get();

        $paymentCount = 0;
        foreach ($completedRides as $ride) {
            $driver = Driver::where('user_id', $ride->driver_id)->first();
            if (!$driver) continue;

            $amount = $ride->actual_price ?? $ride->estimated_price;
            $commissionRate = 20;
            $commission = $amount * ($commissionRate / 100);

            Payment::firstOrCreate(
                ['ride_request_id' => $ride->id],
                [
                    'user_id' => $ride->rider_id,
                    'driver_id' => $driver->id,
                    'amount' => $amount,
                    'payment_method' => ['cash', 'card', 'wallet', 'jazzcash', 'easypaisa'][rand(0, 4)],
                    'payment_type' => 'ride_fare',
                    'status' => 'completed',
                    'commission_rate' => $commissionRate,
                    'commission_amount' => $commission,
                    'driver_earning' => $amount - $commission,
                    'paid_at' => $ride->completed_at,
                    'transaction_id' => 'TXN' . strtoupper(uniqid()),
                ]
            );
            $paymentCount++;
        }
        $this->command->info('Created ' . $paymentCount . ' payments');

        // 7. Create SOS Alerts
        $sosTypes = ['emergency', 'unsafe', 'accident', 'other'];
        $sosStatuses = ['active', 'active', 'resolved', 'resolved', 'false_alarm'];
        $sosMessages = [
            'Driver is taking wrong route',
            'I feel unsafe, driver is behaving strangely',
            'Minor accident occurred',
            'Vehicle broke down in unknown area',
            'Emergency - please help immediately',
        ];

        for ($i = 0; $i < 5; $i++) {
            $rider = $riders[array_rand($riders)];
            $status = $sosStatuses[array_rand($sosStatuses)];
            $location = $pickupLocations[array_rand($pickupLocations)];

            SosAlert::create([
                'user_id' => $rider->id,
                'latitude' => $location['lat'],
                'longitude' => $location['lng'],
                'location_address' => $location['address'],
                'message' => $sosMessages[array_rand($sosMessages)],
                'type' => $sosTypes[array_rand($sosTypes)],
                'status' => $status,
                'contacts_notified' => rand(0, 1),
                'admin_notified' => true,
                'resolved_at' => $status === 'resolved' ? Carbon::now()->subHours(rand(1, 48)) : null,
                'resolution_note' => $status === 'resolved' ? 'Issue resolved by admin' : null,
                'created_at' => Carbon::now()->subDays(rand(0, 7)),
            ]);
        }
        $this->command->info('Created 5 SOS alerts');

        // 8. Create Promo Codes
        $promoCodes = [
            ['code' => 'WELCOME50', 'type' => 'percentage', 'value' => 50, 'max' => 200],
            ['code' => 'FLAT100', 'type' => 'fixed', 'value' => 100, 'max' => 100],
            ['code' => 'RIDE20', 'type' => 'percentage', 'value' => 20, 'max' => 150],
            ['code' => 'NEWUSER', 'type' => 'percentage', 'value' => 30, 'max' => 250],
            ['code' => 'WEEKEND', 'type' => 'fixed', 'value' => 75, 'max' => 75],
        ];

        foreach ($promoCodes as $promo) {
            PromoCode::firstOrCreate(
                ['code' => $promo['code']],
                [
                    'discount_type' => $promo['type'],
                    'discount_value' => $promo['value'],
                    'max_discount' => $promo['max'],
                    'min_ride_amount' => rand(100, 300),
                    'total_usage_limit' => rand(50, 500),
                    'per_user_limit' => 1,
                    'times_used' => rand(0, 50),
                    'valid_from' => Carbon::now()->subDays(30),
                    'valid_until' => Carbon::now()->addDays(rand(30, 90)),
                    'is_active' => true,
                ]
            );
        }
        $this->command->info('Created ' . count($promoCodes) . ' promo codes');

        $this->command->newLine();
        $this->command->info('========================================');
        $this->command->info('Demo data created successfully!');
        $this->command->info('========================================');
        $this->command->info('Admin Login: admin@shareide.com / admin123');
        $this->command->info('========================================');
    }
}
