<?php

namespace App\Services\Access;

use App\Models\Core\User;
use Illuminate\Support\Facades\DB;

class AccessService
{
    /**
     * @return list<string>
     */
    public function permissionsFor(User $user, int $companyId, ?int $branchId): array
    {
        if ($branchId !== null) {
            $overrides = DB::table('access.user_permissions as user_permissions')
                ->join('access.permissions as permissions', 'permissions.id', '=', 'user_permissions.permission_id')
                ->where('user_permissions.user_id', $user->id)
                ->where('user_permissions.company_id', $companyId)
                ->where('user_permissions.branch_id', $branchId);

            if ((clone $overrides)->exists()) {
                return $overrides
                    ->where('user_permissions.is_allowed', true)
                    ->pluck('permissions.code')
                    ->all();
            }
        }

        $query = DB::table('access.user_roles as user_roles')
            ->join('access.roles as roles', 'roles.id', '=', 'user_roles.role_id')
            ->join('access.role_permissions as role_permissions', 'role_permissions.role_id', '=', 'roles.id')
            ->join('access.permissions as permissions', 'permissions.id', '=', 'role_permissions.permission_id')
            ->where('user_roles.user_id', $user->id)
            ->where('user_roles.company_id', $companyId)
            ->where(fn ($query) => $query->whereNull('roles.company_id')->orWhere('roles.company_id', $companyId));

        if ($branchId !== null) {
            $query->where(fn ($query) => $query->whereNull('user_roles.branch_id')->orWhere('user_roles.branch_id', $branchId));
        } else {
            $query->whereNull('user_roles.branch_id');
        }

        return $query->distinct()->pluck('permissions.code')->all();
    }

    public function hasPermission(
        User $user,
        int $companyId,
        ?int $branchId,
        string $permission
    ): bool {
        if ($branchId === null) {
            $branchIds = DB::table('core.branch_users as branch_users')
                ->join('core.branches as branches', 'branches.id', '=', 'branch_users.branch_id')
                ->where('branch_users.user_id', $user->id)
                ->where('branch_users.is_active', true)
                ->where('branches.company_id', $companyId)
                ->where('branches.is_active', true)
                ->whereNull('branches.deleted_at')
                ->pluck('branch_users.branch_id');

            if ($branchIds->count() === 1) {
                $branchId = (int) $branchIds->first();
            } elseif ($branchIds->isNotEmpty() && DB::table('access.user_permissions')
                ->where('user_id', $user->id)
                ->where('company_id', $companyId)
                ->whereIn('branch_id', $branchIds)
                ->exists()) {
                return false;
            }
        }

        if ($branchId !== null) {
            $userPermissionOverrides = DB::table('access.user_permissions')
                ->where('user_id', $user->id)
                ->where('company_id', $companyId)
                ->where('branch_id', $branchId);

            if ((clone $userPermissionOverrides)->exists()) {
                return $userPermissionOverrides
                    ->join('access.permissions as p', 'p.id', '=', 'access.user_permissions.permission_id')
                    ->where('p.code', $permission)
                    ->where('access.user_permissions.is_allowed', true)
                    ->exists();
            }
        }

        $query = DB::table('access.user_roles as ur')
            ->join('access.roles as r', 'r.id', '=', 'ur.role_id')
            ->join('access.role_permissions as rp', 'rp.role_id', '=', 'r.id')
            ->join('access.permissions as p', 'p.id', '=', 'rp.permission_id')

            ->where('ur.user_id', $user->id)
            ->where('ur.company_id', $companyId)
            ->where('p.code', $permission)

            ->where(function ($query) use ($companyId) {
                $query
                    ->whereNull('r.company_id')
                    ->orWhere('r.company_id', $companyId);
            });

        if ($branchId !== null) {
            $query->where(function ($query) use ($branchId) {
                $query
                    ->whereNull('ur.branch_id')
                    ->orWhere('ur.branch_id', $branchId);
            });
        } else {
            $query->whereNull('ur.branch_id');
        }

        // dd([
        //     'user_id' => $user->id,
        //     'company_id' => $companyId,
        //     'branch_id' => $branchId,
        //     'permission' => $permission,
        //     'matching_roles' => $query->get([
        //         'ur.user_id',
        //         'ur.company_id',
        //         'ur.branch_id',
        //         'r.id as role_id',
        //         'r.name as role_name',
        //         'r.company_id as role_company_id',
        //         'p.code as permission_code',
        //     ]),
        // ]);
        return $query->exists();
    }
}
