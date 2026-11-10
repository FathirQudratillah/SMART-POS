import { useEffect, useState } from "react";
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
import { useCreateStockAdjustment } from "../hooks/useCreateStockAdjustment";
import type { CreateStockAdjustmentRequest } from "../types";
import { useStockOverview } from "../../stock-overview/hooks/useStockOverview";

type Props = { open: boolean; onOpenChange: (open: boolean) => void };
type AdjustmentItemForm = { product_id: string; quantity: string };
const emptyItem: AdjustmentItemForm = { product_id: "", quantity: "1" };

export default function CreateStockAdjustmentDialog({
  open,
  onOpenChange,
}: Props) {
  const { company, branch } = useAuth();
  const { showMessage } = useAlert();
  const [warehouseId, setWarehouseId] = useState("");
  const [type, setType] = useState<"increase" | "decrease">("increase");
  const [reason, setReason] = useState("");
  const [items, setItems] = useState<AdjustmentItemForm[]>([{ ...emptyItem }]);
  const [formError, setFormError] = useState("");
  const mutation = useCreateStockAdjustment();
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
    (item) => item.branch_id === branch?.id && item.is_active && !item.deleted_at,
  );
  const products = (productsQuery.data?.data.data ?? []).filter(
    (item) =>
      item.quantity != 0 &&
      item.product.is_active &&
      !item.product.deleted_at,
  );

  const reset = () => {
    setWarehouseId("");
    setType("increase");
    setReason("");
    setItems([{ ...emptyItem }]);
    setFormError("");
  };
  const close = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen && !mutation.isPending) reset();
  };
  const updateItem = (index: number, patch: Partial<AdjustmentItemForm>) =>
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );

  const submit = () => {
    setFormError("");
    if (!warehouseId || !reason.trim()) {
      setFormError("Select a warehouse and enter the adjustment reason.");
      console.log("Warehouse ID:", warehouseId);
      console.log("Reason:", reason);
      return;
    }
    if (
      items.some(
        (item) =>
          !item.product_id ||
          !/^(?:\d+(?:\.\d{1,3})?|\.\d{1,3})$/.test(item.quantity) ||
          Number(item.quantity) <= 0,
      )
    ) {
      setFormError(
        "Select a product and enter a positive quantity with up to 3 decimal places for each line.",
      );
      return;
    }
    if (new Set(items.map((item) => item.product_id)).size !== items.length) {
      setFormError("Each product can only be added once.");
      return;
    }
    const payload: CreateStockAdjustmentRequest = {
      warehouse_id: Number(warehouseId),
      adjustment_type: type,
      reason: reason.trim(),
      items: items.map((item) => ({
        product_id: Number(item.product_id),
        quantity: Number(item.quantity),
      })),
    };
    mutation.mutate(payload, {
      onSuccess: (response) => {
        reset();
        onOpenChange(false);
        showMessage({
          variant: "success",
          title: "Adjustment created",
          description: `${response.data.adjustment_no} was saved as a draft. Post it to update stock.`,
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
              Create Stock Adjustment
            </DialogTitle>
            <DialogDescription>
              Save as a draft and post it after reviewing. Stock will only
              change when posted.
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

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="adjustment-warehouse">Warehouse *</Label>
              <select
                id="adjustment-warehouse"
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
            <div className="space-y-2">
              <Label htmlFor="adjustment-type">Adjustment type *</Label>
              <select
                id="adjustment-type"
                value={type}
                onChange={(event) =>
                  setType(event.target.value as "increase" | "decrease")
                }
                className="h-9 w-full rounded-md border border-input bg-white px-3 text-sm dark:bg-slate-900"
              >
                <option value="increase">Increase stock</option>
                <option value="decrease">Decrease stock</option>
              </select>
            </div>
          </div>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Products</h3>
                <p className="text-sm text-slate-500">
                  Enter the amount to {type === "increase" ? "add" : "remove"}.
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
                Add item
              </Button>
            </div>
            {items.map((item, index) => {
              const used = items
                .filter((_, itemIndex) => itemIndex !== index)
                .map((entry) => entry.product_id);

              const selectedProduct = products.find(
                (p) => String(p.product.id) === item.product_id,
              );

              useEffect(() => {
                 updateItem(index, {
                   quantity: "1",
                 });
              },[type])
              return (
                <div
                  key={index}
                  className="grid gap-3 rounded-lg border border-slate-200 p-3 sm:grid-cols-[1fr_150px_auto] dark:border-slate-800"
                >
                  <div className="space-y-2">
                    <Label htmlFor={`adjustment-product-${index}`}>
                      Product *
                    </Label>
                    <select
                      id={`adjustment-product-${index}`}
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
                    <Label htmlFor={`adjustment-quantity-${index}`}>
                      Quantity *
                    </Label>
                    <Input
                      id={`transfer-quantity-${index}`}
                      type="number"
                      min="1"
                      step="1"
                      max={type === "decrease" && selectedProduct ? selectedProduct.quantity : undefined}
                      value={item.quantity}
                      placeholder="Quantity"
                      disabled={
                        productsQuery.isLoading ||
                        warehouseId === "" ||
                        !selectedProduct ||
                        selectedProduct.quantity === 0
                      }
                      onChange={(event) =>
                        updateItem(index, {
                          quantity: event.target.value,
                        })
                      }
                    />

                    {selectedProduct && type ==="decrease" && (
                      <p className="text-xs text-muted-foreground">
                        max: {selectedProduct.quantity}
                      </p>
                    )}
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Remove item"
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
            <Label htmlFor="adjustment-reason">Reason *</Label>
            <textarea
              id="adjustment-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              maxLength={10000}
              rows={3}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm dark:bg-slate-900"
              placeholder="Explain why stock needs to be adjusted"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              className="bg-red-100 text-red-700 hover:bg-red-200"
              type="button"
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
