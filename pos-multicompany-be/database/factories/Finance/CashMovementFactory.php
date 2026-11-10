<?php

namespace Database\Factories\Finance;

use App\Models\Core\Branch;
use App\Models\Core\Company;
use App\Models\Core\User;
use App\Models\Finance\CashMovement;
use App\Models\Sales\CashierShift;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<CashMovement> */
class CashMovementFactory extends Factory
{
    protected $model = CashMovement::class;

    public function definition(): array
    {
        return [
            'company_id' => Company::factory(),
            'branch_id' => Branch::factory(),
            'cashier_shift_id' => CashierShift::factory(),
            'movement_type' => fake()->randomElement(['cash_in', 'cash_out']),
            'reference_type' => 'manual',
            'reference_id' => null,
            'amount' => fake()->randomFloat(2, 1000, 1000000),
            'description' => fake()->sentence(),
            'created_by' => User::factory(),
            'created_at' => now(),
        ];
    }
}
