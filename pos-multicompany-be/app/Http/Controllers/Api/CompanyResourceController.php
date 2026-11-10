<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

abstract class CompanyResourceController extends Controller
{
    protected string $model;

    protected array $rules = [];

    protected array $companyScopedFields = [];

    protected array $uniqueFields = [];

    protected array $with = [];

    protected array $searchable = [];

    public function index(Request $request, int $company): JsonResponse
    {
        $this->authorizeCompany($request, $company);

        $search = trim($request->input('search', ''));

        $records = ($this->model)::query()
            ->where('company_id', $company)
            ->when($search !== '' && !empty($this->searchable), function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    foreach ($this->searchable as $column) {
                        $query->orWhere($column, 'ILIKE', "%{$search}%");
                    }
                });
            })
            ->latest()
            ->paginate(max(1, min((int) $request->integer('per_page', 25), 100)));

        return response()->json([
            'status' => 'success',
            'message' => class_basename($this->model) . ' list retrieved successfully.',
            'data' => $records,
        ]);
    }

    public function store(Request $request, int $company): JsonResponse
    {
        $this->authorizeCompany($request, $company);
        $data = $request->validate($this->rules);
        $this->validateCompanyData($data, $company);
        $record = ($this->model)::query()->create($data + ['company_id' => $company]);

        return response()->json([
            'status' => 'success',
            'message' => class_basename($this->model).' successfully created.',
            'data' => $record,
        ], 201);
    }

    public function show(Request $request, int $company, int $record): JsonResponse
    {
        $this->authorizeCompany($request, $company);

        return response()->json([
            'status' => 'success',
            'message' => class_basename($this->model).' retrieved successfully.',
            'data' => $this->recordQuery($company)->with($this->with)->findOrFail($record),
        ]);
    }

    public function update(Request $request, int $company, int $record): JsonResponse
    {
        $this->authorizeCompany($request, $company);
        $item = $this->recordQuery($company)->findOrFail($record);
        $rules = $this->rules;

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
        $item->update($data);

        return response()->json([
            'status' => 'success',
            'message' => class_basename($this->model).' successfully updated.',
            'data' => $item->refresh(),
        ]);
    }

    public function destroy(Request $request, int $company): JsonResponse
    {
        $this->authorizeCompany($request, $company);

        $validated = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['required', 'integer', 'distinct'],
        ]);

        $items = $this->recordQuery($company)
            ->whereIn('id', $validated['ids'])
            ->get();

        abort_if(
            $items->count() !== count($validated['ids']),
            404,
            'One or more records were not found.'
        );

        abort_if(
            $items->contains(fn($item) => $item->getAttribute('is_system')),
            403,
            'System records cannot be deleted.'
        );

        $deletedCount = $items->count();

        DB::transaction(function () use ($items) {
            foreach ($items as $item) {
                $item->delete();
            }
        });

        return response()->json([
            'status' => 'success',
            'message' => "{$deletedCount} " . class_basename($this->model) . " records successfully deleted.",
        ]);
    }

    protected function recordQuery(int $company)
    {
        return ($this->model)::query()->where('company_id', $company);
    }

    protected function validateCompanyData(array $data, int $company, ?int $record = null): void
    {
        $errors = [];

        foreach ($this->companyScopedFields as $field => $table) {
            $query = DB::table($table)
                ->where('company_id', $company)
                ->where('id', $data[$field] ?? null);

            if (isset($data[$field]) && Schema::hasColumn($table, 'deleted_at')) {
                $query->whereNull('deleted_at');
            }

            if (isset($data[$field]) && ! $query->exists()) {
                $errors[$field] = "The selected {$field} does not belong to this company.";
            }
        }

        foreach ($this->uniqueFields as $field) {
            if (! isset($data[$field])) {
                continue;
            }

            $duplicate = ($this->model)::query()
                ->where('company_id', $company)
                ->where($field, $data[$field])
                ->when($record, fn ($query) => $query->where('id', '<>', $record))
                ->exists();

            if ($duplicate) {
                $errors[$field] = "The {$field} has already been taken for this company.";
            }
        }

        if ($errors !== []) {
            throw ValidationException::withMessages($errors);
        }
    }
}
