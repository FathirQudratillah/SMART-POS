import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppTable from "@/components/layout/AppTable";
import { useAuth } from "@/context/auth/AuthContext";
import { useStockOpnames } from "../hooks/useStockOpnames";
import { StockOpnamesColumn } from "../columns/StockOpnamesColumn";
import type { StockOpname } from "../types";
import CreateStockOpnameDialog from "./CreateStockOpnameDialog";

export default function StockOpnamesTable() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const { company } = useAuth();
  const { data, isLoading, isError, error } = useStockOpnames({
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
            Stock Opname
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Count physical stock and reconcile warehouse quantities.
          </p>
        </div>
        <Button variant="outline" className="bg-blue-100 text-blue-700 hover:bg-blue-200" onClick={() => setOpen(true)}>
          <Plus className="size-4" />
          Start stock opname
        </Button>
      </div>
      {isLoading && (
        <p role="status" className="text-sm text-slate-500">
          Loading stock opnames...
        </p>
      )}
      {isError && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          Unable to load stock opnames:{" "}
          {error instanceof Error ? error.message : "Please try again."}
        </p>
      )}
      <AppTable<StockOpname>
        columns={StockOpnamesColumn}
        data={data?.data}
        page={page}
        setPage={setPage}
        per_page={perPage}
        setPerPage={setPerPage}
        search={search}
        setSearch={setSearch}
        detailPath="/stock-opname"
        enableSelection={false}
        itemLabel="opnames"
      />
      <CreateStockOpnameDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
