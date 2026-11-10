<?php

namespace App\Models\Sales;

use App\Models\Core\Branch;
use App\Models\Core\User;
use App\Models\Finance\CashMovement;
use App\Models\PosModel;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CashierShift extends PosModel
{
    protected $table = 'sales.cashier_shifts';

    protected $fillable = [
        'company_id', 'branch_id', 'user_id', 'opened_at', 'opening_cash',
        'closed_at', 'closing_cash', 'expected_cash', 'status',
    ];

    protected function casts(): array
    {
        return [
            'opened_at' => 'datetime',
            'closed_at' => 'datetime',
            'opening_cash' => 'decimal:2',
            'closing_cash' => 'decimal:2',
            'expected_cash' => 'decimal:2',
        ];
    }

    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class, 'cashier_shift_id');
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class)->withTrashed();
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id')->withTrashed();
    }

    public function cashMovements(): HasMany
    {
        return $this->hasMany(CashMovement::class, 'cashier_shift_id');
    }
}
