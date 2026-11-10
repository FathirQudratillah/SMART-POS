<?php

namespace App\Models\Inventory;

use App\Models\Core\User;
use App\Models\PosModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StockOpname extends PosModel
{
    protected $table = 'inventory.stock_opnames';

    protected $fillable = [
        'company_id', 'opname_no', 'warehouse_id', 'status', 'opname_date',
        'created_by', 'approved_by', 'notes',
    ];

    protected function casts(): array
    {
        return ['opname_date' => 'datetime'];
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class)->withTrashed();
    }

    public function items(): HasMany
    {
        return $this->hasMany(StockOpnameItem::class);
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
