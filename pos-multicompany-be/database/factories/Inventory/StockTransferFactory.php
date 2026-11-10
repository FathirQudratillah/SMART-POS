<?php

namespace Database\Factories\Inventory;

use App\Models\Core\Company;
use App\Models\Core\User;
use App\Models\Inventory\StockTransfer;
use App\Models\Inventory\Warehouse;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<StockTransfer> */
class StockTransferFactory extends Factory
{
    protected $model = StockTransfer::class;

    public function definition(): array
    {
        return [
            'company_id' => Company::factory(),
            'transfer_no' => fake()->unique()->bothify('TR-########'),
            'source_warehouse_id' => Warehouse::factory(),
            'destination_warehouse_id' => Warehouse::factory(),
            'status' => 'draft',
            'transfer_date' => now(),
            'created_by' => User::factory(),
            'approved_by' => null,
            'notes' => fake()->sentence(),
        ];
    }
}
