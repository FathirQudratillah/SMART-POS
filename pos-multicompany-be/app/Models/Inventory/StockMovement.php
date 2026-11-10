<?php

namespace App\Models\Inventory;

use App\Models\Catalog\Product;
use App\Models\Core\User;
use App\Models\PosModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockMovement extends PosModel
{
    protected $table = 'inventory.stock_movements';

    public $timestamps = false;

    protected $fillable = [
        'company_id', 'warehouse_id', 'product_id', 'movement_type', 'reference_type',
        'reference_id', 'quantity_in', 'quantity_out', 'unit_cost', 'notes', 'created_by', 'created_at',
    ];

    protected function casts(): array
    {
        return [
            'quantity_in' => 'decimal:3',
            'quantity_out' => 'decimal:3',
            'unit_cost' => 'decimal:2',
            'created_at' => 'datetime',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class)->withTrashed();
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class)->withTrashed();
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by')->withTrashed();
    }
}
