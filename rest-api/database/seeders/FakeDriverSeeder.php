<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Driver;
use App\Models\DriverDocument;
use App\Models\Wallet;

class FakeDriverSeeder extends Seeder
{
    /**
     * Pakistani male first names
     */
    private array $maleFirstNames = [
        'Muhammad', 'Ahmed', 'Ali', 'Hassan', 'Hussain', 'Usman', 'Bilal', 'Kamran',
        'Imran', 'Asif', 'Tariq', 'Zahid', 'Nadeem', 'Kashif', 'Waseem', 'Sajid',
        'Fahad', 'Hamza', 'Rizwan', 'Waqar', 'Junaid', 'Shoaib', 'Faisal', 'Adnan',
        'Arif', 'Zubair', 'Shahid', 'Nasir', 'Khalid', 'Amir'
    ];

    /**
     * Pakistani last names
     */
    private array $lastNames = [
        'Khan', 'Ali', 'Ahmed', 'Malik', 'Shah', 'Hussain', 'Raza', 'Iqbal',
        'Nawaz', 'Mehmood', 'Qureshi', 'Javed', 'Akram', 'Bukhari', 'Hashmi',
        'Siddiqui', 'Chaudhry', 'Sheikh', 'Mirza', 'Bhatti', 'Aslam', 'Abbasi'
    ];

    /**
     * Vehicle types with their details
     * Note: The drivers table enum currently only supports 'car' and 'bike'
     * If you need more types, run a migration to alter the enum:
     * ALTER TABLE drivers MODIFY vehicle_type ENUM('car', 'bike', 'rickshaw', 'van', 'high_roof');
     */
    private array $vehicleTypes = [
        'bike' => [
            'models' => ['Honda CD70', 'Honda CG125', 'Honda 125', 'Yamaha YBR', 'Suzuki GS150', 'Suzuki GD110', 'United 100cc', 'Road Prince 70cc'],
            'colors' => ['Black', 'Red', 'Blue', 'Silver', 'White'],
            'seats' => 1,
            'makes' => ['Honda', 'Yamaha', 'Suzuki', 'United', 'Road Prince']
        ],
        'car' => [
            'models' => ['Toyota Corolla', 'Honda Civic', 'Suzuki Cultus', 'Suzuki Alto', 'Toyota Yaris', 'Honda City', 'Suzuki WagonR', 'Toyota Vitz', 'Honda Fit', 'Suzuki Swift', 'Suzuki Bolan', 'Suzuki Every', 'Toyota Hiace'],
            'colors' => ['White', 'Silver', 'Black', 'Grey', 'Blue', 'Red'],
            'seats' => 4,
            'makes' => ['Toyota', 'Honda', 'Suzuki']
        ],
    ];

    /**
     * Cities with coordinates (Lahore and Karachi areas)
     */
    private array $cityLocations = [
        'Lahore' => [
            'center' => ['lat' => 31.5204, 'lng' => 74.3587],
            'areas' => [
                ['lat' => 31.5204, 'lng' => 74.3587, 'name' => 'Mall Road'],
                ['lat' => 31.4697, 'lng' => 74.2728, 'name' => 'DHA Phase 5'],
                ['lat' => 31.5497, 'lng' => 74.3436, 'name' => 'Gulberg'],
                ['lat' => 31.4826, 'lng' => 74.3292, 'name' => 'Model Town'],
                ['lat' => 31.5546, 'lng' => 74.3572, 'name' => 'Anarkali'],
                ['lat' => 31.4504, 'lng' => 74.2751, 'name' => 'Bahria Town'],
                ['lat' => 31.5103, 'lng' => 74.3416, 'name' => 'Railway Station'],
                ['lat' => 31.4278, 'lng' => 74.2646, 'name' => 'Johar Town'],
            ]
        ],
        'Karachi' => [
            'center' => ['lat' => 24.8607, 'lng' => 67.0011],
            'areas' => [
                ['lat' => 24.8607, 'lng' => 67.0011, 'name' => 'Saddar'],
                ['lat' => 24.8138, 'lng' => 67.0298, 'name' => 'Clifton'],
                ['lat' => 24.8262, 'lng' => 67.0311, 'name' => 'Defence'],
                ['lat' => 24.9180, 'lng' => 67.0972, 'name' => 'Gulshan-e-Iqbal'],
                ['lat' => 24.9056, 'lng' => 67.0822, 'name' => 'North Nazimabad'],
                ['lat' => 24.8714, 'lng' => 67.0842, 'name' => 'Tariq Road'],
                ['lat' => 24.9294, 'lng' => 67.1249, 'name' => 'Gulistan-e-Johar'],
                ['lat' => 24.8546, 'lng' => 67.0178, 'name' => 'Korangi'],
            ]
        ]
    ];

