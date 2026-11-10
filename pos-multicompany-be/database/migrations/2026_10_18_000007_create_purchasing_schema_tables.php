<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('purchasing.suppliers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('core.companies')->cascadeOnDelete();
            $table->string('code', 50);
            $table->string('name', 150);
            $table->string('phone', 30)->nullable();
            $table->string('email', 150)->nullable();
            $table->text('address')->nullable();
            $table->string('tax_number', 50)->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestampsTz();
            $table->unique(['company_id', 'code']);
            $table->index(['company_id', 'name']);
        });

        Schema::create('purchasing.purchases', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('core.companies')->restrictOnDelete();
            $table->foreignId('branch_id')->constrained('core.branches')->restrictOnDelete();
            $table->foreignId('warehouse_id')->constrained('inventory.warehouses')->restrictOnDelete();
            $table->foreignId('supplier_id')->constrained('purchasing.suppliers')->restrictOnDelete();
            $table->string('purchase_no', 50);
            $table->timestampTz('purchase_date');
            $table->decimal('subtotal', 18, 2)->default(0);
            $table->decimal('discount_amount', 18, 2)->default(0);
            $table->decimal('tax_amount', 18, 2)->default(0);
            $table->decimal('total_amount', 18, 2)->default(0);
            $table->string('status', 20)->default('draft');
            $table->foreignId('created_by')->constrained('core.users')->restrictOnDelete();
            $table->timestampsTz();
            $table->unique(['company_id', 'purchase_no']);
            $table->index(['company_id', 'status', 'purchase_date']);
        });

        Schema::create('purchasing.purchase_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('purchase_id')->constrained('purchasing.purchases')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('catalog.products')->restrictOnDelete();
            $table->decimal('quantity', 18, 3);
            $table->decimal('unit_price', 18, 2);
            $table->decimal('discount_amount', 18, 2)->default(0);
            $table->decimal('tax_amount', 18, 2)->default(0);
            $table->decimal('line_total', 18, 2);
            $table->timestampsTz();
            $table->index(['purchase_id', 'product_id']);
        });

        Schema::create('purchasing.goods_receipts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('core.companies')->restrictOnDelete();
            $table->foreignId('branch_id')->constrained('core.branches')->restrictOnDelete();
            $table->foreignId('warehouse_id')->constrained('inventory.warehouses')->restrictOnDelete();
            $table->foreignId('supplier_id')->constrained('purchasing.suppliers')->restrictOnDelete();
            $table->foreignId('purchase_id')->nullable()->constrained('purchasing.purchases')->nullOnDelete();
            $table->string('receipt_no', 50);
            $table->timestampTz('receipt_date');
            $table->string('status', 20)->default('draft');
            $table->foreignId('received_by')->constrained('core.users')->restrictOnDelete();
            $table->timestampsTz();
            $table->unique(['company_id', 'receipt_no']);
            $table->index(['company_id', 'status', 'receipt_date']);
        });

        Schema::create('purchasing.goods_receipt_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('goods_receipt_id')->constrained('purchasing.goods_receipts')->cascadeOnDelete();
            $table->foreignId('purchase_item_id')->nullable()->constrained('purchasing.purchase_items')->nullOnDelete();
            $table->foreignId('product_id')->constrained('catalog.products')->restrictOnDelete();
            $table->decimal('quantity_received', 18, 3);
            $table->decimal('unit_cost', 18, 2);
            $table->timestampsTz();
            $table->unique(['goods_receipt_id', 'purchase_item_id']);
            $table->index(['goods_receipt_id', 'product_id']);
        });

        DB::statement('ALTER TABLE purchasing.purchase_items ADD CONSTRAINT purchase_items_quantity_positive CHECK (quantity > 0)');
        DB::statement('ALTER TABLE purchasing.goods_receipt_items ADD CONSTRAINT goods_receipt_items_quantity_positive CHECK (quantity_received > 0)');
    }

    public function down(): void
    {
        Schema::dropIfExists('purchasing.goods_receipt_items');
        Schema::dropIfExists('purchasing.goods_receipts');
        Schema::dropIfExists('purchasing.purchase_items');
        Schema::dropIfExists('purchasing.purchases');
        Schema::dropIfExists('purchasing.suppliers');
    }
};
