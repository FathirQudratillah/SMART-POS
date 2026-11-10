<?php

namespace App\Http\Controllers\Api\Sales;

use App\Http\Controllers\Api\CompanyResourceController;
use App\Models\Sales\Customer;

class CustomerController extends CompanyResourceController
{
    protected string $model = Customer::class;

    protected array $uniqueFields = ['code'];

    protected array $rules = [
        'code' => ['required', 'string', 'max:50'],
        'name' => ['required', 'string', 'max:150'],
        'phone' => ['nullable', 'string', 'max:30'],
        'email' => ['nullable', 'email', 'max:150'],
        'address' => ['nullable', 'string'],
        'is_active' => ['sometimes', 'boolean'],
    ];

    protected array $searchable = [
        'code',
        'name',
        'phone',
        'email',
    ];
}
