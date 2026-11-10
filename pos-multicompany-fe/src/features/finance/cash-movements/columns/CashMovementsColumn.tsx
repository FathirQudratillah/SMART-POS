import type { ColumnDef } from "@tanstack/react-table";
import { formatCurrency } from "@/utils/currency";
import type { CashMovement } from "../types";

export const CashMovementsColumn: ColumnDef<CashMovement>[] = [
  {
    accessorKey: "created_at",
    header: "Date",
    cell: ({ row }) => new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(row.original.created_at)),
  },
  {
    accessorFn: (row) => row.branch?.name ?? "",
    id: "branch",
    header: "Branch",
    cell: ({ row }) => row.original.branch?.name ?? "—",
  },
  {
    accessorKey: "movement_type",
    header: "Type",
    cell: ({ row }) => {
      const isCashIn = row.original.movement_type === "cash_in";
      return (
        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${isCashIn ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
          {isCashIn ? "Cash In" : "Cash Out"}
        </span>
      );
    },
  },
  {
    accessorFn: (row) => row.reference_type,
    id: "reference",
    header: "Source",
    cell: ({ row }) => (
      <span className="capitalize">
        {row.original.reference_type.replaceAll("_", " ")}
        {row.original.reference_id ? ` #${row.original.reference_id}` : ""}
      </span>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => <span className="max-w-xs truncate">{row.original.description}</span>,
  },
  {
    accessorFn: (row) => row.cashier_shift?.id ?? 0,
    id: "shift",
    header: "Shift",
    cell: ({ row }) => row.original.cashier_shift ? `#${row.original.cashier_shift.id}` : "—",
  },
  {
    accessorFn: (row) => row.creator?.name ?? "",
    id: "created_by",
    header: "Recorded by",
    cell: ({ row }) => row.original.creator?.name ?? "—",
  },
  {
    accessorKey: "amount",
    header: "Amount",
    cell: ({ row }) => (
      <span className={`font-semibold tabular-nums ${row.original.movement_type === "cash_in" ? "text-emerald-700" : "text-rose-700"}`}>
        {row.original.movement_type === "cash_in" ? "+" : "−"}{formatCurrency(Number(row.original.amount))}
      </span>
    ),
  },
];
