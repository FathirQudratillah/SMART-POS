<?php

namespace App\Http\Controllers\Api\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Inventory\InventoryStock;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InventoryStockController extends Controller
{
    protected array $searchable = [
        'product' => ['sku', 'name'],
        'warehouse' => ['name'],
    ];

    public function index(Request $request, int $company, ?int $branch = null, ?int $warehouse = null): JsonResponse
    {
        $this->authorizeCompany($request, $company);

        $search = trim($request->input('search', ''));

        $stocks = InventoryStock::query()
            ->where('company_id', $company)
            ->with([
                'warehouse:id,company_id,branch_id,code,name',
                'product:id,company_id,sku,name,unit,selling_price,is_active,deleted_at,image_path',
            ])
            ->when($branch !== null, function ($query) use ($branch) {
                $query->whereHas('warehouse', function ($warehouseQuery) use ($branch) {
                    $warehouseQuery->where('branch_id', $branch);
                });
            })
            ->when($warehouse !== null, function ($query) use ($warehouse) {
                $query->where('warehouse_id', $warehouse);
            })
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    foreach ($this->searchable as $relation => $columns) {
                        $query->orWhereHas($relation, function ($relationQuery) use (
                            $columns,
                            $search
                        ) {
                            $relationQuery->where(function ($columnQuery) use (
                                $columns,
                                $search
                            ) {
                                foreach ($columns as $column) {
                                    $columnQuery->orWhere(
                                        $column,
                                        'ILIKE',
                                        "%{$search}%"
                                    );
                                }
                            });
                        });
                    }
                });
            })
            ->orderBy('warehouse_id')
            ->orderBy('product_id')
            ->paginate(max(1, min((int) $request->integer('per_page', 25), 100)));

        return response()->json([
            'status' => 'success',
            'message' => 'Inventory stock list retrieved successfully.',
            'data' => $stocks,
        ]);
    }
}
