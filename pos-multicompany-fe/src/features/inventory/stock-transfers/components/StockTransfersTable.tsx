import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppTable from "@/components/layout/AppTable";
import { useAuth } from "@/context/auth/AuthContext";
import { useStockTransfers } from "../hooks/useStockTransfers";
import type { StockTransfer } from "../types";
import { StockTransfersColumn } from "../columns/StockTransfersColumn";
import CreateStockTransferDialog from "./CreateStockTransferDialog";

export default function StockTransfersTable() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const { company, branch } = useAuth();
  const { data, isLoading, isError, error } = useStockTransfers({
    companyId: company?.id ?? null,
    branchId: branch?.id ?? null,
    page,
    per_page: perPage,
    search,
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Stock Transfers</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Move stock between company warehouses.</p>
        </div>
        <Button variant="outline" className="bg-blue-100 text-blue-700 hover:bg-blue-200" onClick={() => setCreateOpen(true)}>
          <Plus className="size-4" /> Create transfer
        </Button>
      </div>

      {isLoading && <p role="status" className="text-sm text-slate-500">Loading stock transfers...</p>}
      {isError && (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          Unable to load stock transfers: {error instanceof Error ? error.message : "Please try again."}
        </p>
      )}

      <AppTable<StockTransfer>
        columns={StockTransfersColumn}
        data={data?.data}
        page={page}
        setPage={setPage}
        per_page={perPage}
        setPerPage={setPerPage}
        search={search}
        setSearch={setSearch}
        detailPath="/stock-transfers"
        enableSelection={false}
        itemLabel="transfers"
      />
      <CreateStockTransferDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  );
}
