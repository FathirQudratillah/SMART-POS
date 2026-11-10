<?php

namespace App\Services\Finance;

use App\Models\Finance\CashMovement;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class CashMovementService
{
    /**
     * @param array{
     *     branch_id: int,
     *     cashier_shift_id: int|null,
     *     movement_type: string,
     *     reference_type: string,
     *     reference_id?: int|null,
     *     amount: int|float|string,
     *     description: string
     * } $data
     */
    public function create(int $companyId, int $userId, array $data): CashMovement
    {
        $branchExists = DB::table('core.branches')
            ->where('id', $data['branch_id'])
            ->where('company_id', $companyId)
            ->exists();

        if (! $branchExists) {
            throw ValidationException::withMessages([
                'branch_id' => 'The selected branch does not belong to this company.',
            ]);
        }

        return DB::transaction(function () use ($companyId, $userId, $data): CashMovement {
            if ($data['cashier_shift_id'] !== null) {
                $shift = DB::table('sales.cashier_shifts')
                    ->where('id', $data['cashier_shift_id'])
                    ->where('company_id', $companyId)
                    ->where('branch_id', $data['branch_id'])
                    ->where('user_id', $userId)
                    ->where('status', 'open')
                    ->lockForUpdate()
                    ->first();

                if (! $shift) {
                    throw ValidationException::withMessages([
                        'cashier_shift_id' => 'The selected shift is not an open shift for this branch.',
                    ]);
                }

                if ($data['movement_type'] === 'cash_out') {
                    $totals = DB::table('finance.cash_movements')
                        ->where('cashier_shift_id', $shift->id)
                        ->selectRaw("COALESCE(SUM(CASE WHEN movement_type = 'cash_in' THEN amount ELSE 0 END), 0) as cash_in")
                        ->selectRaw("COALESCE(SUM(CASE WHEN movement_type = 'cash_out' THEN amount ELSE 0 END), 0) as cash_out")
                        ->first();
                    $balanceCents = $this->toCents((string) $shift->opening_cash)
                        + $this->toCents((string) $totals->cash_in)
                        - $this->toCents((string) $totals->cash_out);
                    if ($this->toCents((string) $data['amount']) > $balanceCents) {
                        throw ValidationException::withMessages([
                            'amount' => 'Cash out cannot exceed the current expected cash balance.',
                        ]);
                    }
                }
            }

            return CashMovement::query()->create($data + [
                'company_id' => $companyId,
                'created_by' => $userId,
                'created_at' => now(),
            ]);
        });
    }

    private function toCents(string $amount): int
    {
        [$whole, $fraction] = array_pad(explode('.', $amount, 2), 2, '');

        return ((int) $whole * 100) + (int) str_pad(substr($fraction, 0, 2), 2, '0');
    }
}
