import { useState } from "react";
import { Plus, Trash } from "lucide-react";
import type { RowSelectionState } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import AppTable from "@/components/layout/AppTable";
import { useAuth } from "@/context/auth/AuthContext";
import { useAlert } from "@/context/AlertContext";
import { useWarehouses } from "../hooks/useWarehouses";
import { useDeleteWarehouses } from "../hooks/useDeleteWarehouses";
import type { Warehouse } from "../types";
import { WarehousesColumn } from "../columns/WarehousesColumn";
import AddWarehouseModal from "./AddWarehouseModal";

export default function WarehousesTable() {
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(5);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const { company } = useAuth();
  const { showConfirm, showMessage } = useAlert();
  const { data, isError, error } = useWarehouses({ companyId: company?.id ?? null, page, per_page, search });
  const deleteMutation = useDeleteWarehouses();
  const selectedIds = Object.keys(rowSelection).filter((id) => rowSelection[id]).map(Number);

  const handleDelete = async () => {
    if (!selectedIds.length) return;
    const confirmed = await showConfirm({ title: "Delete warehouses?", description: `Are you sure you want to delete ${selectedIds.length} selected warehouses?`, confirmText: "Yes, delete", cancelText: "Cancel" });
    if (!confirmed) return;
    deleteMutation.mutate({ ids: selectedIds }, {
      onSuccess: (message) => { setRowSelection({}); showMessage({ variant: "success", title: "Success", description: message }); },
      onError: (deleteError) => showMessage({ variant: "error", title: "Error", description: deleteError.message }),
    });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="space-y-1"><h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Warehouses</h2><p className="text-sm text-slate-500 dark:text-slate-400">Manage your company warehouses and locations.</p></div>
        <div className="flex gap-2">{selectedIds.length > 0 && <Button className="bg-red-700 text-white hover:bg-red-800" onClick={handleDelete} disabled={deleteMutation.isPending}><Trash className="size-4" /></Button>}<Button variant="outline" className="bg-blue-100 text-blue-700 hover:bg-blue-200" onClick={() => setOpen(true)}><Plus className="mr-2 size-4" />Add Warehouse</Button></div>
      </div>
      {isError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error.message}</p>}
      <AppTable<Warehouse> columns={WarehousesColumn} data={data?.data} page={page} setPage={setPage} per_page={per_page} setPerPage={setPerPage} search={search} setSearch={setSearch} rowSelection={rowSelection} setRowSelection={setRowSelection} detailPath="/warehouses" />
      <AddWarehouseModal open={open} onOpenChange={setOpen} />
    </div>
  );
}
