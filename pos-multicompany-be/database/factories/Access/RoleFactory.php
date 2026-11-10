<?php

namespace Database\Factories\Access;

use App\Models\Access\Role;
use App\Models\Core\Company;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Role> */
class RoleFactory extends Factory
{
    protected $model = Role::class;

    public function definition(): array
    {
        return [
            'company_id' => Company::factory(),
            'name' => fake()->jobTitle(),
            'code' => fake()->unique()->slug(2),
            'description' => fake()->sentence(),
            'is_system' => false,
        ];
    }
}
