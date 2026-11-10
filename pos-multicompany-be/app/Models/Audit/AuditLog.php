<?php

namespace App\Models\Audit;

use App\Models\PosModel;

class AuditLog extends PosModel
{
    protected $table = 'audit.audit_logs';

    public $timestamps = false;

    protected $fillable = [
        'company_id', 'user_id', 'action', 'entity_type', 'entity_id',
        'old_values', 'new_values', 'ip_address', 'user_agent', 'created_at',
    ];

    protected function casts(): array
    {
        return [
            'old_values' => 'array',
            'new_values' => 'array',
            'created_at' => 'datetime',
        ];
    }
}
