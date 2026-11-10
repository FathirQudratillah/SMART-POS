import { useMemo, useState } from "react";
import { Plus, Trash } from "lucide-react";
import type { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import AppTable from "@/components/layout/AppTable";
import { useAlert } from "@/context/AlertContext";
import { useAuth } from "@/context/auth/AuthContext";
import { useDeletePaymentMethods } from "../hooks/useDeletePaymentMethods";
import { usePaymentMethods } from "../hooks/usePaymentMethods";
import type { PaymentMethod } from "../types";
import PaymentMethodModal from "./PaymentMethodModal";

export default function PaymentMethodsTable() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<PaymentMethod | null>(
    null,
  );
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const { company } = useAuth();
  const { showConfirm, showMessage } = useAlert();
  const query = usePaymentMethods({
    companyId: company?.id ?? null,
    page,
    per_page: perPage,
    search,
  });
  const deleteMutation = useDeletePaymentMethods();
  const selectedIds = Object.keys(rowSelection)
    .filter((id) => rowSelection[id])
    .map(Number);
  const columns = useMemo<ColumnDef<PaymentMethod, unknown>[]>(
    () => [
      {
        accessorKey: "code",
        header: "Code",
        cell: ({ row }) => (
          <span className="font-mono text-xs text-slate-500">
            {row.original.code}
          </span>
        ),
      },
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => (
          <span className="font-medium">{row.original.name}</span>
        ),
      },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ row }) => (
          <span className="capitalize">{row.original.type.replaceAll("_", " ")}</span>
        ),
      },
      {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ row }) => (
          <span
            className={
              row.original.is_active ? "text-emerald-700" : "text-slate-500"
            }
          >
            {row.original.is_active ? "Active" : "Inactive"}
          </span>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        enableSorting: false,
        cell: ({ row }) => (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedRecord(row.original);
              setOpen(true);
            }}
          >
            Edit
          </Button>
        ),
      },
    ],
    [],
  );

  const handleDelete = async () => {
    if (!selectedIds.length) return;
    const confirmed = await showConfirm({
      title: "Delete payment methods?",
      description: `Are you sure you want to delete ${selectedIds.length} selected payment methods?`,
      confirmText: "Yes, delete",
      cancelText: "Cancel",
    });
    if (!confirmed) return;
    deleteMutation.mutate(
      { ids: selectedIds },
      {
        onSuccess: (message) => {
          setRowSelection({});
          showMessage({ variant: "success", title: "Success", description: message });
        },
        onError: (error) =>
          showMessage({ variant: "error", title: "Error", description: error.message }),
      },
    );
  };

  const openAddModal = () => {
    setSelectedRecord(null);
    setOpen(true);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Payment Methods
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage payment methods available when completing sales.
          </p>
        </div>
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <Button
              className="bg-red-700 text-white hover:bg-red-800"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              aria-label="Delete selected payment methods"
            >
              <Trash className="size-4" />
            </Button>
          )}
          <Button
            variant="outline"
            className="bg-blue-100 text-blue-700 hover:bg-blue-200"
            onClick={openAddModal}
          >
            <Plus className="mr-2 size-4" />
            Add Payment Method
          </Button>
        </div>
      </div>
      {query.isError && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          Unable to load payment methods: {query.error.message}
        </p>
      )}
      <AppTable<PaymentMethod>
        columns={columns}
        data={query.data?.data}
        page={page}
        setPage={setPage}
        per_page={perPage}
        setPerPage={setPerPage}
        search={search}
        setSearch={setSearch}
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
        detailPath={null}
        itemLabel="payment methods"
      />
      <PaymentMethodModal
        open={open}
        onOpenChange={setOpen}
        record={selectedRecord}
      />
    </div>
  );
}
