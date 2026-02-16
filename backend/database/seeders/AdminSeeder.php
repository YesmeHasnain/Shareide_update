<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     * Creates the first admin user for the platform
     *
     * Run: php artisan db:seed --class=AdminSeeder
     */
    public function run(): void
    {
        // Check if admin already exists
        $existingAdmin = User::where('role', 'admin')->first();

        if ($existingAdmin) {
            $this->command->info('Admin user already exists: ' . $existingAdmin->email);
            return;
        }

        // Create default admin
        $admin = User::create([
            'name' => 'Super Admin',
            'email' => 'admin@shareide.com',
            'phone' => 'admin_' . time(),
            'password' => Hash::make('admin123'),
            'role' => 'admin',
            'status' => 'active',
        ]);

        $this->command->info('Admin user created successfully!');
        $this->command->info('Email: admin@shareide.com');
        $this->command->info('Password: admin123');
        $this->command->warn('Please change the password after first login!');
    }
}
