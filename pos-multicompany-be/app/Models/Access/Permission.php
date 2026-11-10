<?php

namespace App\Models\Access;

use App\Models\PosModel;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Permission extends PosModel
{
    use SoftDeletes;

    protected $table = 'access.permissions';

    protected $fillable = ['name', 'code', 'module', 'description'];

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'access.role_permissions')
            ->withPivot('created_at');
    }
}
