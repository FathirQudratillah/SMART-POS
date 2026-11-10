<?php

namespace Database\Factories\Catalog;

use App\Models\Catalog\Product;
use App\Models\Catalog\ProductUnit;
use App\Models\Core\Company;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<ProductUnit> */
class ProductUnitFactory extends Factory
{
    protected $model = ProductUnit::class;

    public function definition(): array
    {
        return [
            'company_id' => Company::factory(),
            'product_id' => Product::factory(),
            'unit_name' => fake()->unique()->randomElement(['box', 'pack', 'case']),
            'conversion_factor' => fake()->randomElement([6, 10, 12, 24]),
            'barcode' => fake()->unique()->ean13(),
        ];
    }
}
