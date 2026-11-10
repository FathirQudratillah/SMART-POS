<?php

namespace App\Http\Middleware;

use App\Services\Access\AccessService;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    public function __construct(
        private AccessService $accessService
    ) {}

    public function handle(
        Request $request,
        Closure $next,
        string $permission
    ): Response {
        $user = $request->user();

        if (! $user) {
            abort(401, 'Unauthenticated.');
        }

        abort_if($user->is_superadmin, 403, 'Superadmin accounts cannot access company operations.');

        $company = $request->route('company');
        $branch = $request->route('branch') ?? $request->input('branch_id');

        $companyId = is_object($company)
            ? $company->id
            : $company;

        $branchId = is_object($branch)
            ? $branch->id
            : $branch;
        $branchId = filter_var($branchId, FILTER_VALIDATE_INT) ?: null;

        if (! $companyId) {
            abort(403, 'Company context is required.');
        }

        $allowed = $this->accessService->hasPermission(
            $user,
            (int) $companyId,
            $branchId ? (int) $branchId : null,
            $permission
        );

        abort_unless($allowed, 403, 'You do not have permission.');

        return $next($request);
    }
}
