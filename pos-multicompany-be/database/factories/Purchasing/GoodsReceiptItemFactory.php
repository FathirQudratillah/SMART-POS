<?php

namespace Database\Factories\Purchasing;

use App\Models\Catalog\Product;
use App\Models\Purchasing\GoodsReceipt;
use App\Models\Purchasing\GoodsReceiptItem;
use App\Models\Purchasing\PurchaseItem;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<GoodsReceiptItem> */
class GoodsReceiptItemFactory extends Factory
{
    protected $model = GoodsReceiptItem::class;

    public function definition(): array
    {
        return [
            'goods_receipt_id' => GoodsReceipt::factory(),
            'purchase_item_id' => PurchaseItem::factory(),
            'product_id' => Product::factory(),
            'quantity_received' => fake()->randomFloat(3, 0.001, 100),
            'unit_cost' => fake()->randomFloat(2, 500, 90000),
        ];
    }
}
