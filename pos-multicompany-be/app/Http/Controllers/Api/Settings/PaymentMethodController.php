<?php

namespace App\Http\Controllers\Api\Settings;

use App\Http\Controllers\Api\CompanyResourceController;
use App\Models\Settings\PaymentMethod;

class PaymentMethodController extends CompanyResourceController
{
    protected string $model = PaymentMethod::class;

    protected array $uniqueFields = ['code'];

    protected array $searchable = ['code', 'name', 'type'];

    protected array $rules = [
        'code' => ['required', 'string', 'max:40'],
        'name' => ['required', 'string', 'max:100'],
        'type' => ['required', 'string', 'max:30'],
        'is_active' => ['sometimes', 'boolean'],
    ];
}
