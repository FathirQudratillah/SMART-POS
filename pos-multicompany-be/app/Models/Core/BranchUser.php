<?php

namespace App\Models\Core;

use App\Models\PosModel;

class BranchUser extends PosModel
{
    protected $table = 'core.branch_users';

    protected $fillable = ['branch_id', 'user_id', 'is_active'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }
}
