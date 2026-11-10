<?php

namespace Database\Factories\Sales;

use App\Models\Core\Branch;
use App\Models\Core\Company;
use App\Models\Core\User;
use App\Models\Inventory\Warehouse;
use App\Models\Sales\CashierShift;
use App\Models\Sales\Customer;
use App\Models\Sales\Sale;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<Sale> */
class SaleFactory extends Factory
{
    protected $model = Sale::class;

    public function definition(): array
    {
        return [
            'company_id' => Company::factory(),
            'branch_id' => Branch::factory(),
            'warehouse_id' => Warehouse::factory(),
            'cashier_shift_id' => CashierShift::factory(),
            'customer_id' => Customer::factory(),
            'invoice_no' => fake()->unique()->bothify('INV-########'),
            'sale_date' => now(),
            'subtotal' => 0,
            'discount_amount' => 0,
            'tax_amount' => 0,
            'total_amount' => 0,
            'paid_amount' => 0,
            'change_amount' => 0,
            'status' => 'draft',
            'created_by' => User::factory(),
        ];
    }
}
