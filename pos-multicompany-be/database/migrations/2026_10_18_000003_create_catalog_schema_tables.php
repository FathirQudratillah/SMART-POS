<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('catalog.categories', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('core.companies')->cascadeOnDelete();
            $table->foreignId('parent_id')->nullable()->constrained('catalog.categories')->nullOnDelete();
            $table->string('name', 120);
            $table->string('code', 50);
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestampsTz();
            $table->unique(['company_id', 'code']);
            $table->index(['company_id', 'name']);
        });

        Schema::create('catalog.products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('core.companies')->cascadeOnDelete();
            $table->foreignId('category_id')->nullable()->constrained('catalog.categories')->nullOnDelete();
            $table->string('sku', 80);
            $table->string('barcode', 100)->nullable();
            $table->string('name', 200);
            $table->text('description')->nullable();
            $table->string('unit', 30);
            $table->decimal('cost_price', 18, 2)->default(0);
            $table->decimal('selling_price', 18, 2)->default(0);
            $table->boolean('is_active')->default(true);
            $table->timestampsTz();
            $table->softDeletesTz();
            $table->unique(['company_id', 'sku']);
            $table->index(['company_id', 'name']);
            $table->index(['company_id', 'barcode']);
        });

        Schema::create('catalog.product_prices', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('core.companies')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('catalog.products')->cascadeOnDelete();
            $table->string('price_type', 40);
            $table->decimal('price', 18, 2);
            $table->timestampTz('effective_from');
            $table->timestampTz('effective_to')->nullable();
            $table->timestampsTz();
            $table->index(['company_id', 'product_id', 'price_type']);
            $table->index(['product_id', 'effective_from', 'effective_to']);
        });

        Schema::create('catalog.product_units', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('core.companies')->cascadeOnDelete();
            $table->foreignId('product_id')->constrained('catalog.products')->cascadeOnDelete();
            $table->string('unit_name', 30);
            $table->decimal('conversion_factor', 18, 6);
            $table->string('barcode', 100)->nullable();
            $table->timestampsTz();
            $table->unique(['product_id', 'unit_name']);
            $table->index(['company_id', 'product_id']);
            $table->index('barcode');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('catalog.product_units');
        Schema::dropIfExists('catalog.product_prices');
        Schema::dropIfExists('catalog.products');
        Schema::dropIfExists('catalog.categories');
    }
};
