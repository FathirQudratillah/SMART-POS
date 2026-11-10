<?php

namespace App\Models\Purchasing;

use App\Models\Core\Branch;
use App\Models\Inventory\Warehouse;
use App\Models\PosModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class GoodsReceipt extends PosModel
{
    protected $table = 'purchasing.goods_receipts';

    protected $fillable = [
        'company_id', 'branch_id', 'warehouse_id', 'supplier_id', 'purchase_id',
        'receipt_no', 'receipt_date', 'status', 'received_by',
    ];

    protected function casts(): array
    {
        return ['receipt_date' => 'datetime'];
    }

    public function items(): HasMany
    {
        return $this->hasMany(GoodsReceiptItem::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class)->withTrashed();
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class)->withTrashed();
    }

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class)->withTrashed();
    }

    public function purchase(): BelongsTo
    {
        return $this->belongsTo(Purchase::class);
    }
}
