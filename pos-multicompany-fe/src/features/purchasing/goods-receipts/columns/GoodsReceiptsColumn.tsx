import type { ColumnDef } from "@tanstack/react-table";
import type { GoodsReceipt } from "../types";

export const GoodsReceiptsColumn: ColumnDef<GoodsReceipt>[] = [
  { accessorKey: "receipt_no", header: "Receipt No.", cell: ({ row }) => <span className="font-mono text-xs font-medium">{row.original.receipt_no}</span> },
  { accessorFn: (row) => row.supplier?.name ?? "", id: "supplier", header: "Supplier", cell: ({ row }) => row.original.supplier?.name ?? "—" },
  { accessorFn: (row) => row.purchase?.purchase_no ?? "Direct receipt", id: "purchase", header: "Purchase Order", cell: ({ row }) => row.original.purchase?.purchase_no ?? "Direct receipt" },
  { accessorFn: (row) => row.warehouse?.name ?? "", id: "warehouse", header: "Warehouse", cell: ({ row }) => row.original.warehouse?.name ?? "—" },
  { accessorKey: "receipt_date", header: "Date", cell: ({ row }) => new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(row.original.receipt_date)) },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${row.original.status === "posted" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{row.original.status}</span> },
];
