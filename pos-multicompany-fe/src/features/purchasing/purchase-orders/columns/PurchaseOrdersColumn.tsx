import type { ColumnDef } from "@tanstack/react-table";
import { formatCurrency } from "@/utils/currency";
import type { PurchaseOrder } from "../types";

export const PurchaseOrdersColumn: ColumnDef<PurchaseOrder>[] = [
  { accessorKey: "purchase_no", header: "PO Number", cell: ({ row }) => <span className="font-mono text-xs font-medium">{row.original.purchase_no}</span> },
  { accessorFn: (row) => row.supplier?.name ?? "", id: "supplier", header: "Supplier", cell: ({ row }) => row.original.supplier?.name ?? "—" },
  { accessorFn: (row) => row.warehouse?.name ?? "", id: "warehouse", header: "Warehouse", cell: ({ row }) => row.original.warehouse?.name ?? "—" },
  { accessorKey: "purchase_date", header: "Date", cell: ({ row }) => new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(new Date(row.original.purchase_date)) },
  { accessorKey: "total_amount", header: "Total", cell: ({ row }) => formatCurrency(Number(row.original.total_amount)) },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${row.original.status === "received" ? "bg-emerald-50 text-emerald-700" : row.original.status === "partially_received" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"}`}>{row.original.status.replaceAll("_", " ")}</span> },
];
