<?php

namespace Database\Factories\Core;

use App\Models\Core\Branch;
use App\Models\Core\BranchUser;
use App\Models\Core\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<BranchUser> */
class BranchUserFactory extends Factory
{
    protected $model = BranchUser::class;

    public function definition(): array
    {
        return [
            'branch_id' => Branch::factory(),
            'user_id' => User::factory(),
            'is_active' => true,
        ];
    }
}
