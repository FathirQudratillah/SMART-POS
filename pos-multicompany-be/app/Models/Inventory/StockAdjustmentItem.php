<?php

namespace App\Models\Inventory;

use App\Models\Catalog\Product;
use App\Models\PosModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockAdjustmentItem extends PosModel
{
    protected $table = 'inventory.stock_adjustment_items';

    protected $fillable = ['stock_adjustment_id', 'product_id', 'quantity'];

    protected function casts(): array
    {
        return ['quantity' => 'decimal:3'];
    }

    public function adjustment(): BelongsTo
    {
        return $this->belongsTo(StockAdjustment::class, 'stock_adjustment_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class)->withTrashed();
    }
}
