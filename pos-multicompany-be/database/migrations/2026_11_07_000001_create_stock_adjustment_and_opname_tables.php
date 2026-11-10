<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory.stock_adjustments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('core.companies')->restrictOnDelete();
            $table->string('adjustment_no', 50);
            $table->foreignId('warehouse_id')->constrained('inventory.warehouses')->restrictOnDelete();
            $table->string('adjustment_type', 20);
            $table->string('status', 20)->default('draft');
            $table->timestampTz('adjustment_date');
            $table->foreignId('created_by')->constrained('core.users')->restrictOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('core.users')->nullOnDelete();
            $table->text('reason');
            $table->timestampsTz();
            $table->unique(['company_id', 'adjustment_no']);
            $table->index(['company_id', 'status', 'adjustment_date']);
        });

        Schema::create('inventory.stock_adjustment_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stock_adjustment_id')->constrained('inventory.stock_adjustments')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('catalog.products')->restrictOnDelete();
            $table->decimal('quantity', 18, 3);
            $table->timestampsTz();
            $table->unique(['stock_adjustment_id', 'product_id']);
        });

        Schema::create('inventory.stock_opnames', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('core.companies')->restrictOnDelete();
            $table->string('opname_no', 50);
            $table->foreignId('warehouse_id')->constrained('inventory.warehouses')->restrictOnDelete();
            $table->string('status', 20)->default('draft');
            $table->timestampTz('opname_date');
            $table->foreignId('created_by')->constrained('core.users')->restrictOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('core.users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestampsTz();
            $table->unique(['company_id', 'opname_no']);
            $table->index(['company_id', 'status', 'opname_date']);
        });

        Schema::create('inventory.stock_opname_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stock_opname_id')->constrained('inventory.stock_opnames')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('catalog.products')->restrictOnDelete();
            $table->decimal('system_quantity', 18, 3);
            $table->decimal('counted_quantity', 18, 3);
            $table->timestampsTz();
            $table->unique(['stock_opname_id', 'product_id']);
        });

        DB::statement("ALTER TABLE inventory.stock_adjustments ADD CONSTRAINT stock_adjustments_type_check CHECK (adjustment_type IN ('increase', 'decrease'))");
        DB::statement("ALTER TABLE inventory.stock_adjustments ADD CONSTRAINT stock_adjustments_status_check CHECK (status IN ('draft', 'approved'))");
        DB::statement('ALTER TABLE inventory.stock_adjustment_items ADD CONSTRAINT stock_adjustment_items_quantity_positive CHECK (quantity > 0)');
        DB::statement("ALTER TABLE inventory.stock_opnames ADD CONSTRAINT stock_opnames_status_check CHECK (status IN ('draft', 'approved'))");
        DB::statement('ALTER TABLE inventory.stock_opname_items ADD CONSTRAINT stock_opname_items_quantities_nonnegative CHECK (system_quantity >= 0 AND counted_quantity >= 0)');
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory.stock_opname_items');
        Schema::dropIfExists('inventory.stock_opnames');
        Schema::dropIfExists('inventory.stock_adjustment_items');
        Schema::dropIfExists('inventory.stock_adjustments');
    }
};
