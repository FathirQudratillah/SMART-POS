<?php

namespace App\Http\Controllers\Api\Access;

use App\Http\Controllers\Api\CompanyResourceController;
use App\Models\Access\Role;

class RoleController extends CompanyResourceController
{
    protected string $model = Role::class;

    protected array $uniqueFields = ['code'];

    protected array $rules = [
        'name' => ['required', 'string', 'max:80'],
        'code' => ['required', 'string', 'max:80'],
        'description' => ['nullable', 'string'],
    ];
}
