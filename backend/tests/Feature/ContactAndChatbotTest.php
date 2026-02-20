<?php

namespace Tests\Feature;

use Tests\TestCase;

class ContactAndChatbotTest extends TestCase
{
    public function test_contact_form_requires_fields(): void
    {
        $response = $this->postJson('/api/contact', []);

        $response->assertStatus(422)
            ->assertJson(['success' => false])
            ->assertJsonValidationErrors(['name', 'email', 'message']);
    }

    public function test_chatbot_requires_message(): void
    {
        $response = $this->postJson('/api/chatbot/message', []);

        $response->assertStatus(422);
    }

    public function test_contact_form_is_rate_limited(): void
    {
        // Send 11 requests (limit is 10/minute)
        for ($i = 0; $i < 11; $i++) {
            $response = $this->postJson('/api/contact', [
                'name' => 'Test',
                'email' => 'test@test.com',
                'message' => 'Test message',
            ]);
        }

        // The 11th request should be rate limited
        $response->assertStatus(429);
    }
}
