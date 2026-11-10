import { useMemo, useState } from "react";

import {
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
  type OnChangeFn,
} from "@tanstack/react-table";

import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  FileSearchCorner,
  Search,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { PaginatedResponse } from "@/types";
import { Checkbox } from "../ui/checkbox";
import { useNavigate } from "react-router-dom";

interface HasId {
  id: string | number;
}

interface AppTableProps<T extends HasId> {
  columns: ColumnDef<T, unknown>[];
  data: PaginatedResponse<T> | undefined;

  page: number;
  setPage: (page: number) => void;

  per_page: number;
  setPerPage: (perPage: number) => void;
  
  search: string;
  setSearch: (search: string) => void;
  
  rowSelection?: RowSelectionState;
  setRowSelection?: OnChangeFn<RowSelectionState>;
  detailPath?: string | null;
  enableSelection?: boolean;
  itemLabel?: string;
}

export default function AppTable<T extends HasId>({
  columns,
  data,
  page,
  setPage,
  per_page,
  setPerPage,
  search,
  setSearch,
  rowSelection,
  setRowSelection,
  detailPath = "/products",
  enableSelection = true,
  itemLabel = "products",
}: AppTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [internalRowSelection, setInternalRowSelection] = useState<RowSelectionState>({});
  const navigate = useNavigate();
  const selectionState = rowSelection ?? internalRowSelection;
  const updateRowSelection = setRowSelection ?? setInternalRowSelection;

  const tableColumns = useMemo<ColumnDef<T, unknown>[]>(
    () => {
      const selectionColumn: ColumnDef<T, unknown> = {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Pilih semua data"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Pilih baris"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      };
      const actionsColumn: ColumnDef<T, unknown> = {
        id: "actions",
        header: () => <FileSearchCorner className="text-slate-400" />,
        cell: ({ row }) => (
          <button
            type="button"
            aria-label="View details"
            onClick={() => navigate(`${detailPath}/${row.original.id}`)}
            className="text-slate-600 hover:text-slate-800"
          >
            <FileSearchCorner />
          </button>
        ),
        enableSorting: false,
      };

      return [
        ...(enableSelection ? [selectionColumn] : []),
        ...columns,
        ...(detailPath ? [actionsColumn] : []),
      ];
    },
    [columns, detailPath, enableSelection, navigate],
  );


  const table = useReactTable({
    data: data?.data ?? [],
    columns: tableColumns,

    state: {
      sorting,
      rowSelection: selectionState,
      pagination: {
        pageIndex: page - 1,
        pageSize: data?.per_page ?? per_page,
      },
    },

    onSortingChange: setSorting,
    onRowSelectionChange: updateRowSelection,

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),

    manualPagination: true,
    pageCount: data?.last_page ?? 0,

    enableRowSelection: enableSelection,

    getRowId: (row) => String((row as { id: string | number }).id),
  });

  const selectedCount = table.getFilteredSelectedRowModel().rows.length;

  const filteredCount = table.getFilteredRowModel().rows.length;

  return (
    <>
      {/* ============================================= */}
      {/* SEARCH & TOOLBAR */}
      {/* ============================================= */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

          <Input
            placeholder="Search..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            className="h-10 rounded-lg border-slate-200 bg-white pl-10 pr-10 shadow-none focus-visible:ring-blue-500 dark:border-slate-800 dark:bg-slate-950"
          />

          {search && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              aria-label="Clear search"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 text-sm">
          <span className="text-slate-500 dark:text-slate-400">
            {selectedCount > 0
              ? `${selectedCount} selected`
              : `${filteredCount} ${itemLabel}`}
          </span>

          {selectedCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.resetRowSelection()}
              className="h-9 border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300"
            >
              <X className="mr-1 size-3.5" />
              Clear selection
            </Button>
          )}
        </div>
      </div>

      {/* ============================================= */}
      {/* TABLE */}
      {/* ============================================= */}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50 dark:bg-slate-900">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="border-b border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="h-12 whitespace-nowrap px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={
                            header.column.getCanSort()
                              ? "flex cursor-pointer select-none items-center gap-2"
                              : "flex items-center gap-2"
                          }
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}

                          {header.column.getCanSort() && (
                            <>
                              {header.column.getIsSorted() === "asc" ? (
                                <ArrowUp className="size-3.5 text-blue-600" />
                              ) : header.column.getIsSorted() === "desc" ? (
                                <ArrowDown className="size-3.5 text-blue-600" />
                              ) : (
                                <ArrowUpDown className="size-3.5 text-slate-400" />
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="border-b border-slate-100 transition-colors hover:bg-blue-50/60 data-[state=selected]:bg-blue-50 dark:border-slate-800 dark:hover:bg-slate-900 dark:data-[state=selected]:bg-blue-950/40"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell
                        key={cell.id}
                        className="whitespace-nowrap px-4 py-3.5 text-sm"
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={tableColumns.length}
                    className="h-32 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Search className="size-8 text-slate-300 dark:text-slate-600" />

                      <p className="font-medium text-slate-700 dark:text-slate-300">
                        No {itemLabel} found
                      </p>

                      <p className="text-sm text-slate-500">
                        Try adjusting your search or filters.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ============================================= */}
      {/* PAGINATION */}
      {/* ============================================= */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* PAGE INFORMATION */}

        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span>Rows per page</span>

            <select
              value={data?.per_page}
              onChange={(event) => setPerPage(Number(event.target.value))}
              className="h-9 rounded-lg border border-slate-200 bg-white px-2 text-sm font-medium text-slate-700 outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300"
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>

          <span className="hidden text-slate-300 sm:inline">|</span>

          <span>
            {data?.total === 0
              ? "0 results"
              : `Showing ${data?.from ?? 0}–${data?.to ?? 0} of ${
                  data?.total ?? 0
                } results`}
          </span>
        </div>

        {/* PAGE NAVIGATION */}

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Page {data?.current_page} of {data?.last_page}
          </span>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage(page - 1)}
              disabled={!data?.prev_page_url}
              aria-label="Previous page"
              className="size-9 border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300"
            >
              <ChevronLeft className="size-4" />
            </Button>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setPage(page + 1)}
              disabled={!data?.next_page_url}
              aria-label="Next page"
              className="size-9 border-slate-200 text-slate-600 hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700 disabled:opacity-40 dark:border-slate-700 dark:text-slate-300"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