    /**
     * Plate number prefixes by city
     */
    private array $platePrefixes = [
        'Lahore' => ['LEA', 'LEB', 'LEC', 'LED', 'LEE', 'LEF', 'LEG', 'LEH', 'LEJ', 'LEK'],
        'Karachi' => ['AKA', 'AKB', 'AKC', 'AKD', 'AKE', 'AKF', 'BKA', 'BKB', 'BKC', 'BKD']
    ];

    /**
     * Run the database seeds.
     *
     * Creates 15 fake drivers with vehicles for SHAREIDE app
     *
     * Run: php artisan db:seed --class=FakeDriverSeeder
     */
    public function run(): void
    {
        $this->command->info('Creating fake driver data...');
        $this->command->newLine();

        $driversData = $this->generateDriversData(15);
        $createdCount = 0;

        foreach ($driversData as $data) {
            // Check if phone already exists
            if (User::where('phone', $data['phone'])->exists()) {
                $this->command->warn("Skipping: Driver with phone {$data['phone']} already exists");
                continue;
            }

            // Create User
            $user = User::create([
                'name' => $data['name'],
                'phone' => $data['phone'],
                'email' => $data['email'],
                'password' => Hash::make('password123'),
                'role' => 'driver',
                'status' => 'active',
                'profile_photo' => $data['profile_photo'],
            ]);

            // Create Driver profile
            $driver = Driver::create([
                'user_id' => $user->id,
                'cnic' => $data['cnic'],
                'cnic_name' => $data['name'],
                'city' => $data['city'],
                'vehicle_type' => $data['vehicle_type'],
                'vehicle_model' => $data['vehicle_model'],
                'plate_number' => $data['plate_number'],
                'seats' => $data['seats'],
                'status' => 'approved', // All fake drivers are approved
                'is_online' => $data['is_online'],
                'current_lat' => $data['current_lat'],
                'current_lng' => $data['current_lng'],
                'rating_average' => $data['rating'],
                'completed_rides_count' => $data['completed_rides'],
            ]);

            // Note: Vehicle info is stored directly in drivers table (vehicle_type, vehicle_model, plate_number)
            // The vehicles table schema is not fully implemented in this app

            // Create Driver Documents (verified)
            DriverDocument::create([
                'driver_id' => $driver->id,
                'verification_status' => 'verified',
                'verified_at' => now(),
            ]);

            // Create Wallet for driver
            Wallet::create([
                'driver_id' => $driver->id,
                'balance' => rand(500, 10000),
                'total_earned' => rand(10000, 100000),
                'total_withdrawn' => rand(5000, 50000),
            ]);

            $createdCount++;
            $this->command->info("Created: {$data['name']} ({$data['vehicle_type']}) - {$data['city']}");
        }

        $this->command->newLine();
        $this->command->info('========================================');
        $this->command->info("Successfully created {$createdCount} fake drivers!");
        $this->command->info('========================================');
        $this->command->info('All drivers have password: password123');
        $this->command->info('========================================');
    }

