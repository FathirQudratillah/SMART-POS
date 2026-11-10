import type { ColumnDef } from "@tanstack/react-table";
import type { StockOpname } from "../types";

export const StockOpnamesColumn: ColumnDef<StockOpname>[] = [
  { accessorKey: "opname_no", header: "Opname No.", cell: ({ row }) => <span className="font-mono text-xs font-medium">{row.original.opname_no}</span> },
  { accessorFn: (row) => row.warehouse?.name ?? "", id: "warehouse", header: "Warehouse", cell: ({ row }) => row.original.warehouse?.name ?? "—" },
  { accessorKey: "opname_date", header: "Date", cell: ({ row }) => new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(row.original.opname_date)) },
  { accessorKey: "items_count", id: "items", header: "Products" },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${row.original.status === "approved" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{row.original.status === "approved" ? "Posted" : "Draft"}</span> },
];
