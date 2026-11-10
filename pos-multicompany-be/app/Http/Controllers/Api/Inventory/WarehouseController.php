<?php

namespace App\Http\Controllers\Api\Inventory;

use App\Http\Controllers\Api\CompanyResourceController;
use App\Models\Inventory\Warehouse;

class WarehouseController extends CompanyResourceController
{
    protected string $model = Warehouse::class;

    protected array $companyScopedFields = ['branch_id' => 'core.branches'];

    protected array $uniqueFields = ['code'];

    protected array $with = ['branch'];

    protected array $rules = [
        'branch_id' => ['nullable', 'integer'],
        'code' => ['required', 'string', 'max:40'],
        'name' => ['required', 'string', 'max:150'],
        'address' => ['nullable', 'string'],
        'is_active' => ['sometimes', 'boolean'],
    ];

    protected array $searchable = [
        'code',
        'name',
        'address',
    ];
}
