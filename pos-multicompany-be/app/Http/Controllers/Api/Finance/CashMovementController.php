<?php

namespace App\Http\Controllers\Api\Finance;

use App\Http\Controllers\Controller;
use App\Models\Finance\CashMovement;
use App\Services\Finance\CashMovementService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CashMovementController extends Controller
{
    public function __construct(private readonly CashMovementService $cashMovementService) {}

    public function index(Request $request, int $company): JsonResponse
    {
        $this->authorizeCompany($request, $company);
        $filters = $request->validate([
            'branch_id' => ['nullable', 'integer', 'schema_exists:core,branches,id'],
            'movement_type' => ['nullable', 'in:cash_in,cash_out'],
            'search' => ['nullable', 'string', 'max:150'],
        ]);
        $search = trim($filters['search'] ?? '');

        $movements = CashMovement::query()
            ->where('company_id', $company)
            ->with([
                'branch:id,company_id,code,name',
                'cashierShift:id,company_id,branch_id,user_id,opened_at,status',
                'creator:id,name',
            ])
            ->when(isset($filters['branch_id']), fn ($query) => $query->where('branch_id', $filters['branch_id']))
            ->when(isset($filters['movement_type']), fn ($query) => $query->where('movement_type', $filters['movement_type']))
            ->when($search !== '', function ($query) use ($search) {
                $query->where(function ($query) use ($search) {
                    $query->where('description', 'ILIKE', "%{$search}%")
                        ->orWhere('reference_type', 'ILIKE', "%{$search}%")
                        ->orWhereRaw('CAST(reference_id AS TEXT) ILIKE ?', ["%{$search}%"]);
                });
            })
            ->latest('created_at')
            ->paginate(max(1, min((int) $request->integer('per_page', 25), 100)));

        return response()->json([
            'status' => 'success',
            'message' => 'Cash movement list retrieved successfully.',
            'data' => $movements,
        ]);
    }

    public function store(Request $request, int $company): JsonResponse
    {
        $this->authorizeCompany($request, $company);
        $data = $request->validate([
            'branch_id' => ['required', 'integer', 'schema_exists:core,branches,id'],
            'cashier_shift_id' => ['nullable', 'integer', 'schema_exists:sales,cashier_shifts,id'],
            'movement_type' => ['required', 'in:cash_in,cash_out'],
            'reference_type' => ['required', 'in:manual,expense,adjustment'],
            'reference_id' => ['nullable', 'integer', 'min:1'],
            'amount' => ['required', 'numeric', 'decimal:0,2', 'gt:0', 'max:9999999999999999.99'],
            'description' => ['required', 'string', 'max:1000'],
        ]);
        $data['cashier_shift_id'] = $data['cashier_shift_id'] ?? null;

        $record = $this->cashMovementService->create(
            $company,
            (int) $request->user()->getKey(),
            $data
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Cash movement successfully created.',
            'data' => $record,
        ], 201);
    }
}
