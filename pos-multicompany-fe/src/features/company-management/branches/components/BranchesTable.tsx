import { useMemo, useState } from "react";
import { Plus, Trash } from "lucide-react";
import type { ColumnDef, RowSelectionState } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import AppTable from "@/components/layout/AppTable";
import { useBranches } from "../hooks/useBranches";
import type { Branch } from "../types";
import { BranchesColumns } from "../columns/BranchesColumn";
import { useAuth } from "@/context/auth/AuthContext";
import { useAlert } from "@/context/AlertContext";
import { useDeleteBranches } from "../hooks/useDeleteBranches";
import BranchModal from "./BranchModal";

export default function BranchesTable() {
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const { company } = useAuth();
  const { showConfirm, showMessage } = useAlert();
  const query = useBranches({
    companyId: company?.id ?? null,
    page,
    per_page,
    search,
  });
  const deleteMutation = useDeleteBranches();
  const selectedIds = Object.keys(rowSelection)
    .filter((id) => rowSelection[id])
    .map(Number);
  const columns = useMemo<ColumnDef<Branch, unknown>[]>(
    () => [
      ...BranchesColumns,
      {
        id: "edit",
        header: "Edit",
        enableSorting: false,
        cell: ({ row }) => (
          <Button
            type="button"
            variant="outline"
            className="bg-blue-100 text-blue-700 hover:bg-blue-200"
            size="sm"
            onClick={() => {
              setSelectedBranch(row.original);
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
      title: "Delete branches?",
      description: `Are you sure you want to delete ${selectedIds.length} selected branches?`,
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
  const openAdd = () => {
    setSelectedBranch(null);
    setOpen(true);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Branches
          </h2>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage and organize your company branches.
          </p>
        </div>

        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              aria-label="Delete selected branches"
            >
              <Trash className="size-4" />
            </Button>
          )}
          <Button
            variant="outline"
            className="bg-blue-100 text-blue-700 hover:bg-blue-200"
            onClick={openAdd}
          >
            <Plus className="mr-2 size-4" /> Add Branch
          </Button>
        </div>
      </div>

      {query.isError && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          Unable to load branches: {query.error.message}
        </p>
      )}
      <AppTable<Branch>
        columns={columns}
        data={query.data?.data}
        page={page}
        setPage={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        search={search}
        setSearch={setSearch}
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
        detailPath="/branches"
      />
      <BranchModal open={open} onOpenChange={setOpen} branch={selectedBranch} />
    </div>
  );
}
