<?php

namespace App\Policies\Core;

use App\Models\Core\User;
use Illuminate\Auth\Access\Response;

class CompanyPolicy
{
    public function access(User $user, int $company): Response
    {
        $isMember = $user->companies()
            ->where('core.companies.id', $company)
            ->where('core.companies.status', 'active')
            ->wherePivot('is_active', true)
            ->exists();

        return $isMember
            ? Response::allow()
            : Response::deny('You do not have access to this company.');
    }
}
