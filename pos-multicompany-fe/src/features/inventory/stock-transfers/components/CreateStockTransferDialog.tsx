import {  useState } from "react";
import { LoaderCircle, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/auth/AuthContext";
import { useAlert } from "@/context/AlertContext";
import { useWarehouses } from "@/features/master/warehouses/hooks/useWarehouses";
import { useCreateStockTransfer } from "../hooks/useCreateStockTransfer";
import type { CreateStockTransferRequest } from "../types";
import { useStockOverview } from "../../stock-overview/hooks/useStockOverview";
import FormLogo from "@/components/ui/FormLogo";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type FormItem = { product_id: string; quantity: string };
const emptyItem: FormItem = { product_id: "", quantity: "1" };

export default function CreateStockTransferDialog({ open, onOpenChange }: Props) {
  const { company, branch } = useAuth();
  const { showMessage } = useAlert();
  const [sourceId, setSourceId] = useState("");
  const [destinationId, setDestinationId] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<FormItem[]>([{ ...emptyItem }]);
  const [formError, setFormError] = useState("");
  const createMutation = useCreateStockTransfer();
  const {
    data: warehousesResponse,
    isLoading: isLoadingWarehouses,
    isError: isWarehousesError,
    error: warehousesError,
  } = useWarehouses({
    companyId: company?.id ?? null,
    page: 1,
    per_page: 100,
  });
  const {
    data: productsResponse,
    isLoading: isLoadingProducts,
    isError: isProductsError,
    error: productsError,
  } = useStockOverview({
    companyId: company?.id ?? null,
    branchId: branch?.id ?? null,
    warehouseId: sourceId ? Number(sourceId) : null,
    page: 1,
    per_page: 100,
  });

  const warehouses = (warehousesResponse?.data.data ?? []).filter(
    (warehouse) => warehouse.branch_id === branch?.id && warehouse.is_active && !warehouse.deleted_at,
  );
  const products = (productsResponse?.data.data ?? []).filter(
    (product) => product.quantity != 0 && product.product.is_active && !product.product.deleted_at,
  );
  

  const closeDialog = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen && !createMutation.isPending) {
      resetForm();
    }
  };

  const resetForm = () => {
    setSourceId("");
    setDestinationId("");
    setNotes("");
    setItems([{ ...emptyItem }]);
    setFormError("");
  };

  const updateItem = (index: number, patch: Partial<FormItem>) => {
    setItems((current) => current.map((item, itemIndex) =>
      itemIndex === index ? { ...item, ...patch } : item,
    ));
  };

  const submit = () => {
    setFormError("");
    if (!sourceId || !destinationId) {
      setFormError("Select both the source and destination warehouses.");
      return;
    }
    if (sourceId === destinationId) {
      setFormError("Source and destination warehouses must be different.");
      return;
    }
    if (items.some((item) =>
      !item.product_id ||
      !/^(?:\d+(?:\.\d{1,3})?|\.\d{1,3})$/.test(item.quantity) ||
      !Number.isFinite(Number(item.quantity)) ||
      Number(item.quantity) <= 0,
    )) {
      setFormError("Choose a product and enter a quantity greater than zero with up to 3 decimal places for every line.");
      return;
    }
    const productIds = items.map((item) => item.product_id);
    if (new Set(productIds).size !== productIds.length) {
      setFormError("Each product can only be added once.");
      return;
    }

    const payload: CreateStockTransferRequest = {
      source_warehouse_id: Number(sourceId),
      destination_warehouse_id: Number(destinationId),
      notes: notes.trim() || undefined,
      items: items.map((item) => ({
        product_id: Number(item.product_id),
        quantity: Number(item.quantity),
      })),
    };

    createMutation.mutate(payload, {
      onSuccess: (response) => {
        resetForm();
        onOpenChange(false);
        showMessage({
          variant: "success",
          title: "Stock transfer created",
          description: `${response.data.transfer_no} was saved as a draft. Post it to move stock.`,
        });
      },
      onError: (error) => {
        const validationErrors = Object.values(error.errors ?? {}).flat();
        setFormError(validationErrors.length ? validationErrors.join("\n") : error.message);
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={closeDialog}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto bg-white p-0 sm:max-w-3xl dark:bg-slate-950">
        <div className="space-y-6 p-6 sm:p-8">
          <DialogHeader>
            <FormLogo />
            <DialogTitle className="text-2xl font-bold tracking-tight">
              Create Stock Transfer
            </DialogTitle>
            <DialogDescription>
              Save a draft first. Stock changes only after the transfer is
              posted.
            </DialogDescription>
          </DialogHeader>

          {formError && (
            <div
              role="alert"
              className="whitespace-pre-line rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
            >
              {formError}
            </div>
          )}
          {isWarehousesError && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
            >
              Unable to load warehouses:{" "}
              {warehousesError instanceof Error
                ? warehousesError.message
                : "Please try again."}
            </p>
          )}
          {isProductsError && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
            >
              Unable to load products:{" "}
              {productsError instanceof Error
                ? productsError.message
                : "Please try again."}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="transfer-source">Source warehouse *</Label>
              <select
                id="transfer-source"
                value={sourceId}
                onChange={(event) => setSourceId(event.target.value)}
                disabled={isLoadingWarehouses}
                className="h-9 w-full rounded-md border border-input bg-white px-3 text-sm dark:bg-slate-900"
              >
                <option value="">Select source warehouse</option>
                {warehouses.map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.code} — {warehouse.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="transfer-destination">
                Destination warehouse *
              </Label>
              <select
                id="transfer-destination"
                value={destinationId}
                onChange={(event) => setDestinationId(event.target.value)}
                disabled={isLoadingWarehouses}
                className="h-9 w-full rounded-md border border-input bg-white px-3 text-sm dark:bg-slate-900"
              >
                <option value="">Select destination warehouse</option>
                {warehouses
                  .filter((warehouse) => String(warehouse.id) !== sourceId)
                  .map((warehouse) => (
                    <option key={warehouse.id} value={warehouse.id}>
                      {warehouse.code} — {warehouse.name}
                    </option>
                  ))}
              </select>
              {!isLoadingWarehouses && warehouses.length < 2 && (
                <p className="text-xs text-amber-700">
                  At least two active warehouses are required.
                </p>
              )}
            </div>
          </div>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Products</h3>
                <p className="text-sm text-slate-500">
                  Enter quantities to move.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="bg-blue-100 text-blue-700 hover:bg-blue-200"
                disabled={
                  isLoadingProducts ||
                  products.length === 0 ||
                  items.length >= products.length
                }
                onClick={() =>
                  setItems((current) => [...current, { ...emptyItem }])
                }
              >
                <Plus className="size-4" /> Add item
              </Button>
            </div>
            <div className="space-y-3">
              {items.map((item, index) => {
                const selectedIds = items
                  .filter((_, itemIndex) => itemIndex !== index)
                  .map((selected) => selected.product_id);

                const selectedProduct = products.find(
                  (p) => String(p.product.id) === item.product_id,
                );

                return (
                  <div
                    key={index}
                    className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:grid-cols-[1fr_150px_auto] dark:border-slate-800"
                  >
                    {/* Product */}
                    <div className="space-y-2">
                      <Label htmlFor={`transfer-product-${index}`}>
                        Product *
                      </Label>

                      <select
                        id={`transfer-product-${index}`}
                        value={item.product_id}
                        onChange={(event) =>
                          updateItem(index, {
                            product_id: event.target.value,
                            quantity: "",
                          })
                        }
                        disabled={isLoadingProducts || sourceId === ""}
                        className="h-9 w-full rounded-md border border-input bg-white px-3 text-sm disabled:text-slate-400 dark:bg-slate-900"
                      >
                        <option value="">
                          {isLoadingProducts
                            ? "Loading products..."
                            : "Select product"}
                        </option>

                        {products
                          .filter(
                            (product) =>
                              !selectedIds.includes(
                                String(product.product.id),
                              ) ||
                              String(product.product.id) === item.product_id,
                          )
                          .map((product) => (
                            <option
                              key={product.product.id}
                              value={String(product.product.id)}
                            >
                              {product.product.sku} — {product.product.name}
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* Quantity */}
                    <div className="space-y-2">
                      <Label htmlFor={`transfer-quantity-${index}`}>
                        Quantity *
                      </Label>

                      <Input
                        id={`transfer-quantity-${index}`}
                        type="number"
                        min="1"
                        step="1"
                        max={selectedProduct?.quantity ?? undefined}
                        value={item.quantity}
                        placeholder="Quantity"
                        disabled={
                          isLoadingProducts ||
                          sourceId === "" ||
                          !selectedProduct ||
                          selectedProduct.quantity === 0
                        }
                        onChange={(event) =>
                          updateItem(index, {
                            quantity: event.target.value,
                          })
                        }
                      />

                      {selectedProduct && (
                        <p className="text-xs text-muted-foreground">
                          Available: {selectedProduct.quantity}
                        </p>
                      )}
                    </div>

                    {/* Remove */}
                    <div className="flex items-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Remove item"
                        disabled={items.length === 1}
                        onClick={() =>
                          setItems((current) =>
                            current.filter(
                              (_, itemIndex) => itemIndex !== index,
                            ),
                          )
                        }
                      >
                        <Trash2 className="size-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                );
              })}{" "}
              {!isLoadingProducts && products.length === 0 && (
                <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                  No active products are available.
                </p>
              )}
            </div>
          </section>

          <div className="space-y-2">
            <Label htmlFor="transfer-notes">Notes</Label>
            <textarea
              id="transfer-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              maxLength={10000}
              rows={3}
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-slate-900"
              placeholder="Optional notes"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="bg-red-100 text-red-700 hover:bg-red-200"
              onClick={() => closeDialog(false)}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={submit}
              variant="outline"
              className="bg-blue-100 text-blue-700 hover:bg-blue-200"
              disabled={
                createMutation.isPending ||
                warehouses.length < 2 ||
                products.length === 0
              }
            >
              {createMutation.isPending && (
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
