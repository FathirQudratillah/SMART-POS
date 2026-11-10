<?php

namespace App\Models\Settings;

use App\Models\PosModel;
use Illuminate\Database\Eloquent\SoftDeletes;

class CompanySetting extends PosModel
{
    use SoftDeletes;

    protected $table = 'settings.company_settings';

    protected $fillable = ['company_id', 'setting_key', 'setting_value'];

    protected function casts(): array
    {
        return ['setting_value' => 'array'];
    }
}
