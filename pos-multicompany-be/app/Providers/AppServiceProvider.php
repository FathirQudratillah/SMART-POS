<?php

namespace App\Providers;

use App\Models\Core\Company;
use App\Models\Core\User;
use App\Policies\Core\CompanyPolicy;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Gate::policy(Company::class, CompanyPolicy::class);

        ResetPassword::createUrlUsing(function (User $user, string $token): string {
            return rtrim((string) config('app.frontend_url'), '/').'/reset-password?'.http_build_query([
                'token' => $token,
                'email' => $user->getEmailForPasswordReset(),
            ]);
        });

        Validator::extend(
            'schema_exists',
            function ($attribute, $value, $parameters, $validator) {
                [$schema, $table, $column] = $parameters;

                return DB::table("$schema.$table")
                    ->where($column, $value)
                    ->exists();
            },
            'The selected :attribute is invalid.'
        );
    }
}
