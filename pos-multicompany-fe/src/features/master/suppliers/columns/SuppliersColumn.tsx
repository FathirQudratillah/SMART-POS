import type { ColumnDef } from "@tanstack/react-table";
import type { Supplier } from "../types";

export const SuppliersColumn: ColumnDef<Supplier>[] = [
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
        {row.original.code}
      </span>
    ),
  },
  {
    accessorKey: "name",
    header: "Supplier Name",
    cell: ({ row }) => (
      <span className="font-medium text-slate-800 dark:text-slate-100">
        {row.original.name}
      </span>
    ),
  },
  
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => (
      <span className="tabular-nums text-slate-700 dark:text-slate-300">
        {row.original.phone || "-"}
      </span>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="text-slate-600 dark:text-slate-400">
        {row.original.email || "-"}
      </span>
    ),
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => (
      <span className={row.original.is_active ? "text-emerald-700" : "text-slate-500"}>
        {row.original.is_active ? "Active" : "Inactive"}
      </span>
    ),
  },
];
