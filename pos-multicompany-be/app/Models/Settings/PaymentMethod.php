<?php

namespace App\Models\Settings;

use App\Models\PosModel;
use App\Models\Sales\Payment;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class PaymentMethod extends PosModel
{
    use SoftDeletes;

    protected $table = 'settings.payment_methods';

    protected $fillable = ['company_id', 'code', 'name', 'type', 'is_active'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }
}
