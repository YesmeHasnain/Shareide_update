<?php

namespace Database\Seeders;

use App\Models\AdminRole;
use App\Models\FareSetting;
use App\Models\CommissionSetting;
use App\Models\SupportTicket;
use App\Models\TicketMessage;
use App\Models\SystemAlert;
use App\Models\User;
use Illuminate\Database\Seeder;

class AdvancedFeaturesSeeder extends Seeder
{
    public function run(): void
    {
        // Create Admin Roles
        $this->createAdminRoles();

        // Create Default Fare Settings
        $this->createFareSettings();

        // Create Default Commission Settings
        $this->createCommissionSettings();

        // Create Sample Support Tickets
        $this->createSupportTickets();

        // Create Sample System Alerts
        $this->createSystemAlerts();
    }

    private function createAdminRoles(): void
    {
        $roles = [
            [
                'name' => 'super_admin',
                'display_name' => 'Super Admin',
                'description' => 'Full access to all features',
                'permissions' => AdminRole::allPermissions(),
                'is_active' => true,
            ],
            [
                'name' => 'operations_manager',
                'display_name' => 'Operations Manager',
                'description' => 'Manage drivers, rides, and daily operations',
                'permissions' => [
                    'view_dashboard', 'manage_drivers', 'manage_riders',
                    'manage_rides', 'view_payments', 'manage_sos',
                    'view_reports', 'view_analytics', 'view_map'
                ],
                'is_active' => true,
            ],
            [
                'name' => 'support_agent',
                'display_name' => 'Support Agent',
                'description' => 'Handle customer support and tickets',
                'permissions' => [
                    'view_dashboard', 'view_drivers', 'view_riders',
                    'view_rides', 'manage_support', 'view_sos'
                ],
                'is_active' => true,
            ],
            [
                'name' => 'finance_manager',
                'display_name' => 'Finance Manager',
                'description' => 'Handle payments, commissions, and financial reports',
                'permissions' => [
                    'view_dashboard', 'manage_payments', 'manage_fare',
                    'manage_commission', 'view_reports', 'view_analytics'
                ],
                'is_active' => true,
            ],
        ];

        foreach ($roles as $role) {
            AdminRole::updateOrCreate(
                ['name' => $role['name']],
                $role
            );
        }

        // Assign Super Admin role to existing admin
        $superAdminRole = AdminRole::where('name', 'super_admin')->first();
        if ($superAdminRole) {
            User::where('role', 'admin')->update(['admin_role_id' => $superAdminRole->id]);
        }
    }

    private function createFareSettings(): void
    {
        $cities = ['Lahore', 'Karachi', 'Islamabad', 'Rawalpindi', 'Faisalabad'];

        foreach ($cities as $city) {
            // Car fares
            FareSetting::updateOrCreate(
                ['city' => $city, 'vehicle_type' => 'car'],
                [
                    'base_fare' => 50.00,
                    'per_km_rate' => 18.00,
                    'per_minute_rate' => 2.00,
                    'minimum_fare' => 100.00,
                    'booking_fee' => 20.00,
                    'cancellation_fee' => 50.00,
                    'waiting_charge_per_min' => 3.00,
                    'is_active' => true,
                ]
            );

            // Bike fares
            FareSetting::updateOrCreate(
                ['city' => $city, 'vehicle_type' => 'bike'],
                [
                    'base_fare' => 30.00,
                    'per_km_rate' => 12.00,
                    'per_minute_rate' => 1.50,
                    'minimum_fare' => 50.00,
                    'booking_fee' => 10.00,
                    'cancellation_fee' => 30.00,
                    'waiting_charge_per_min' => 2.00,
                    'is_active' => true,
                ]
            );
        }
    }

    private function createCommissionSettings(): void
    {
        CommissionSetting::updateOrCreate(
            ['name' => 'Standard Commission (Car)'],
            [
                'type' => 'percentage',
                'value' => 15.00,
                'city' => null,
                'vehicle_type' => 'car',
                'min_rides_for_discount' => 100,
                'discounted_value' => 12.00,
                'is_active' => true,
            ]
        );

        CommissionSetting::updateOrCreate(
            ['name' => 'Standard Commission (Bike)'],
            [
                'type' => 'percentage',
                'value' => 12.00,
                'city' => null,
                'vehicle_type' => 'bike',
                'min_rides_for_discount' => 150,
                'discounted_value' => 10.00,
                'is_active' => true,
            ]
        );
    }

