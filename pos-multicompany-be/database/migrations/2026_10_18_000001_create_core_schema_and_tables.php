<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private array $schemas = [
        'core',
        'access',
        'catalog',
        'inventory',
        'sales',
        'purchasing',
        'finance',
        'audit',
        'settings',
    ];

    public function up(): void
    {
        if (DB::connection()->getDriverName() !== 'pgsql') {
            throw new RuntimeException('POS module schemas require PostgreSQL.');
        }

        foreach ($this->schemas as $schema) {
            DB::statement("CREATE SCHEMA IF NOT EXISTS {$schema}");
        }

        if (Schema::hasTable('users') && ! Schema::hasTable('core.users')) {
            DB::statement('ALTER TABLE public.users SET SCHEMA core');
        }

        if (! Schema::hasTable('core.users')) {
            throw new RuntimeException('The users table is required in the core schema before creating POS tables.');
        }

        Schema::table('core.users', function (Blueprint $table) {
            if (! Schema::hasColumn('core.users', 'phone')) {
                $table->string('phone', 30)->nullable();
            }

            if (! Schema::hasColumn('core.users', 'is_active')) {
                $table->boolean('is_active')->default(true);
            }
        });

        Schema::create('core.companies', function (Blueprint $table) {
            $table->id();
            $table->string('name', 150);
            $table->string('code', 30)->unique();
            $table->string('legal_name', 200)->nullable();
            $table->string('tax_number', 50)->nullable();
            $table->string('email', 150)->nullable();
            $table->string('phone', 30)->nullable();
            $table->text('address')->nullable();
            $table->string('status', 20)->default('active');
            $table->timestampsTz();
            $table->softDeletesTz();
        });

        Schema::create('core.branches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('core.companies')->cascadeOnDelete();
            $table->string('code', 30);
            $table->string('name', 150);
            $table->text('address')->nullable();
            $table->string('phone', 30)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestampsTz();
            $table->unique(['company_id', 'code']);
            $table->index(['company_id', 'is_active']);
        });

        Schema::create('core.company_users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('core.companies')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('core.users')->cascadeOnDelete();
            $table->boolean('is_active')->default(true);
            $table->timestampTz('joined_at')->nullable();
            $table->timestampsTz();
            $table->unique(['company_id', 'user_id']);
            $table->index(['user_id', 'is_active']);
        });

        Schema::create('core.branch_users', function (Blueprint $table) {
            $table->id();
            $table->foreignId('branch_id')->constrained('core.branches')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('core.users')->cascadeOnDelete();
            $table->boolean('is_active')->default(true);
            $table->timestampsTz();
            $table->unique(['branch_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('core.branch_users');
        Schema::dropIfExists('core.company_users');
        Schema::dropIfExists('core.branches');
        Schema::dropIfExists('core.companies');

        if (Schema::hasTable('core.users') && ! Schema::hasTable('users')) {
            DB::statement('ALTER TABLE core.users SET SCHEMA public');

            if (Schema::hasTable('users')) {
                Schema::table('users', function (Blueprint $table) {
                    if (Schema::hasColumn('users', 'phone')) {
                        $table->dropColumn('phone');
                    }

                    if (Schema::hasColumn('users', 'is_active')) {
                        $table->dropColumn('is_active');
                    }
                });
            }
        }

        foreach (array_reverse($this->schemas) as $schema) {
            DB::statement("DROP SCHEMA IF EXISTS {$schema}");
        }
    }
};
