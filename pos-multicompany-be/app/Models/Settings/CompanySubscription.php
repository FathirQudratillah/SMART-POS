<?php

namespace App\Models\Settings;

use App\Models\PosModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CompanySubscription extends PosModel
{
    protected $table = 'settings.company_subscriptions';

    protected $fillable = ['company_id', 'subscription_plan_id', 'starts_at', 'ends_at', 'status'];

    protected function casts(): array
    {
        return ['starts_at' => 'datetime', 'ends_at' => 'datetime'];
    }

    public function plan(): BelongsTo
    {
        return $this->belongsTo(SubscriptionPlan::class, 'subscription_plan_id')->withTrashed();
    }
}
