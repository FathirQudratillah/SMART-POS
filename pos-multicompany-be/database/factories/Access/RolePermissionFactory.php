<?php

namespace Database\Factories\Access;

use App\Models\Access\Permission;
use App\Models\Access\Role;
use App\Models\Access\RolePermission;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<RolePermission> */
class RolePermissionFactory extends Factory
{
    protected $model = RolePermission::class;

    public function definition(): array
    {
        return [
            'role_id' => Role::factory(),
            'permission_id' => Permission::factory(),
            'created_at' => now(),
        ];
    }
}
