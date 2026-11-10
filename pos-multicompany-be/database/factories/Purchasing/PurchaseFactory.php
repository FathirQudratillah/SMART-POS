<?php

namespace Database\Factories\Purchasing;

use App\Models\Core\Branch;
use App\Models\Core\Company;
use App\Models\Core\User;
use App\Models\Inventory\Warehouse;
use App\Models\Purchasing\Purchase;
use App\Models\Purchasing\Supplier;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Purchase> */
class PurchaseFactory extends Factory
{
    protected $model = Purchase::class;

    public function definition(): array
    {
        return [
            'company_id' => Company::factory(),
            'branch_id' => Branch::factory(),
            'warehouse_id' => Warehouse::factory(),
            'supplier_id' => Supplier::factory(),
            'purchase_no' => fake()->unique()->bothify('PO-########'),
            'purchase_date' => now(),
            'subtotal' => 0,
            'discount_amount' => 0,
            'tax_amount' => 0,
            'total_amount' => 0,
            'status' => 'draft',
            'created_by' => User::factory(),
        ];
    }
}