    private function createSupportTickets(): void
    {
        $riders = User::where('role', 'rider')->take(3)->get();
        $admin = User::where('role', 'admin')->first();

        if ($riders->isEmpty()) return;

        // Categories: payment, ride_issue, driver_behavior, app_bug, account, other
        $tickets = [
            [
                'subject' => 'Driver was rude during my ride',
                'description' => 'The driver on my recent ride was very rude and used inappropriate language. I would like to report this behavior.',
                'category' => 'driver_behavior',
                'priority' => 'high',
            ],
            [
                'subject' => 'Payment deducted but ride cancelled',
                'description' => 'My ride was cancelled but the payment was still deducted from my wallet. Please refund the amount.',
                'category' => 'payment',
                'priority' => 'urgent',
            ],
            [
                'subject' => 'App crashing on ride booking',
                'description' => 'The app keeps crashing whenever I try to book a ride. I am using the latest version.',
                'category' => 'app_bug',
                'priority' => 'medium',
            ],
            [
                'subject' => 'Unable to update profile picture',
                'description' => 'I am trying to update my profile picture but it keeps showing an error.',
                'category' => 'account',
                'priority' => 'low',
            ],
            [
                'subject' => 'Wrong fare charged',
                'description' => 'I was charged Rs. 500 for a 5km ride which should have been around Rs. 150. Please check and refund.',
                'category' => 'ride_issue',
                'priority' => 'high',
            ],
        ];

        foreach ($tickets as $index => $ticketData) {
            $rider = $riders[$index % count($riders)];

            $ticket = SupportTicket::create([
                'user_id' => $rider->id,
                'user_type' => 'rider',
                'subject' => $ticketData['subject'],
                'description' => $ticketData['description'],
                'category' => $ticketData['category'],
                'priority' => $ticketData['priority'],
                'status' => $index < 2 ? 'open' : ($index < 4 ? 'in_progress' : 'resolved'),
                'assigned_to' => $index >= 2 && $admin ? $admin->id : null,
                'resolved_at' => $index >= 4 ? now() : null,
            ]);

            // Add reply for in_progress and resolved tickets
            if ($index >= 2 && $admin) {
                TicketMessage::create([
                    'support_ticket_id' => $ticket->id,
                    'user_id' => $admin->id,
                    'sender_type' => 'admin',
                    'message' => 'Thank you for reporting this issue. We are looking into it and will update you soon.',
                    'is_internal' => false,
                ]);
            }
        }
    }

    private function createSystemAlerts(): void
    {
        $alerts = [
            [
                'alert_type' => 'driver_verification',
                'title' => 'New Driver Registration',
                'message' => '5 new drivers pending verification',
                'severity' => 'info',
            ],
            [
                'alert_type' => 'sos_triggered',
                'title' => 'SOS Alert Triggered',
                'message' => 'A passenger has triggered an SOS alert. Immediate attention required.',
                'severity' => 'critical',
            ],
            [
                'alert_type' => 'high_cancellation',
                'title' => 'High Cancellation Rate',
                'message' => 'Driver ID #15 has a cancellation rate above 30% this week',
                'severity' => 'warning',
            ],
            [
                'alert_type' => 'payment_failed',
                'title' => 'Multiple Payment Failures',
                'message' => '12 payment failures recorded in the last hour',
                'severity' => 'warning',
            ],
            [
                'alert_type' => 'low_ratings',
                'title' => 'Low Driver Rating',
                'message' => 'Driver ID #23 rating dropped below 3.5 stars',
                'severity' => 'warning',
            ],
        ];

        foreach ($alerts as $index => $alert) {
            SystemAlert::create([
                'alert_type' => $alert['alert_type'],
                'title' => $alert['title'],
                'message' => $alert['message'],
                'severity' => $alert['severity'],
                'is_read' => $index > 2,
                'is_resolved' => $index > 3,
            ]);
        }
    }
}
