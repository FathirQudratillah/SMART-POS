<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('access.user_permissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('core.companies')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('core.users')->cascadeOnDelete();
            $table->foreignId('branch_id')->constrained('core.branches')->cascadeOnDelete();
            $table->foreignId('permission_id')->constrained('access.permissions')->cascadeOnDelete();
            $table->boolean('is_allowed')->default(false);
            $table->timestampsTz();
            $table->unique(['company_id', 'user_id', 'branch_id', 'permission_id']);
            $table->index(['company_id', 'user_id', 'branch_id']);
        });

        DB::table('access.permissions')->insertOrIgnore([
            'name' => 'Manage company users',
            'code' => 'core.users.manage',
            'module' => 'core',
            'description' => 'Create and manage users, branches, and user permissions for a company.',
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        $permissionId = DB::table('access.permissions')
            ->where('code', 'core.users.manage')
            ->value('id');
        $adminRoleIds = DB::table('access.roles as roles')
            ->whereNotNull('roles.company_id')
            ->where(function ($query) {
                $query->where('roles.code', 'like', 'admin-company-%')
                    ->orWhere('roles.code', 'owner')
                    ->orWhereExists(function ($subquery) {
                        $subquery->selectRaw('1')
                            ->from('access.role_permissions as role_permissions')
                            ->join('access.permissions as permissions', 'permissions.id', '=', 'role_permissions.permission_id')
                            ->whereColumn('role_permissions.role_id', 'roles.id')
                            ->whereIn('permissions.code', ['core.branches.manage', 'settings.manage']);
                    });
            })
            ->pluck('roles.id');

        foreach ($adminRoleIds as $roleId) {
            DB::table('access.role_permissions')->insertOrIgnore([
                'role_id' => $roleId,
                'permission_id' => $permissionId,
                'created_at' => now(),
            ]);
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('access.user_permissions');
        DB::table('access.role_permissions')
            ->whereIn('permission_id', DB::table('access.permissions')->select('id')->where('code', 'core.users.manage'))
            ->delete();
        DB::table('access.permissions')->where('code', 'core.users.manage')->delete();
    }
};
