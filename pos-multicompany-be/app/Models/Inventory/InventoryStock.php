<?php

namespace App\Models\Inventory;

use App\Models\Catalog\Product;
use App\Models\PosModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InventoryStock extends PosModel
{
    protected $table = 'inventory.inventory_stocks';

    public const CREATED_AT = null;

    protected $fillable = ['company_id', 'warehouse_id', 'product_id', 'quantity'];

    protected function casts(): array
    {
        return ['quantity' => 'decimal:3', 'updated_at' => 'datetime'];
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class)->withTrashed();
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class)->withTrashed();
    }
}
