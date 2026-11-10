<?php

namespace Database\Factories\Access;

use App\Models\Access\Permission;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Permission> */
class PermissionFactory extends Factory
{
    protected $model = Permission::class;

    public function definition(): array
    {
        $module = fake()->randomElement(['sales', 'inventory', 'catalog', 'purchasing']);

        return [
            'name' => fake()->words(2, true),
            'code' => fake()->unique()->slug(2).'.'.fake()->randomElement(['view', 'create', 'update']),
            'module' => $module,
            'description' => fake()->sentence(),
        ];
    }
}
