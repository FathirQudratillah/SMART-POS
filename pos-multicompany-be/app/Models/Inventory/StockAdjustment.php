<?php

namespace App\Models\Inventory;

use App\Models\Core\User;
use App\Models\PosModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StockAdjustment extends PosModel
{
    protected $table = 'inventory.stock_adjustments';

    protected $fillable = [
        'company_id', 'adjustment_no', 'warehouse_id', 'adjustment_type', 'status',
        'adjustment_date', 'created_by', 'approved_by', 'reason',
    ];

    protected function casts(): array
    {
        return ['adjustment_date' => 'datetime'];
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class)->withTrashed();
    }

    public function items(): HasMany
    {
        return $this->hasMany(StockAdjustmentItem::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}
