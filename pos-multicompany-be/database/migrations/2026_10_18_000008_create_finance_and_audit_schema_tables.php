<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('finance.cash_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('core.companies')->restrictOnDelete();
            $table->foreignId('branch_id')->constrained('core.branches')->restrictOnDelete();
            $table->foreignId('cashier_shift_id')->nullable()->constrained('sales.cashier_shifts')->nullOnDelete();
            $table->string('movement_type', 20);
            $table->string('reference_type', 50);
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->decimal('amount', 18, 2);
            $table->text('description');
            $table->foreignId('created_by')->constrained('core.users')->restrictOnDelete();
            $table->timestampTz('created_at')->useCurrent();
            $table->index(['company_id', 'branch_id', 'created_at']);
            $table->index(['cashier_shift_id', 'created_at']);
            $table->index(['reference_type', 'reference_id']);
        });

        Schema::create('audit.audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->nullable()->constrained('core.companies')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('core.users')->nullOnDelete();
            $table->string('action', 100);
            $table->string('entity_type', 100);
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->jsonb('old_values')->nullable();
            $table->jsonb('new_values')->nullable();
            $table->ipAddress('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->timestampTz('created_at')->useCurrent();
            $table->index(['company_id', 'created_at']);
            $table->index(['entity_type', 'entity_id']);
            $table->index(['user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit.audit_logs');
        Schema::dropIfExists('finance.cash_movements');
    }
};
