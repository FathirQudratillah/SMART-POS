<?php

namespace App\Models\Sales;

use App\Models\Core\Branch;
use App\Models\Core\User;
use App\Models\Inventory\Warehouse;
use App\Models\PosModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Sale extends PosModel
{
    protected $table = 'sales.sales';

    protected $fillable = [
        'company_id', 'branch_id', 'warehouse_id', 'cashier_shift_id', 'customer_id',
        'invoice_no', 'sale_date', 'subtotal', 'discount_amount', 'tax_amount',
        'total_amount', 'paid_amount', 'change_amount', 'status', 'created_by',
    ];

    protected function casts(): array
    {
        return [
            'sale_date' => 'datetime',
            'subtotal' => 'decimal:2',
            'discount_amount' => 'decimal:2',
            'tax_amount' => 'decimal:2',
            'total_amount' => 'decimal:2',
            'paid_amount' => 'decimal:2',
            'change_amount' => 'decimal:2',
        ];
    }

    public function items(): HasMany
    {
        return $this->hasMany(SaleItem::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class)->withTrashed();
    }

    public function warehouse(): BelongsTo
    {
        return $this->belongsTo(Warehouse::class)->withTrashed();
    }

    public function cashierShift(): BelongsTo
    {
        return $this->belongsTo(CashierShift::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function customer(): BelongsTo
    {
        return $this->belongsTo(Customer::class)->withTrashed();
    }

    public function returns(): HasMany
    {
        return $this->hasMany(SaleReturn::class);
    }
}
