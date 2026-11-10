<?php

namespace App\Http\Controllers\Api\Purchasing;

use App\Http\Controllers\Controller;
use App\Models\Catalog\Product;
use App\Models\Purchasing\Purchase;
use App\Rules\SchemaUnique;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PurchaseController extends Controller
{
    public function index(Request $request, int $company, ?int $branch): JsonResponse
    {
        $this->authorizeCompany($request, $company);
        $search = trim($request->string('search')->toString());

        $purchases = Purchase::query()
            ->where('company_id', $company)
            ->when($branch !== null, function ($query) use ($branch) {
                $query->where('branch_id', $branch);
            })
            ->with([
                'branch:id,company_id,code,name',
                'warehouse:id,company_id,code,name',
                'supplier:id,company_id,code,name',
            ])
            ->withCount('items')
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('purchase_no', 'ILIKE', "%{$search}%")
                        ->orWhere('status', 'ILIKE', "%{$search}%")
                        ->orWhereHas('supplier', fn ($supplier) => $supplier->where('name', 'ILIKE', "%{$search}%"));
                });
            })
            ->latest('purchase_date')
            ->latest('id')
            ->paginate(max(1, min((int) $request->integer('per_page', 25), 100)));

        return response()->json([
            'status' => 'success',
            'message' => 'Purchase list retrieved successfully.',
            'data' => $purchases,
        ]);
    }

    public function show(Request $request, int $company, int $purchase): JsonResponse
    {
        $this->authorizeCompany($request, $company);

        $record = Purchase::query()
            ->where('company_id', $company)
            ->with([
                'branch:id,company_id,code,name',
                'warehouse:id,company_id,code,name',
                'supplier:id,company_id,code,name',
                'items.product:id,company_id,sku,name,unit',
            ])
            ->findOrFail($purchase);
        $this->attachReceivedQuantities($record);

        return response()->json([
            'status' => 'success',
            'message' => 'Purchase retrieved successfully.',
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
            'purchase_no' => [
                'required', 'string', 'max:50', new SchemaUnique('purchasing', 'purchases', 'purchase_no', ['company_id' => $company])
            ],
            'purchase_date' => ['required', 'date'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_id' => ['required', 'integer', 'distinct', 'schema_exists:catalog,products,id'],
            'items.*.quantity' => ['required', 'numeric', 'decimal:0,3', 'gt:0', 'max:999999999999999.999'],
            'items.*.unit_price' => ['required', 'numeric', 'decimal:0,2', 'min:0', 'max:9999999999999999.99'],
            'items.*.discount_amount' => ['sometimes', 'numeric', 'decimal:0,2', 'min:0', 'max:9999999999999999.99'],
            'items.*.tax_amount' => ['sometimes', 'numeric', 'decimal:0,2', 'min:0', 'max:9999999999999999.99'],
        ]);

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
        abort_unless(
            DB::table('inventory.warehouses')
                ->where('id', $data['warehouse_id'])
                ->where(function ($query) use ($data) {
                    $query->whereNull('branch_id')->orWhere('branch_id', $data['branch_id']);
                })
                ->exists(),
            422,
            'The selected warehouse is not assigned to this branch.'
        );

        $products = Product::query()
            ->where('company_id', $company)
            ->whereIn('id', collect($data['items'])->pluck('product_id'))
            ->get()
            ->keyBy('id');

        if ($products->count() !== count($data['items'])) {
            abort(422, 'One or more products do not belong to this company.');
        }
        abort_if($products->contains(fn (Product $product): bool => ! $product->is_active), 422, 'Inactive products cannot be ordered.');

        $purchase = DB::transaction(function () use ($company, $data, $request): Purchase {
            $lines = collect($data['items'])->map(function (array $item): array {
                $quantity = round((float) $item['quantity'], 3);
                $unitPrice = (float) $item['unit_price'];
                $discount = (float) ($item['discount_amount'] ?? 0);
                $tax = (float) ($item['tax_amount'] ?? 0);

                abort_if($discount > $quantity * $unitPrice, 422, 'An item discount cannot exceed its gross amount.');

                return [
                    'product_id' => $item['product_id'],
                    'quantity' => $quantity,
                    'unit_price' => $unitPrice,
                    'discount_amount' => $discount,
                    'tax_amount' => $tax,
                    'line_total' => round(($quantity * $unitPrice) - $discount + $tax, 2),
                ];
            });
            $subtotal = round($lines->sum(fn (array $line) => $line['quantity'] * $line['unit_price']), 2);
            $discount = round($lines->sum('discount_amount'), 2);
            $tax = round($lines->sum('tax_amount'), 2);

            $purchase = Purchase::query()->create([
                'company_id' => $company,
                'branch_id' => $data['branch_id'],
                'warehouse_id' => $data['warehouse_id'],
                'supplier_id' => $data['supplier_id'],
                'purchase_no' => $data['purchase_no'],
                'purchase_date' => $data['purchase_date'],
                'subtotal' => $subtotal,
                'discount_amount' => $discount,
                'tax_amount' => $tax,
                'total_amount' => round($subtotal - $discount + $tax, 2),
                'status' => 'draft',
                'created_by' => $request->user()->getKey(),
            ]);
            $purchase->items()->createMany($lines->all());

            return $purchase->load([
                'branch:id,company_id,code,name',
                'warehouse:id,company_id,code,name',
                'supplier:id,company_id,code,name',
                'items.product:id,company_id,sku,name,unit',
            ]);
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Purchase successfully created.',
            'data' => $purchase,
        ], 201);
    }

    private function assertCompanyRelation(string $table, int $id, int $company): void
    {
        abort_unless(
            DB::table($table)->where('id', $id)->where('company_id', $company)->exists(),
            422,
            'A selected record does not belong to this company.'
        );
    }

    private function attachReceivedQuantities(Purchase $purchase): void
    {
        $received = DB::table('purchasing.goods_receipt_items as receipt_items')
            ->join('purchasing.goods_receipts as receipts', 'receipts.id', '=', 'receipt_items.goods_receipt_id')
            ->whereIn('receipt_items.purchase_item_id', $purchase->items->pluck('id'))
            ->where('receipts.status', 'posted')
            ->groupBy('receipt_items.purchase_item_id')
            ->selectRaw('receipt_items.purchase_item_id, SUM(receipt_items.quantity_received) as received_quantity')
            ->pluck('received_quantity', 'purchase_item_id');

        foreach ($purchase->items as $item) {
            $item->setAttribute('received_quantity', (string) ($received[$item->id] ?? 0));
        }
    }
}
