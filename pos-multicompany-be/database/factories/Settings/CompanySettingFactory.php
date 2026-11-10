<?php

namespace Database\Factories\Settings;

use App\Models\Core\Company;
use App\Models\Settings\CompanySetting;
use Illuminate\Database\Eloquent\Factories\Factory;

/** @extends Factory<CompanySetting> */
class CompanySettingFactory extends Factory
{
    protected $model = CompanySetting::class;

    public function definition(): array
    {
        return [
            'company_id' => Company::factory(),
            'setting_key' => 'receipt_footer',
            'setting_value' => ['text' => fake()->sentence()],
        ];
    }
}
