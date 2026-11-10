<?php

namespace App\Models\Catalog;

use App\Models\PosModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductPrice extends PosModel
{
    protected $table = 'catalog.product_prices';

    protected $fillable = [
        'company_id', 'product_id', 'price_type', 'price', 'effective_from', 'effective_to',
    ];

    protected function casts(): array
    {
        return [
            'price' => 'decimal:2',
            'effective_from' => 'datetime',
            'effective_to' => 'datetime',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class)->withTrashed();
    }
}
