import type { ColumnDef } from "@tanstack/react-table";
import { formatCurrency } from "@/utils/currency";
import type { Sale } from "../types";

export const SalesColumn: ColumnDef<Sale>[] = [
  { accessorKey: "invoice_no", header: "Invoice", cell: ({ row }) => <span className="font-mono text-xs font-medium">{row.original.invoice_no}</span> },
  { accessorFn: (row) => row.customer?.name ?? "Walk-in customer", id: "customer", header: "Customer", cell: ({ row }) => row.original.customer?.name ?? "Walk-in customer" },
  { accessorFn: (row) => row.warehouse?.name ?? "", id: "warehouse", header: "Warehouse", cell: ({ row }) => row.original.warehouse?.name ?? "—" },
  { accessorKey: "sale_date", header: "Date", cell: ({ row }) => new Intl.DateTimeFormat("id-ID", { dateStyle: "medium", timeStyle: "short" }).format(new Date(row.original.sale_date)) },
  { accessorKey: "total_amount", header: "Total", cell: ({ row }) => formatCurrency(Number(row.original.total_amount)) },
  { accessorKey: "status", header: "Status", cell: ({ row }) => <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${row.original.status === "completed" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{row.original.status}</span> },
];
