<?php

namespace App\Models\Catalog;

use App\Models\PosModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductUnit extends PosModel
{
    protected $table = 'catalog.product_units';

    protected $fillable = ['company_id', 'product_id', 'unit_name', 'conversion_factor', 'barcode'];

    protected function casts(): array
    {
        return ['conversion_factor' => 'decimal:6'];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class)->withTrashed();
    }
}
