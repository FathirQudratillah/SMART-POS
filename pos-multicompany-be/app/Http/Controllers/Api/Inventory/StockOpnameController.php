<?php

namespace App\Http\Controllers\Api\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Inventory\StockOpname;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class StockOpnameController extends Controller
{
    public function index(Request $request, int $company): JsonResponse
    {
        $this->authorizeCompany($request, $company);
        $search = trim($request->string('search')->toString());

        $records = StockOpname::query()
            ->where('company_id', $company)
            ->with('warehouse:id,company_id,code,name')
            ->withCount('items')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('opname_no', 'ILIKE', "%{$search}%")
                        ->orWhereHas('warehouse', fn ($warehouse) => $warehouse->where('name', 'ILIKE', "%{$search}%"));
                });
            })
            ->latest('opname_date')
            ->latest('id')
            ->paginate(max(1, min((int) $request->integer('per_page', 25), 100)));

        return response()->json(['status' => 'success', 'message' => 'Stock opname list retrieved successfully.', 'data' => $records]);
    }

    public function show(Request $request, int $company, int $opname): JsonResponse
    {
        $this->authorizeCompany($request, $company);

        $record = StockOpname::query()
            ->where('company_id', $company)
            ->with(['warehouse:id,company_id,code,name', 'creator:id,name', 'approver:id,name', 'items.product:id,company_id,sku,name,unit'])
            ->findOrFail($opname);

        return response()->json(['status' => 'success', 'message' => 'Stock opname retrieved successfully.', 'data' => $record]);
    }

    public function store(Request $request, int $company): JsonResponse
    {
        $this->authorizeCompany($request, $company);
        $data = $request->validate([
            'warehouse_id' => ['required', 'integer', 'schema_exists:inventory,warehouses,id'],
            'opname_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:10000'],
            'items' => ['required', 'array', 'min:1', 'max:500'],
            'items.*.product_id' => ['required', 'integer', 'distinct', 'schema_exists:catalog,products,id'],
            'items.*.counted_quantity' => ['required', 'numeric', 'decimal:0,3', 'min:0', 'max:999999999999999.999'],
        ]);

        $this->assertActiveCompanyRecord('inventory.warehouses', $data['warehouse_id'], $company, 'The selected warehouse must be active and belong to this company.');
        foreach ($data['items'] as $item) {
            $this->assertActiveCompanyRecord('catalog.products', $item['product_id'], $company, 'Every selected product must be active and belong to this company.');
        }

        $record = DB::transaction(function () use ($company, $data, $request): StockOpname {
            $productIds = collect($data['items'])->pluck('product_id')->sort()->values();
            foreach ($productIds as $productId) {
                DB::table('inventory.inventory_stocks')->insertOrIgnore([
                    'company_id' => $company,
                    'warehouse_id' => $data['warehouse_id'],
                    'product_id' => $productId,
                    'quantity' => 0,
                    'updated_at' => now(),
                ]);
            }

            $stocks = DB::table('inventory.inventory_stocks')
                ->where('company_id', $company)
                ->where('warehouse_id', $data['warehouse_id'])
                ->whereIn('product_id', $productIds)
                ->orderBy('product_id')
                ->lockForUpdate()
                ->get()
                ->keyBy('product_id');

            $record = StockOpname::query()->create([
                'company_id' => $company,
                'opname_no' => 'OPN-'.Str::upper((string) Str::uuid()),
                'warehouse_id' => $data['warehouse_id'],
                'status' => 'draft',
                'opname_date' => $data['opname_date'] ?? now(),
                'created_by' => $request->user()->getKey(),
                'notes' => $data['notes'] ?? null,
            ]);

            $record->items()->createMany(collect($data['items'])->map(fn ($item) => [
                'product_id' => $item['product_id'],
                'system_quantity' => $stocks->get($item['product_id'])->quantity,
                'counted_quantity' => $item['counted_quantity'],
            ])->all());

            return $record->load(['warehouse:id,company_id,code,name', 'items.product:id,company_id,sku,name,unit']);
        });

        return response()->json(['status' => 'success', 'message' => 'Stock opname successfully created as a draft.', 'data' => $record], 201);
    }

    public function post(Request $request, int $company, int $opname): JsonResponse
    {
        $this->authorizeCompany($request, $company);

        $record = DB::transaction(function () use ($company, $opname, $request): StockOpname {
            $record = StockOpname::query()->where('company_id', $company)->lockForUpdate()->with('items')->findOrFail($opname);
            abort_unless($record->status === 'draft', 422, 'Only draft stock opnames can be posted.');
            $this->assertActiveCompanyRecord('inventory.warehouses', $record->warehouse_id, $company, 'The opname warehouse is no longer active.');

            $productIds = $record->items->pluck('product_id')->sort()->values();
            $stocks = DB::table('inventory.inventory_stocks')
                ->where('company_id', $company)
                ->where('warehouse_id', $record->warehouse_id)
                ->whereIn('product_id', $productIds)
                ->orderBy('product_id')
                ->lockForUpdate()
                ->get()
                ->keyBy('product_id');

            foreach ($record->items as $item) {
                $stock = $stocks->get($item->product_id);
                abort_unless($stock, 422, "Stock record is missing for product ID {$item->product_id}.");

                abort_unless(
                    $this->toMilliUnits((string) $stock->quantity) === $this->toMilliUnits((string) $item->system_quantity),
                    422,
                    "Stock changed after this opname draft was created for product ID {$item->product_id}. Create a new opname and recount."
                );

                $deltaMilli = $this->toMilliUnits((string) $item->counted_quantity) - $this->toMilliUnits((string) $stock->quantity);
                DB::table('inventory.inventory_stocks')
                    ->where('company_id', $company)
                    ->where('warehouse_id', $record->warehouse_id)
                    ->where('product_id', $item->product_id)
                    ->update(['quantity' => $item->counted_quantity, 'updated_at' => now()]);

                if ($deltaMilli === 0) {
                    continue;
                }

                $quantityIn = $deltaMilli > 0 ? $this->fromMilliUnits($deltaMilli) : 0;
                $quantityOut = $deltaMilli < 0 ? $this->fromMilliUnits(abs($deltaMilli)) : 0;
                DB::table('inventory.stock_movements')->insert([
                    'company_id' => $company,
                    'warehouse_id' => $record->warehouse_id,
                    'product_id' => $item->product_id,
                    'movement_type' => $deltaMilli > 0 ? 'opname_in' : 'opname_out',
                    'reference_type' => 'stock_opname',
                    'reference_id' => $record->id,
                    'quantity_in' => $quantityIn,
                    'quantity_out' => $quantityOut,
                    'unit_cost' => null,
                    'notes' => $record->notes,
                    'created_by' => $request->user()->getKey(),
                    'created_at' => now(),
                ]);
            }

            $record->update(['status' => 'approved', 'approved_by' => $request->user()->getKey()]);

            return $record->fresh(['warehouse:id,company_id,code,name', 'creator:id,name', 'approver:id,name', 'items.product:id,company_id,sku,name,unit']);
        });

        return response()->json(['status' => 'success', 'message' => 'Stock opname successfully posted.', 'data' => $record]);
    }

    private function assertActiveCompanyRecord(string $table, int $id, int $company, string $message): void
    {
        abort_unless(
            DB::table($table)->where('id', $id)->where('company_id', $company)->where('is_active', true)->whereNull('deleted_at')->exists(),
            422,
            $message
        );
    }

    private function toMilliUnits(string $quantity): int
    {
        [$whole, $fraction] = array_pad(explode('.', $quantity, 2), 2, '');

        return ((int) $whole * 1000) + (int) str_pad(substr($fraction, 0, 3), 3, '0');
    }

    private function fromMilliUnits(int $quantity): string
    {
        return intdiv($quantity, 1000).'.'.str_pad((string) ($quantity % 1000), 3, '0', STR_PAD_LEFT);
    }
}
