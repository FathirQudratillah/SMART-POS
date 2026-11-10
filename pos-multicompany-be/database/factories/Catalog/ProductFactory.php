<?php

namespace Database\Factories\Catalog;

use App\Models\Catalog\Category;
use App\Models\Catalog\Product;
use App\Models\Core\Company;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Product> */
class ProductFactory extends Factory
{
    protected $model = Product::class;

    public function definition(): array
    {
        $cost = fake()->randomFloat(2, 1000, 100000);

        return [
            'company_id' => Company::factory(),
            'category_id' => Category::factory(),
            'sku' => fake()->unique()->bothify('SKU-########'),
            'barcode' => fake()->unique()->ean13(),
            'name' => fake()->words(3, true),
            'description' => fake()->sentence(),
            'unit' => 'pcs',
            'cost_price' => $cost,
            'selling_price' => round($cost * 1.25, 2),
            'is_active' => true,
        ];
    }
}
