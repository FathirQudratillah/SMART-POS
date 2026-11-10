<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sales\Sale;
use Carbon\CarbonImmutable;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function __invoke(Request $request, int $company): JsonResponse
    {
        $this->authorizeCompany($request, $company);
        $filters = $request->validate([
            'branch_id' => ['required', 'integer', 'min:1'],
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

        $today = CarbonImmutable::now()->startOfDay();
        $monthStart = $today->startOfMonth();
        $sales = Sale::query()
            ->where('company_id', $company)
            ->where('branch_id', $branchId)
            ->where('status', 'completed');
        $todaySales = (clone $sales)
            ->whereBetween('sale_date', [$today, $today->endOfDay()])
            ->selectRaw('COUNT(*) as count, COALESCE(SUM(total_amount), 0) as revenue')
            ->first();
        $monthRevenue = (clone $sales)
            ->whereBetween('sale_date', [$monthStart, $today->endOfDay()])
            ->sum('total_amount');

        $dailySales = (clone $sales)
            ->whereBetween('sale_date', [$today->subDays(6), $today->endOfDay()])
            ->selectRaw('DATE(sale_date) as sale_day, COUNT(*) as count, COALESCE(SUM(total_amount), 0) as revenue')
            ->groupBy(DB::raw('DATE(sale_date)'))
            ->orderBy('sale_day')
            ->get()
            ->keyBy(fn ($row) => (string) $row->sale_day);

        $salesTrend = collect(range(6, 0))
            ->map(function (int $daysAgo) use ($today, $dailySales): array {
                $date = $today->subDays($daysAgo);
                $dayData = $dailySales->get($date->toDateString());

                return [
                    'date' => $date->toDateString(),
                    'label' => $date->format('D'),
                    'count' => (int) ($dayData->count ?? 0),
                    'revenue' => (float) ($dayData->revenue ?? 0),
                ];
            })
            ->values();

        $branchStocks = DB::table('inventory.inventory_stocks as stocks')
            ->join('inventory.warehouses as warehouses', 'warehouses.id', '=', 'stocks.warehouse_id')
            ->where('stocks.company_id', $company)
            ->where('warehouses.branch_id', $branchId)
            ->select('stocks.product_id')
            ->selectRaw('SUM(stocks.quantity) as quantity')
            ->groupBy('stocks.product_id');
        $stockRows = DB::table('catalog.products as products')
            ->leftJoinSub(
                $branchStocks,
                'branch_stocks',
                fn ($join) => $join->on('branch_stocks.product_id', '=', 'products.id')
            )
            ->where('products.company_id', $company)
            ->where('products.is_active', true)
            ->whereNull('products.deleted_at')
            ->get([
                'products.id as product_id',
                DB::raw('COALESCE(branch_stocks.quantity, 0) as quantity'),
            ]);

        $openShifts = DB::table('sales.cashier_shifts')
            ->where('company_id', $company)
            ->where('branch_id', $branchId)
            ->where('status', 'open')
            ->count();

        $recentSales = (clone $sales)
            ->with([
                'customer:id,company_id,code,name',
                'creator:id,name',
            ])
            ->latest('sale_date')
            ->latest('id')
            ->limit(6)
            ->get([
                'id',
                'invoice_no',
                'sale_date',
                'total_amount',
                'status',
                'customer_id',
                'created_by',
            ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Dashboard summary retrieved successfully.',
            'data' => [
                'sales_today' => [
                    'count' => (int) ($todaySales->count ?? 0),
                    'revenue' => (float) ($todaySales->revenue ?? 0),
                ],
                'sales_month' => [
                    'revenue' => (float) $monthRevenue,
                ],
                'stock' => [
                    'product_count' => $stockRows->where('quantity', '>', 0)->count(),
                    'total_quantity' => (float) $stockRows->sum('quantity'),
                    'out_of_stock_count' => $stockRows->where('quantity', '<=', 0)->count(),
                ],
                'open_shift_count' => $openShifts,
                'sales_trend' => $salesTrend,
                'recent_sales' => $recentSales,
            ],
        ]);
    }
}
