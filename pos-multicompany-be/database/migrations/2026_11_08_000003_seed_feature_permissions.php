<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    private const PERMISSIONS = [
        ['name' => 'View companies', 'code' => 'core.companies.view', 'module' => 'core'],
        ['name' => 'Create companies', 'code' => 'core.companies.create', 'module' => 'core'],
        ['name' => 'Update companies', 'code' => 'core.companies.update', 'module' => 'core'],
        ['name' => 'Delete companies', 'code' => 'core.companies.delete', 'module' => 'core'],
        ['name' => 'View branches', 'code' => 'core.branches.view', 'module' => 'core'],
        ['name' => 'Create branches', 'code' => 'core.branches.create', 'module' => 'core'],
        ['name' => 'Update branches', 'code' => 'core.branches.update', 'module' => 'core'],
        ['name' => 'Delete branches', 'code' => 'core.branches.delete', 'module' => 'core'],
        ['name' => 'Manage company users', 'code' => 'core.users.manage', 'module' => 'core'],
        ['name' => 'View roles', 'code' => 'access.roles.view', 'module' => 'access'],
        ['name' => 'Create roles', 'code' => 'access.roles.create', 'module' => 'access'],
        ['name' => 'Update roles', 'code' => 'access.roles.update', 'module' => 'access'],
        ['name' => 'Delete roles', 'code' => 'access.roles.delete', 'module' => 'access'],
        ['name' => 'View categories', 'code' => 'catalog.categories.view', 'module' => 'catalog'],
        ['name' => 'Create categories', 'code' => 'catalog.categories.create', 'module' => 'catalog'],
        ['name' => 'Update categories', 'code' => 'catalog.categories.update', 'module' => 'catalog'],
        ['name' => 'Delete categories', 'code' => 'catalog.categories.delete', 'module' => 'catalog'],
        ['name' => 'View products', 'code' => 'catalog.products.view', 'module' => 'catalog'],
        ['name' => 'Create products', 'code' => 'catalog.products.create', 'module' => 'catalog'],
        ['name' => 'Update products', 'code' => 'catalog.products.update', 'module' => 'catalog'],
        ['name' => 'Delete products', 'code' => 'catalog.products.delete', 'module' => 'catalog'],
        ['name' => 'View warehouses', 'code' => 'inventory.warehouses.view', 'module' => 'inventory'],
        ['name' => 'Create warehouses', 'code' => 'inventory.warehouses.create', 'module' => 'inventory'],
        ['name' => 'Update warehouses', 'code' => 'inventory.warehouses.update', 'module' => 'inventory'],
        ['name' => 'Delete warehouses', 'code' => 'inventory.warehouses.delete', 'module' => 'inventory'],
        ['name' => 'View stock overview', 'code' => 'inventory.stock_overview.view', 'module' => 'inventory'],
        ['name' => 'View stock movements', 'code' => 'inventory.stock_movements.view', 'module' => 'inventory'],
        ['name' => 'View stock transfers', 'code' => 'inventory.stock_transfers.view', 'module' => 'inventory'],
        ['name' => 'Create stock transfers', 'code' => 'inventory.stock_transfers.create', 'module' => 'inventory'],
        ['name' => 'Post stock transfers', 'code' => 'inventory.stock_transfers.post', 'module' => 'inventory'],
        ['name' => 'View stock adjustments', 'code' => 'inventory.stock_adjustments.view', 'module' => 'inventory'],
        ['name' => 'Create stock adjustments', 'code' => 'inventory.stock_adjustments.create', 'module' => 'inventory'],
        ['name' => 'Post stock adjustments', 'code' => 'inventory.stock_adjustments.post', 'module' => 'inventory'],
        ['name' => 'View stock opnames', 'code' => 'inventory.stock_opnames.view', 'module' => 'inventory'],
        ['name' => 'Create stock opnames', 'code' => 'inventory.stock_opnames.create', 'module' => 'inventory'],
        ['name' => 'Post stock opnames', 'code' => 'inventory.stock_opnames.post', 'module' => 'inventory'],
        ['name' => 'View suppliers', 'code' => 'purchasing.suppliers.view', 'module' => 'purchasing'],
        ['name' => 'Create suppliers', 'code' => 'purchasing.suppliers.create', 'module' => 'purchasing'],
        ['name' => 'Update suppliers', 'code' => 'purchasing.suppliers.update', 'module' => 'purchasing'],
        ['name' => 'Delete suppliers', 'code' => 'purchasing.suppliers.delete', 'module' => 'purchasing'],
        ['name' => 'View purchase orders', 'code' => 'purchasing.orders.view', 'module' => 'purchasing'],
        ['name' => 'Create purchase orders', 'code' => 'purchasing.orders.create', 'module' => 'purchasing'],
        ['name' => 'View goods receipts', 'code' => 'purchasing.goods_receipts.view', 'module' => 'purchasing'],
        ['name' => 'Create goods receipts', 'code' => 'purchasing.goods_receipts.create', 'module' => 'purchasing'],
        ['name' => 'Post goods receipts', 'code' => 'purchasing.goods_receipts.post', 'module' => 'purchasing'],
        ['name' => 'View customers', 'code' => 'sales.customers.view', 'module' => 'sales'],
        ['name' => 'Create customers', 'code' => 'sales.customers.create', 'module' => 'sales'],
        ['name' => 'Update customers', 'code' => 'sales.customers.update', 'module' => 'sales'],
        ['name' => 'Delete customers', 'code' => 'sales.customers.delete', 'module' => 'sales'],
        ['name' => 'View sales', 'code' => 'sales.sales.view', 'module' => 'sales'],
        ['name' => 'Create sales', 'code' => 'sales.create', 'module' => 'sales'],
        ['name' => 'View cashier shifts', 'code' => 'sales.cashier_shifts.view', 'module' => 'sales'],
        ['name' => 'Open cashier shifts', 'code' => 'sales.cashier_shifts.open', 'module' => 'sales'],
        ['name' => 'Close cashier shifts', 'code' => 'sales.cashier_shifts.close', 'module' => 'sales'],
        ['name' => 'View cash movements', 'code' => 'finance.cash_movements.view', 'module' => 'finance'],
        ['name' => 'Create cash movements', 'code' => 'finance.cash_movements.create', 'module' => 'finance'],
        ['name' => 'View payment methods', 'code' => 'settings.payment_methods.view', 'module' => 'settings'],
        ['name' => 'Create payment methods', 'code' => 'settings.payment_methods.create', 'module' => 'settings'],
        ['name' => 'Update payment methods', 'code' => 'settings.payment_methods.update', 'module' => 'settings'],
        ['name' => 'Delete payment methods', 'code' => 'settings.payment_methods.delete', 'module' => 'settings'],
        ['name' => 'View dashboard', 'code' => 'dashboard.view', 'module' => 'dashboard'],
    ];

    private const LEGACY_PERMISSION_MAP = [
        'core.companies.view' => [],
        'core.companies.create' => [],
        'core.companies.update' => [],
        'core.companies.delete' => [],
        'core.branches.view' => ['core.branches.manage'],
        'core.branches.create' => ['core.branches.manage'],
        'core.branches.update' => ['core.branches.manage'],
        'core.branches.delete' => ['core.branches.manage'],
        'core.users.manage' => ['core.users.manage'],
        'access.roles.view' => ['settings.manage'],
        'access.roles.create' => ['settings.manage'],
        'access.roles.update' => ['settings.manage'],
        'access.roles.delete' => ['settings.manage'],
        'catalog.categories.view' => ['catalog.products.view', 'catalog.products.manage'],
        'catalog.categories.create' => ['catalog.products.manage'],
        'catalog.categories.update' => ['catalog.products.manage'],
        'catalog.categories.delete' => ['catalog.products.manage'],
        'catalog.products.view' => ['catalog.products.view'],
        'catalog.products.create' => ['catalog.products.manage'],
        'catalog.products.update' => ['catalog.products.manage'],
        'catalog.products.delete' => ['catalog.products.manage'],
        'inventory.warehouses.view' => ['inventory.manage'],
        'inventory.warehouses.create' => ['inventory.manage'],
        'inventory.warehouses.update' => ['inventory.manage'],
        'inventory.warehouses.delete' => ['inventory.manage'],
        'inventory.stock_overview.view' => ['inventory.manage'],
        'inventory.stock_movements.view' => ['inventory.manage'],
        'inventory.stock_transfers.view' => ['inventory.manage'],
        'inventory.stock_transfers.create' => ['inventory.manage'],
        'inventory.stock_transfers.post' => ['inventory.manage'],
        'inventory.stock_adjustments.view' => ['inventory.manage'],
        'inventory.stock_adjustments.create' => ['inventory.manage'],
        'inventory.stock_adjustments.post' => ['inventory.manage'],
        'inventory.stock_opnames.view' => ['inventory.manage'],
        'inventory.stock_opnames.create' => ['inventory.manage'],
        'inventory.stock_opnames.post' => ['inventory.manage'],
        'purchasing.suppliers.view' => ['purchasing.suppliers.manage', 'purchasing.manage'],
        'purchasing.suppliers.create' => ['purchasing.suppliers.manage', 'purchasing.manage'],
        'purchasing.suppliers.update' => ['purchasing.suppliers.manage', 'purchasing.manage'],
        'purchasing.suppliers.delete' => ['purchasing.suppliers.manage', 'purchasing.manage'],
        'purchasing.orders.view' => ['purchasing.manage'],
        'purchasing.orders.create' => ['purchasing.manage'],
        'purchasing.goods_receipts.view' => ['purchasing.manage'],
        'purchasing.goods_receipts.create' => ['purchasing.manage'],
        'purchasing.goods_receipts.post' => ['purchasing.manage'],
        'sales.customers.view' => ['sales.customers.manage'],
        'sales.customers.create' => ['sales.customers.manage'],
        'sales.customers.update' => ['sales.customers.manage'],
        'sales.customers.delete' => ['sales.customers.manage'],
        'sales.sales.view' => ['sales.view'],
        'sales.create' => ['sales.create'],
        'sales.cashier_shifts.view' => ['sales.view', 'sales.create'],
        'sales.cashier_shifts.open' => ['sales.create'],
        'sales.cashier_shifts.close' => ['sales.create'],
        'finance.cash_movements.view' => [],
        'finance.cash_movements.create' => [],
        'settings.payment_methods.view' => ['settings.manage'],
        'settings.payment_methods.create' => ['settings.manage'],
        'settings.payment_methods.update' => ['settings.manage'],
        'settings.payment_methods.delete' => ['settings.manage'],
        'dashboard.view' => [],
    ];

    public function up(): void
    {
        $now = now();
        foreach (self::PERMISSIONS as $permission) {
            DB::table('access.permissions')->updateOrInsert(
                ['code' => $permission['code']],
                $permission + [
                    'description' => null,
                    'updated_at' => $now,
                    'created_at' => $now,
                ]
            );
        }

        $permissionIds = DB::table('access.permissions')
            ->whereIn('code', array_column(self::PERMISSIONS, 'code'))
            ->pluck('id', 'code');
        $legacyIds = DB::table('access.permissions')
            ->whereIn('code', array_unique(array_merge(...array_values(self::LEGACY_PERMISSION_MAP))))
            ->pluck('id', 'code');

        $adminRoleIds = DB::table('access.roles as roles')
            ->whereNotNull('roles.company_id')
            ->where(function ($query) {
                $query->where('roles.code', 'owner')
                    ->orWhere('roles.code', 'like', 'admin-company-%')
                    ->orWhereExists(function ($subquery) {
                        $subquery->selectRaw('1')
                            ->from('access.role_permissions as role_permissions')
                            ->join('access.permissions as permissions', 'permissions.id', '=', 'role_permissions.permission_id')
                            ->whereColumn('role_permissions.role_id', 'roles.id')
                            ->whereIn('permissions.code', ['core.branches.manage', 'core.users.manage', 'settings.manage']);
                    });
            })
            ->pluck('roles.id');

        $roleLegacyPermissionIds = DB::table('access.role_permissions')
            ->whereIn('permission_id', $legacyIds->values())
            ->get(['role_id', 'permission_id'])
            ->groupBy('role_id')
            ->map(fn ($rows) => $rows->pluck('permission_id')->map(fn ($id) => (int) $id)->all());

        foreach (self::PERMISSIONS as $permission) {
            $permissionId = (int) $permissionIds[$permission['code']];
            $sourceIds = collect(self::LEGACY_PERMISSION_MAP[$permission['code']])
                ->map(fn ($code) => $legacyIds[$code] ?? null)
                ->filter()
                ->map(fn ($id) => (int) $id)
                ->all();

            $roleIds = $adminRoleIds->all();
            if ($sourceIds !== []) {
                foreach ($roleLegacyPermissionIds as $roleId => $rolePermissionIds) {
                    if (array_intersect($sourceIds, $rolePermissionIds) !== []) {
                        $roleIds[] = (int) $roleId;
                    }
                }
            }

            foreach (array_unique($roleIds) as $roleId) {
                DB::table('access.role_permissions')->insertOrIgnore([
                    'role_id' => $roleId,
                    'permission_id' => $permissionId,
                    'created_at' => $now,
                ]);
            }
        }

        $overrides = DB::table('access.user_permissions as user_permissions')
            ->join('access.permissions as permissions', 'permissions.id', '=', 'user_permissions.permission_id')
            ->get([
                'user_permissions.company_id',
                'user_permissions.user_id',
                'user_permissions.branch_id',
                'permissions.code',
                'user_permissions.is_allowed',
            ])
            ->groupBy(fn ($row) => "{$row->company_id}:{$row->user_id}:{$row->branch_id}");

        foreach ($overrides as $rows) {
            $first = $rows->first();
            $legacyAllowed = $rows->where('is_allowed', true)->pluck('code')->flip();
            foreach (self::PERMISSIONS as $permission) {
                $allowed = collect(self::LEGACY_PERMISSION_MAP[$permission['code']])
                    ->contains(fn ($code) => $legacyAllowed->has($code));

                DB::table('access.user_permissions')->insertOrIgnore([
                    'company_id' => $first->company_id,
                    'user_id' => $first->user_id,
                    'branch_id' => $first->branch_id,
                    'permission_id' => $permissionIds[$permission['code']],
                    'is_allowed' => $allowed,
                    'created_at' => $now,
                    'updated_at' => $now,
                ]);
            }
        }
    }

    public function down(): void
    {
        $existingPermissionCodes = ['catalog.products.view', 'core.users.manage', 'sales.create'];
        $permissionIds = DB::table('access.permissions')
            ->whereIn('code', array_column(self::PERMISSIONS, 'code'))
            ->whereNotIn('code', $existingPermissionCodes)
            ->pluck('id');

        DB::table('access.user_permissions')->whereIn('permission_id', $permissionIds)->delete();
        DB::table('access.role_permissions')->whereIn('permission_id', $permissionIds)->delete();
        DB::table('access.permissions')->whereIn('id', $permissionIds)->delete();
    }
};
