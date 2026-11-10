<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('inventory.warehouses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('core.companies')->cascadeOnDelete();
            $table->foreignId('branch_id')->nullable()->constrained('core.branches')->nullOnDelete();
            $table->string('code', 40);
            $table->string('name', 150);
            $table->text('address')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestampsTz();
            $table->unique(['company_id', 'code']);
            $table->index(['company_id', 'branch_id']);
        });

        Schema::create('inventory.inventory_stocks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('core.companies')->cascadeOnDelete();
            $table->foreignId('warehouse_id')->constrained('inventory.warehouses')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('catalog.products')->cascadeOnDelete();
            $table->decimal('quantity', 18, 3)->default(0);
            $table->timestampTz('updated_at')->useCurrent();
            $table->unique(['company_id', 'warehouse_id', 'product_id']);
        });

        Schema::create('inventory.stock_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('core.companies')->restrictOnDelete();
            $table->foreignId('warehouse_id')->constrained('inventory.warehouses')->restrictOnDelete();
            $table->foreignId('product_id')->constrained('catalog.products')->restrictOnDelete();
            $table->string('movement_type', 30);
            $table->string('reference_type', 50);
            $table->unsignedBigInteger('reference_id')->nullable();
            $table->decimal('quantity_in', 18, 3)->default(0);
            $table->decimal('quantity_out', 18, 3)->default(0);
            $table->decimal('unit_cost', 18, 2)->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->constrained('core.users')->restrictOnDelete();
            $table->timestampTz('created_at')->useCurrent();
            $table->index(['company_id', 'created_at']);
            $table->index(['warehouse_id', 'product_id', 'created_at']);
            $table->index(['reference_type', 'reference_id']);
        });

        Schema::create('inventory.stock_transfers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('core.companies')->restrictOnDelete();
            $table->string('transfer_no', 50);
            $table->foreignId('source_warehouse_id')->constrained('inventory.warehouses')->restrictOnDelete();
            $table->foreignId('destination_warehouse_id')->constrained('inventory.warehouses')->restrictOnDelete();
            $table->string('status', 20)->default('draft');
            $table->timestampTz('transfer_date');
            $table->foreignId('created_by')->constrained('core.users')->restrictOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('core.users')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestampsTz();
            $table->unique(['company_id', 'transfer_no']);
            $table->index(['company_id', 'status', 'transfer_date']);
        });

        Schema::create('inventory.stock_transfer_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stock_transfer_id')->constrained('inventory.stock_transfers')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('catalog.products')->restrictOnDelete();
            $table->decimal('quantity', 18, 3);
            $table->timestampsTz();
            $table->unique(['stock_transfer_id', 'product_id']);
        });

        DB::statement('ALTER TABLE inventory.inventory_stocks ADD CONSTRAINT inventory_stocks_quantity_nonnegative CHECK (quantity >= 0)');
        DB::statement('ALTER TABLE inventory.stock_movements ADD CONSTRAINT stock_movements_one_direction CHECK ((quantity_in > 0 AND quantity_out = 0) OR (quantity_out > 0 AND quantity_in = 0))');
        DB::statement('ALTER TABLE inventory.stock_transfers ADD CONSTRAINT stock_transfers_distinct_warehouses CHECK (source_warehouse_id <> destination_warehouse_id)');
        DB::statement('ALTER TABLE inventory.stock_transfer_items ADD CONSTRAINT stock_transfer_items_quantity_positive CHECK (quantity > 0)');
    }

    public function down(): void
    {
        Schema::dropIfExists('inventory.stock_transfer_items');
        Schema::dropIfExists('inventory.stock_transfers');
        Schema::dropIfExists('inventory.stock_movements');
        Schema::dropIfExists('inventory.inventory_stocks');
        Schema::dropIfExists('inventory.warehouses');
    }
};
