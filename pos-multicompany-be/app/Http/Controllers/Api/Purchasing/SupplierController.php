<?php

namespace App\Http\Controllers\Api\Purchasing;

use App\Http\Controllers\Api\CompanyResourceController;
use App\Models\Purchasing\Supplier;

class SupplierController extends CompanyResourceController
{
    protected string $model = Supplier::class;

    protected array $uniqueFields = ['code'];

    protected array $rules = [
        'code' => ['required', 'string', 'max:50'],
        'name' => ['required', 'string', 'max:150'],
        'phone' => ['nullable', 'string', 'max:30'],
        'email' => ['nullable', 'email', 'max:150'],
        'address' => ['nullable', 'string'],
        'tax_number' => ['nullable', 'string', 'max:50'],
        'is_active' => ['sometimes', 'boolean'],
    ];

    protected array $searchable = [
        'code',
        'name',
        'phone',
        'email',
        
    ];
}
