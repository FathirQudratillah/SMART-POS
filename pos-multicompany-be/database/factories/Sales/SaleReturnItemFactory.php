<?php

namespace Database\Factories\Sales;

use App\Models\Catalog\Product;
use App\Models\Sales\SaleItem;
use App\Models\Sales\SaleReturn;
use App\Models\Sales\SaleReturnItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<SaleReturnItem> */
class SaleReturnItemFactory extends Factory
{
    protected $model = SaleReturnItem::class;

    public function definition(): array
    {
        $unitPrice = fake()->randomFloat(2, 1000, 100000);
        $quantity = fake()->randomFloat(3, 0.001, 5);

        return [
            'sale_return_id' => SaleReturn::factory(),
            'sale_item_id' => SaleItem::factory(),
            'product_id' => Product::factory(),
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'line_total' => round($unitPrice * $quantity, 2),
        ];
    }
}
