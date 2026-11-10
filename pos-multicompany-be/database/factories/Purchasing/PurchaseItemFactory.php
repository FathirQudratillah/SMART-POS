<?php

namespace Database\Factories\Purchasing;

use App\Models\Catalog\Product;
use App\Models\Purchasing\Purchase;
use App\Models\Purchasing\PurchaseItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<PurchaseItem> */
class PurchaseItemFactory extends Factory
{
    protected $model = PurchaseItem::class;

    public function definition(): array
    {
        $quantity = fake()->randomFloat(3, 1, 100);
        $unitPrice = fake()->randomFloat(2, 500, 90000);

        return [
            'purchase_id' => Purchase::factory(),
            'product_id' => Product::factory(),
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'discount_amount' => 0,
            'tax_amount' => 0,
            'line_total' => round($quantity * $unitPrice, 2),
        ];
    }
}
