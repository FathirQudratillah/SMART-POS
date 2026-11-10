<?php

namespace App\Models\Settings;

use App\Models\PosModel;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class SubscriptionPlan extends PosModel
{
    use SoftDeletes;

    protected $table = 'settings.subscription_plans';

    protected $fillable = [
        'name', 'code', 'description', 'price', 'billing_period', 'max_branches', 'max_users', 'is_active',
    ];

    protected function casts(): array
    {
        return ['price' => 'decimal:2', 'is_active' => 'boolean'];
    }

    public function subscriptions(): HasMany
    {
        return $this->hasMany(CompanySubscription::class);
    }
}
