import { useState } from "react";
import AppTable from "@/components/layout/AppTable";
import { useAuth } from "@/context/auth/AuthContext";
import { useStockOverview } from "../hooks/useStockOverview";
import type { StockOverviewItem } from "../types";
import { StockOverviewColumn } from "../columns/StockOverviewColumn";
import { Button } from "@/components/ui/button";
import { LoaderCircle, RefreshCw } from "lucide-react";

export default function StockOverviewTable() {
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(5);
  const [search, setSearch] = useState("");

  const { company, branch } = useAuth();
  const { data, isLoading, isError, error, refetch } = useStockOverview({
    companyId: company?.id ?? null,
    branchId: branch?.id ?? null,
    page,
    per_page,
    search,
  });

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          Stock Overview
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          View product stock levels across your warehouses.
        </p>
      </div>

      {isLoading && (
        <div
          role="status"
          className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300"
        >
          <LoaderCircle className="size-4 animate-spin" />
          Loading stock overview...
        </div>
      )}

      {isError && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
        >
          <span>
            Unable to load stock overview
            {error instanceof Error ? `: ${error.message}` : "."}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void refetch()}
            className="border-red-300 text-red-700 hover:bg-red-100 dark:border-red-800 dark:text-red-300 dark:hover:bg-red-950"
          >
            <RefreshCw className="mr-2 size-4" />
            Retry
          </Button>
        </div>
      )}

      <AppTable<StockOverviewItem>
        columns={StockOverviewColumn}
        data={data?.data}
        page={page}
        setPage={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        search={search}
        setSearch={setSearch}
        enableSelection={false}
        detailPath={null}
        itemLabel="stock records"
      />
    </div>
  );
}
