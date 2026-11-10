<?php

namespace Database\Factories\Settings;

use App\Models\Core\Company;
use App\Models\Settings\CompanySubscription;
use App\Models\Settings\SubscriptionPlan;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<CompanySubscription> */
class CompanySubscriptionFactory extends Factory
{
    protected $model = CompanySubscription::class;

    public function definition(): array
    {
        return [
            'company_id' => Company::factory(),
            'subscription_plan_id' => SubscriptionPlan::factory(),
            'starts_at' => now(),
            'ends_at' => now()->addYear(),
            'status' => 'active',
        ];
    }
}
