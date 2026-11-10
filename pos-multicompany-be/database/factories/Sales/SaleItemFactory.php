<?php

namespace Database\Factories\Sales;

use App\Models\Catalog\Product;
use App\Models\Sales\Sale;
use App\Models\Sales\SaleItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<SaleItem> */
class SaleItemFactory extends Factory
{
    protected $model = SaleItem::class;

    public function definition(): array
    {
        $quantity = fake()->randomFloat(3, 1, 10);
        $unitPrice = fake()->randomFloat(2, 1000, 100000);

        return [
            'sale_id' => Sale::factory(),
            'product_id' => Product::factory(),
            'product_name' => fake()->words(3, true),
            'sku' => fake()->unique()->bothify('SKU-########'),
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'discount_amount' => 0,
            'tax_amount' => 0,
            'cost_price' => round($unitPrice * 0.7, 2),
            'line_total' => round($quantity * $unitPrice, 2),
        ];
    }
}
