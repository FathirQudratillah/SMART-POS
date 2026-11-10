<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\DB;

class SchemaExists implements ValidationRule
{
    public function __construct(
        protected string $schema,
        protected string $table,
        protected string $column = 'id',
        protected ?int $companyId = null,
    ) {}

    public function validate(
        string $attribute,
        mixed $value,
        Closure $fail
    ): void {
        $query = DB::table("{$this->schema}.{$this->table}")
            ->where($this->column, $value);

        if ($this->companyId !== null) {
            $query->where('company_id', $this->companyId);
        }

        if (!$query->exists()) {
            $fail("The selected {$attribute} is invalid.");
        }
    }
}
