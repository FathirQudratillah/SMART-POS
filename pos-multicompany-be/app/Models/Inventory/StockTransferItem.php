<?php

namespace App\Models\Inventory;

use App\Models\Catalog\Product;
use App\Models\PosModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockTransferItem extends PosModel
{
    protected $table = 'inventory.stock_transfer_items';

    protected $fillable = ['stock_transfer_id', 'product_id', 'quantity'];

    protected function casts(): array
    {
        return ['quantity' => 'decimal:3'];
    }

    public function transfer(): BelongsTo
    {
        return $this->belongsTo(StockTransfer::class, 'stock_transfer_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class)->withTrashed();
    }
}
