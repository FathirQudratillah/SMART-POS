import { useState } from "react";
import {
  Plus,
  Trash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Product } from "../types";
import { useProducts } from "../hooks/useProducts";
import AppTable from "@/components/layout/AppTable";
import { ProductColumns } from "../columns/ProductColumn";
import { useAuth } from "@/context/auth/AuthContext";
import AddProductModal from "./AddProductModal";
import type { RowSelectionState } from "@tanstack/react-table";
import { useDeleteProducts } from "../hooks/useDeleteProducts";
import { useAlert } from "@/context/AlertContext";


export default function ProductTable() {
  const [page, setPage] = useState(1);
  const [per_page, setPerPage] = useState(5);
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});

  const { company } = useAuth();
  const { showConfirm, showMessage } = useAlert();

  const { data } = useProducts({
    companyId: company?.id ?? null,
    page,
    per_page,
    search,
  });

  const selectedIds = Object.keys(rowSelection)
    .filter((id) => rowSelection[id])
    .map(Number);

  const deleteMutation = useDeleteProducts();

  const handleDelete = async () => {
    if (selectedIds.length === 0) return;

     const confirmed = await showConfirm({
       title: "Delete product?",
       description: "Are you sure you want to delete this product?",
       confirmText: "Yes, delete",
       cancelText: "Cancel",
     });

     if (!confirmed) return;

    deleteMutation.mutate(
      { ids: selectedIds },
      {
        onSuccess: () => {
          setRowSelection({});
          showMessage({
            variant: "success",
            title: "Success",
            description: "Product successfully deleted.",
          });
        },
        onError: (error) => {
          showMessage({
            variant: "error",
            title: "Error",
            description: error.message,
          });
        }
        

      },
    );
  };

  const products = data?.data;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            Products
          </h2>

          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage your product inventory and information.
          </p>
        </div>

        <div className="flex gap-2">
          {selectedIds.length > 0 && (
            <Button
              className="bg-red-700 text-white shadow-sm hover:bg-red-800"
              onClick={handleDelete}
              disabled={selectedIds.length === 0 || deleteMutation.isPending}
              aria-label="Delete selected products"
            >
              <Trash className="size-4" />
            </Button>
          )}
          <Button
            variant="outline"
            className="bg-blue-100 text-blue-700 shadow-sm hover:bg-blue-200"
            onClick={() => setOpen(true)}
          >
            <Plus className="mr-2 size-4" />
            Add Product
          </Button>
        </div>
      </div>

      <AppTable<Product>
        columns={ProductColumns}
        data={products}
        page={page}
        setPage={setPage}
        per_page={per_page}
        setPerPage={setPerPage}
        search={search}
        setSearch={setSearch}
        rowSelection={rowSelection}
        setRowSelection={setRowSelection}
      />

      <AddProductModal open={open} onOpenChange={setOpen} />
    </div>
  );
}