    /**
     * Generate driver data array
     */
    private function generateDriversData(int $count): array
    {
        $drivers = [];
        $usedPhones = [];
        $usedCnics = [];
        $usedPlates = [];

        // Vehicle type distribution: 10 cars, 5 bikes
        $vehicleDistribution = [
            'car' => 10,
            'bike' => 5,
        ];

        $vehicleTypeIndex = 0;
        $vehicleTypeQueue = [];

        // Build queue of vehicle types based on distribution
        foreach ($vehicleDistribution as $type => $qty) {
            for ($i = 0; $i < $qty; $i++) {
                $vehicleTypeQueue[] = $type;
            }
        }

        shuffle($vehicleTypeQueue);

        for ($i = 0; $i < $count; $i++) {
            // Generate unique phone
            do {
                $phone = '+923' . rand(0, 4) . rand(0, 9) . rand(1000000, 9999999);
            } while (in_array($phone, $usedPhones));
            $usedPhones[] = $phone;

            // Generate unique CNIC (Format: 12345-1234567-1)
            do {
                $cnic = rand(10000, 99999) . '-' . rand(1000000, 9999999) . '-' . rand(1, 9);
            } while (in_array($cnic, $usedCnics));
            $usedCnics[] = $cnic;

            // Generate name
            $firstName = $this->maleFirstNames[array_rand($this->maleFirstNames)];
            $lastName = $this->lastNames[array_rand($this->lastNames)];
            $fullName = $firstName . ' ' . $lastName;

            // Pick city (alternating between Lahore and Karachi)
            $city = $i % 2 === 0 ? 'Lahore' : 'Karachi';
            $cityData = $this->cityLocations[$city];
            $area = $cityData['areas'][array_rand($cityData['areas'])];

            // Get vehicle type from distribution queue
            $vehicleType = $vehicleTypeQueue[$i % count($vehicleTypeQueue)];
            $vehicleData = $this->vehicleTypes[$vehicleType];

            // Generate unique plate number
            do {
                $platePrefix = $this->platePrefixes[$city][array_rand($this->platePrefixes[$city])];
                $plateNumber = $platePrefix . '-' . rand(1000, 9999);
            } while (in_array($plateNumber, $usedPlates));
            $usedPlates[] = $plateNumber;

            // Pick vehicle details
            $vehicleModel = $vehicleData['models'][array_rand($vehicleData['models'])];
            $vehicleColor = $vehicleData['colors'][array_rand($vehicleData['colors'])];
            $vehicleMake = $vehicleData['makes'][array_rand($vehicleData['makes'])];
            $vehicleYear = rand(2015, 2024);

            // Add some randomness to coordinates (within ~1km)
            $latOffset = (rand(-500, 500) / 100000);
            $lngOffset = (rand(-500, 500) / 100000);

            // Generate rating between 4.0 and 5.0
            $rating = round(rand(40, 50) / 10, 2);

            // Generate ride stats
            $totalRides = rand(50, 500);
            $completedRides = (int)($totalRides * (rand(85, 98) / 100));

            // Determine online status (70% chance of being online)
            $isOnline = rand(1, 10) <= 7;

            // Profile photo placeholder
            $photoId = rand(1, 99);
            $profilePhoto = "https://randomuser.me/api/portraits/men/{$photoId}.jpg";

            $drivers[] = [
                'name' => $fullName,
                'phone' => $phone,
                'email' => strtolower(str_replace(' ', '.', $fullName)) . '.driver@shareide.pk',
                'cnic' => $cnic,
                'address' => $area['name'] . ', ' . $city,
                'city' => $city,
                'vehicle_type' => $vehicleType,
                'vehicle_model' => $vehicleModel,
                'vehicle_make' => $vehicleMake,
                'vehicle_color' => $vehicleColor,
                'vehicle_year' => $vehicleYear,
                'plate_number' => $plateNumber,
                'seats' => $vehicleData['seats'],
                'current_lat' => $area['lat'] + $latOffset,
                'current_lng' => $area['lng'] + $lngOffset,
                'rating' => $rating,
                'total_rides' => $totalRides,
                'completed_rides' => $completedRides,
                'is_online' => $isOnline,
                'profile_photo' => $profilePhoto,
            ];
        }

        return $drivers;
    }
}
