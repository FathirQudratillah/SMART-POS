import type { ColumnDef } from "@tanstack/react-table";
import type { StockOverviewItem } from "../types";

export const StockOverviewColumn: ColumnDef<StockOverviewItem>[] = [
  {
    accessorKey: "product.sku",
    header: "SKU",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
        {row.original.product.sku}
      </span>
    ),
  },
  {
    accessorKey: "product.name",
    header: "Product",
    cell: ({ row }) => (
      <span className="font-medium text-slate-800 dark:text-slate-100">
        {row.original.product.name}
      </span>
    ),
  },
  {
    accessorKey: "warehouse.name",
    header: "Warehouse",
    cell: ({ row }) => (
      <span className="text-slate-600 dark:text-slate-400">
        {row.original.warehouse.name}
      </span>
    ),
  },
  {
    accessorKey: "quantity",
    header: "Stock",

    cell: ({ row }) => {
      const stock = Number(row.original.quantity);
      const hasValidStock = Number.isFinite(stock);
      const formattedStock = hasValidStock
        ? new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 }).format(stock)
        : "—";

      const status =
        !hasValidStock
          ? {
              label: "Unknown",
              className:
                "bg-slate-50 text-slate-700 ring-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:ring-slate-700",
            }
          : stock <= 0
          ? {
              label: "Out of stock",
              className:
                "bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/40 dark:text-red-400 dark:ring-red-900",
            }
          : stock <= 10
            ? {
                label: "Low stock",
                className:
                  "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:ring-amber-900",
              }
            : {
                label: "Available",
                className:
                  "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-900",
              };

      return (
        <div className="flex items-center gap-2">
          <span className="font-medium tabular-nums text-slate-700 dark:text-slate-300">
            {formattedStock}
          </span>

          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${status.className}`}
          >
            {status.label}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "product.unit",
    header: "Unit",
    cell: ({ row }) => (
      <span className="text-slate-600 dark:text-slate-400">
        {row.original.product.unit}
      </span>
    ),
  },
];
