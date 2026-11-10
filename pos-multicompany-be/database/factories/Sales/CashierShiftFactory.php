<?php

namespace Database\Factories\Sales;

use App\Models\Core\Branch;
use App\Models\Core\Company;
use App\Models\Core\User;
use App\Models\Sales\CashierShift;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<CashierShift> */
class CashierShiftFactory extends Factory
{
    protected $model = CashierShift::class;

    public function definition(): array
    {
        return [
            'company_id' => Company::factory(),
            'branch_id' => Branch::factory(),
            'user_id' => User::factory(),
            'opened_at' => now()->subHours(2),
            'opening_cash' => fake()->randomFloat(2, 0, 1000000),
            'closed_at' => null,
            'closing_cash' => null,
            'expected_cash' => null,
            'status' => 'open',
        ];
    }
}
