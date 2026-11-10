<?php

namespace Database\Factories\Inventory;

use App\Models\Catalog\Product;
use App\Models\Core\Company;
use App\Models\Core\User;
use App\Models\Inventory\StockMovement;
use App\Models\Inventory\Warehouse;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<StockMovement> */
class StockMovementFactory extends Factory
{
    protected $model = StockMovement::class;

    public function definition(): array
    {
        $isInbound = fake()->boolean();
        $quantity = fake()->randomFloat(3, 0.001, 100);

        return [
            'company_id' => Company::factory(),
            'warehouse_id' => Warehouse::factory(),
            'product_id' => Product::factory(),
            'movement_type' => $isInbound ? 'IN' : 'OUT',
            'reference_type' => 'manual',
            'reference_id' => null,
            'quantity_in' => $isInbound ? $quantity : 0,
            'quantity_out' => $isInbound ? 0 : $quantity,
            'unit_cost' => fake()->randomFloat(2, 100, 100000),
            'notes' => fake()->sentence(),
            'created_by' => User::factory(),
            'created_at' => now(),
        ];
    }
}
