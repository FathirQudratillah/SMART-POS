<?php

namespace Database\Factories\Access;

use App\Models\Access\Role;
use App\Models\Access\UserRole;
use App\Models\Core\Branch;
use App\Models\Core\Company;
use App\Models\Core\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<UserRole> */
class UserRoleFactory extends Factory
{
    protected $model = UserRole::class;

    public function definition(): array
    {
        return [
            'company_id' => Company::factory(),
            'user_id' => User::factory(),
            'role_id' => Role::factory(),
            'branch_id' => Branch::factory(),
        ];
    }
}
