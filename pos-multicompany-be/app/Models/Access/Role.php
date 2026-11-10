<?php

namespace App\Models\Access;

use App\Models\Core\User;
use App\Models\PosModel;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Role extends PosModel
{
    use SoftDeletes;

    protected $table = 'access.roles';

    protected $fillable = ['company_id', 'name', 'code', 'description', 'is_system'];

    protected function casts(): array
    {
        return ['is_system' => 'boolean'];
    }

    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(Permission::class, 'access.role_permissions')
            ->withPivot('created_at');
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(
            User::class,
            'access.user_roles',
            'role_id',
            'user_id'
        )->withPivot('company_id');
    }
}
