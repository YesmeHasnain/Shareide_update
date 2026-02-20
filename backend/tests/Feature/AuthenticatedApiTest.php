<?php

namespace Tests\Feature;

use Tests\TestCase;

class AuthenticatedApiTest extends TestCase
{
    public function test_me_requires_auth(): void
    {
        $response = $this->getJson('/api/me');
        $response->assertStatus(401);
    }

    public function test_profile_requires_auth(): void
    {
        $response = $this->getJson('/api/profile');
        $response->assertStatus(401);
    }

    public function test_ride_history_requires_auth(): void
    {
        $response = $this->getJson('/api/rides/history');
        $response->assertStatus(401);
    }

    public function test_wallet_balance_requires_auth(): void
    {
        $response = $this->getJson('/api/rider-wallet/balance');
        $response->assertStatus(401);
    }

    public function test_notifications_requires_auth(): void
    {
        $response = $this->getJson('/api/notifications');
        $response->assertStatus(401);
    }

    public function test_loyalty_requires_auth(): void
    {
        $response = $this->getJson('/api/loyalty/dashboard');
        $response->assertStatus(401);
    }

    public function test_emergency_contacts_requires_auth(): void
    {
        $response = $this->getJson('/api/emergency/contacts');
        $response->assertStatus(401);
    }

    public function test_saved_places_requires_auth(): void
    {
        $response = $this->getJson('/api/saved-places');
        $response->assertStatus(401);
    }

    public function test_driver_profile_requires_auth(): void
    {
        $response = $this->getJson('/api/driver/profile');
        $response->assertStatus(401);
    }

    public function test_chat_requires_auth(): void
    {
        $response = $this->getJson('/api/chat/my-chats');
        $response->assertStatus(401);
    }

    public function test_all_protected_routes_return_json_401(): void
    {
        $protectedRoutes = [
            'GET' => [
                '/api/me',
                '/api/profile',
                '/api/rides/history',
                '/api/rides/active',
                '/api/rider-wallet/balance',
                '/api/notifications',
                '/api/loyalty/dashboard',
                '/api/emergency/contacts',
                '/api/saved-places',
                '/api/driver/profile',
                '/api/chat/my-chats',
                '/api/promo-codes/active',
                '/api/referrals/my-code',
            ],
        ];

        foreach ($protectedRoutes['GET'] as $route) {
            $response = $this->getJson($route);
            $this->assertEquals(401, $response->status(), "Route {$route} should return 401, got {$response->status()}");
            $response->assertJson(['success' => false]);
        }
    }
}
