<?php

namespace App\Models\Sales;

use App\Models\PosModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SaleReturnItem extends PosModel
{
    protected $table = 'sales.sale_return_items';

    protected $fillable = ['sale_return_id', 'sale_item_id', 'product_id', 'quantity', 'unit_price', 'line_total'];

    protected function casts(): array
    {
        return ['quantity' => 'decimal:3', 'unit_price' => 'decimal:2', 'line_total' => 'decimal:2'];
    }

    public function saleReturn(): BelongsTo
    {
        return $this->belongsTo(SaleReturn::class);
    }
}
