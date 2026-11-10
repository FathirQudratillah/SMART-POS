import { useState } from "react";
import { LoaderCircle, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAlert } from "@/context/AlertContext";
import { useAuth } from "@/context/auth/AuthContext";
import FormLogo from "@/components/ui/FormLogo";
import { useWarehouses } from "@/features/master/warehouses/hooks/useWarehouses";
import { useCreateStockOpname } from "../hooks/useCreateStockOpname";
import type { CreateStockOpnameRequest } from "../types";
import { useStockOverview } from "../../stock-overview/hooks/useStockOverview";

type Props = { open: boolean; onOpenChange: (open: boolean) => void };
type OpnameItemForm = { product_id: string; counted_quantity: string };
const emptyItem: OpnameItemForm = { product_id: "", counted_quantity: "0" };

export default function CreateStockOpnameDialog({ open, onOpenChange }: Props) {
  const { company, branch } = useAuth();
  const { showMessage } = useAlert();
  const [warehouseId, setWarehouseId] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<OpnameItemForm[]>([{ ...emptyItem }]);
  const [formError, setFormError] = useState("");
  const mutation = useCreateStockOpname();
  const warehousesQuery = useWarehouses({
    companyId: company?.id ?? null,
    page: 1,
    per_page: 100,
  });
  const productsQuery = useStockOverview({
    companyId: company?.id ?? null,
    branchId: branch?.id ?? null,
    warehouseId: warehouseId ? Number(warehouseId) : null,
    page: 1,
    per_page: 100,
  });
  const warehouses = (warehousesQuery.data?.data.data ?? []).filter(
    (item) =>
      item.branch_id === branch?.id && item.is_active && !item.deleted_at,
  );
  const products = (productsQuery.data?.data.data ?? []).filter(
    (item) =>
      item.quantity != 0 && item.product.is_active && !item.product.deleted_at,
  );

  const reset = () => {
    setWarehouseId("");
    setNotes("");
    setItems([{ ...emptyItem }]);
    setFormError("");
  };
  const close = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen && !mutation.isPending) reset();
  };
  const updateItem = (index: number, patch: Partial<OpnameItemForm>) =>
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );

  const submit = () => {
    setFormError("");
    if (!warehouseId) {
      setFormError("Select a warehouse.");
      return;
    }
    if (
      items.some(
        (item) =>
          !item.product_id ||
          !/^(?:\d+(?:\.\d{1,3})?|\.\d{1,3})$/.test(item.counted_quantity) ||
          Number(item.counted_quantity) < 0,
      )
    ) {
      setFormError(
        "Select a product and enter a non-negative counted quantity with up to 3 decimal places for each line.",
      );
      return;
    }
    if (new Set(items.map((item) => item.product_id)).size !== items.length) {
      setFormError("Each product can only be counted once.");
      return;
    }
    const payload: CreateStockOpnameRequest = {
      warehouse_id: Number(warehouseId),
      notes: notes.trim() || undefined,
      items: items.map((item) => ({
        product_id: Number(item.product_id),
        counted_quantity: Number(item.counted_quantity),
      })),
    };
    mutation.mutate(payload, {
      onSuccess: (response) => {
        reset();
        onOpenChange(false);
        showMessage({
          variant: "success",
          title: "Stock opname created",
          description: `${response.data.opname_no} was saved as a draft for review.`,
        });
      },
      onError: (error) => {
        const messages = Object.values(error.errors ?? {}).flat();
        setFormError(messages.length ? messages.join("\n") : error.message);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto bg-white p-0 sm:max-w-3xl dark:bg-slate-950">
        <div className="space-y-6 p-6 sm:p-8">
          <DialogHeader>
            <FormLogo />
            <DialogTitle className="text-2xl font-bold tracking-tight">
              Start Stock Opname
            </DialogTitle>
            <DialogDescription>
              Enter the physical count for each product. The system quantity is
              captured when the draft is created; if stock changes before
              posting, create a new opname and recount.
            </DialogDescription>
          </DialogHeader>
          {formError && (
            <p
              role="alert"
              className="whitespace-pre-line rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {formError}
            </p>
          )}
          {warehousesQuery.isError && (
            <p role="alert" className="text-sm text-red-700">
              Unable to load warehouses: {warehousesQuery.error.message}
            </p>
          )}
          {productsQuery.isError && (
            <p role="alert" className="text-sm text-red-700">
              Unable to load products: {productsQuery.error.message}
            </p>
          )}
          <div className="space-y-2">
            <Label htmlFor="opname-warehouse">Warehouse *</Label>
            <select
              id="opname-warehouse"
              value={warehouseId}
              onChange={(event) => setWarehouseId(event.target.value)}
              disabled={warehousesQuery.isLoading}
              className="h-9 w-full rounded-md border border-input bg-white px-3 text-sm dark:bg-slate-900"
            >
              <option value="">Select warehouse</option>
              {warehouses.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.code} — {item.name}
                </option>
              ))}
            </select>
          </div>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Physical count</h3>
                <p className="text-sm text-slate-500">
                  Counted quantity can be zero.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={
                  items.length >= products.length || products.length === 0
                }
                onClick={() =>
                  setItems((current) => [...current, { ...emptyItem }])
                }
              >
                <Plus className="size-4" />
                Add product
              </Button>
            </div>
            {items.map((item, index) => {
              const used = items
                .filter((_, itemIndex) => itemIndex !== index)
                .map((entry) => entry.product_id);
              return (
                <div
                  key={index}
                  className="grid gap-3 rounded-lg border border-slate-200 p-3 sm:grid-cols-[1fr_180px_auto] dark:border-slate-800"
                >
                  <div className="space-y-2">
                    <Label htmlFor={`opname-product-${index}`}>Product *</Label>
                    <select
                      id={`opname-product-${index}`}
                      value={item.product_id}
                      onChange={(event) =>
                        updateItem(index, { product_id: event.target.value })
                      }
                      disabled={productsQuery.isLoading || !warehouseId}
                      className="h-9 w-full rounded-md border border-input bg-white px-3 text-sm dark:bg-slate-900 disabled:text-slate-400"
                    >
                      <option value="">Select product</option>
                      {products
                        .filter(
                          (product) =>
                            !used.includes(String(product.product.id)) ||
                            String(product.product.id) === item.product_id,
                        )
                        .map((product) => (
                          <option
                            key={product.product.id}
                            value={product.product.id}
                          >
                            {product.product.sku} — {product.product.name}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`opname-count-${index}`}>
                      Counted quantity *
                    </Label>
                    <Input
                      id={`opname-count-${index}`}
                      type="number"
                      min="0"
                      step="1"
                      value={item.counted_quantity}
                      disabled={productsQuery.isLoading || !warehouseId}
                      className="disabled:text-slate-400"
                      onChange={(event) =>
                        updateItem(index, {
                          counted_quantity: event.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Remove product"
                      disabled={items.length === 1}
                      onClick={() =>
                        setItems((current) =>
                          current.filter((_, itemIndex) => itemIndex !== index),
                        )
                      }
                    >
                      <Trash2 className="size-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </section>
          <div className="space-y-2">
            <Label htmlFor="opname-notes">Notes</Label>
            <textarea
              id="opname-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              maxLength={10000}
              rows={3}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm dark:bg-slate-900"
              placeholder="Optional notes"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="bg-red-100 text-red-700 hover:bg-red-200"
              onClick={() => close(false)}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="outline"
              className="bg-blue-100 text-blue-700 hover:bg-blue-200"
              type="button"
              onClick={submit}
              disabled={
                mutation.isPending ||
                warehouses.length === 0 ||
                products.length === 0
              }
            >
              {mutation.isPending && (
                <LoaderCircle className="size-4 animate-spin" />
              )}
              Save draft
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
