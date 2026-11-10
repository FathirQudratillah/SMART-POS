<?php

namespace App\Http\Controllers\Api\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Inventory\StockAdjustment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class StockAdjustmentController extends Controller
{
    public function index(Request $request, int $company): JsonResponse
    {
        $this->authorizeCompany($request, $company);
        $search = trim($request->string('search')->toString());

        $records = StockAdjustment::query()
            ->where('company_id', $company)
            ->with('warehouse:id,company_id,code,name')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('adjustment_no', 'ILIKE', "%{$search}%")
                        ->orWhereHas('warehouse', fn($warehouse) => $warehouse->where('name', 'ILIKE', "%{$search}%"));
                });
            })
            ->latest('adjustment_date')
            ->latest('id')
            ->paginate(max(1, min((int) $request->integer('per_page', 25), 100)));

        return response()->json(['status' => 'success', 'message' => 'Stock adjustment list retrieved successfully.', 'data' => $records]);
    }

    public function show(Request $request, int $company, int $adjustment): JsonResponse
    {
        $this->authorizeCompany($request, $company);

        $record = StockAdjustment::query()
            ->where('company_id', $company)
            ->with(['warehouse:id,company_id,code,name', 'creator:id,name', 'approver:id,name', 'items.product:id,company_id,sku,name,unit'])
            ->findOrFail($adjustment);

        return response()->json(['status' => 'success', 'message' => 'Stock adjustment retrieved successfully.', 'data' => $record]);
    }

    public function store(Request $request, int $company): JsonResponse
    {
        $this->authorizeCompany($request, $company);
        $data = $request->validate([
            'warehouse_id' => ['required', 'integer', 'schema_exists:inventory,warehouses,id'],
            'adjustment_type' => ['required', 'in:increase,decrease'],
            'adjustment_date' => ['nullable', 'date'],
            'reason' => ['required', 'string', 'max:10000'],
            'items' => ['required', 'array', 'min:1', 'max:500'],
            'items.*.product_id' => ['required', 'integer', 'distinct', 'schema_exists:catalog,products,id'],
            'items.*.quantity' => ['required', 'numeric', 'decimal:0,3', 'gt:0', 'max:999999999999999.999'],
        ]);

        $this->assertActiveCompanyRecord('inventory.warehouses', $data['warehouse_id'], $company, 'The selected warehouse must be active and belong to this company.');
        foreach ($data['items'] as $item) {
            $this->assertActiveCompanyRecord('catalog.products', $item['product_id'], $company, 'Every selected product must be active and belong to this company.');
        }

        $record = DB::transaction(function () use ($company, $data, $request): StockAdjustment {
            $record = StockAdjustment::query()->create([
                'company_id' => $company,
                'adjustment_no' => 'ADJ-' . Str::upper((string) Str::uuid()),
                'warehouse_id' => $data['warehouse_id'],
                'adjustment_type' => $data['adjustment_type'],
                'status' => 'draft',
                'adjustment_date' => $data['adjustment_date'] ?? now(),
                'created_by' => $request->user()->getKey(),
                'reason' => $data['reason'],
            ]);
            $record->items()->createMany($data['items']);

            return $record->load(['warehouse:id,company_id,code,name', 'items.product:id,company_id,sku,name,unit']);
        });

        return response()->json(['status' => 'success', 'message' => 'Stock adjustment successfully created as a draft.', 'data' => $record], 201);
    }

    public function post(Request $request, int $company, int $adjustment): JsonResponse
    {
        $this->authorizeCompany($request, $company);

        $record = DB::transaction(function () use ($company, $adjustment, $request): StockAdjustment {
            $record = StockAdjustment::query()->where('company_id', $company)->lockForUpdate()->with('items')->findOrFail($adjustment);
            abort_unless($record->status === 'draft', 422, 'Only draft stock adjustments can be posted.');

            $this->assertActiveCompanyRecord('inventory.warehouses', $record->warehouse_id, $company, 'The adjustment warehouse is no longer active.');
            $productIds = $record->items->pluck('product_id')->sort()->values();

            foreach ($productIds as $productId) {
                DB::table('inventory.inventory_stocks')->insertOrIgnore([
                    'company_id' => $company,
                    'warehouse_id' => $record->warehouse_id,
                    'product_id' => $productId,
                    'quantity' => 0,
                    'updated_at' => now(),
                ]);
            }

            DB::table('inventory.inventory_stocks')
                ->where('company_id', $company)
                ->where('warehouse_id', $record->warehouse_id)
                ->whereIn('product_id', $productIds)
                ->orderBy('product_id')
                ->lockForUpdate()
                ->get();

            foreach ($record->items as $item) {
                if ($record->adjustment_type === 'increase') {
                    DB::table('inventory.inventory_stocks')
                        ->where('company_id', $company)
                        ->where('warehouse_id', $record->warehouse_id)
                        ->where('product_id', $item->product_id)
                        ->increment('quantity', $item->quantity, ['updated_at' => now()]);
                    $quantityIn = $item->quantity;
                    $quantityOut = 0;
                } else {
                    $updated = DB::table('inventory.inventory_stocks')
                        ->where('company_id', $company)
                        ->where('warehouse_id', $record->warehouse_id)
                        ->where('product_id', $item->product_id)
                        ->where('quantity', '>=', $item->quantity)
                        ->decrement('quantity', $item->quantity, ['updated_at' => now()]);
                    abort_unless($updated === 1, 422, "Insufficient stock for product ID {$item->product_id}.");
                    $quantityIn = 0;
                    $quantityOut = $item->quantity;
                }

                DB::table('inventory.stock_movements')->insert([
                    'company_id' => $company,
                    'warehouse_id' => $record->warehouse_id,
                    'product_id' => $item->product_id,
                    'movement_type' => $record->adjustment_type === 'increase' ? 'adjustment_in' : 'adjustment_out',
                    'reference_type' => 'stock_adjustment',
                    'reference_id' => $record->id,
                    'quantity_in' => $quantityIn,
                    'quantity_out' => $quantityOut,
                    'unit_cost' => null,
                    'notes' => $record->reason,
                    'created_by' => $request->user()->getKey(),
                    'created_at' => now(),
                ]);
            }

            $record->update(['status' => 'approved', 'approved_by' => $request->user()->getKey()]);

            return $record->fresh(['warehouse:id,company_id,code,name', 'creator:id,name', 'approver:id,name', 'items.product:id,company_id,sku,name,unit']);
        });

        return response()->json(['status' => 'success', 'message' => 'Stock adjustment successfully posted.', 'data' => $record]);
    }

    private function assertActiveCompanyRecord(string $table, int $id, int $company, string $message): void
    {
        abort_unless(
            DB::table($table)->where('id', $id)->where('company_id', $company)->where('is_active', true)->whereNull('deleted_at')->exists(),
            422,
            $message
        );
    }
}
