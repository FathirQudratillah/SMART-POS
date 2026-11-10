<?php

namespace Tests\Unit;

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
use App\Models\Sales\SaleReturn;
use App\Models\Sales\SaleReturnItem;
use App\Models\Settings\CompanySetting;
use App\Models\Settings\CompanySubscription;
use App\Models\Settings\PaymentMethod;
use App\Models\Settings\SubscriptionPlan;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Tests\TestCase;

class PosModelSchemaTest extends TestCase
{
    public function test_models_use_their_postgresql_schema_qualified_tables(): void
    {
        $tables = [
            User::class => 'core.users',
            Company::class => 'core.companies',
            Branch::class => 'core.branches',
            CompanyUser::class => 'core.company_users',
            BranchUser::class => 'core.branch_users',
            Role::class => 'access.roles',
            Permission::class => 'access.permissions',
            RolePermission::class => 'access.role_permissions',
            UserRole::class => 'access.user_roles',
            Category::class => 'catalog.categories',
            Product::class => 'catalog.products',
            ProductPrice::class => 'catalog.product_prices',
            ProductUnit::class => 'catalog.product_units',
            Warehouse::class => 'inventory.warehouses',
            InventoryStock::class => 'inventory.inventory_stocks',
            StockMovement::class => 'inventory.stock_movements',
            StockTransfer::class => 'inventory.stock_transfers',
            StockTransferItem::class => 'inventory.stock_transfer_items',
            CashierShift::class => 'sales.cashier_shifts',
            Customer::class => 'sales.customers',
            Sale::class => 'sales.sales',
            SaleItem::class => 'sales.sale_items',
            Payment::class => 'sales.payments',
            SaleReturn::class => 'sales.sale_returns',
            SaleReturnItem::class => 'sales.sale_return_items',
            Supplier::class => 'purchasing.suppliers',
            Purchase::class => 'purchasing.purchases',
            PurchaseItem::class => 'purchasing.purchase_items',
            GoodsReceipt::class => 'purchasing.goods_receipts',
            GoodsReceiptItem::class => 'purchasing.goods_receipt_items',
            CashMovement::class => 'finance.cash_movements',
            AuditLog::class => 'audit.audit_logs',
            CompanySetting::class => 'settings.company_settings',
            PaymentMethod::class => 'settings.payment_methods',
            SubscriptionPlan::class => 'settings.subscription_plans',
            CompanySubscription::class => 'settings.company_subscriptions',
        ];

        foreach ($tables as $model => $table) {
            $this->assertSame($table, (new $model)->getTable(), $model);
        }
    }

    public function test_companies_use_soft_deletes(): void
    {
        $this->assertContains(SoftDeletes::class, class_uses_recursive(Company::class));
    }

    public function test_master_models_use_soft_deletes(): void
    {
        foreach ([
            User::class,
            Branch::class,
            Role::class,
            Permission::class,
            Category::class,
            Product::class,
            Warehouse::class,
            Customer::class,
            Supplier::class,
            CompanySetting::class,
            PaymentMethod::class,
            SubscriptionPlan::class,
        ] as $model) {
            $this->assertContains(SoftDeletes::class, class_uses_recursive($model), $model);
        }
    }

    public function test_every_pos_model_resolves_a_factory(): void
    {
        foreach ([
            User::class,
            Company::class,
            Branch::class,
            CompanyUser::class,
            BranchUser::class,
            Role::class,
            Permission::class,
            RolePermission::class,
            UserRole::class,
            Category::class,
            Product::class,
            ProductPrice::class,
            ProductUnit::class,
            Warehouse::class,
            InventoryStock::class,
            StockMovement::class,
            StockTransfer::class,
            StockTransferItem::class,
            CashierShift::class,
            Customer::class,
            Sale::class,
            SaleItem::class,
            Payment::class,
            SaleReturn::class,
            SaleReturnItem::class,
            Supplier::class,
            Purchase::class,
            PurchaseItem::class,
            GoodsReceipt::class,
            GoodsReceiptItem::class,
            CashMovement::class,
            AuditLog::class,
            CompanySetting::class,
            PaymentMethod::class,
            SubscriptionPlan::class,
            CompanySubscription::class,
        ] as $model) {
            $factory = $model::factory();

            $this->assertInstanceOf(Factory::class, $factory);
            $this->assertIsArray($factory->definition());
        }
    }
}
