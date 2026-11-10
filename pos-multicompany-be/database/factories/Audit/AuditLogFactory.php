<?php

namespace Database\Factories\Audit;

use App\Models\Audit\AuditLog;
use App\Models\Core\Company;
use App\Models\Core\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<AuditLog> */
class AuditLogFactory extends Factory
{
    protected $model = AuditLog::class;

    public function definition(): array
    {
        return [
            'company_id' => Company::factory(),
            'user_id' => User::factory(),
            'action' => 'catalog.product.updated',
            'entity_type' => 'product',
            'entity_id' => fake()->numberBetween(1, 10000),
            'old_values' => ['is_active' => false],
            'new_values' => ['is_active' => true],
            'ip_address' => fake()->ipv4(),
            'user_agent' => fake()->userAgent(),
            'created_at' => now(),
        ];
    }
}
