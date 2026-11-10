<?php

namespace App\Models\Sales;

use App\Models\PosModel;
use App\Models\Settings\PaymentMethod;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends PosModel
{
    protected $table = 'sales.payments';

    protected $fillable = [
        'company_id', 'sale_id', 'payment_method_id', 'amount', 'reference_no', 'paid_at', 'status',
    ];

    protected function casts(): array
    {
        return ['amount' => 'decimal:2', 'paid_at' => 'datetime'];
    }

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }

    public function paymentMethod(): BelongsTo
    {
        return $this->belongsTo(PaymentMethod::class)->withTrashed();
    }
}
