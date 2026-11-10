<?php

namespace App\Models\Core;

use App\Models\PosModel;

class CompanyUser extends PosModel
{
    protected $table = 'core.company_users';

    protected $fillable = ['company_id', 'user_id', 'is_active', 'joined_at'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean', 'joined_at' => 'datetime'];
    }
}
