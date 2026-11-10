<?php

namespace Database\Factories\Settings;

use App\Models\Core\Company;
use App\Models\Settings\PaymentMethod;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<PaymentMethod> */
class PaymentMethodFactory extends Factory
{
    protected $model = PaymentMethod::class;

    public function definition(): array
    {
        return [
            'company_id' => Company::factory(),
            'code' => fake()->unique()->bothify('PAY-####'),
            'name' => fake()->randomElement(['Cash', 'Card', 'QR Payment']),
            'type' => fake()->randomElement(['cash', 'card', 'digital']),
            'is_active' => true,
        ];
    }

    public function global(): static
    {
        return $this->state(fn (): array => ['company_id' => null]);
    }
}
