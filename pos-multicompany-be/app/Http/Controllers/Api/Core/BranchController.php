<?php

namespace App\Http\Controllers\Api\Core;

use App\Http\Controllers\Api\CompanyResourceController;
use App\Models\Core\Branch;

class BranchController extends CompanyResourceController
{
    protected string $model = Branch::class;

    protected array $uniqueFields = ['code'];

    protected array $rules = [
        'code' => ['required', 'string', 'max:30'],
        'name' => ['required', 'string', 'max:150'],
        'address' => ['nullable', 'string'],
        'phone' => ['nullable', 'string', 'max:30'],
        'is_active' => ['sometimes', 'boolean'],
    ];

    protected array $searchable = [
        'name',
        'code',
        'phone',
        'address',
    ];
}
