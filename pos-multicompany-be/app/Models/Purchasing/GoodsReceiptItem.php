<?php

namespace App\Models\Purchasing;

use App\Models\Catalog\Product;
use App\Models\PosModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class GoodsReceiptItem extends PosModel
{
    protected $table = 'purchasing.goods_receipt_items';

    protected $fillable = ['goods_receipt_id', 'purchase_item_id', 'product_id', 'quantity_received', 'unit_cost'];

    protected function casts(): array
    {
        return ['quantity_received' => 'decimal:3', 'unit_cost' => 'decimal:2'];
    }

    public function goodsReceipt(): BelongsTo
    {
        return $this->belongsTo(GoodsReceipt::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class)->withTrashed();
    }

    public function purchaseItem(): BelongsTo
    {
        return $this->belongsTo(PurchaseItem::class, 'purchase_item_id');
    }
}
