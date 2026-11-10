<?php

namespace App\Models\Access;

use App\Models\PosModel;

class UserRole extends PosModel
{
    protected $table = 'access.user_roles';

    protected $fillable = ['company_id', 'user_id', 'role_id', 'branch_id'];
}
