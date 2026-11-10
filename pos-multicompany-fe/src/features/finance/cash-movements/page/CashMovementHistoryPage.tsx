import { useState } from "react";
import AppTable from "@/components/layout/AppTable";
import { useAuth } from "@/context/auth/AuthContext";
import { CashMovementsColumn } from "../columns/CashMovementsColumn";
import { useCashMovements } from "../hooks/useCashMovements";
import type { CashMovement } from "../types";

export default function CashMovementHistoryPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [movementType, setMovementType] = useState<"all" | "cash_in" | "cash_out">("all");
  const { company, branch } = useAuth();
  const params = company
    ? { companyId: company.id, branchId: branch?.id ?? null, page, per_page: perPage, search, movementType }
    : null;
  const query = useCashMovements(params);

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Cash Movement History</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Review cash-in and cash-out movements recorded manually or through POS sales.</p>
      </div>
      <div className="flex items-center gap-3">
        <label htmlFor="cash-movement-type" className="text-sm font-medium">Movement type</label>
        <select
          id="cash-movement-type"
          value={movementType}
          onChange={(event) => {
            setMovementType(event.target.value as "all" | "cash_in" | "cash_out");
            setPage(1);
          }}
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
        >
          <option value="all">All movements</option>
          <option value="cash_in">Cash In</option>
          <option value="cash_out">Cash Out</option>
        </select>
      </div>
      {query.isLoading && <p role="status" className="text-sm text-slate-500">Loading cash movement history...</p>}
      {query.isError && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Unable to load cash movement history: {query.error.message}
        </p>
      )}
      <AppTable<CashMovement>
        columns={CashMovementsColumn}
        data={query.data?.data}
        page={page}
        setPage={setPage}
        per_page={perPage}
        setPerPage={setPerPage}
        search={search}
        setSearch={setSearch}
        detailPath={null}
        enableSelection={false}
        itemLabel="cash movements"
      />
    </div>
  );
}
