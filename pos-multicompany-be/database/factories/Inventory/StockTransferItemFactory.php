<?php

namespace Database\Factories\Inventory;

use App\Models\Catalog\Product;
use App\Models\Inventory\StockTransfer;
use App\Models\Inventory\StockTransferItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<StockTransferItem> */
class StockTransferItemFactory extends Factory
{
    protected $model = StockTransferItem::class;

    public function definition(): array
    {
        return [
            'stock_transfer_id' => StockTransfer::factory(),
            'product_id' => Product::factory(),
            'quantity' => fake()->randomFloat(3, 0.001, 100),
        ];
    }
}
