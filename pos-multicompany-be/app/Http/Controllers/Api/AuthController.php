<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Access\Role;
use App\Models\Audit\AuditLog;
use App\Models\Core\Branch;
use App\Models\Core\Company;
use App\Models\Core\User;
use App\Services\Access\AccessService;
use Illuminate\Auth\Events\PasswordReset;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Laravel\Sanctum\PersonalAccessToken;

class AuthController extends Controller
{
    public function forgotPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email', 'max:150'],
        ]);

        Password::sendResetLink($validated);

        return response()->json([
            'status' => 'success',
            'message' => 'If an account exists for this email, a password reset link has been sent.',
            'data' => null,
        ]);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email', 'max:150'],
            'password' => ['required', 'string', 'min:8', 'max:255', 'confirmed'],
        ]);

        $status = Password::reset(
            $validated,
            function (User $user, string $password): void {
                $user->forceFill([
                    'password' => $password,
                    'email_verified_at' => $user->email_verified_at ?? now(),
                    'remember_token' => Str::random(60),
                ])->save();

                event(new PasswordReset($user));
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            return response()->json([
                'status' => 'error',
                'message' => 'This password reset link is invalid or has expired. Request a new one and try again.',
                'data' => null,
            ], 422);
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Password reset successfully. Your email address has been verified.',
            'data' => null,
        ]);
    }

    public function signup(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:150'],
            'email' => ['required', 'email', 'max:150', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8'],
            'phone' => ['required', 'string', 'min:10'],

            'company.name' => ['required', 'string', 'max:150'],
            'company.code' => ['required', 'string', 'max:30', Rule::unique('companies', 'code')->whereNull('deleted_at')],
            'company.legal_name' => ['nullable', 'string', 'max:200'],
            'company.tax_number' => ['nullable', 'string', 'max:50'],
            'company.email' => ['nullable', 'email', 'max:150'],
            'company.phone' => ['nullable', 'string', 'max:30'],
            'company.address' => ['nullable', 'string'],

            'branch.name' => ['required', 'string', 'max:150'],
            'branch.code' => ['required', 'string', 'max:30', Rule::unique('branches', 'code')->whereNull('deleted_at')],
            'branch.phone' => ['nullable', 'string', 'max:30'],
            'branch.address' => ['nullable', 'string'],
        ]);

        $result = DB::transaction(function () use ($validated) {
            $user = User::create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'password' => Hash::make($validated['password']),
                'phone' => $validated['phone'],
            ]);

            $company = Company::create([
                'name' => $validated['company']['name'],
                'code' => $validated['company']['code'],
                'legal_name' => $validated['company']['legal_name'],
                'phone' => $validated['company']['phone'],
                'tax_number' => $validated['company']['tax_number'],
                'email' => $validated['company']['email'] ?? null,
                'address' => $validated['company']['address'],
                'status' => 'active',
            ]);

            $branch = Branch::create([
                'company_id' => $company->id,
                'name' => $validated['branch']['name'],
                'code' => $validated['branch']['code'],
                'phone' => $validated['branch']['phone'] ?? null,
                'address' => $validated['branch']['address'],
                'is_active' => true,
            ]);

            $role = Role::create([
                'company_id' => $company->id,
                'name' => 'Admin '.$company->name,
                'code' => 'admin-company-'.$company->id,
                'description' => 'Admin Company Role',
                'is_system' => false,
            ]);

            $permissionIds = DB::table('access.permissions')
                ->pluck('id');

            $user->companies()->attach($company->id, [
                'is_active' => true,
                'joined_at' => now(),
            ]);

            $user->branches()->attach($branch->id, [
                'is_active' => true,
            ]);

            $user->roles()->attach($role->id, [
                'company_id' => $company->id,
            ]);

            $role->permissions()->sync($permissionIds);

            $user->sendEmailVerificationNotification();

            return [
                'user' => $user,
                'company' => $company,
                'branch' => $branch,
            ];
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Signup successful.',
            'data' => $result,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'device_name' => ['sometimes', 'string', 'max:100'],
        ]);

        $user = User::query()->where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Invalid credentials.',
                'data' => null,
            ], 401);
        }

        abort_unless($user->is_active, 403, 'This account is inactive.');

        $token = $user->createToken($credentials['device_name'] ?? 'api-token');
        $this->recordLoginActivity($request, $user);

        return response()->json([
            'status' => 'success',
            'message' => 'Login successful.',
            'data' => [
                'token_type' => 'Bearer',
                'access_token' => $token->plainTextToken,
                'user' => $user->only(['id', 'name', 'email', 'phone']),
            ],
        ]);
    }

    public function spaLogin(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'device_name' => ['sometimes', 'string', 'max:100'],
        ]);

        if (! Auth::guard('web')->attempt([
            'email' => $credentials['email'],
            'password' => $credentials['password'],
        ])) {
            return response()->json([
                'status' => 'error',
                'message' => 'Email or password is incorrect.',
                'data' => null,
            ], 401);
        }

        $request->session()->regenerate();

        $user = Auth::guard('web')->user();

        abort_unless($user->is_active, 403, 'This account is inactive.');
        $this->recordLoginActivity($request, $user);

        return response()->json([
            'status' => 'success',
            'message' => 'Login successful.',
            'data' => [
                'user' => $user->only(['id', 'name', 'email', 'phone']),
            ],
        ]);
    }

    public function me(Request $request, AccessService $accessService): JsonResponse
    {
        $user = $request->user();

        if ($user->is_superadmin) {
            return response()->json([
                'status' => 'success',
                'message' => 'User information retrieved successfully.',
                'data' => [
                    'user' => $user->only([
                        'id',
                        'name',
                        'email',
                        'phone',
                        'email_verified_at',
                        'is_superadmin',
                    ]),
                    'company' => null,
                    'branch' => null,
                    'permissions' => ['dashboard.view', 'admin.users.view', 'admin.users.delete'],
                ],
            ]);
        }

        $company = $user->companies->first();
        $branch = $user->branches->first();

        return response()->json([
            'status' => 'success',
            'message' => 'User information retrieved successfully.',
            'data' => [
                'user' => $user->only([
                    'id',
                    'name',
                    'email',
                    'phone',
                    'email_verified_at',
                    'is_superadmin',
                ]),
                'company' => $company->makeHidden(['pivot']),
                'branch' => $branch->makeHidden(['pivot']),
                'permissions' => $accessService->permissionsFor(
                    $user,
                    (int) $company->id,
                    $branch ? (int) $branch->id : null
                ),
            ],
        ]);
    }

    private function recordLoginActivity(Request $request, User $user): void
    {
        AuditLog::query()->create([
            'user_id' => $user->id,
            'action' => 'user.login',
            'entity_type' => 'user',
            'entity_id' => $user->id,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'created_at' => now(),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $token = $request->user()->currentAccessToken();

        if ($token instanceof PersonalAccessToken) {
            $token->delete();
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Logout successful.',
            'data' => null,
        ]);
    }

    public function spaLogout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'status' => 'success',
            'message' => 'Logout successful.',
            'data' => null,
        ]);
    }
}
