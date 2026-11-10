<?php

namespace App\Http\Controllers\Api\Inventory;

use App\Http\Controllers\Controller;
use App\Models\Inventory\StockMovement;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StockMovementController extends Controller
{
    public function index(Request $request, int $company): JsonResponse
    {
        $this->authorizeCompany($request, $company);
        $filters = $request->validate([
            'branch_id' => ['required', 'integer', 'min:1'],
            'movement_type' => ['nullable', 'string', 'max:30'],
            'search' => ['nullable', 'string', 'max:255'],
            'page' => ['nullable', 'integer', 'min:1'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);
        $branchId = (int) $filters['branch_id'];
        abort_unless(
            DB::table('core.branches')
                ->where('id', $branchId)
                ->where('company_id', $company)
                ->exists(),
            404,
            'The selected branch was not found.'
        );

        $search = trim($filters['search'] ?? '');
        $movements = StockMovement::query()
            ->where('company_id', $company)
            ->with([
                'product:id,company_id,sku,name,unit',
                'warehouse:id,company_id,branch_id,code,name',
                'creator:id,name',
            ])
            ->whereHas('warehouse', fn (Builder $warehouse) => $warehouse->where('branch_id', $branchId))
            ->when(
                isset($filters['movement_type']),
                fn (Builder $query) => $query->where('movement_type', $filters['movement_type'])
            )
            ->when($search !== '', function (Builder $query) use ($search) {
                $query->where(function (Builder $query) use ($search) {
                    $query->where('movement_type', 'ILIKE', "%{$search}%")
                        ->orWhere('reference_type', 'ILIKE', "%{$search}%")
                        ->orWhere('notes', 'ILIKE', "%{$search}%")
                        ->orWhereHas('product', function (Builder $product) use ($search) {
                            $product->where('sku', 'ILIKE', "%{$search}%")
                                ->orWhere('name', 'ILIKE', "%{$search}%");
                        })
                        ->orWhereHas('warehouse', function (Builder $warehouse) use ($search) {
                            $warehouse->where('code', 'ILIKE', "%{$search}%")
                                ->orWhere('name', 'ILIKE', "%{$search}%");
                        });

                    if (ctype_digit($search)) {
                        $query->orWhere('reference_id', (int) $search);
                    }
                });
            })
            ->latest('created_at')
            ->latest('id')
            ->paginate(max(1, min((int) ($filters['per_page'] ?? 25), 100)));

        return response()->json([
            'status' => 'success',
            'message' => 'Stock movements retrieved successfully.',
            'data' => $movements,
        ]);
    }
}
