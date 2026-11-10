<?php

namespace App\Http\Controllers\Api\Sales;

use App\Http\Controllers\Controller;
use App\Models\Catalog\Product;
use App\Models\Finance\CashMovement;
use App\Models\Sales\CashierShift;
use App\Models\Sales\Sale;
use App\Rules\SchemaUnique;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SaleController extends Controller
{
    public function shifts(Request $request, int $company): JsonResponse
    {
        $this->authorizeCompany($request, $company);
        $branchId = $request->integer('branch_id');
        abort_if($branchId < 1, 422, 'A branch ID is required.');
        $this->assertCompanyRelation('core.branches', $branchId, $company);

        $search = trim($request->string('search')->toString());
        $shifts = CashierShift::query()
            ->where('company_id', $company)
            ->where('branch_id', $branchId)
            ->with([
                'branch:id,company_id,code,name',
                'user:id,name',
            ])
            ->when(
                in_array($request->query('status'), ['open', 'closed'], true),
                fn (Builder $query) => $query->where('status', $request->query('status'))
            )
            ->when($search !== '', function (Builder $query) use ($search) {
                $query->where(function (Builder $query) use ($search) {
                    $query->where('status', 'ILIKE', "%{$search}%")
                        ->orWhereHas('user', fn (Builder $user) => $user->where('name', 'ILIKE', "%{$search}%"));
                });
            })
            ->latest('opened_at')
            ->latest('id')
            ->paginate(max(1, min((int) $request->integer('per_page', 25), 100)));

        $movementTotals = DB::table('finance.cash_movements')
            ->whereIn('cashier_shift_id', $shifts->getCollection()->pluck('id'))
            ->select('cashier_shift_id')
            ->selectRaw("COALESCE(SUM(CASE WHEN movement_type = 'cash_in' THEN amount ELSE 0 END), 0) as cash_in_total")
            ->selectRaw("COALESCE(SUM(CASE WHEN movement_type = 'cash_out' THEN amount ELSE 0 END), 0) as cash_out_total")
            ->groupBy('cashier_shift_id')
            ->get()
            ->keyBy('cashier_shift_id');

        $shifts->getCollection()->each(function (CashierShift $shift) use ($movementTotals): void {
            $totals = $movementTotals->get($shift->id);
            $cashIn = (string) ($totals->cash_in_total ?? '0.00');
            $cashOut = (string) ($totals->cash_out_total ?? '0.00');
            $expectedCash = $shift->expected_cash ?? $this->fromCents(
                $this->toCents((string) $shift->opening_cash)
                + $this->toCents($cashIn)
                - $this->toCents($cashOut)
            );

            $shift->setAttribute('cash_in_total', $cashIn);
            $shift->setAttribute('cash_out_total', $cashOut);
            $shift->setAttribute('current_expected_cash', $expectedCash);
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Cashier shifts retrieved successfully.',
            'data' => $shifts,
        ]);
    }

    public function index(Request $request, int $company): JsonResponse
    {
        $this->authorizeCompany($request, $company);
        $search = trim($request->string('search')->toString());

        $sales = Sale::query()
            ->where('company_id', $company)
            ->with([
                'branch:id,company_id,code,name',
                'warehouse:id,company_id,code,name',
                'customer:id,company_id,code,name',
            ])
            ->withCount('items')
            ->when($request->integer('branch_id') > 0, fn (Builder $query) => $query->where('branch_id', $request->integer('branch_id')))
            ->when($search !== '', function (Builder $query) use ($search) {
                $query->where(function (Builder $query) use ($search) {
                    $query->where('invoice_no', 'ILIKE', "%{$search}%")
                        ->orWhere('status', 'ILIKE', "%{$search}%")
                        ->orWhereHas('customer', fn (Builder $customer) => $customer->where('name', 'ILIKE', "%{$search}%"));
                });
            })
            ->latest('sale_date')
            ->latest('id')
            ->paginate(max(1, min((int) $request->integer('per_page', 25), 100)));

        return response()->json([
            'status' => 'success',
            'message' => 'Sales list retrieved successfully.',
            'data' => $sales,
        ]);
    }

    public function show(Request $request, int $company, int $sale): JsonResponse
    {
        $this->authorizeCompany($request, $company);

        $record = Sale::query()
            ->where('company_id', $company)
            ->with([
                'branch:id,company_id,code,name',
                'warehouse:id,company_id,code,name',
                'customer:id,company_id,code,name,phone',
                'cashierShift:id,company_id,branch_id,user_id,opened_at,status',
                'creator:id,name',
                'items.product:id,company_id,sku,name,unit',
                'items.warehouse:id,company_id,branch_id,code,name',
                'payments.paymentMethod:id,company_id,code,name,type',
            ])
            ->findOrFail($sale);

        return response()->json([
            'status' => 'success',
            'message' => 'Sale retrieved successfully.',
            'data' => $record,
        ]);
    }

    public function store(Request $request, int $company): JsonResponse
    {
        $this->authorizeCompany($request, $company);
        $data = $request->validate([
            'branch_id' => ['required', 'integer', 'schema_exists:core,branches,id'],
            'warehouse_id' => ['required', 'integer', 'schema_exists:inventory,warehouses,id'],
            'cashier_shift_id' => ['required', 'integer', 'schema_exists:sales,cashier_shifts,id'],
            'customer_id' => ['nullable', 'integer', 'schema_exists:sales,customers,id'],
            'invoice_no' => [
                'required',
                'string',
                'max:50',
                new SchemaUnique('sales', 'sales', 'invoice_no', ['company_id' => $company]),
            ],
            'sale_date' => ['required', 'date'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'schema_exists:catalog,products,id'],
            'items.*.warehouse_id' => ['nullable', 'integer', 'schema_exists:inventory,warehouses,id'],
            'items.*.quantity' => ['required', 'numeric', 'decimal:0,3', 'gt:0', 'max:999999999999999.999'],
        ]);
        $data['customer_id'] = $data['customer_id'] ?? null;

        $this->assertCompanyRelation('core.branches', $data['branch_id'], $company);
        abort_unless(
            DB::table('core.branches')->where('id', $data['branch_id'])->where('is_active', true)->whereNull('deleted_at')->exists(),
            422,
            'The selected branch is inactive.'
        );
        $this->assertCompanyRelation('inventory.warehouses', $data['warehouse_id'], $company);
        abort_unless(
            DB::table('inventory.warehouses')->where('id', $data['warehouse_id'])->where('is_active', true)->whereNull('deleted_at')->exists(),
            422,
            'The selected warehouse is inactive.'
        );
        $warehouseIds = collect($data['items'])
            ->map(fn (array $item) => (int) ($item['warehouse_id'] ?? $data['warehouse_id']))
            ->unique()
            ->values();
        $availableWarehouseCount = DB::table('inventory.warehouses')
            ->whereIn('id', $warehouseIds)
            ->where('company_id', $company)
            ->where('is_active', true)
            ->whereNull('deleted_at')
            ->where(fn ($query) => $query->where('branch_id', $data['branch_id'])->orWhereNull('branch_id'))
            ->count();
        abort_unless($availableWarehouseCount === $warehouseIds->count(), 422, 'One or more selected warehouses are inactive or not assigned to this branch.');
        $this->assertCompanyRelation('sales.cashier_shifts', $data['cashier_shift_id'], $company, [
            'branch_id' => $data['branch_id'],
            'user_id' => $request->user()->getKey(),
            'status' => 'open',
        ]);

        if ($data['customer_id'] !== null) {
            $this->assertCompanyRelation('sales.customers', $data['customer_id'], $company);
            abort_unless(
                DB::table('sales.customers')->where('id', $data['customer_id'])->where('is_active', true)->whereNull('deleted_at')->exists(),
                422,
                'The selected customer is inactive.'
            );
        }

        $products = Product::query()
            ->where('company_id', $company)
            ->whereIn('id', collect($data['items'])->pluck('product_id'))
            ->get()
            ->keyBy('id');

        if ($products->count() !== collect($data['items'])->pluck('product_id')->unique()->count()) {
            abort(422, 'One or more products do not belong to this company.');
        }
        abort_if($products->contains(fn (Product $product): bool => ! $product->is_active || $product->trashed()), 422, 'Inactive products cannot be sold.');

        $sale = DB::transaction(function () use ($company, $data, $products, $request): Sale {
            $items = collect($data['items'])->map(function (array $item) use ($products, $data): array {
                $product = $products->get($item['product_id']);
                $quantity = round((float) $item['quantity'], 3);
                $unitPrice = (float) $product->selling_price;

                return [
                    'product_id' => $product->id,
                    'warehouse_id' => $item['warehouse_id'] ?? $data['warehouse_id'],
                    'product_name' => $product->name,
                    'sku' => $product->sku,
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'discount_amount' => 0,
                    'tax_amount' => 0,
                    'cost_price' => $product->cost_price,
                    'line_total' => round($quantity * $unitPrice, 2),
                ];
            });

            $subtotal = round($items->sum('line_total'), 2);
            $sale = Sale::query()->create([
                'company_id' => $company,
                'branch_id' => $data['branch_id'],
                'warehouse_id' => $data['warehouse_id'],
                'cashier_shift_id' => $data['cashier_shift_id'],
                'customer_id' => $data['customer_id'] ?? null,
                'invoice_no' => $data['invoice_no'],
                'sale_date' => $data['sale_date'],
                'subtotal' => $subtotal,
                'discount_amount' => 0,
                'tax_amount' => 0,
                'total_amount' => $subtotal,
                'paid_amount' => 0,
                'change_amount' => 0,
                'status' => 'draft',
                'created_by' => $request->user()->getKey(),
            ]);

            $sale->items()->createMany($items->all());

            return $sale->load(['branch:id,company_id,code,name', 'warehouse:id,company_id,branch_id,code,name', 'customer:id,company_id,code,name', 'items.product:id,company_id,sku,name,unit', 'items.warehouse:id,company_id,branch_id,code,name']);
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Sale successfully created.',
            'data' => $sale,
        ], 201);
    }

    public function openShift(Request $request, int $company): JsonResponse
    {
        $this->authorizeCompany($request, $company);
        $branchId = (int) $request->query('branch_id');
        abort_if($branchId < 1, 422, 'A branch ID is required.');

        $this->assertCompanyRelation('core.branches', $branchId, $company);

        $shift = CashierShift::query()
            ->where('company_id', $company)
            ->where('branch_id', $branchId)
            ->where('user_id', $request->user()->getKey())
            ->where('status', 'open')
            ->latest('opened_at')
            ->first();

        if ($shift) {
            $totals = DB::table('finance.cash_movements')
                ->where('cashier_shift_id', $shift->id)
                ->selectRaw("COALESCE(SUM(CASE WHEN movement_type = 'cash_in' THEN amount ELSE 0 END), 0) as cash_in")
                ->selectRaw("COALESCE(SUM(CASE WHEN movement_type = 'cash_out' THEN amount ELSE 0 END), 0) as cash_out")
                ->first();
            $shift->setAttribute('cash_in_total', $totals->cash_in);
            $shift->setAttribute('cash_out_total', $totals->cash_out);
            $shift->setAttribute(
                'expected_cash',
                $this->fromCents(
                    $this->toCents((string) $shift->opening_cash)
                    + $this->toCents((string) $totals->cash_in)
                    - $this->toCents((string) $totals->cash_out)
                )
            );
            $shift->setAttribute('cash_movements', CashMovement::query()
                ->where('cashier_shift_id', $shift->id)
                ->latest('created_at')
                ->get());
        }

        return response()->json([
            'status' => 'success',
            'message' => $shift ? 'Open cashier shift retrieved successfully.' : 'No open cashier shift found.',
            'data' => $shift,
        ]);
    }

    public function startShift(Request $request, int $company): JsonResponse
    {
        $this->authorizeCompany($request, $company);
        $data = $request->validate([
            'branch_id' => ['required', 'integer', 'schema_exists:core,branches,id'],
            'opening_cash' => ['required', 'numeric', 'decimal:0,2', 'min:0', 'max:9999999999999999.99'],
        ]);
        $this->assertCompanyRelation('core.branches', $data['branch_id'], $company, ['is_active' => true]);
        abort_unless(
            DB::table('core.branches')->where('id', $data['branch_id'])->whereNull('deleted_at')->exists(),
            422,
            'The selected branch is inactive.'
        );

        $shift = DB::transaction(function () use ($company, $data, $request): CashierShift {
            $branch = DB::table('core.branches')
                ->where('id', $data['branch_id'])
                ->where('company_id', $company)
                ->lockForUpdate()
                ->first();
            abort_unless($branch && $branch->is_active && $branch->deleted_at === null, 422, 'The selected branch is inactive.');

            $hasOpenShift = DB::table('sales.cashier_shifts')
                ->where('company_id', $company)
                ->where('branch_id', $data['branch_id'])
                ->where('user_id', $request->user()->getKey())
                ->where('status', 'open')
                ->lockForUpdate()
                ->exists();
            abort_if($hasOpenShift, 422, 'You already have an open cashier shift for this branch.');

            return CashierShift::query()->create([
                'company_id' => $company,
                'branch_id' => $data['branch_id'],
                'user_id' => $request->user()->getKey(),
                'opened_at' => now(),
                'opening_cash' => $data['opening_cash'],
                'status' => 'open',
            ]);
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Cashier shift successfully opened.',
            'data' => $shift,
        ], 201);
    }

    public function closeShift(Request $request, int $company, int $shift): JsonResponse
    {
        $this->authorizeCompany($request, $company);
        $data = $request->validate([
            'closing_cash' => ['required', 'numeric', 'decimal:0,2', 'min:0', 'max:9999999999999999.99'],
        ]);

        $closedShift = DB::transaction(function () use ($company, $shift, $data, $request): CashierShift {
            $record = CashierShift::query()
                ->where('company_id', $company)
                ->where('user_id', $request->user()->getKey())
                ->lockForUpdate()
                ->findOrFail($shift);
            abort_unless($record->status === 'open', 422, 'Only an open cashier shift can be closed.');

            $hasDraftSales = Sale::query()
                ->where('cashier_shift_id', $record->id)
                ->where('status', 'draft')
                ->exists();
            abort_if($hasDraftSales, 422, 'Complete or resolve all draft sales before closing this shift.');

            $cashMovements = DB::table('finance.cash_movements')
                ->where('cashier_shift_id', $record->id)
                ->selectRaw("COALESCE(SUM(CASE WHEN movement_type = 'cash_in' THEN amount ELSE 0 END), 0) as cash_in")
                ->selectRaw("COALESCE(SUM(CASE WHEN movement_type = 'cash_out' THEN amount ELSE 0 END), 0) as cash_out")
                ->first();
            $expectedCashCents = $this->toCents((string) $record->opening_cash)
                + $this->toCents((string) $cashMovements->cash_in)
                - $this->toCents((string) $cashMovements->cash_out);

            $record->update([
                'closed_at' => now(),
                'closing_cash' => $data['closing_cash'],
                'expected_cash' => $this->fromCents($expectedCashCents),
                'status' => 'closed',
            ]);

            return $record->fresh();
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Cashier shift successfully closed.',
            'data' => $closedShift,
        ]);
    }

    public function paymentMethods(Request $request, int $company): JsonResponse
    {
        $this->authorizeCompany($request, $company);
        $methods = DB::table('settings.payment_methods')
            ->whereNull('deleted_at')
            ->where('is_active', true)
            ->where(fn ($query) => $query->whereNull('company_id')->orWhere('company_id', $company))
            ->orderBy('name')
            ->get(['id', 'company_id', 'code', 'name', 'type', 'is_active']);

        return response()->json([
            'status' => 'success',
            'message' => 'Available payment methods retrieved successfully.',
            'data' => $methods,
        ]);
    }

    public function complete(Request $request, int $company, int $sale): JsonResponse
    {
        $this->authorizeCompany($request, $company);
        $data = $request->validate([
            'payment_method_id' => ['required', 'integer', 'schema_exists:settings,payment_methods,id'],
            'amount_tendered' => ['required', 'numeric', 'decimal:0,2', 'gt:0', 'max:9999999999999999.99'],
            'reference_no' => ['nullable', 'string', 'max:100'],
        ]);

        abort_unless(
            DB::table('settings.payment_methods')
                ->where('id', $data['payment_method_id'])
                ->where('is_active', true)
                ->whereNull('deleted_at')
                ->where(fn ($query) => $query->whereNull('company_id')->orWhere('company_id', $company))
                ->exists(),
            422,
            'The selected payment method is inactive or unavailable to this company.'
        );

        $completedSale = DB::transaction(function () use ($company, $sale, $data, $request): Sale {
            $record = Sale::query()
                ->where('company_id', $company)
                ->lockForUpdate()
                ->with('items')
                ->findOrFail($sale);

            abort_unless($record->status === 'draft', 422, 'Only draft sales can be completed.');
            abort_if($record->items->isEmpty(), 422, 'A sale must contain at least one product.');
            $amountTenderedCents = $this->toCents((string) $data['amount_tendered']);
            $totalCents = $this->toCents((string) $record->total_amount);
            abort_if($amountTenderedCents < $totalCents, 422, 'The amount tendered must cover the sale total.');

            $shift = DB::table('sales.cashier_shifts')
                ->where('id', $record->cashier_shift_id)
                ->where('company_id', $company)
                ->where('branch_id', $record->branch_id)
                ->where('user_id', $request->user()->getKey())
                ->where('status', 'open')
                ->lockForUpdate()
                ->first();
            abort_unless($shift, 422, 'The cashier shift is no longer open or available to this user.');

            $stockKeys = $record->items
                ->map(fn ($item) => [
                    'warehouse_id' => $item->warehouse_id ?? $record->warehouse_id,
                    'product_id' => $item->product_id,
                ])
                ->unique(fn (array $key) => $key['warehouse_id'].':'.$key['product_id']);
            $warehouseIds = $stockKeys->pluck('warehouse_id')->unique()->sort()->values();
            $productIds = $stockKeys->pluck('product_id')->unique()->sort()->values();
            $warehouses = DB::table('inventory.warehouses')
                ->whereIn('id', $warehouseIds)
                ->where('company_id', $company)
                ->where(fn ($query) => $query->where('branch_id', $record->branch_id)->orWhereNull('branch_id'))
                ->where('is_active', true)
                ->whereNull('deleted_at')
                ->get(['id']);
            abort_unless($warehouses->count() === $warehouseIds->count(), 422, 'One or more sale warehouses are no longer active or assigned to this branch.');

            $stocks = DB::table('inventory.inventory_stocks')
                ->where('company_id', $company)
                ->whereIn('warehouse_id', $warehouseIds)
                ->whereIn('product_id', $productIds)
                ->orderBy('warehouse_id')
                ->orderBy('product_id')
                ->lockForUpdate()
                ->get()
                ->keyBy(fn ($stock) => $stock->warehouse_id.':'.$stock->product_id);

            foreach ($record->items as $item) {
                abort_unless(
                    DB::table('catalog.products')
                        ->where('id', $item->product_id)
                        ->where('company_id', $company)
                        ->where('is_active', true)
                        ->whereNull('deleted_at')
                        ->exists(),
                    422,
                    "Product {$item->sku} is no longer active."
                );
                $warehouseId = $item->warehouse_id ?? $record->warehouse_id;
                $stock = $stocks->get($warehouseId.':'.$item->product_id);
                abort_unless($stock, 422, "Insufficient stock for product {$item->sku}.");
                abort_if(
                    $this->toMilliUnits((string) $stock->quantity) < $this->toMilliUnits((string) $item->quantity),
                    422,
                    "Insufficient stock for product {$item->sku}."
                );
            }

            foreach ($record->items as $item) {
                $updated = DB::table('inventory.inventory_stocks')
                    ->where('company_id', $company)
                    ->where('warehouse_id', $item->warehouse_id ?? $record->warehouse_id)
                    ->where('product_id', $item->product_id)
                    ->where('quantity', '>=', $item->quantity)
                    ->decrement('quantity', $item->quantity, ['updated_at' => now()]);
                abort_unless($updated === 1, 422, "Insufficient stock for product {$item->sku}.");

                DB::table('inventory.stock_movements')->insert([
                    'company_id' => $company,
                    'warehouse_id' => $item->warehouse_id ?? $record->warehouse_id,
                    'product_id' => $item->product_id,
                    'movement_type' => 'sale',
                    'reference_type' => 'sale',
                    'reference_id' => $record->id,
                    'quantity_in' => 0,
                    'quantity_out' => $item->quantity,
                    'unit_cost' => $item->cost_price,
                    'notes' => "Sale {$record->invoice_no}",
                    'created_by' => $request->user()->getKey(),
                    'created_at' => now(),
                ]);
            }

            $record->payments()->create([
                'company_id' => $company,
                'payment_method_id' => $data['payment_method_id'],
                'amount' => $record->total_amount,
                'reference_no' => $data['reference_no'] ?? null,
                'paid_at' => now(),
                'status' => 'succeeded',
            ]);
            if (strtolower((string) DB::table('settings.payment_methods')->where('id', $data['payment_method_id'])->value('type')) === 'cash') {
                CashMovement::query()->create([
                    'company_id' => $company,
                    'branch_id' => $record->branch_id,
                    'cashier_shift_id' => $record->cashier_shift_id,
                    'movement_type' => 'cash_in',
                    'reference_type' => 'sale',
                    'reference_id' => $record->id,
                    'amount' => $record->total_amount,
                    'description' => "Cash sale {$record->invoice_no}",
                    'created_by' => $request->user()->getKey(),
                    'created_at' => now(),
                ]);
            }
            $record->update([
                'paid_amount' => $record->total_amount,
                'change_amount' => $this->fromCents($amountTenderedCents - $totalCents),
                'status' => 'completed',
            ]);

            return $record->fresh([
                'branch:id,company_id,code,name',
                'warehouse:id,company_id,code,name',
                'customer:id,company_id,code,name,phone',
                'cashierShift:id,company_id,branch_id,user_id,opened_at,status',
                'creator:id,name',
                'items.product:id,company_id,sku,name,unit',
                'items.warehouse:id,company_id,branch_id,code,name',
                'payments.paymentMethod:id,company_id,code,name,type',
            ]);
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Sale successfully completed.',
            'data' => $completedSale,
        ]);
    }

    private function assertCompanyRelation(string $table, int $id, int $company, array $conditions = []): void
    {
        abort_unless(
            DB::table($table)->where('id', $id)->where('company_id', $company)->where($conditions)->exists(),
            422,
            'A selected record does not belong to this company or is not available.'
        );
    }

    private function toMilliUnits(string $quantity): int
    {
        [$whole, $fraction] = array_pad(explode('.', $quantity, 2), 2, '');

        return ((int) $whole * 1000) + (int) str_pad(substr($fraction, 0, 3), 3, '0');
    }

    private function toCents(string $amount): int
    {
        [$whole, $fraction] = array_pad(explode('.', $amount, 2), 2, '');

        return ((int) $whole * 100) + (int) str_pad(substr($fraction, 0, 2), 2, '0');
    }

    private function fromCents(int $amount): string
    {
        return intdiv($amount, 100).'.'.str_pad((string) ($amount % 100), 2, '0', STR_PAD_LEFT);
    }
}
