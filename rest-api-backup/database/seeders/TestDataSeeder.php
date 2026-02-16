<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Driver;
use App\Models\RiderProfile;

class TestDataSeeder extends Seeder
{
    public function run(): void
    {
        // Create admin user
        $admin = User::create([
            'name' => 'Admin',
            'phone' => '+923001111111',
            'role' => 'admin',
            'status' => 'active',
        ]);

        // Create test rider
        $rider = User::create([
            'name' => 'Test Rider',
            'phone' => '+923002222222',
            'role' => 'rider',
            'status' => 'active',
        ]);

        RiderProfile::create([
            'user_id' => $rider->id,
            'full_name' => 'Test Rider',
            'default_city' => 'Lahore',
        ]);

        // Create test driver
        $driverUser = User::create([
            'name' => 'Test Driver',
            'phone' => '+923003333333',
            'role' => 'driver',
            'status' => 'active',
        ]);

        Driver::create([
            'user_id' => $driverUser->id,
            'vehicle_type' => 'car',
            'vehicle_model' => 'Honda Civic',
            'plate_number' => 'LEA-1234',
            'seats' => 4,
            'city' => 'Lahore',
            'status' => 'approved',
            'is_online' => true,
            'current_lat' => 31.5204,
            'current_lng' => 74.3587,
        ]);

        echo "Test data created successfully!\n";
    }
}