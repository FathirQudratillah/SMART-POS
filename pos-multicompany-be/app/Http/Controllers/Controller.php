<?php

namespace App\Http\Controllers;

use App\Models\Core\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;

abstract class Controller
{
    protected function authorizeCompany(Request $request, int $company): void
    {
        $user = $request->user();
        abort_unless($user, 401, 'Authentication is required.');

        Gate::forUser($user)->authorize('access', [Company::class, $company]);
    }
}
