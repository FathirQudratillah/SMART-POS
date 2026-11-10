import type { ColumnDef } from "@tanstack/react-table";
import type { StockTransfer } from "../types";

export const StockTransfersColumn: ColumnDef<StockTransfer>[] = [
  {
    accessorKey: "transfer_no",
    header: "Transfer No.",
    cell: ({ row }) => (
      <span className="font-mono text-xs font-medium text-slate-700 dark:text-slate-200">
        {row.original.transfer_no}
      </span>
    ),
  },
  {
    accessorFn: (row) => row.source_warehouse?.name ?? "",
    id: "source",
    header: "From",
    cell: ({ row }) => (
      <span className="text-slate-600 dark:text-slate-400">
        {row.original.source_warehouse?.name ?? "—"}
      </span>
    ),
  },
  {
    accessorFn: (row) => row.destination_warehouse?.name ?? "",
    id: "destination",
    header: "To",
    cell: ({ row }) => (
      <span className="text-slate-600 dark:text-slate-400">
        {row.original.destination_warehouse?.name ?? "—"}
      </span>
    ),
  },
  {
    accessorKey: "transfer_date",
    header: "Date",
    cell: ({ row }) => (
      <span className="text-slate-600 dark:text-slate-400">
        {new Intl.DateTimeFormat("en", {
          dateStyle: "medium",
          timeStyle: "short",
        }).format(new Date(row.original.transfer_date))}
      </span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const isApproved = row.original.status === "approved";
      return (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
            isApproved
              ? "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-900"
              : "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:ring-amber-900"
          }`}
        >
          {isApproved ? "Posted" : "Draft"}
        </span>
      );
    },
  },
];
