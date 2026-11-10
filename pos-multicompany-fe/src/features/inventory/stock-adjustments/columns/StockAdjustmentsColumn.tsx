import type { ColumnDef } from "@tanstack/react-table";
import type { StockAdjustment } from "../types";

export const StockAdjustmentsColumn: ColumnDef<StockAdjustment>[] = [
  { accessorKey: "adjustment_no", header: "Adjustment No.", cell: ({ row }) => <span className="font-mono text-xs font-medium">{row.original.adjustment_no}</span> },
  { accessorFn: (row) => row.warehouse?.name ?? "", id: "warehouse", header: "Warehouse", cell: ({ row }) => row.original.warehouse?.name ?? "—" },
  { accessorKey: "adjustment_type", header: "Type", cell: ({ row }) => <span className={row.original.adjustment_type === "increase" ? "text-emerald-700" : "text-amber-700"}>{row.original.adjustment_type === "increase" ? "Increase" : "Decrease"}</span> },
  { accessorKey: "adjustment_date", header: "Date", cell: ({ row }) => new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(row.original.adjustment_date)) },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${row.original.status === "approved" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{row.original.status === "approved" ? "Posted" : "Draft"}</span> },
];
