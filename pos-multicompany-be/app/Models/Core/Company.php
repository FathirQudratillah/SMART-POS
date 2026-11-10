<?php

namespace App\Models\Core;

use App\Models\Catalog\Product;
use App\Models\PosModel;
use App\Models\Sales\Customer;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Company extends PosModel
{
    use SoftDeletes;

    protected $table = 'core.companies';

    protected $fillable = [
        'name', 'code', 'legal_name', 'tax_number', 'email', 'phone', 'address', 'status',
    ];

    public function branches(): HasMany
    {
        return $this->hasMany(Branch::class);
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class, 'core.company_users')
            ->withPivot(['is_active', 'joined_at'])
            ->withTimestamps();
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function customers(): HasMany
    {
        return $this->hasMany(Customer::class);
    }
}
