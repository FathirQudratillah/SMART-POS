<?php

namespace Database\Factories\Inventory;

use App\Models\Catalog\Product;
use App\Models\Core\Company;
use App\Models\Inventory\InventoryStock;
use App\Models\Inventory\Warehouse;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<InventoryStock> */
class InventoryStockFactory extends Factory
{
    protected $model = InventoryStock::class;

    public function definition(): array
    {
        return [
            'company_id' => Company::factory(),
            'warehouse_id' => Warehouse::factory(),
            'product_id' => Product::factory(),
            'quantity' => fake()->randomFloat(3, 0, 1000),
        ];
    }
}
