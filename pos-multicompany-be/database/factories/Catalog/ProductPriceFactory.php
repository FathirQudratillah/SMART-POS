<?php

namespace Database\Factories\Catalog;

use App\Models\Catalog\Product;
use App\Models\Catalog\ProductPrice;
use App\Models\Core\Company;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<ProductPrice> */
class ProductPriceFactory extends Factory
{
    protected $model = ProductPrice::class;

    public function definition(): array
    {
        return [
            'company_id' => Company::factory(),
            'product_id' => Product::factory(),
            'price_type' => 'retail',
            'price' => fake()->randomFloat(2, 1000, 1000000),
            'effective_from' => now(),
            'effective_to' => null,
        ];
    }
}
