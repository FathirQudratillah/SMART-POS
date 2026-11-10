<?php

namespace App\Models\Sales;

use App\Models\Catalog\Product;
use App\Models\Inventory\Warehouse;
use App\Models\PosModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SaleItem extends PosModel
{
    protected $table = 'sales.sale_items';

    protected $fillable = [
        'sale_id', 'product_id', 'warehouse_id', 'product_name', 'sku', 'quantity', 'unit_price',
        'discount_amount', 'tax_amount', 'cost_price', 'line_total',
    ];

    protected function casts(): array
    {
        return [
            'quantity' => 'decimal:3',
            'unit_price' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'cost_price' => 'decimal:2',
            'line_total' => 'decimal:2',
        ];
    }

    public function sale(): BelongsTo
    {
        return $this->belongsTo(Sale::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class)->withTrashed();
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class)->withTrashed();
    }
}
