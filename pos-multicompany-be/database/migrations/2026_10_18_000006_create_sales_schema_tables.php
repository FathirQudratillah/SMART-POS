<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('sales.cashier_shifts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('core.companies')->restrictOnDelete();
            $table->foreignId('branch_id')->constrained('core.branches')->restrictOnDelete();
            $table->foreignId('user_id')->constrained('core.users')->restrictOnDelete();
            $table->timestampTz('opened_at');
            $table->decimal('opening_cash', 18, 2)->default(0);
            $table->timestampTz('closed_at')->nullable();
            $table->decimal('closing_cash', 18, 2)->nullable();
            $table->decimal('expected_cash', 18, 2)->nullable();
            $table->string('status', 20)->default('open');
            $table->timestampsTz();
            $table->index(['company_id', 'branch_id', 'status']);
            $table->index(['user_id', 'opened_at']);
        });

        Schema::create('sales.customers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('core.companies')->cascadeOnDelete();
            $table->string('code', 50);
            $table->string('name', 150);
            $table->string('phone', 30)->nullable();
            $table->string('email', 150)->nullable();
            $table->text('address')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestampsTz();
            $table->unique(['company_id', 'code']);
            $table->index(['company_id', 'name']);
        });

        Schema::create('sales.sales', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('core.companies')->restrictOnDelete();
            $table->foreignId('branch_id')->constrained('core.branches')->restrictOnDelete();
            $table->foreignId('warehouse_id')->constrained('inventory.warehouses')->restrictOnDelete();
            $table->foreignId('cashier_shift_id')->constrained('sales.cashier_shifts')->restrictOnDelete();
            $table->foreignId('customer_id')->nullable()->constrained('sales.customers')->nullOnDelete();
            $table->string('invoice_no', 50);
            $table->timestampTz('sale_date');
            $table->decimal('subtotal', 18, 2)->default(0);
            $table->decimal('discount_amount', 18, 2)->default(0);
            $table->decimal('tax_amount', 18, 2)->default(0);
            $table->decimal('total_amount', 18, 2)->default(0);
            $table->decimal('paid_amount', 18, 2)->default(0);
            $table->decimal('change_amount', 18, 2)->default(0);
            $table->string('status', 20)->default('draft');
            $table->foreignId('created_by')->constrained('core.users')->restrictOnDelete();
            $table->timestampsTz();
            $table->unique(['company_id', 'invoice_no']);
            $table->index(['company_id', 'branch_id', 'sale_date']);
            $table->index(['company_id', 'status', 'sale_date']);
        });

        Schema::create('sales.sale_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sale_id')->constrained('sales.sales')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('catalog.products')->restrictOnDelete();
            $table->string('product_name', 200);
            $table->string('sku', 80);
            $table->decimal('quantity', 18, 3);
            $table->decimal('unit_price', 18, 2);
            $table->decimal('discount_amount', 18, 2)->default(0);
            $table->decimal('tax_amount', 18, 2)->default(0);
            $table->decimal('cost_price', 18, 2)->nullable();
            $table->decimal('line_total', 18, 2);
            $table->timestampsTz();
            $table->index(['sale_id', 'product_id']);
        });

        Schema::create('sales.payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('core.companies')->restrictOnDelete();
            $table->foreignId('sale_id')->constrained('sales.sales')->restrictOnDelete();
            $table->foreignId('payment_method_id')->constrained('settings.payment_methods')->restrictOnDelete();
            $table->decimal('amount', 18, 2);
            $table->string('reference_no', 100)->nullable();
            $table->timestampTz('paid_at')->nullable();
            $table->string('status', 20)->default('pending');
            $table->timestampsTz();
            $table->index(['company_id', 'sale_id', 'status']);
            $table->index('reference_no');
        });

        Schema::create('sales.sale_returns', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('core.companies')->restrictOnDelete();
            $table->foreignId('branch_id')->constrained('core.branches')->restrictOnDelete();
            $table->foreignId('sale_id')->constrained('sales.sales')->restrictOnDelete();
            $table->string('return_no', 50);
            $table->timestampTz('return_date');
            $table->text('reason');
            $table->decimal('total_amount', 18, 2)->default(0);
            $table->string('status', 20)->default('draft');
            $table->foreignId('created_by')->constrained('core.users')->restrictOnDelete();
            $table->timestampsTz();
            $table->unique(['company_id', 'return_no']);
            $table->index(['sale_id', 'status']);
        });

        Schema::create('sales.sale_return_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('sale_return_id')->constrained('sales.sale_returns')->cascadeOnDelete();
            $table->foreignId('sale_item_id')->constrained('sales.sale_items')->restrictOnDelete();
            $table->foreignId('product_id')->constrained('catalog.products')->restrictOnDelete();
            $table->decimal('quantity', 18, 3);
            $table->decimal('unit_price', 18, 2);
            $table->decimal('line_total', 18, 2);
            $table->timestampsTz();
            $table->index(['sale_return_id', 'sale_item_id']);
        });

        DB::statement('ALTER TABLE sales.sale_items ADD CONSTRAINT sale_items_quantity_positive CHECK (quantity > 0)');
        DB::statement('ALTER TABLE sales.sale_return_items ADD CONSTRAINT sale_return_items_quantity_positive CHECK (quantity > 0)');
        DB::statement('ALTER TABLE sales.payments ADD CONSTRAINT payments_amount_positive CHECK (amount > 0)');
    }

    public function down(): void
    {
        Schema::dropIfExists('sales.sale_return_items');
        Schema::dropIfExists('sales.sale_returns');
        Schema::dropIfExists('sales.payments');
        Schema::dropIfExists('sales.sale_items');
        Schema::dropIfExists('sales.sales');
        Schema::dropIfExists('sales.customers');
        Schema::dropIfExists('sales.cashier_shifts');
    }
};
