<?php

namespace App\Models\Purchasing;

use App\Models\PosModel;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Supplier extends PosModel
{
    use SoftDeletes;

    protected $table = 'purchasing.suppliers';

    protected $fillable = [
        'company_id', 'code', 'name', 'phone', 'email', 'address', 'tax_number', 'is_active',
    ];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function purchases(): HasMany
    {
        return $this->hasMany(Purchase::class);
    }
}
