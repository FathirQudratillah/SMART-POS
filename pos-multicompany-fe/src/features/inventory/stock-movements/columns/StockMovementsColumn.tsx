import type { ColumnDef } from "@tanstack/react-table";
import { formatCurrency } from "@/utils/currency";
import type { StockMovement } from "../types";

const movementLabels: Record<StockMovement["movement_type"], string> = {
  IN: "Stock In",
  OUT: "Stock Out",
  sale: "Sale",
  purchase_receipt: "Purchase Receipt",
  transfer_in: "Transfer In",
  transfer_out: "Transfer Out",
  adjustment_in: "Adjustment In",
  adjustment_out: "Adjustment Out",
  opname_in: "Opname In",
  opname_out: "Opname Out",
};

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatQuantity(value: number | string): string {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: 3,
  }).format(Number(value));
}

export const StockMovementsColumn: ColumnDef<StockMovement>[] = [
  {
    accessorKey: "created_at",
    header: "Date",
    cell: ({ row }) => formatDate(row.original.created_at),
  },
  {
    accessorFn: (row) => row.product?.sku ?? "",
    id: "sku",
    header: "SKU",
    cell: ({ row }) => row.original.product?.sku ?? "—",
  },
  {
    accessorFn: (row) => row.product?.name ?? "",
    id: "product",
    header: "Product",
    cell: ({ row }) => row.original.product?.name ?? "—",
  },
  {
    accessorFn: (row) => row.warehouse?.name ?? "",
    id: "warehouse",
    header: "Warehouse",
    cell: ({ row }) => row.original.warehouse?.name ?? "—",
  },
  {
    accessorKey: "movement_type",
    header: "Movement",
    cell: ({ row }) => {
      const isInbound = Number(row.original.quantity_in) > 0;
      return (
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
            isInbound
              ? "bg-emerald-50 text-emerald-700"
              : "bg-rose-50 text-rose-700"
          }`}
        >
          {movementLabels[row.original.movement_type]}
        </span>
      );
    },
  },
  {
    accessorKey: "quantity_in",
    header: "In",
    cell: ({ row }) => (
      <span className="font-medium tabular-nums text-emerald-700">
        {Number(row.original.quantity_in) > 0
          ? `+${formatQuantity(row.original.quantity_in)}`
          : "—"}
      </span>
    ),
  },
  {
    accessorKey: "quantity_out",
    header: "Out",
    cell: ({ row }) => (
      <span className="font-medium tabular-nums text-rose-700">
        {Number(row.original.quantity_out) > 0
          ? `−${formatQuantity(row.original.quantity_out)}`
          : "—"}
      </span>
    ),
  },
  {
    id: "reference",
    header: "Reference",
    cell: ({ row }) =>
      `${row.original.reference_type.replaceAll("_", " ")}${
        row.original.reference_id ? ` #${row.original.reference_id}` : ""
      }`,
  },
  {
    accessorKey: "unit_cost",
    header: "Unit Cost",
    cell: ({ row }) =>
      row.original.unit_cost == null
        ? "—"
        : formatCurrency(Number(row.original.unit_cost)),
  },
  {
    accessorKey: "notes",
    header: "Notes",
    cell: ({ row }) => (
      <span className="block max-w-xs truncate">{row.original.notes || "—"}</span>
    ),
  },
  {
    accessorFn: (row) => row.creator?.name ?? "",
    id: "creator",
    header: "Recorded By",
    cell: ({ row }) => row.original.creator?.name ?? "—",
  },
];
