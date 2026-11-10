<?php

namespace App\Http\Controllers\Api\Catalog;

use App\Http\Controllers\Api\CompanyResourceController;
use App\Models\Catalog\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Throwable;

class ProductController extends CompanyResourceController
{
    protected string $model = Product::class;

    protected array $companyScopedFields = ['category_id' => 'catalog.categories'];

    protected array $uniqueFields = ['sku'];

    protected array $with = [
        'category:id,name',
    ];

    protected array $rules = [
        'category_id' => ['nullable', 'integer', 'schema_exists:catalog,categories,id'],
        'sku' => ['required', 'string', 'max:80'],
        'barcode' => ['nullable', 'string', 'max:100'],
        'name' => ['required', 'string', 'max:200'],
        'description' => ['nullable', 'string'],
        'unit' => ['required', 'string', 'max:30'],
        'cost_price' => ['required', 'numeric', 'min:0'],
        'selling_price' => ['required', 'numeric', 'min:0'],
        'is_active' => ['sometimes', 'boolean'],
    ];

    protected array $searchable = [
        'name',
        'sku',
        'barcode',
        'description',
    ];

    public function store(Request $request, int $company): JsonResponse
    {
        $this->authorizeCompany($request, $company);
        $data = $request->validate($this->rules + [
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ]);
        $this->validateCompanyData($data, $company);

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('products', 'public');
            if ($imagePath === false) {
                throw new RuntimeException('The product image could not be stored.');
            }
        }

        unset($data['image']);
        $data['image_path'] = $imagePath;

        try {
            $record = Product::query()->create($data + ['company_id' => $company]);
        } catch (Throwable $error) {
            if ($imagePath !== null) {
                Storage::disk('public')->delete($imagePath);
            }

            throw $error;
        }

        return response()->json([
            'status' => 'success',
            'message' => class_basename($this->model).' successfully created.',
            'data' => $record,
        ], 201);
    }

    public function update(Request $request, int $company, int $record): JsonResponse
    {
        $this->authorizeCompany($request, $company);
        $product = $this->recordQuery($company)->findOrFail($record);
        $rules = $this->rules + [
            'image' => ['nullable', 'image', 'mimes:jpeg,png,jpg,webp', 'max:2048'],
        ];

        if ($request->isMethod('PATCH')) {
            foreach ($rules as $field => $fieldRules) {
                if (in_array('required', $fieldRules, true)) {
                    $rules[$field] = array_merge(
                        ['sometimes'],
                        array_values(array_filter($fieldRules, fn (string $rule): bool => $rule !== 'required'))
                    );
                }
            }
        }

        $data = $request->validate($rules);
        $this->validateCompanyData($data, $company, $record);
        $oldImagePath = $product->image_path;
        $newImagePath = null;

        if ($request->hasFile('image')) {
            $newImagePath = $request->file('image')->store('products', 'public');
            if ($newImagePath === false) {
                throw new RuntimeException('The product image could not be stored.');
            }

            $data['image_path'] = $newImagePath;
        }

        unset($data['image']);

        try {
            $product->update($data);
        } catch (Throwable $error) {
            if ($newImagePath !== null) {
                Storage::disk('public')->delete($newImagePath);
            }

            throw $error;
        }

        if ($newImagePath !== null && $oldImagePath !== null
            && ! Storage::disk('public')->delete($oldImagePath)) {
            throw new RuntimeException('The previous product image could not be deleted.');
        }

        return response()->json([
            'status' => 'success',
            'message' => class_basename($this->model).' successfully updated.',
            'data' => $product->refresh(),
        ]);
    }
}
