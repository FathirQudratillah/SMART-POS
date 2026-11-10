<?php

namespace Database\Factories\Core;

use App\Models\Core\Company;
use App\Models\Core\CompanyUser;
use App\Models\Core\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<CompanyUser> */
class CompanyUserFactory extends Factory
{
    protected $model = CompanyUser::class;

    public function definition(): array
    {
        return [
            'company_id' => Company::factory(),
            'user_id' => User::factory(),
            'is_active' => true,
            'joined_at' => now(),
        ];
    }
}
