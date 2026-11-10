<?php

namespace Tests\Feature;

use App\Models\Core\User;
use Tests\TestCase;

class PosApiAuthTest extends TestCase
{
    public function test_pos_api_requires_authentication(): void
    {
        $this->getJson('/api/v1/companies')
            ->assertUnauthorized();
    }

    public function test_pos_api_rejects_inactive_users(): void
    {
        $user = new User;
        $user->setAttribute('id', 1);
        $user->setAttribute('is_active', false);

        $this->actingAs($user)
            ->getJson('/api/v1/companies')
            ->assertForbidden();
    }

    public function test_authentication_endpoints_validate_login_and_require_a_token(): void
    {
        $this->postJson('/api/v1/auth/login', [])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['email', 'password']);

        $this->getJson('/api/v1/auth/me')
            ->assertUnauthorized();

        $this->postJson('/api/v1/auth/logout')
            ->assertUnauthorized();
    }

}
