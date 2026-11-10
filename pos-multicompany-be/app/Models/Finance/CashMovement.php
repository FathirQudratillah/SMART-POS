<?php

namespace App\Models\Finance;

use App\Models\Core\Branch;
use App\Models\Core\User;
use App\Models\PosModel;
use App\Models\Sales\CashierShift;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CashMovement extends PosModel
{
    protected $table = 'finance.cash_movements';

    public $timestamps = false;

    protected $fillable = [
        'company_id', 'branch_id', 'cashier_shift_id', 'movement_type', 'reference_type',
        'reference_id', 'amount', 'description', 'created_by', 'created_at',
    ];

    protected function casts(): array
    {
        return ['amount' => 'decimal:2', 'created_at' => 'datetime'];
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class)->withTrashed();
    }

    public function cashierShift(): BelongsTo
    {
        return $this->belongsTo(CashierShift::class, 'cashier_shift_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
