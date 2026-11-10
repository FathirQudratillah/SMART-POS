<?php

namespace App\Models\Sales;

use App\Models\PosModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class SaleReturn extends PosModel
{
    protected $table = 'sales.sale_returns';

    protected $fillable = [
        'company_id', 'branch_id', 'sale_id', 'return_no', 'return_date',
        'reason', 'total_amount', 'status', 'created_by',
    ];

    protected function casts(): array
    {
        return ['return_date' => 'datetime', 'total_amount' => 'decimal:2'];
    }

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(SaleReturnItem::class);
    }
}
