import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppTable from "@/components/layout/AppTable";
import { useAuth } from "@/context/auth/AuthContext";
import { useGoodsReceipts } from "../hooks/useGoodsReceipts";
import type { GoodsReceipt } from "../types";
import { GoodsReceiptsColumn } from "../columns/GoodsReceiptsColumn";
import CreateGoodsReceiptDialog from "./CreateGoodsReceiptDialog";

export default function GoodsReceiptsTable() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const { company, branch } = useAuth();
  const query = useGoodsReceipts({
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
            Goods Receipts
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Receive ordered products into your warehouse.
          </p>
        </div>
        <Button
          variant="outline"
          className="bg-blue-100 text-blue-700 hover:bg-blue-200"
          onClick={() => setOpen(true)}
        >
          <Plus className="size-4" />
          Create goods receipt
        </Button>
      </div>
      {query.isLoading && (
        <p role="status" className="text-sm text-slate-500">
          Loading goods receipts...
        </p>
      )}
      {query.isError && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          Unable to load goods receipts: {query.error.message}
        </p>
      )}
      <AppTable<GoodsReceipt>
        columns={GoodsReceiptsColumn}
        data={query.data?.data}
        page={page}
        setPage={setPage}
        per_page={perPage}
        setPerPage={setPerPage}
        search={search}
        setSearch={setSearch}
        detailPath="/good-receipts"
        enableSelection={false}
        itemLabel="goods receipts"
      />
      <CreateGoodsReceiptDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
