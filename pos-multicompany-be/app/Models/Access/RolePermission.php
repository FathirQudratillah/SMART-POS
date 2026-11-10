<?php

namespace App\Models\Access;

use App\Models\PosModel;

class RolePermission extends PosModel
{
    protected $table = 'access.role_permissions';

    public $timestamps = false;

    protected $fillable = ['role_id', 'permission_id', 'created_at'];

    protected function casts(): array
    {
        return ['created_at' => 'datetime'];
    }
}
