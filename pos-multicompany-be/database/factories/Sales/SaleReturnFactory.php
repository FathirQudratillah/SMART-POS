<?php

namespace Database\Factories\Sales;

use App\Models\Core\Branch;
use App\Models\Core\Company;
use App\Models\Core\User;
use App\Models\Sales\Sale;
use App\Models\Sales\SaleReturn;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<SaleReturn> */
class SaleReturnFactory extends Factory
{
    protected $model = SaleReturn::class;

    public function definition(): array
    {
        return [
            'company_id' => Company::factory(),
            'branch_id' => Branch::factory(),
            'sale_id' => Sale::factory(),
            'return_no' => fake()->unique()->bothify('RET-########'),
            'return_date' => now(),
            'reason' => fake()->sentence(),
            'total_amount' => fake()->randomFloat(2, 1000, 100000),
            'status' => 'draft',
            'created_by' => User::factory(),
        ];
    }
}
