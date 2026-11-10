<?php

namespace Database\Factories\Inventory;

use App\Models\Core\Branch;
use App\Models\Core\Company;
use App\Models\Inventory\Warehouse;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Warehouse> */
class WarehouseFactory extends Factory
{
    protected $model = Warehouse::class;

    public function definition(): array
    {
        return [
            'company_id' => Company::factory(),
            'branch_id' => Branch::factory(),
            'code' => fake()->unique()->bothify('WH-####'),
            'name' => fake()->city().' Warehouse',
            'address' => fake()->address(),
            'is_active' => true,
        ];
    }
}
