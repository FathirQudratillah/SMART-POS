<?php

namespace App\Http\Controllers\Api\Core;

use App\Http\Controllers\Controller;
use App\Models\Core\Company;
use App\Services\Access\AccessService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class CompanyController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        abort_unless($user, 401, 'Authentication is required.');
        abort_if($user->is_superadmin, 403, 'Superadmin accounts cannot access company operations.');

        $companies = $user->companies()
            ->where('core.companies.status', 'active')
            ->wherePivot('is_active', true)
            ->paginate(max(1, min((int) $request->integer('per_page', 25), 100)));

        return response()->json([
            'status' => 'success',
            'message' => 'Company list retrieved successfully.',
            'data' => $companies,
        ]);
    }

    public function store(Request $request, AccessService $accessService): JsonResponse
    {
        $user = $request->user();
        abort_unless($user, 401, 'Authentication is required.');
        abort_if($user->is_superadmin, 403, 'Superadmin accounts cannot access company operations.');
        $companyIds = DB::table('core.company_users')
            ->where('user_id', $user->getKey())
            ->where('is_active', true)
            ->pluck('company_id');
        $canCreateCompany = $companyIds->contains(function ($companyId) use ($accessService, $user): bool {
            $branchIds = DB::table('core.branch_users as branch_users')
                ->join('core.branches as branches', 'branches.id', '=', 'branch_users.branch_id')
                ->where('branch_users.user_id', $user->getKey())
                ->where('branch_users.is_active', true)
                ->where('branches.company_id', $companyId)
                ->where('branches.is_active', true)
                ->whereNull('branches.deleted_at')
                ->pluck('branch_users.branch_id');

            if ($branchIds->isEmpty()) {
                return $accessService->hasPermission($user, (int) $companyId, null, 'core.companies.create');
            }

            return $branchIds->contains(
                fn ($branchId) => $accessService->hasPermission(
                    $user,
                    (int) $companyId,
                    (int) $branchId,
                    'core.companies.create'
                )
            );
        });
        abort_unless($canCreateCompany, 403, 'You do not have permission to create a company.');

        $data = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'code' => ['required', 'string', 'max:30', Rule::unique('core.companies', 'code')->whereNull('deleted_at')],
            'legal_name' => ['nullable', 'string', 'max:200'],
            'tax_number' => ['nullable', 'string', 'max:50'],
            'email' => ['nullable', 'email', 'max:150'],
            'phone' => ['nullable', 'string', 'max:30'],
            'address' => ['nullable', 'string'],
            'status' => ['sometimes', Rule::in(['active', 'suspended', 'inactive'])],
        ]);

        $company = DB::transaction(function () use ($user, $data): Company {
            $company = Company::query()->create($data);
            $company->users()->attach($user->getKey(), ['is_active' => true, 'joined_at' => now()]);

            return $company;
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Company successfully created.',
            'data' => $company,
        ], 201);
    }

    public function show(Request $request, int $company): JsonResponse
    {
        $this->authorizeCompany($request, $company);

        return response()->json([
            'status' => 'success',
            'message' => 'Company retrieved successfully.',
            'data' => Company::query()->findOrFail($company),
        ]);
    }

    public function update(Request $request, int $company): JsonResponse
    {
        $this->authorizeCompany($request, $company);
        $record = Company::query()->findOrFail($company);
        $record->update($request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:150'],
            'code' => ['sometimes', 'required', 'string', 'max:30', Rule::unique('core.companies', 'code')->whereNull('deleted_at')->ignore($company)],
            'legal_name' => ['sometimes', 'nullable', 'string', 'max:200'],
            'tax_number' => ['sometimes', 'nullable', 'string', 'max:50'],
            'email' => ['sometimes', 'nullable', 'email', 'max:150'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:30'],
            'address' => ['sometimes', 'nullable', 'string'],
            'status' => ['sometimes', Rule::in(['active', 'suspended', 'inactive'])],
        ]));

        return response()->json([
            'status' => 'success',
            'message' => 'Company successfully updated.',
            'data' => $record->refresh(),
        ]);
    }

    public function destroy(Request $request, int $company): JsonResponse
    {
        $this->authorizeCompany($request, $company);
        $record = Company::query()->findOrFail($company);
        $record->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Company successfully deleted.',
        ]);
    }
}
