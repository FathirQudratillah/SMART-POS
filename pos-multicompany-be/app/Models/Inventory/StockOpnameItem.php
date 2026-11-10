<?php

namespace App\Models\Inventory;

use App\Models\Catalog\Product;
use App\Models\PosModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockOpnameItem extends PosModel
{
    protected $table = 'inventory.stock_opname_items';

    protected $fillable = ['stock_opname_id', 'product_id', 'system_quantity', 'counted_quantity'];

    protected function casts(): array
    {
        return [
            'system_quantity' => 'decimal:3',
            'counted_quantity' => 'decimal:3',
        ];
    }

    public function opname(): BelongsTo
    {
        return $this->belongsTo(StockOpname::class, 'stock_opname_id');
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class)->withTrashed();
    }
}
