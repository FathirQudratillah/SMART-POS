<?php

namespace App\Http\Controllers\Api\Core;

use App\Http\Controllers\Controller;
use App\Models\Core\User;
use App\Rules\SchemaUnique;
use Illuminate\Auth\SessionGuard;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class CompanyUserController extends Controller
{
    public function index(Request $request, int $company): JsonResponse
    {
        $this->authorizeCompany($request, $company);
        $search = trim($request->string('search')->toString());
        $users = User::query()
            ->join('core.company_users as company_membership', 'company_membership.user_id', '=', 'core.users.id')
            ->where('company_membership.company_id', $company)
            ->where('company_membership.is_active', true)
            ->select([
                'core.users.id',
                'core.users.name',
                'core.users.email',
                'core.users.phone',
                'core.users.is_active',
                'company_membership.joined_at',
            ])
            ->with(['branches' => function ($query) use ($company) {
                $query->where('core.branches.company_id', $company)
                    ->where('core.branch_users.is_active', true)
                    ->select('core.branches.id', 'core.branches.company_id', 'core.branches.code', 'core.branches.name');
            }])
            ->when($search !== '', function (Builder $query) use ($search) {
                $query->where(function (Builder $query) use ($search) {
                    $query->where('core.users.name', 'ILIKE', "%{$search}%")
                        ->orWhere('core.users.email', 'ILIKE', "%{$search}%")
                        ->orWhere('core.users.phone', 'ILIKE', "%{$search}%");
                });
            })
            ->orderBy('core.users.name')
            ->paginate(max(1, min((int) $request->integer('per_page', 25), 100)));

        return response()->json([
            'status' => 'success',
            'message' => 'Company users retrieved successfully.',
            'data' => $users,
        ]);
    }

    public function store(Request $request, int $company): JsonResponse
    {
        $this->authorizeCompany($request, $company);
        $data = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'email' => ['required', 'email', 'max:150', new SchemaUnique('core', 'users', 'email')],
            'phone' => ['nullable', 'string', 'max:30'],
            'password' => ['required', 'string', 'min:8', 'max:255'],
            'branch_id' => ['required', 'integer', 'schema_exists:core,branches,id'],
        ]);
        $this->assertBranchBelongsToCompany((int) $data['branch_id'], $company);

        $user = DB::transaction(function () use ($company, $data): User {
            $user = User::query()->create([
                'name' => $data['name'],
                'email' => $data['email'],
                'phone' => $data['phone'] ?? null,
                'password' => $data['password'],
                'is_active' => true,
            ]);

            DB::table('core.company_users')->insert([
                'company_id' => $company,
                'user_id' => $user->id,
                'is_active' => true,
                'joined_at' => now(),
                'created_at' => now(),
                'updated_at' => now(),
            ]);
            DB::table('core.branch_users')->insert([
                'branch_id' => $data['branch_id'],
                'user_id' => $user->id,
                'is_active' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            $this->saveUserPermissionOverrides($company, $user->id, (int) $data['branch_id'], []);

            return $user->load(['branches' => fn ($query) => $query
                ->where('core.branches.company_id', $company)
                ->select('core.branches.id', 'core.branches.company_id', 'core.branches.code', 'core.branches.name')]);
        });

        $user->sendEmailVerificationNotification();

        return response()->json([
            'status' => 'success',
            'message' => 'Company user successfully created.',
            'data' => $user,
        ], 201);
    }

    public function show(Request $request, int $company, int $user): JsonResponse
    {
        $this->authorizeCompany($request, $company);
        $record = $this->companyUserQuery($company)->findOrFail($user);
        $branch = $record->branches()
            ->where('core.branches.company_id', $company)
            ->where('core.branch_users.is_active', true)
            ->first();

        abort_unless($branch, 422, 'The user is not assigned to a branch in this company.');
        $overrides = DB::table('access.user_permissions')
            ->where('company_id', $company)
            ->where('user_id', $record->id)
            ->where('branch_id', $branch->id)
            ->exists();
        $permissionIds = $overrides
            ? DB::table('access.user_permissions')
                ->where('company_id', $company)
                ->where('user_id', $record->id)
                ->where('branch_id', $branch->id)
                ->where('is_allowed', true)
                ->pluck('permission_id')
            : DB::table('access.user_roles as user_roles')
                ->join('access.roles as roles', 'roles.id', '=', 'user_roles.role_id')
                ->join('access.role_permissions as role_permissions', 'role_permissions.role_id', '=', 'roles.id')
                ->where('user_roles.company_id', $company)
                ->where('user_roles.user_id', $record->id)
                ->where(fn ($query) => $query->whereNull('user_roles.branch_id')->orWhere('user_roles.branch_id', $branch->id))
                ->where(fn ($query) => $query->whereNull('roles.company_id')->orWhere('roles.company_id', $company))
                ->pluck('role_permissions.permission_id');

        return response()->json([
            'status' => 'success',
            'message' => 'Company user retrieved successfully.',
            'data' => [
                'user' => $record,
                'branch' => $branch,
                'permissions' => DB::table('access.permissions')
                    ->whereNull('deleted_at')
                    ->orderBy('module')
                    ->orderBy('name')
                    ->get(['id', 'name', 'code', 'module', 'description']),
                'permission_ids' => $permissionIds->map(fn ($id) => (int) $id)->values(),
                'uses_custom_permissions' => $overrides,
            ],
        ]);
    }

    public function update(Request $request, int $company, int $user): JsonResponse
    {
        $this->authorizeCompany($request, $company);
        $record = $this->companyUserQuery($company)->findOrFail($user);
        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:150'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:30'],
            'branch_id' => ['sometimes', 'required', 'integer', 'schema_exists:core,branches,id'],
        ]);

        if (isset($data['branch_id'])) {
            $this->assertBranchBelongsToCompany((int) $data['branch_id'], $company);
        }

        DB::transaction(function () use ($company, $data, $record): void {
            $record->update(collect($data)->only(['name', 'phone'])->all());

            if (isset($data['branch_id'])) {
                $companyBranchIds = DB::table('core.branches')
                    ->where('company_id', $company)
                    ->pluck('id');
                $currentBranchIds = DB::table('core.branch_users')
                    ->where('user_id', $record->id)
                    ->whereIn('branch_id', $companyBranchIds)
                    ->where('is_active', true)
                    ->pluck('branch_id');
                if ($currentBranchIds->count() !== 1 || (int) $currentBranchIds->first() !== (int) $data['branch_id']) {
                    DB::table('core.branch_users')
                        ->where('user_id', $record->id)
                        ->whereIn('branch_id', $companyBranchIds)
                        ->delete();
                    DB::table('core.branch_users')->insert([
                        'branch_id' => $data['branch_id'],
                        'user_id' => $record->id,
                        'is_active' => true,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                    DB::table('access.user_permissions')
                        ->where('company_id', $company)
                        ->where('user_id', $record->id)
                        ->delete();
                    $this->saveUserPermissionOverrides($company, $record->id, (int) $data['branch_id'], []);
                }
            }
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Company user successfully updated.',
            'data' => $this->companyUserQuery($company)->with('branches')->findOrFail($record->id),
        ]);
    }

    public function changePassword(Request $request, int $company, int $user): JsonResponse
    {
        $this->authorizeCompany($request, $company);
        $record = $this->companyUserQuery($company)->findOrFail($user);
        $data = $request->validate([
            'password' => ['required', 'string', 'min:8', 'max:255', 'confirmed'],
        ]);

        $record->forceFill([
            'password' => Hash::make($data['password']),
        ])->save();

        $guard = Auth::guard('web');
        $authenticatedUser = $guard instanceof SessionGuard ? $guard->user() : null;

        if ($request->hasSession() && $authenticatedUser?->is($record)) {
            $authenticatedUser->setAttribute('password', $record->getAuthPassword());
            $request->session()->put(
                'password_hash_web',
                $guard->hashPasswordForCookie($record->getAuthPassword()),
            );
            $request->session()->regenerate();
        }

        return response()->json([
            'status' => 'success',
            'message' => 'User password successfully changed.',
            'data' => null,
        ]);
    }

    public function updatePermissions(Request $request, int $company, int $user): JsonResponse
    {
        $this->authorizeCompany($request, $company);
        abort_if((int) $request->user()->getKey() === $user, 422, 'You cannot change your own permissions.');
        $record = $this->companyUserQuery($company)->findOrFail($user);
        $data = $request->validate([
            'branch_id' => ['required', 'integer', 'schema_exists:core,branches,id'],
            'permission_ids' => ['present', 'array'],
            'permission_ids.*' => ['required', 'integer', 'distinct', 'schema_exists:access,permissions,id'],
        ]);
        $branchId = (int) $data['branch_id'];
        $this->assertBranchBelongsToCompany($branchId, $company);
        abort_unless(
            DB::table('core.branch_users')
                ->where('user_id', $record->id)
                ->where('branch_id', $branchId)
                ->where('is_active', true)
                ->exists(),
            422,
            'The selected branch is not assigned to this user.'
        );
        $validPermissionCount = DB::table('access.permissions')
            ->whereNull('deleted_at')
            ->whereIn('id', $data['permission_ids'])
            ->count();
        abort_unless($validPermissionCount === count($data['permission_ids']), 422, 'One or more selected permissions are unavailable.');

        $this->saveUserPermissionOverrides($company, $record->id, $branchId, $data['permission_ids']);

        return response()->json([
            'status' => 'success',
            'message' => 'User permissions successfully updated.',
            'data' => ['user_id' => $record->id, 'branch_id' => $branchId],
        ]);
    }

    public function destroy(Request $request, int $company): JsonResponse
    {
        $this->authorizeCompany($request, $company);
        $data = $request->validate([
            'ids' => ['required', 'array', 'min:1'],
            'ids.*' => ['required', 'integer', 'distinct'],
        ]);
        $userIds = array_map('intval', $data['ids']);
        abort_if(in_array((int) $request->user()->getKey(), $userIds, true), 422, 'You cannot remove your own company access.');

        $users = $this->companyUserQuery($company)
            ->whereIn('core.users.id', $userIds)
            ->get();
        abort_unless($users->count() === count($data['ids']), 404, 'One or more company users were not found.');

        DB::transaction(function () use ($company, $userIds): void {
            $branchIds = DB::table('core.branches')
                ->where('company_id', $company)
                ->pluck('id');
            DB::table('core.company_users')
                ->where('company_id', $company)
                ->whereIn('user_id', $userIds)
                ->delete();
            DB::table('core.branch_users')
                ->whereIn('branch_id', $branchIds)
                ->whereIn('user_id', $userIds)
                ->delete();
            DB::table('access.user_roles')
                ->where('company_id', $company)
                ->whereIn('user_id', $userIds)
                ->delete();
            DB::table('access.user_permissions')
                ->where('company_id', $company)
                ->whereIn('user_id', $userIds)
                ->delete();
        });

        return response()->json([
            'status' => 'success',
            'message' => count($userIds).' company user(s) successfully removed.',
        ]);
    }

    private function companyUserQuery(int $company): Builder
    {
        return User::query()
            ->whereHas('companies', fn ($query) => $query
                ->where('core.companies.id', $company)
                ->where('core.company_users.is_active', true))
            ->with(['branches' => fn ($query) => $query
                ->where('core.branches.company_id', $company)
                ->where('core.branch_users.is_active', true)]);
    }

    private function assertBranchBelongsToCompany(int $branchId, int $company): void
    {
        abort_unless(
            DB::table('core.branches')
                ->where('id', $branchId)
                ->where('company_id', $company)
                ->where('is_active', true)
                ->whereNull('deleted_at')
                ->exists(),
            422,
            'The selected branch is inactive or does not belong to this company.'
        );
    }

    private function saveUserPermissionOverrides(int $company, int $user, int $branch, array $permissionIds): void
    {
        $permissions = DB::table('access.permissions')
            ->whereNull('deleted_at')
            ->pluck('id');
        $allowedIds = collect($permissionIds)->map(fn ($id) => (int) $id)->all();
        $now = now();

        DB::transaction(function () use ($company, $user, $branch, $permissions, $allowedIds, $now): void {
            DB::table('access.user_permissions')
                ->where('company_id', $company)
                ->where('user_id', $user)
                ->where('branch_id', $branch)
                ->delete();

            DB::table('access.user_permissions')->insert(
                $permissions->map(fn ($permissionId) => [
                    'company_id' => $company,
                    'user_id' => $user,
                    'branch_id' => $branch,
                    'permission_id' => $permissionId,
                    'is_allowed' => in_array((int) $permissionId, $allowedIds, true),
                    'created_at' => $now,
                    'updated_at' => $now,
                ])->all()
            );
        });
    }
}
