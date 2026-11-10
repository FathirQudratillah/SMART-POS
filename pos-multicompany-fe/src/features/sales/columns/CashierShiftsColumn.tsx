import type { ColumnDef } from "@tanstack/react-table";
import { formatCurrency } from "@/utils/currency";
import type { CashierShift } from "../types";

function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function cashAmount(value: number | string | null | undefined): number {
  return Number(value ?? 0);
}

export const CashierShiftsColumn: ColumnDef<CashierShift>[] = [
  {
    accessorKey: "id",
    header: "Shift",
    cell: ({ row }) => <span className="font-medium">#{row.original.id}</span>,
  },
  {
    accessorFn: (row) => row.user?.name ?? "",
    id: "cashier",
    header: "Cashier",
    cell: ({ row }) => row.original.user?.name ?? "—",
  },
  {
    accessorKey: "opened_at",
    header: "Opened",
    cell: ({ row }) => formatDate(row.original.opened_at),
  },
  {
    accessorKey: "closed_at",
    header: "Closed",
    cell: ({ row }) => formatDate(row.original.closed_at),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const isOpen = row.original.status === "open";
      return (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
            isOpen
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-700"
          }`}
        >
          {isOpen ? "Open" : "Closed"}
        </span>
      );
    },
  },
  {
    accessorKey: "opening_cash",
    header: "Opening Cash",
    cell: ({ row }) => formatCurrency(cashAmount(row.original.opening_cash)),
  },
  {
    accessorKey: "cash_in_total",
    header: "Cash In",
    cell: ({ row }) => (
      <span className="font-medium tabular-nums text-emerald-700">
        {formatCurrency(cashAmount(row.original.cash_in_total))}
      </span>
    ),
  },
  {
    accessorKey: "cash_out_total",
    header: "Cash Out",
    cell: ({ row }) => (
      <span className="font-medium tabular-nums text-rose-700">
        {formatCurrency(cashAmount(row.original.cash_out_total))}
      </span>
    ),
  },
  {
    accessorKey: "current_expected_cash",
    header: "Expected Cash",
    cell: ({ row }) =>
      formatCurrency(
        cashAmount(
          row.original.current_expected_cash ?? row.original.expected_cash,
        ),
      ),
  },
  {
    accessorKey: "closing_cash",
    header: "Closing Cash",
    cell: ({ row }) =>
      row.original.closing_cash == null
        ? "—"
        : formatCurrency(cashAmount(row.original.closing_cash)),
  },
  {
    id: "variance",
    header: "Variance",
    cell: ({ row }) => {
      if (row.original.closing_cash == null) return "—";
      const expected = cashAmount(
        row.original.expected_cash ?? row.original.current_expected_cash,
      );
      const variance = cashAmount(row.original.closing_cash) - expected;
      return (
        <span
          className={`font-medium tabular-nums ${
            variance < 0 ? "text-rose-700" : "text-emerald-700"
          }`}
        >
          {variance > 0 ? "+" : ""}
          {formatCurrency(variance)}
        </span>
      );
    },
  },
];
