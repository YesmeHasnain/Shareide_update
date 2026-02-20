<?php

namespace Tests\Feature;

use Tests\TestCase;

class ApiHealthTest extends TestCase
{
    public function test_ping_endpoint_returns_success(): void
    {
        $response = $this->getJson('/api/ping');

        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonStructure(['success', 'message', 'timestamp']);
    }

    public function test_pusher_config_returns_key_and_cluster(): void
    {
        $response = $this->getJson('/api/pusher/config');

        $response->assertStatus(200)
            ->assertJson(['success' => true])
            ->assertJsonStructure(['success', 'data' => ['key', 'cluster']]);
    }

    public function test_nonexistent_route_returns_json_404(): void
    {
        $response = $this->getJson('/api/nonexistent-route');

        $response->assertStatus(404)
            ->assertJson(['success' => false]);
    }

    public function test_unauthenticated_request_returns_401(): void
    {
        $response = $this->getJson('/api/me');

        $response->assertStatus(401)
            ->assertJson([
                'success' => false,
                'message' => 'Unauthenticated. Please login first.',
            ]);
    }
}
