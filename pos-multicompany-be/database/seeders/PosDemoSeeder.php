<?php

namespace Database\Seeders;

use App\Models\Access\Permission;
use App\Models\Access\Role;
use App\Models\Access\RolePermission;
use App\Models\Access\UserRole;
use App\Models\Audit\AuditLog;
use App\Models\Catalog\Category;
use App\Models\Catalog\Product;
use App\Models\Catalog\ProductPrice;
use App\Models\Catalog\ProductUnit;
use App\Models\Core\Branch;
use App\Models\Core\BranchUser;
use App\Models\Core\Company;
use App\Models\Core\CompanyUser;
use App\Models\Core\User;
use App\Models\Finance\CashMovement;
use App\Models\Inventory\InventoryStock;
use App\Models\Inventory\StockMovement;
use App\Models\Inventory\StockTransfer;
use App\Models\Inventory\StockTransferItem;
use App\Models\Inventory\Warehouse;
use App\Models\Purchasing\GoodsReceipt;
use App\Models\Purchasing\GoodsReceiptItem;
use App\Models\Purchasing\Purchase;
use App\Models\Purchasing\PurchaseItem;
use App\Models\Purchasing\Supplier;
use App\Models\Sales\CashierShift;
use App\Models\Sales\Customer;
use App\Models\Sales\Payment;
use App\Models\Sales\Sale;
use App\Models\Sales\SaleItem;
use App\Models\Settings\CompanySetting;
use App\Models\Settings\CompanySubscription;
use App\Models\Settings\PaymentMethod;
use App\Models\Settings\SubscriptionPlan;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class PosDemoSeeder extends Seeder
{
    private const RECORD_COUNT = 10;

    public function run(): void
    {
        if (app()->environment('production')) {
            $this->command?->warn('POS demo data was not seeded in production.');

            return;
        }

        DB::transaction(function (): void {
            $companies = [];
            $users = [];
            $branches = [];

            for ($index = 1; $index <= self::RECORD_COUNT; $index++) {
                $suffix = str_pad((string) $index, 2, '0', STR_PAD_LEFT);
                $companyCode = $index === 1 ? 'DEMO-POS' : "DEMO-POS-{$suffix}";
                $userEmail = $index === 1 ? 'admin@pos.test' : "admin{$suffix}@pos.test";

                $companies[] = $this->upsertActive(Company::class, ['code' => $companyCode], [
                    'name' => $index === 1 ? 'Demo Retail Company' : "Demo Retail Company {$suffix}",
                    'legal_name' => $index === 1 ? 'Demo Retail Company' : "Demo Retail Company {$suffix}",
                    'tax_number' => null,
                    'email' => $index === 1 ? 'contact@demo-pos.test' : "contact{$suffix}@demo-pos.test",
                    'phone' => '+62 21 555 '.str_pad((string) (100 + $index), 4, '0', STR_PAD_LEFT),
                    'address' => 'Jakarta, Indonesia',
                    'status' => 'active',
                ]);

                $users[] = $this->upsertActive(User::class, ['email' => $userEmail], [
                    'name' => $index === 1 ? 'POS Demo Admin' : "POS Demo User {$suffix}",
                    'phone' => '+62 812 '.str_pad((string) $index, 4, '0', STR_PAD_LEFT).' 0000',
                    'password' => Hash::make('password'),
                    'email_verified_at' => now(),
                    'is_active' => true,
                ]);

                $branchCode = $index === 1 ? 'JKT-001' : "JKT-{$suffix}";
                $branches[] = $this->upsertActive(Branch::class, [
                    'company_id' => $companies[$index - 1]->id,
                    'code' => $branchCode,
                ], [
                    'name' => $index === 1 ? 'Jakarta Main Branch' : "Jakarta Branch {$suffix}",
                    'address' => 'Jakarta, Indonesia',
                    'phone' => $companies[$index - 1]->phone,
                    'is_active' => true,
                ]);

                CompanyUser::query()->updateOrCreate(
                    ['company_id' => $companies[$index - 1]->id, 'user_id' => $users[$index - 1]->id],
                    ['is_active' => true, 'joined_at' => now()]
                );
                BranchUser::query()->updateOrCreate(
                    ['branch_id' => $branches[$index - 1]->id, 'user_id' => $users[$index - 1]->id],
                    ['is_active' => true]
                );
            }

            $permissionData = [
                ['name' => 'View products', 'code' => 'catalog.products.view', 'module' => 'catalog'],
                ['name' => 'Manage products', 'code' => 'catalog.products.manage', 'module' => 'catalog'],
                ['name' => 'Create sales', 'code' => 'sales.create', 'module' => 'sales'],
                ['name' => 'View sales', 'code' => 'sales.view', 'module' => 'sales'],
                ['name' => 'Manage inventory', 'code' => 'inventory.manage', 'module' => 'inventory'],
                ['name' => 'Manage purchases', 'code' => 'purchasing.manage', 'module' => 'purchasing'],
                ['name' => 'Manage customers', 'code' => 'sales.customers.manage', 'module' => 'sales'],
                ['name' => 'Manage suppliers', 'code' => 'purchasing.suppliers.manage', 'module' => 'purchasing'],
                ['name' => 'Manage branches', 'code' => 'core.branches.manage', 'module' => 'core'],
                ['name' => 'Manage company users', 'code' => 'core.users.manage', 'module' => 'core'],
                ['name' => 'Manage settings', 'code' => 'settings.manage', 'module' => 'settings'],
            ];
            $permissions = [];

            foreach ($permissionData as $attributes) {
                $permissions[] = $this->upsertActive(Permission::class, ['code' => $attributes['code']], $attributes + [
                    'description' => null,
                ]);
            }

            $roles = [];

            for ($index = 0; $index < self::RECORD_COUNT; $index++) {
                $roleCode = $index === 0 ? 'owner' : 'demo-role-'.str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT);
                $roles[] = $this->upsertActive(Role::class, [
                    'company_id' => $companies[$index]->id,
                    'code' => $roleCode,
                ], [
                    'name' => $index === 0 ? 'Owner' : 'Demo Role '.str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT),
                    'description' => $index === 0 ? 'Company owner role' : 'Demo company role',
                    'is_system' => false,
                ]);

                if ($index === 0) {
                    $roles[$index]->permissions()->sync(Permission::query()->pluck('id'));
                } else {
                    RolePermission::query()->firstOrCreate([
                        'role_id' => $roles[$index]->id,
                        'permission_id' => $permissions[$index]->id,
                    ]);
                }
                UserRole::query()->updateOrCreate([
                    'company_id' => $companies[$index]->id,
                    'user_id' => $users[$index]->id,
                    'role_id' => $roles[$index]->id,
                    'branch_id' => $branches[$index]->id,
                ], []);
                $userManagementPermission = collect($permissions)
                    ->first(fn (Permission $permission) => $permission->code === 'core.users.manage');
                if ($userManagementPermission) {
                    RolePermission::query()->firstOrCreate([
                        'role_id' => $roles[$index]->id,
                        'permission_id' => $userManagementPermission->id,
                    ]);
                }
            }

            $company = $companies[0];
            $user = $users[0];
            $branch = $branches[0];

            $categories = [];
            $products = [];
            $customers = [];
            $suppliers = [];
            $warehouses = [];
            $paymentMethods = [];
            $plans = [];

            for ($index = 1; $index <= self::RECORD_COUNT; $index++) {
                $suffix = str_pad((string) $index, 2, '0', STR_PAD_LEFT);
                $categories[] = $this->upsertActive(Category::class, [
                    'company_id' => $company->id,
                    'code' => $index === 1 ? 'BEVERAGES' : "CATEGORY-{$suffix}",
                ], [
                    'parent_id' => null,
                    'name' => $index === 1 ? 'Beverages' : "Demo Category {$suffix}",
                    'description' => $index === 1 ? 'Drinks and beverages' : 'Demo product category',
                    'is_active' => true,
                ]);

                $sku = $index === 1 ? 'DEMO-COFFEE-001' : "DEMO-PRODUCT-{$suffix}";
                $products[] = $this->upsertActive(Product::class, [
                    'company_id' => $company->id,
                    'sku' => $sku,
                ], [
                    'category_id' => $categories[$index - 1]->id,
                    'barcode' => '899100000'.str_pad((string) $index, 4, '0', STR_PAD_LEFT),
                    'name' => $index === 1 ? 'Demo Coffee' : "Demo Product {$suffix}",
                    'description' => $index === 1 ? 'Demo coffee product for POS testing' : 'Demo product for POS testing',
                    'unit' => 'pcs',
                    'cost_price' => 10000 + (($index - 1) * 500),
                    'selling_price' => 15000 + (($index - 1) * 1000),
                    'is_active' => true,
                ]);

                $price = ProductPrice::query()->firstOrNew([
                    'company_id' => $company->id,
                    'product_id' => $products[$index - 1]->id,
                    'price_type' => 'retail',
                ]);
                $price->fill([
                    'price' => 15000 + (($index - 1) * 1000),
                    'effective_from' => now(),
                    'effective_to' => null,
                ])->save();

                ProductUnit::query()->updateOrCreate(
                    ['product_id' => $products[$index - 1]->id, 'unit_name' => 'box'],
                    ['company_id' => $company->id, 'conversion_factor' => 12, 'barcode' => null]
                );

                $customerCode = $index === 1 ? 'WALK-IN' : "CUSTOMER-{$suffix}";
                $customers[] = $this->upsertActive(Customer::class, [
                    'company_id' => $company->id,
                    'code' => $customerCode,
                ], [
                    'name' => $index === 1 ? 'Walk-in Customer' : "Demo Customer {$suffix}",
                    'phone' => '+62 812 '.str_pad((string) $index, 4, '0', STR_PAD_LEFT).' 1111',
                    'email' => "customer{$suffix}@demo-pos.test",
                    'address' => 'Jakarta, Indonesia',
                    'is_active' => true,
                ]);

                $supplierCode = $index === 1 ? 'SUP-DEMO' : "SUP-DEMO-{$suffix}";
                $suppliers[] = $this->upsertActive(Supplier::class, [
                    'company_id' => $company->id,
                    'code' => $supplierCode,
                ], [
                    'name' => $index === 1 ? 'Demo Beverage Supplier' : "Demo Supplier {$suffix}",
                    'phone' => '+62 21 555 '.str_pad((string) (200 + $index), 4, '0', STR_PAD_LEFT),
                    'email' => "supplier{$suffix}@demo-pos.test",
                    'address' => 'Jakarta, Indonesia',
                    'tax_number' => null,
                    'is_active' => true,
                ]);

                $warehouseCode = match ($index) {
                    1 => 'WH-MAIN',
                    2 => 'WH-RESERVE',
                    default => "WH-{$suffix}",
                };
                $warehouses[] = $this->upsertActive(Warehouse::class, [
                    'company_id' => $company->id,
                    'code' => $warehouseCode,
                ], [
                    'branch_id' => $branch->id,
                    'name' => $index === 1 ? 'Main Warehouse' : ($index === 2 ? 'Reserve Warehouse' : "Demo Warehouse {$suffix}"),
                    'address' => 'Jakarta, Indonesia',
                    'is_active' => true,
                ]);

                $methodCode = $index === 1 ? 'CASH' : "PAYMENT-{$suffix}";
                $paymentMethods[] = $this->upsertActive(PaymentMethod::class, [
                    'company_id' => $company->id,
                    'code' => $methodCode,
                ], [
                    'name' => $index === 1 ? 'Cash' : "Demo Payment Method {$suffix}",
                    'type' => $index === 1 ? 'cash' : 'digital',
                    'is_active' => true,
                ]);

                $planCode = $index === 1 ? 'DEMO-MONTHLY' : "DEMO-PLAN-{$suffix}";
                $plans[] = $this->upsertActive(SubscriptionPlan::class, ['code' => $planCode], [
                    'name' => $index === 1 ? 'Demo Monthly' : "Demo Plan {$suffix}",
                    'description' => 'Development subscription plan',
                    'price' => 99000 + (($index - 1) * 10000),
                    'billing_period' => 'monthly',
                    'max_branches' => 5,
                    'max_users' => 25,
                    'is_active' => true,
                ]);

                CompanySetting::query()->updateOrCreate([
                    'company_id' => $company->id,
                    'setting_key' => $index === 1 ? 'receipt_footer' : "demo_setting_{$suffix}",
                ], [
                    'setting_value' => ['text' => $index === 1
                        ? 'Thank you for shopping with us!'
                        : "Demo setting {$suffix}"],
                ]);

                CompanySubscription::query()->updateOrCreate([
                    'company_id' => $companies[$index - 1]->id,
                    'subscription_plan_id' => $plans[$index - 1]->id,
                ], [
                    'starts_at' => now()->startOfMonth(),
                    'ends_at' => now()->addMonth(),
                    'status' => 'active',
                ]);
            }

            PaymentMethod::query()->firstOrCreate(
                ['company_id' => null, 'code' => 'QRIS'],
                ['name' => 'QRIS', 'type' => 'digital', 'is_active' => true]
            );

            $stocks = [];

            foreach ($products as $index => $product) {
                $stock = InventoryStock::query()->updateOrCreate([
                    'company_id' => $company->id,
                    'warehouse_id' => $warehouses[$index]->id,
                    'product_id' => $product->id,
                ], ['quantity' => 98]);
                $stocks[] = $stock;

                StockMovement::query()->firstOrCreate([
                    'company_id' => $company->id,
                    'warehouse_id' => $warehouses[$index]->id,
                    'product_id' => $product->id,
                    'reference_type' => 'opening_balance',
                    'reference_id' => $stock->id,
                ], [
                    'movement_type' => 'IN',
                    'quantity_in' => 100,
                    'quantity_out' => 0,
                    'unit_cost' => $product->cost_price,
                    'notes' => 'Demo opening stock',
                    'created_by' => $user->id,
                    'created_at' => now(),
                ]);
            }

            $shifts = [];

            for ($index = 0; $index < self::RECORD_COUNT; $index++) {
                $openedAt = now()->startOfDay()->subDays($index);
                $shift = $index === 0
                    ? CashierShift::query()
                        ->where('company_id', $company->id)
                        ->where('branch_id', $branch->id)
                        ->where('user_id', $user->id)
                        ->where('status', 'open')
                        ->first()
                    : null;

                $shift ??= CashierShift::query()->firstOrNew([
                    'company_id' => $company->id,
                    'branch_id' => $branch->id,
                    'user_id' => $user->id,
                    'opened_at' => $openedAt,
                ]);
                $shift->fill([
                    'opened_at' => $openedAt,
                    'opening_cash' => 100000,
                    'closed_at' => $index === 0 ? null : $openedAt->copy()->addHours(8),
                    'closing_cash' => $index === 0 ? null : 100000,
                    'expected_cash' => $index === 0 ? null : 100000,
                    'status' => $index === 0 ? 'open' : 'closed',
                ])->save();
                $shifts[] = $shift;
            }

            for ($index = 0; $index < self::RECORD_COUNT; $index++) {
                $number = str_pad((string) ($index + 1), 4, '0', STR_PAD_LEFT);
                $product = $products[$index];
                $quantity = 2;
                $subtotal = (float) $product->selling_price * $quantity;

                $sale = Sale::query()->updateOrCreate([
                    'company_id' => $company->id,
                    'invoice_no' => "DEMO-INV-{$number}",
                ], [
                    'branch_id' => $branch->id,
                    'warehouse_id' => $warehouses[$index]->id,
                    'cashier_shift_id' => $shifts[$index]->id,
                    'customer_id' => $customers[$index]->id,
                    'sale_date' => now()->subMinutes(30 + $index),
                    'subtotal' => $subtotal,
                    'discount_amount' => 0,
                    'tax_amount' => 0,
                    'total_amount' => $subtotal,
                    'paid_amount' => $subtotal,
                    'change_amount' => 0,
                    'status' => 'completed',
                    'created_by' => $user->id,
                ]);

                SaleItem::query()->updateOrCreate([
                    'sale_id' => $sale->id,
                    'product_id' => $product->id,
                ], [
                    'product_name' => $product->name,
                    'sku' => $product->sku,
                    'quantity' => $quantity,
                    'unit_price' => $product->selling_price,
                    'discount_amount' => 0,
                    'tax_amount' => 0,
                    'cost_price' => $product->cost_price,
                    'line_total' => $subtotal,
                ]);

                Payment::query()->updateOrCreate([
                    'sale_id' => $sale->id,
                    'reference_no' => "DEMO-PAY-{$number}",
                ], [
                    'company_id' => $company->id,
                    'payment_method_id' => $paymentMethods[$index]->id,
                    'amount' => $subtotal,
                    'paid_at' => now()->subMinutes(30 + $index),
                    'status' => 'succeeded',
                ]);

                StockMovement::query()->firstOrCreate([
                    'company_id' => $company->id,
                    'warehouse_id' => $warehouses[$index]->id,
                    'product_id' => $product->id,
                    'reference_type' => 'sale',
                    'reference_id' => $sale->id,
                ], [
                    'movement_type' => 'OUT',
                    'quantity_in' => 0,
                    'quantity_out' => $quantity,
                    'unit_cost' => $product->cost_price,
                    'notes' => 'Demo sale',
                    'created_by' => $user->id,
                    'created_at' => now()->subMinutes(30 + $index),
                ]);

                $purchase = Purchase::query()->updateOrCreate([
                    'company_id' => $company->id,
                    'purchase_no' => "DEMO-PO-{$number}",
                ], [
                    'branch_id' => $branch->id,
                    'warehouse_id' => $warehouses[$index]->id,
                    'supplier_id' => $suppliers[$index]->id,
                    'purchase_date' => now(),
                    'subtotal' => 100000,
                    'discount_amount' => 0,
                    'tax_amount' => 0,
                    'total_amount' => 100000,
                    'status' => 'draft',
                    'created_by' => $user->id,
                ]);

                $purchaseItem = PurchaseItem::query()->updateOrCreate([
                    'purchase_id' => $purchase->id,
                    'product_id' => $product->id,
                ], [
                    'quantity' => 10,
                    'unit_price' => 10000,
                    'discount_amount' => 0,
                    'tax_amount' => 0,
                    'line_total' => 100000,
                ]);

                $receipt = GoodsReceipt::query()->updateOrCreate([
                    'company_id' => $company->id,
                    'receipt_no' => "DEMO-GR-{$number}",
                ], [
                    'branch_id' => $branch->id,
                    'warehouse_id' => $warehouses[$index]->id,
                    'supplier_id' => $suppliers[$index]->id,
                    'purchase_id' => $purchase->id,
                    'receipt_date' => now(),
                    'status' => 'draft',
                    'received_by' => $user->id,
                ]);

                GoodsReceiptItem::query()->updateOrCreate([
                    'goods_receipt_id' => $receipt->id,
                    'purchase_item_id' => $purchaseItem->id,
                ], [
                    'product_id' => $product->id,
                    'quantity_received' => 10,
                    'unit_cost' => $purchaseItem->unit_price,
                ]);

                $transfer = StockTransfer::query()->updateOrCreate([
                    'company_id' => $company->id,
                    'transfer_no' => "DEMO-TR-{$number}",
                ], [
                    'source_warehouse_id' => $warehouses[0]->id,
                    'destination_warehouse_id' => $warehouses[1]->id,
                    'status' => 'draft',
                    'transfer_date' => now(),
                    'created_by' => $user->id,
                    'approved_by' => null,
                    'notes' => 'Demo stock transfer',
                ]);

                StockTransferItem::query()->updateOrCreate([
                    'stock_transfer_id' => $transfer->id,
                    'product_id' => $product->id,
                ], ['quantity' => 5]);

                CashMovement::query()->firstOrCreate([
                    'company_id' => $company->id,
                    'branch_id' => $branch->id,
                    'reference_type' => 'expense',
                    'reference_id' => $shifts[$index]->id,
                ], [
                    'cashier_shift_id' => $shifts[$index]->id,
                    'movement_type' => 'cash_out',
                    'amount' => 5000,
                    'description' => 'Demo operational expense',
                    'created_by' => $user->id,
                    'created_at' => now(),
                ]);

                AuditLog::query()->firstOrCreate([
                    'company_id' => $companies[$index]->id,
                    'user_id' => $users[$index]->id,
                    'action' => 'seeder.demo_data_created',
                    'entity_type' => 'company',
                    'entity_id' => $companies[$index]->id,
                ], [
                    'old_values' => null,
                    'new_values' => ['code' => $companies[$index]->code],
                    'ip_address' => null,
                    'user_agent' => 'database-seeder',
                    'created_at' => now(),
                ]);
            }

            $this->command?->info('POS demo data seeded: at least 10 records per seeded entity.');
            $this->command?->line('Login: admin@pos.test / password');
        });
    }

    /**
     * @param  class-string<Model>  $model
     * @param  array<string, mixed>  $identity
     * @param  array<string, mixed>  $attributes
     */
    private function upsertActive(string $model, array $identity, array $attributes): Model
    {
        $record = $model::withTrashed()->updateOrCreate($identity, $attributes);

        if ($record->trashed()) {
            $record->restore();
        }

        return $record;
    }
}
