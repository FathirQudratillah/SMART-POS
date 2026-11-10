<?php

namespace App\Models\Purchasing;

use App\Models\Core\Branch;
use App\Models\Inventory\Warehouse;
use App\Models\PosModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Purchase extends PosModel
{
    protected $table = 'purchasing.purchases';

    protected $fillable = [
        'company_id', 'branch_id', 'warehouse_id', 'supplier_id', 'purchase_no',
        'purchase_date', 'subtotal', 'discount_amount', 'tax_amount', 'total_amount', 'status', 'created_by',
    ];

    protected function casts(): array
    {
        return [
            'purchase_date' => 'datetime',
            'subtotal' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'total_amount' => 'decimal:2',
        ];
    }

    public function items(): HasMany
    {
        return $this->hasMany(PurchaseItem::class);
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

    public function goodsReceipts(): HasMany
    {
        return $this->hasMany(GoodsReceipt::class);
    }
}
