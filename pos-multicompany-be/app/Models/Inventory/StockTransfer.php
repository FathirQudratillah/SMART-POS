<?php

namespace App\Models\Inventory;

use App\Models\Core\User;
use App\Models\PosModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class StockTransfer extends PosModel
{
    protected $table = 'inventory.stock_transfers';

    protected $fillable = [
        'company_id', 'transfer_no', 'source_warehouse_id', 'destination_warehouse_id',
        'status', 'transfer_date', 'created_by', 'approved_by', 'notes',
    ];

    protected function casts(): array
    {
        return ['transfer_date' => 'datetime'];
    }

    public function items(): HasMany
    {
        return $this->hasMany(StockTransferItem::class);
    }

    public function sourceWarehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class, 'source_warehouse_id')->withTrashed();
    }

    public function destinationWarehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class, 'destination_warehouse_id')->withTrashed();
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
