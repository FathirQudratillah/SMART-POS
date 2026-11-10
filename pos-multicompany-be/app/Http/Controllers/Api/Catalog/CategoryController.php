<?php

namespace App\Http\Controllers\Api\Catalog;

use App\Http\Controllers\Api\CompanyResourceController;
use App\Models\Catalog\Category;

class CategoryController extends CompanyResourceController
{
    protected string $model = Category::class;

    protected array $companyScopedFields = ['parent_id' => 'catalog.categories'];

    protected array $uniqueFields = ['code'];

    protected array $rules = [
        'parent_id' => ['nullable', 'integer', 'exists:catalog.categories,id'],
        'name' => ['required', 'string', 'max:120'],
        'code' => ['required', 'string', 'max:50'],
        'description' => ['nullable', 'string'],
        'is_active' => ['sometimes', 'boolean'],
    ];

    protected array $searchable = [
        'code',
        'name',
    ];
}
