<?php

namespace Database\Factories\Sales;

use App\Models\Core\Company;
use App\Models\Sales\Payment;
use App\Models\Sales\Sale;
use App\Models\Settings\PaymentMethod;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Payment> */
class PaymentFactory extends Factory
{
    protected $model = Payment::class;

    public function definition(): array
    {
        return [
            'company_id' => Company::factory(),
            'sale_id' => Sale::factory(),
            'payment_method_id' => PaymentMethod::factory(),
            'amount' => fake()->randomFloat(2, 1000, 1000000),
            'reference_no' => fake()->optional()->bothify('PAY-########'),
            'paid_at' => now(),
            'status' => 'succeeded',
        ];
    }
}
