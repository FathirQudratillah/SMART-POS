<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private array $tables = [
        'core.users',
        'core.branches',
        'access.roles',
        'access.permissions',
        'catalog.categories',
        'inventory.warehouses',
        'sales.customers',
        'purchasing.suppliers',
        'settings.company_settings',
        'settings.payment_methods',
        'settings.subscription_plans',
    ];

    private array $uniqueConstraints = [
        ['core.companies', 'core_companies_code_unique', 'code'],
        ['core.users', 'users_email_unique', 'email'],
        ['core.branches', 'core_branches_company_id_code_unique', 'company_id, code'],
        ['access.roles', 'access_roles_company_id_code_unique', 'company_id, code'],
        ['access.permissions', 'access_permissions_code_unique', 'code'],
        ['catalog.categories', 'catalog_categories_company_id_code_unique', 'company_id, code'],
        ['catalog.products', 'catalog_products_company_id_sku_unique', 'company_id, sku'],
        ['inventory.warehouses', 'inventory_warehouses_company_id_code_unique', 'company_id, code'],
        ['sales.customers', 'sales_customers_company_id_code_unique', 'company_id, code'],
        ['purchasing.suppliers', 'purchasing_suppliers_company_id_code_unique', 'company_id, code'],
        ['settings.company_settings', 'settings_company_settings_company_id_setting_key_unique', 'company_id, setting_key'],
        ['settings.payment_methods', 'settings_payment_methods_company_id_code_unique', 'company_id, code'],
        ['settings.subscription_plans', 'settings_subscription_plans_code_unique', 'code'],
    ];

    public function up(): void
    {
        foreach ($this->tables as $tableName) {
            if (! Schema::hasColumn($tableName, 'deleted_at')) {
                Schema::table($tableName, function (Blueprint $table) {
                    $table->softDeletesTz();
                });
            }
        }

        foreach ($this->uniqueConstraints as [$table, $constraint]) {
            DB::statement("ALTER TABLE {$table} DROP CONSTRAINT IF EXISTS {$constraint}");
        }

        foreach ($this->uniqueConstraints as [$table, $index, $columns]) {
            DB::statement("CREATE UNIQUE INDEX {$index} ON {$table} ({$columns}) WHERE deleted_at IS NULL");
        }

        DB::statement('DROP INDEX IF EXISTS access.roles_system_code_unique');
        DB::statement('CREATE UNIQUE INDEX roles_system_code_active_unique ON access.roles (code) WHERE company_id IS NULL AND deleted_at IS NULL');
        DB::statement('DROP INDEX IF EXISTS settings.payment_methods_global_code_unique');
        DB::statement('CREATE UNIQUE INDEX payment_methods_global_code_active_unique ON settings.payment_methods (code) WHERE company_id IS NULL AND deleted_at IS NULL');
    }

    public function down(): void
    {
        foreach ($this->uniqueConstraints as [$table, $index]) {
            [$schema] = explode('.', $table, 2);
            DB::statement("DROP INDEX IF EXISTS {$schema}.{$index}");
        }

        DB::statement('DROP INDEX IF EXISTS access.roles_system_code_active_unique');
        DB::statement('DROP INDEX IF EXISTS settings.payment_methods_global_code_active_unique');

        foreach ($this->uniqueConstraints as [$table, $constraint, $columns]) {
            DB::statement("ALTER TABLE {$table} ADD CONSTRAINT {$constraint} UNIQUE ({$columns})");
        }

        DB::statement('CREATE UNIQUE INDEX roles_system_code_unique ON access.roles (code) WHERE company_id IS NULL');
        DB::statement('CREATE UNIQUE INDEX payment_methods_global_code_unique ON settings.payment_methods (code) WHERE company_id IS NULL');

        foreach ($this->tables as $tableName) {
            Schema::table($tableName, function (Blueprint $table) {
                $table->dropSoftDeletes();
            });
        }
    }
};
