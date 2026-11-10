import { useState } from "react";
import AppTable from "@/components/layout/AppTable";
import { useAuth } from "@/context/auth/AuthContext";
import { StockMovementsColumn } from "../columns/StockMovementsColumn";
import { useStockMovements } from "../hooks/useStockMovements";
import type { StockMovement } from "../types";

export default function StockMovementsPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [movementType, setMovementType] =
    useState<"all" | StockMovement["movement_type"]>("all");
  const { company, branch } = useAuth();
  const params =
    company && branch
      ? {
          companyId: company.id,
          branchId: branch.id,
          page,
          per_page: perPage,
          search,
          movementType,
        }
      : null;
  const query = useStockMovements(params);

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Stock Movements
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Review stock movements recorded for {branch?.name ?? "your assigned branch"}.
        </p>
      </div>
      {branch === null && (
        <p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          Your account must be assigned to a branch to view stock movements.
        </p>
      )}
      {branch && (
        <div className="flex items-center gap-3">
          <label htmlFor="stock-movement-type" className="text-sm font-medium">
            Movement type
          </label>
          <select
            id="stock-movement-type"
            value={movementType}
            onChange={(event) => {
              setMovementType(
                event.target.value as "all" | StockMovement["movement_type"],
              );
              setPage(1);
            }}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
          >
            <option value="all">All movements</option>
            <option value="IN">Stock In</option>
            <option value="OUT">Stock Out</option>
            <option value="sale">Sale</option>
            <option value="purchase_receipt">Purchase Receipt</option>
            <option value="transfer_in">Transfer In</option>
            <option value="transfer_out">Transfer Out</option>
            <option value="adjustment_in">Adjustment In</option>
            <option value="adjustment_out">Adjustment Out</option>
            <option value="opname_in">Opname In</option>
            <option value="opname_out">Opname Out</option>
          </select>
        </div>
      )}
      {query.isLoading && (
        <p role="status" className="text-sm text-slate-500">
          Loading stock movements...
        </p>
      )}
      {query.isError && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          Unable to load stock movements: {query.error.message}
        </p>
      )}
      <AppTable<StockMovement>
        columns={StockMovementsColumn}
        data={query.data?.data}
        page={page}
        setPage={setPage}
        per_page={perPage}
        setPerPage={setPerPage}
        search={search}
        setSearch={setSearch}
        detailPath={null}
        enableSelection={false}
        itemLabel="stock movements"
      />
    </div>
  );
}
