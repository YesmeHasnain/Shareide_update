<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AuthTest extends TestCase
{
    public function test_send_code_requires_phone(): void
    {
        $response = $this->postJson('/api/auth/send-code', []);

        $response->assertStatus(422)
            ->assertJson(['success' => false])
            ->assertJsonValidationErrors('phone');
    }

    public function test_send_code_rejects_invalid_phone_format(): void
    {
        $response = $this->postJson('/api/auth/send-code', [
            'phone' => '12345',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('phone');
    }

    public function test_send_code_accepts_valid_pakistan_phone(): void
    {
        $response = $this->postJson('/api/auth/send-code', [
            'phone' => '03001234567',
        ]);

        // Should return 200 (OTP sent) or 500 if Twilio not configured in test env
        // The key is it passes validation
        $this->assertTrue(in_array($response->status(), [200, 500]));
    }

    public function test_verify_code_requires_phone_and_code(): void
    {
        $response = $this->postJson('/api/auth/verify-code', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['phone', 'code']);
    }

    public function test_verify_code_rejects_invalid_code(): void
    {
        $response = $this->postJson('/api/auth/verify-code', [
            'phone' => '03001234567',
            'code' => '000000',
        ]);

        // Returns 401 for invalid/expired verification code
        $response->assertStatus(401)
            ->assertJson(['success' => false]);
    }

    public function test_complete_registration_requires_fields(): void
    {
        $response = $this->postJson('/api/auth/complete-registration', []);

        $response->assertStatus(422);
    }

    public function test_logout_requires_authentication(): void
    {
        $response = $this->postJson('/api/logout');

        $response->assertStatus(401);
    }

    public function test_auth_routes_are_rate_limited(): void
    {
        // Send 6 requests (limit is 5/minute)
        for ($i = 0; $i < 6; $i++) {
            $response = $this->postJson('/api/auth/send-code', [
                'phone' => 'invalid',
            ]);
        }

        // The 6th request should be rate limited
        $response->assertStatus(429);
    }
}
