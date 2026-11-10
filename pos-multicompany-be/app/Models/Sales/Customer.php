<?php

namespace App\Models\Sales;

use App\Models\PosModel;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Customer extends PosModel
{
    use SoftDeletes;

    protected $table = 'sales.customers';

    protected $fillable = ['company_id', 'code', 'name', 'phone', 'email', 'address', 'is_active'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }

    public function sales(): HasMany
    {
        return $this->hasMany(Sale::class);
    }
}
