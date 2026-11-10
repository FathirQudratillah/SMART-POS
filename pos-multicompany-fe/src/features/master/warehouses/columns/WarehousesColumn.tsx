import type { ColumnDef } from "@tanstack/react-table";
import type { Warehouse } from "../types";

export const WarehousesColumn: ColumnDef<Warehouse>[] = [
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
    header: "Warehouse Name",
    cell: ({ row }) => (
      <span className="font-medium text-slate-800 dark:text-slate-100">
        {row.original.name}
      </span>
    ),
  },
  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => (
      <span className="text-slate-600 dark:text-slate-400">
        {row.original.address || "-"}
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
