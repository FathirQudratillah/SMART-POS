<?php

namespace App\Http\Controllers\Api\Purchasing;

use App\Http\Controllers\Controller;
use App\Models\Purchasing\GoodsReceipt;
use App\Rules\SchemaUnique;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class GoodsReceiptController extends Controller
{
    public function index(Request $request, int $company, ?int $branch): JsonResponse
    {
        $this->authorizeCompany($request, $company);
        $search = trim($request->string('search')->toString());

        $receipts = GoodsReceipt::query()
            ->where('company_id', $company)
            ->when($branch !== null, function ($query) use ($branch) {
                $query->where('branch_id', $branch);
            })
            ->with([
                'branch:id,company_id,code,name',
                'warehouse:id,company_id,code,name',
                'supplier:id,company_id,code,name',
                'purchase:id,company_id,purchase_no',
            ])
            ->withCount('items')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('receipt_no', 'ILIKE', "%{$search}%")
                        ->orWhere('status', 'ILIKE', "%{$search}%")
                        ->orWhereHas('supplier', fn ($supplier) => $supplier->where('name', 'ILIKE', "%{$search}%"))
                        ->orWhereHas('purchase', fn ($purchase) => $purchase->where('purchase_no', 'ILIKE', "%{$search}%"));
                });
            })
            ->latest('receipt_date')
            ->latest('id')
            ->paginate(max(1, min((int) $request->integer('per_page', 25), 100)));

        return response()->json([
            'status' => 'success',
            'message' => 'Goods receipt list retrieved successfully.',
            'data' => $receipts,
        ]);
    }

    public function show(Request $request, int $company, int $receipt): JsonResponse
    {
        $this->authorizeCompany($request, $company);

        $record = GoodsReceipt::query()
            ->where('company_id', $company)
            ->with([
                'branch:id,company_id,code,name',
                'warehouse:id,company_id,code,name',
                'supplier:id,company_id,code,name',
                'purchase:id,company_id,purchase_no',
                'items.product:id,company_id,sku,name,unit',
                'items.purchaseItem:id,purchase_id,product_id,quantity,unit_price',
            ])
            ->findOrFail($receipt);

        return response()->json([
            'status' => 'success',
            'message' => 'Goods receipt retrieved successfully.',
            'data' => $record,
        ]);
    }

    public function store(Request $request, int $company): JsonResponse
    {
        $this->authorizeCompany($request, $company);
        $data = $request->validate([
            'branch_id' => ['required', 'integer', 'schema_exists:core,branches,id'],
            'warehouse_id' => ['required', 'integer', 'schema_exists:inventory,warehouses,id'],
            'supplier_id' => ['required', 'integer', 'schema_exists:purchasing,suppliers,id'],
            'purchase_id' => ['nullable', 'integer', 'schema_exists:purchasing,purchases,id'],
            'receipt_no' => [
            'required', 'string', 'max:50', new SchemaUnique('purchasing', 'goods_receipts', 'receipt_no', ['company_id' => $company])],
            'receipt_date' => ['required', 'date'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.purchase_item_id' => ['nullable', 'integer', 'distinct', 'schema_exists:purchasing,purchase_items,id'],
            'items.*.product_id' => ['required', 'integer', 'distinct', 'schema_exists:catalog,products,id'],
            'items.*.quantity_received' => ['required', 'numeric', 'decimal:0,3', 'gt:0', 'max:999999999999999.999'],
            'items.*.unit_cost' => ['required', 'numeric', 'decimal:0,2', 'min:0', 'max:9999999999999999.99'],
        ]);
        $data['purchase_id'] = $data['purchase_id'] ?? null;

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
        $this->assertCompanyRelation('purchasing.suppliers', $data['supplier_id'], $company);
        abort_unless(
            DB::table('purchasing.suppliers')->where('id', $data['supplier_id'])->where('is_active', true)->whereNull('deleted_at')->exists(),
            422,
            'The selected supplier is inactive.'
        );
        $this->assertWarehouseBranch($data['warehouse_id'], $data['branch_id']);

        if ($data['purchase_id'] !== null) {
            abort_unless(
                DB::table('purchasing.purchases')
                    ->where('id', $data['purchase_id'])
                    ->where('company_id', $company)
                    ->where('supplier_id', $data['supplier_id'])
                    ->where('branch_id', $data['branch_id'])
                    ->where('warehouse_id', $data['warehouse_id'])
                    ->whereNotIn('status', ['cancelled', 'received'])
                    ->exists(),
                422,
                'The selected purchase is not available for this receipt.'
            );
        }

        foreach ($data['items'] as $item) {
            $this->assertCompanyRelation('catalog.products', $item['product_id'], $company);

            if (isset($item['purchase_item_id']) && $data['purchase_id'] === null) {
                abort(422, 'A purchase item can only be linked to a receipt for its purchase.');
            }

            if ($data['purchase_id'] !== null) {
                abort_unless(
                    isset($item['purchase_item_id'])
                    && DB::table('purchasing.purchase_items')
                        ->where('id', $item['purchase_item_id'])
                        ->where('purchase_id', $data['purchase_id'])
                        ->where('product_id', $item['product_id'])
                        ->exists(),
                    422,
                    'Each purchase receipt line must match an item in the selected purchase.'
                );
            }
        }

        $receipt = DB::transaction(function () use ($company, $data, $request): GoodsReceipt {
            $receipt = GoodsReceipt::query()->create([
                'company_id' => $company,
                'branch_id' => $data['branch_id'],
                'warehouse_id' => $data['warehouse_id'],
                'supplier_id' => $data['supplier_id'],
                'purchase_id' => $data['purchase_id'] ?? null,
                'receipt_no' => $data['receipt_no'],
                'receipt_date' => $data['receipt_date'],
                'status' => 'draft',
                'received_by' => $request->user()->getKey(),
            ]);

            $receipt->items()->createMany($data['items']);

            return $receipt->load([
                'branch:id,company_id,code,name',
                'warehouse:id,company_id,code,name',
                'supplier:id,company_id,code,name',
                'purchase:id,company_id,purchase_no',
                'items.product:id,company_id,sku,name,unit',
                'items.purchaseItem:id,purchase_id,product_id,quantity,unit_price',
            ]);
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Goods receipt successfully created.',
            'data' => $receipt,
        ], 201);
    }

    public function post(Request $request, int $company, int $receipt): JsonResponse
    {
        $this->authorizeCompany($request, $company);

        $postedReceipt = DB::transaction(function () use ($company, $receipt, $request): GoodsReceipt {
            $record = GoodsReceipt::query()
                ->where('company_id', $company)
                ->lockForUpdate()
                ->with('items')
                ->findOrFail($receipt);

            abort_unless($record->status === 'draft', 422, 'Only draft receipts can be posted.');

            foreach ($record->items as $item) {
                if ($record->purchase_id !== null) {
                    $purchaseItem = DB::table('purchasing.purchase_items')
                        ->where('id', $item->purchase_item_id)
                        ->lockForUpdate()
                        ->first();

                    abort_unless($purchaseItem, 422, 'The purchase item no longer exists.');

                    $alreadyReceived = DB::table('purchasing.goods_receipt_items as gri')
                        ->join('purchasing.goods_receipts as gr', 'gr.id', '=', 'gri.goods_receipt_id')
                        ->where('gri.purchase_item_id', $purchaseItem->id)
                        ->where('gr.status', 'posted')
                        ->sum('gri.quantity_received');

                    abort_if(
                        $this->toMilliUnits((string) $alreadyReceived) + $this->toMilliUnits((string) $item->quantity_received) > $this->toMilliUnits((string) $purchaseItem->quantity),
                        422,
                        'The received quantity exceeds the remaining purchase quantity.'
                    );
                }

                DB::table('inventory.inventory_stocks')->insertOrIgnore([
                    'company_id' => $company,
                    'warehouse_id' => $record->warehouse_id,
                    'product_id' => $item->product_id,
                    'quantity' => 0,
                    'updated_at' => now(),
                ]);

                DB::table('inventory.inventory_stocks')
                    ->where('company_id', $company)
                    ->where('warehouse_id', $record->warehouse_id)
                    ->where('product_id', $item->product_id)
                    ->lockForUpdate()
                    ->increment('quantity', $item->quantity_received, ['updated_at' => now()]);

                DB::table('inventory.stock_movements')->insert([
                    'company_id' => $company,
                    'warehouse_id' => $record->warehouse_id,
                    'product_id' => $item->product_id,
                    'movement_type' => 'purchase_receipt',
                    'reference_type' => 'goods_receipt',
                    'reference_id' => $record->id,
                    'quantity_in' => $item->quantity_received,
                    'quantity_out' => 0,
                    'unit_cost' => $item->unit_cost,
                    'notes' => null,
                    'created_by' => $request->user()->getKey(),
                    'created_at' => now(),
                ]);
            }

            $record->update(['status' => 'posted']);

            if ($record->purchase_id !== null) {
                $this->updatePurchaseStatus($record->purchase_id);
            }

            return $record->fresh([
                'branch:id,company_id,code,name',
                'warehouse:id,company_id,code,name',
                'supplier:id,company_id,code,name',
                'purchase:id,company_id,purchase_no',
                'items.product:id,company_id,sku,name,unit',
                'items.purchaseItem:id,purchase_id,product_id,quantity,unit_price',
            ]);
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Goods receipt successfully posted.',
            'data' => $postedReceipt,
        ]);
    }

    private function updatePurchaseStatus(int $purchaseId): void
    {
        $items = DB::table('purchasing.purchase_items')
            ->where('purchase_id', $purchaseId)
            ->get(['id', 'quantity']);
        $allReceived = $items->isNotEmpty();

        foreach ($items as $item) {
            $received = DB::table('purchasing.goods_receipt_items as gri')
                ->join('purchasing.goods_receipts as gr', 'gr.id', '=', 'gri.goods_receipt_id')
                ->where('gri.purchase_item_id', $item->id)
                ->where('gr.status', 'posted')
                ->sum('gri.quantity_received');

            if ((float) $received < (float) $item->quantity) {
                $allReceived = false;
                break;
            }
        }

        DB::table('purchasing.purchases')
            ->where('id', $purchaseId)
            ->update(['status' => $allReceived ? 'received' : 'partially_received', 'updated_at' => now()]);
    }

    private function assertCompanyRelation(string $table, int $id, int $company): void
    {
        abort_unless(
            DB::table($table)->where('id', $id)->where('company_id', $company)->exists(),
            422,
            'A selected record does not belong to this company.'
        );
    }

    private function assertWarehouseBranch(int $warehouse, int $branch): void
    {
        abort_unless(
            DB::table('inventory.warehouses')
                ->where('id', $warehouse)
                ->where(fn ($query) => $query->whereNull('branch_id')->orWhere('branch_id', $branch))
                ->exists(),
            422,
            'The selected warehouse is not assigned to this branch.'
        );
    }

    private function toMilliUnits(string $quantity): int
    {
        [$whole, $fraction] = array_pad(explode('.', $quantity, 2), 2, '');

        return ((int) $whole * 1000) + (int) str_pad(substr($fraction, 0, 3), 3, '0');
    }
}
