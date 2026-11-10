<?php

namespace App\Http\Controllers\Api\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Inventory\StockTransfer;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class StockTransferController extends Controller
{
    public function index(Request $request, int $company, ?int $branch = null): JsonResponse
    {
        $this->authorizeCompany($request, $company);

        $search = trim($request->string('search')->toString());
        $transfers = StockTransfer::query()
            ->where('company_id', $company)
            ->with(['sourceWarehouse:id,company_id,code,name', 'destinationWarehouse:id,company_id,code,name'])
            ->when($branch !== null, function ($query) use ($branch) {
                $query->whereHas('sourceWarehouse', function ($warehouseQuery) use ($branch) {
                    $warehouseQuery->where('branch_id', $branch);
                });
            })
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('transfer_no', 'ILIKE', "%{$search}%")
                        ->orWhereHas('sourceWarehouse', fn ($warehouse) => $warehouse->where('name', 'ILIKE', "%{$search}%"))
                        ->orWhereHas('destinationWarehouse', fn ($warehouse) => $warehouse->where('name', 'ILIKE', "%{$search}%"));
                });
            })
            ->latest('transfer_date')
            ->latest('id')
            ->paginate(max(1, min((int) $request->integer('per_page', 25), 100)));

        return response()->json([
            'status' => 'success',
            'message' => 'Stock transfer list retrieved successfully.',
            'data' => $transfers,
        ]);
    }

    public function show(Request $request, int $company, int $transfer): JsonResponse
    {
        $this->authorizeCompany($request, $company);

        $record = StockTransfer::query()
            ->where('company_id', $company)
            ->with([
                'sourceWarehouse:id,company_id,code,name',
                'destinationWarehouse:id,company_id,code,name',
                'creator:id,name',
                'approver:id,name',
                'items.product:id,company_id,sku,name,unit',
            ])
            ->findOrFail($transfer);

        return response()->json([
            'status' => 'success',
            'message' => 'Stock transfer retrieved successfully.',
            'data' => $record,
        ]);
    }

    public function store(Request $request, int $company): JsonResponse
    {
        $this->authorizeCompany($request, $company);
        $data = $request->validate([
            'source_warehouse_id' => ['required', 'integer', 'different:destination_warehouse_id', 'schema_exists:inventory,warehouses,id'],
            'destination_warehouse_id' => ['required', 'integer', 'schema_exists:inventory,warehouses,id'],
            'transfer_date' => ['nullable', 'date'],
            'notes' => ['nullable', 'string', 'max:10000'],
            'items' => ['required', 'array', 'min:1', 'max:500'],
            'items.*.product_id' => ['required', 'integer', 'distinct', 'schema_exists:catalog,products,id'],
            'items.*.quantity' => ['required', 'numeric', 'decimal:0,3', 'gt:0', 'max:999999999999999.999'],
        ]);


        foreach (['source_warehouse_id', 'destination_warehouse_id'] as $warehouseKey) {
            abort_unless(
                DB::table('inventory.warehouses')
                    ->where('id', $data[$warehouseKey])
                    ->where('company_id', $company)
                    ->where('is_active', true)
                    ->whereNull('deleted_at')
                    ->exists(),
                422,
                'Both selected warehouses must be active and belong to this company.'
            );
        }

        foreach ($data['items'] as $item) {
            abort_unless(
                DB::table('catalog.products')
                    ->where('id', $item['product_id'])
                    ->where('company_id', $company)
                    ->where('is_active', true)
                    ->whereNull('deleted_at')
                    ->exists(),
                422,
                'Every selected product must be active and belong to this company.'
            );
        }

        $record = DB::transaction(function () use ($company, $data, $request): StockTransfer {
            $record = StockTransfer::query()->create([
                'company_id' => $company,
                'transfer_no' => 'STF-'.Str::upper((string) Str::uuid()),
                'source_warehouse_id' => $data['source_warehouse_id'],
                'destination_warehouse_id' => $data['destination_warehouse_id'],
                'status' => 'draft',
                'transfer_date' => $data['transfer_date'] ?? now(),
                'created_by' => $request->user()->getKey(),
                'notes' => $data['notes'] ?? null,
            ]);

            $record->items()->createMany($data['items']);

            return $record->load([
                'sourceWarehouse:id,company_id,code,name',
                'destinationWarehouse:id,company_id,code,name',
                'items.product:id,company_id,sku,name,unit',
            ]);
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Stock transfer successfully created as a draft.',
            'data' => $record,
        ], 201);
    }

    public function post(Request $request, int $company, int $transfer): JsonResponse
    {
        $this->authorizeCompany($request, $company);

        $record = DB::transaction(function () use ($company, $transfer, $request): StockTransfer {
            $record = StockTransfer::query()
                ->where('company_id', $company)
                ->lockForUpdate()
                ->with('items')
                ->findOrFail($transfer);

            abort_unless($record->status === 'draft', 422, 'Only draft stock transfers can be posted.');
            abort_if($record->items->isEmpty(), 422, 'A stock transfer must contain at least one product.');

            $warehouseIds = [$record->source_warehouse_id, $record->destination_warehouse_id];
            $validWarehouses = DB::table('inventory.warehouses')
                ->where('company_id', $company)
                ->whereIn('id', $warehouseIds)
                ->where('is_active', true)
                ->whereNull('deleted_at')
                ->count();
            abort_unless($validWarehouses === 2, 422, 'Both transfer warehouses must still be active.');

            $productIds = $record->items->pluck('product_id')->sort()->values();
            $stocks = DB::table('inventory.inventory_stocks')
                ->where('company_id', $company)
                ->where('warehouse_id', $record->source_warehouse_id)
                ->whereIn('product_id', $productIds)
                ->orderBy('product_id')
                ->lockForUpdate()
                ->get()
                ->keyBy('product_id');

            foreach ($record->items as $item) {
                abort_unless(
                    $stocks->has($item->product_id),
                    422,
                    "Insufficient stock for product ID {$item->product_id}."
                );
            }

            foreach ($record->items as $item) {
                $decremented = DB::table('inventory.inventory_stocks')
                    ->where('company_id', $company)
                    ->where('warehouse_id', $record->source_warehouse_id)
                    ->where('product_id', $item->product_id)
                    ->where('quantity', '>=', $item->quantity)
                    ->decrement('quantity', $item->quantity, ['updated_at' => now()]);
                abort_unless($decremented === 1, 422, "Insufficient stock for product ID {$item->product_id}.");

                DB::table('inventory.inventory_stocks')->insertOrIgnore([
                    'company_id' => $company,
                    'warehouse_id' => $record->destination_warehouse_id,
                    'product_id' => $item->product_id,
                    'quantity' => 0,
                    'updated_at' => now(),
                ]);
                DB::table('inventory.inventory_stocks')
                    ->where('company_id', $company)
                    ->where('warehouse_id', $record->destination_warehouse_id)
                    ->where('product_id', $item->product_id)
                    ->increment('quantity', $item->quantity, ['updated_at' => now()]);

                foreach ([
                    [
                        'warehouse_id' => $record->source_warehouse_id,
                        'quantity_in' => 0,
                        'quantity_out' => $item->quantity,
                        'movement_type' => 'transfer_out',
                    ],
                    [
                        'warehouse_id' => $record->destination_warehouse_id,
                        'quantity_in' => $item->quantity,
                        'quantity_out' => 0,
                        'movement_type' => 'transfer_in',
                    ],
                ] as $movement) {
                    DB::table('inventory.stock_movements')->insert([
                        'company_id' => $company,
                        'warehouse_id' => $movement['warehouse_id'],
                        'product_id' => $item->product_id,
                        'movement_type' => $movement['movement_type'],
                        'reference_type' => 'stock_transfer',
                        'reference_id' => $record->id,
                        'quantity_in' => $movement['quantity_in'],
                        'quantity_out' => $movement['quantity_out'],
                        'unit_cost' => null,
                        'notes' => $record->notes,
                        'created_by' => $request->user()->getKey(),
                        'created_at' => now(),
                    ]);
                }
            }

            $record->update([
                'status' => 'approved',
                'approved_by' => $request->user()->getKey(),
            ]);

            return $record->fresh([
                'sourceWarehouse:id,company_id,code,name',
                'destinationWarehouse:id,company_id,code,name',
                'creator:id,name',
                'approver:id,name',
                'items.product:id,company_id,sku,name,unit',
            ]);
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Stock transfer successfully posted.',
            'data' => $record,
        ]);
    }
}
