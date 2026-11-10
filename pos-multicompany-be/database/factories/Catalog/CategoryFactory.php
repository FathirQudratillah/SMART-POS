<?php

namespace Database\Factories\Catalog;

use App\Models\Catalog\Category;
use App\Models\Core\Company;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Category> */
class CategoryFactory extends Factory
{
    protected $model = Category::class;

    public function definition(): array
    {
        return [
            'company_id' => Company::factory(),
            'parent_id' => null,
            'name' => fake()->unique()->word(),
            'code' => fake()->unique()->bothify('CAT-####'),
            'description' => fake()->sentence(),
            'is_active' => true,
        ];
    }
}
