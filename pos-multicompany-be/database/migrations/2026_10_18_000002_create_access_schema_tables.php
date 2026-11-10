<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('access.roles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->nullable()->constrained('core.companies')->cascadeOnDelete();
            $table->string('name', 80);
            $table->string('code', 80);
            $table->text('description')->nullable();
            $table->boolean('is_system')->default(false);
            $table->timestampsTz();
            $table->unique(['company_id', 'code']);
            $table->index(['company_id', 'is_system']);
        });
        

        DB::statement('CREATE UNIQUE INDEX roles_system_code_unique ON access.roles (code) WHERE company_id IS NULL');

        Schema::create('access.permissions', function (Blueprint $table) {
            $table->id();
            $table->string('name', 120);
            $table->string('code', 100)->unique();
            $table->string('module', 60);
            $table->text('description')->nullable();
            $table->timestampsTz();
            $table->index('module');
        });

        Schema::create('access.role_permissions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('role_id')->constrained('access.roles')->cascadeOnDelete();
            $table->foreignId('permission_id')->constrained('access.permissions')->cascadeOnDelete();
            $table->timestampTz('created_at')->useCurrent();
            $table->unique(['role_id', 'permission_id']);
        });

        Schema::create('access.user_roles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('core.companies')->cascadeOnDelete();
            $table->foreignId('user_id')->constrained('core.users')->cascadeOnDelete();
            $table->foreignId('role_id')->constrained('access.roles')->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained('core.branches')->cascadeOnDelete();
            $table->timestampsTz();
            $table->unique(['company_id', 'user_id', 'role_id', 'branch_id']);
            $table->index(['company_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('access.user_roles');
        Schema::dropIfExists('access.role_permissions');
        Schema::dropIfExists('access.permissions');
        DB::statement('DROP INDEX IF EXISTS access.roles_system_code_unique');
        Schema::dropIfExists('access.roles');
    }
};
