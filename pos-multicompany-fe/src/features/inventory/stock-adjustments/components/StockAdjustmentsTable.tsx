import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppTable from "@/components/layout/AppTable";
import { useAuth } from "@/context/auth/AuthContext";
import { useStockAdjustments } from "../hooks/useStockAdjustments";
import { StockAdjustmentsColumn } from "../columns/StockAdjustmentsColumn";
import type { StockAdjustment } from "../types";
import CreateStockAdjustmentDialog from "./CreateStockAdjustmentDialog";

export default function StockAdjustmentsTable() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const { company } = useAuth();
  const { data, isLoading, isError, error } = useStockAdjustments({
    companyId: company?.id ?? null,
    page,
    per_page: perPage,
    search,
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Stock Adjustments
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Record increases or decreases for warehouse stock.
          </p>
        </div>
        <Button variant="outline" className="bg-blue-100 text-blue-700 hover:bg-blue-200" onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          Create adjustment
        </Button>
      </div>
      {isLoading && (
        <p role="status" className="text-sm text-slate-500">
          Loading adjustments...
        </p>
      )}
      {isError && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          Unable to load adjustments:{" "}
          {error instanceof Error ? error.message : "Please try again."}
        </p>
      )}
      <AppTable<StockAdjustment>
        columns={StockAdjustmentsColumn}
        data={data?.data}
        page={page}
        setPage={setPage}
        per_page={perPage}
        setPerPage={setPerPage}
        search={search}
        setSearch={setSearch}
        detailPath="/stock-adjustments"
        enableSelection={false}
        itemLabel="adjustments"
      />
      <CreateStockAdjustmentDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
