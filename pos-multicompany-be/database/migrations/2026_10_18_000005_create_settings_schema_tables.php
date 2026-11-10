<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings.company_settings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('core.companies')->cascadeOnDelete();
            $table->string('setting_key', 100);
            $table->jsonb('setting_value')->nullable();
            $table->timestampsTz();
            $table->unique(['company_id', 'setting_key']);
        });

        Schema::create('settings.payment_methods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->nullable()->constrained('core.companies')->cascadeOnDelete();
            $table->string('code', 40);
            $table->string('name', 100);
            $table->string('type', 30);
            $table->boolean('is_active')->default(true);
            $table->timestampsTz();
            $table->unique(['company_id', 'code']);
            $table->index(['company_id', 'is_active']);
        });

        DB::statement('CREATE UNIQUE INDEX payment_methods_global_code_unique ON settings.payment_methods (code) WHERE company_id IS NULL');

        Schema::create('settings.subscription_plans', function (Blueprint $table) {
            $table->id();
            $table->string('name', 100);
            $table->string('code', 40)->unique();
            $table->text('description')->nullable();
            $table->decimal('price', 18, 2);
            $table->string('billing_period', 20);
            $table->integer('max_branches');
            $table->integer('max_users');
            $table->boolean('is_active')->default(true);
            $table->timestampsTz();
        });

        Schema::create('settings.company_subscriptions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('company_id')->constrained('core.companies')->restrictOnDelete();
            $table->foreignId('subscription_plan_id')->constrained('settings.subscription_plans')->restrictOnDelete();
            $table->timestampTz('starts_at');
            $table->timestampTz('ends_at')->nullable();
            $table->string('status', 20)->default('trial');
            $table->timestampsTz();
            $table->index(['company_id', 'status']);
            $table->index(['subscription_plan_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('settings.company_subscriptions');
        Schema::dropIfExists('settings.subscription_plans');
        DB::statement('DROP INDEX IF EXISTS settings.payment_methods_global_code_unique');
        Schema::dropIfExists('settings.payment_methods');
        Schema::dropIfExists('settings.company_settings');
    }
};
