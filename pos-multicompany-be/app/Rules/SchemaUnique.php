<?php

namespace App\Rules;

use Closure;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Support\Facades\DB;

class SchemaUnique implements ValidationRule
{
    public function __construct(
        protected string $schema,
        protected string $table,
        protected string $column,
        protected array $where = [],
        protected ?int $ignoreId = null,
    ) {}

    public function validate(
        string $attribute,
        mixed $value,
        Closure $fail
    ): void {
        $query = DB::table("{$this->schema}.{$this->table}")
            ->where($this->column, $value);

        foreach ($this->where as $column => $condition) {
            $query->where($column, $condition);
        }

        if ($this->ignoreId !== null) {
            $query->where('id', '!=', $this->ignoreId);
        }

        if ($query->exists()) {
            $fail("The {$attribute} has already been taken.");
        }
    }
}
