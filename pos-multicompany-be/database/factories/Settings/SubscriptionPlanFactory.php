<?php

namespace Database\Factories\Settings;

use App\Models\Settings\SubscriptionPlan;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<SubscriptionPlan> */
class SubscriptionPlanFactory extends Factory
{
    protected $model = SubscriptionPlan::class;

    public function definition(): array
    {
        return [
            'name' => fake()->randomElement(['Starter', 'Professional', 'Enterprise']),
            'code' => fake()->unique()->bothify('PLAN-####'),
            'description' => fake()->sentence(),
            'price' => fake()->randomFloat(2, 0, 1000000),
            'billing_period' => fake()->randomElement(['monthly', 'yearly']),
            'max_branches' => fake()->numberBetween(1, 50),
            'max_users' => fake()->numberBetween(1, 500),
            'is_active' => true,
        ];
    }
}
