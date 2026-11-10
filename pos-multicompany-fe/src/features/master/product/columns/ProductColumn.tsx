import type { ColumnDef } from "@tanstack/react-table";
import type { Product } from "../types";
import { formatCurrency } from "@/utils/currency";

export const ProductColumns: ColumnDef<Product>[] = [
  {
    accessorKey: "sku",
    header: "SKU",
    cell: ({ row }) => (
      <span className="font-mono text-xs text-slate-500 dark:text-slate-400">
        {row.original.sku}
      </span>
    ),
  },

  {
    accessorKey: "name",
    header: "Product Name",
    cell: ({ row }) => (
      <span className="font-medium text-slate-800 dark:text-slate-100">
        {row.original.name}
      </span>
    ),
  },

  {
    accessorKey: "category",
    header: "Category",
    cell: ({ row }) => (
      <span className="text-slate-600 dark:text-slate-400">
        {row.original.category_id}
      </span>
    ),
  },

  {
    accessorKey: "barcode",
    header: "Barcode",
    cell: ({ row }) => (
      <span className="font-medium tabular-nums text-slate-700 dark:text-slate-300">
        {row.original.barcode}
      </span>
    ),
  },

  {
    accessorKey: "selling_price",
    header: "Selling Price",
    cell: ({ row }) => (
      <span className="font-medium tabular-nums text-slate-700 dark:text-slate-300">
        {formatCurrency(Number(row.original.selling_price))}
      </span>
    ),
  },

    // {
    //   accessorKey: "stock",
    //   header: "Stock",

    //   cell: ({ row }) => {
    //     const stock = row.original.stock;

    //     const status =
    //       stock === 0
    //         ? {
    //             label: "Out of stock",
    //             className:
    //               "bg-red-50 text-red-700 ring-red-200 dark:bg-red-950/40 dark:text-red-400 dark:ring-red-900",
    //           }
    //         : stock <= 10
    //           ? {
    //               label: "Low stock",
    //               className:
    //                 "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:ring-amber-900",
    //             }
    //           : {
    //               label: "Available",
    //               className:
    //                 "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:ring-emerald-900",
    //             };

    //     return (
    //       <div className="flex items-center gap-2">
    //         <span className="font-medium tabular-nums text-slate-700 dark:text-slate-300">
    //           {stock}
    //         </span>

    //         <span
    //           className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${status.className}`}
    //         >
    //           {status.label}
    //         </span>
    //       </div>
    //     );
    //   },
    // },
];
