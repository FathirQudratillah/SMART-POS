import { useState } from "react";
import AppTable from "@/components/layout/AppTable";
import { useAuth } from "@/context/auth/AuthContext";
import { CashierShiftsColumn } from "../columns/CashierShiftsColumn";
import { useCashierShifts } from "../hooks/useCashierShifts";
import type { CashierShift } from "../types";

export default function CashierShiftsPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "open" | "closed">("all");
  const { company, branch } = useAuth();
  const params =
    company && branch
      ? {
          companyId: company.id,
          branchId: branch.id,
          page,
          per_page: perPage,
          search,
          status,
        }
      : null;
  const query = useCashierShifts(params);

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Cashier Shifts
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          View all cashier shifts and cash balances for{" "}
          {branch?.name ?? "your assigned branch"}.
        </p>
      </div>
      {branch === null && (
        <p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          Your account must be assigned to a branch to view cashier shifts.
        </p>
      )}
      {branch && (
        <div className="flex items-center gap-3">
          <label htmlFor="cashier-shift-status" className="text-sm font-medium">
            Status
          </label>
          <select
            id="cashier-shift-status"
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as "all" | "open" | "closed");
              setPage(1);
            }}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
          >
            <option value="all">All shifts</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      )}
      {query.isLoading && (
        <p role="status" className="text-sm text-slate-500">
          Loading cashier shifts...
        </p>
      )}
      {query.isError && (
        <p
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
        >
          Unable to load cashier shifts: {query.error.message}
        </p>
      )}
      <AppTable<CashierShift>
        columns={CashierShiftsColumn}
        data={query.data?.data}
        page={page}
        setPage={setPage}
        per_page={perPage}
        setPerPage={setPerPage}
        search={search}
        setSearch={setSearch}
        detailPath={null}
        enableSelection={false}
        itemLabel="cashier shifts"
      />
    </div>
  );
}
