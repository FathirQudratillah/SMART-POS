import { useState } from "react";
import { Plus, Trash } from "lucide-react";
import type { RowSelectionState } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import AppTable from "@/components/layout/AppTable";
import { useAlert } from "@/context/AlertContext";
import { useAuth } from "@/context/auth/AuthContext";
import { useCompanyUsers } from "../hooks/useCompanyUsers";
import { useDeleteCompanyUsers } from "../hooks/useCompanyUserMutations";
import type { CompanyUser } from "../types";
import CreateCompanyUserModal from "./CreateCompanyUserModal";

const columns = [
  {
    accessorKey: "name",
    header: "User",
    cell: ({ row }: { row: { original: CompanyUser } }) => (
      <div>
        <p className="font-medium text-slate-800 dark:text-slate-100">{row.original.name}</p>
        <p className="text-xs text-slate-500">{row.original.email}</p>
      </div>
    ),
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }: { row: { original: CompanyUser } }) => row.original.phone || "—",
  },
  {
    id: "branches",
    header: "Assigned Branch",
    accessorFn: (row: CompanyUser) => row.branches.map((branch) => branch.name).join(", "),
    cell: ({ row }: { row: { original: CompanyUser } }) =>
      row.original.branches.length
        ? row.original.branches.map((branch) => `${branch.code} — ${branch.name}`).join(", ")
        : "No branch assigned",
  },
  {
    accessorKey: "is_active",
    header: "Account",
    cell: ({ row }: { row: { original: CompanyUser } }) => (
      <span className={row.original.is_active ? "text-emerald-700" : "text-rose-700"}>
        {row.original.is_active ? "Active" : "Inactive"}
      </span>
    ),
  },
];

export default function CompanyUsersTable() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const { company, user } = useAuth();
  const { showConfirm, showMessage } = useAlert();
  const query = useCompanyUsers({
    companyId: company?.id ?? null,
    page,
    per_page: perPage,
    search,
  });
  const deleteMutation = useDeleteCompanyUsers();
  const selectedIds = Object.keys(rowSelection)
    .filter((id) => rowSelection[id])
    .map(Number);
  const selectionHasSelf = selectedIds.includes(user?.id ?? -1);

  const removeSelected = async () => {
    if (!selectedIds.length) return;
    const confirmed = await showConfirm({
      title: "Remove company users?",
      description: `Remove ${selectedIds.length} selected user(s) from this company? Their login account remains available for other companies.`,
      confirmText: "Remove users",
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

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Users & Permissions
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Create company accounts, assign branches, and configure individual access.
          </p>
        </div>
        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <Button
              variant="destructive"
              onClick={removeSelected}
              disabled={deleteMutation.isPending || selectionHasSelf}
              aria-label="Remove selected company users"
            >
              <Trash className="size-4" />
            </Button>
          )}
          <Button
            variant="outline"
            className="bg-blue-100 text-blue-700 hover:bg-blue-200"
            onClick={() => setOpen(true)}
          >
            <Plus className="mr-2 size-4" /> Add User
          </Button>
        </div>
      </div>
      {selectionHasSelf && (
        <p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
          Your own account cannot be removed from the company.
        </p>
      )}
      {query.isError && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          Unable to load company users: {query.error.message}
        </p>
      )}
      <AppTable<CompanyUser>
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
        detailPath="/users"
        itemLabel="users"
      />
      <CreateCompanyUserModal open={open} onOpenChange={setOpen} />
    </div>
  );
}
