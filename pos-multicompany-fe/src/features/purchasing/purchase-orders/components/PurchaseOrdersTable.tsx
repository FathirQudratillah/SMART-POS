import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppTable from "@/components/layout/AppTable";
import { useAuth } from "@/context/auth/AuthContext";
import { usePurchaseOrders } from "../hooks/usePurchaseOrders";
import type { PurchaseOrder } from "../types";
import { PurchaseOrdersColumn } from "../columns/PurchaseOrdersColumn";
import CreatePurchaseOrderDialog from "./CreatePurchaseOrderDialog";

export default function PurchaseOrdersTable() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const { company, branch } = useAuth();
  const query = usePurchaseOrders({
    companyId: company?.id ?? null,
    branchId: branch?.id ?? null,
    page,
    per_page: perPage,
    search,
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Purchase Orders
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Create and track orders from your suppliers.
          </p>
        </div>
        <Button
          variant="outline"
          className="bg-blue-100 text-blue-700 hover:bg-blue-200"
          onClick={() => setOpen(true)}
        >
          <Plus className="size-4" />
          Create purchase order
        </Button>
      </div>
      {query.isLoading && (
        <p role="status" className="text-sm text-slate-500">
          Loading purchase orders...
        </p>
      )}
      {query.isError && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          Unable to load purchase orders: {query.error.message}
        </p>
      )}
      <AppTable<PurchaseOrder>
        columns={PurchaseOrdersColumn}
        data={query.data?.data}
        page={page}
        setPage={setPage}
        per_page={perPage}
        setPerPage={setPerPage}
        search={search}
        setSearch={setSearch}
        detailPath="/purchase-orders"
        enableSelection={false}
        itemLabel="purchase orders"
      />
      <CreatePurchaseOrderDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
