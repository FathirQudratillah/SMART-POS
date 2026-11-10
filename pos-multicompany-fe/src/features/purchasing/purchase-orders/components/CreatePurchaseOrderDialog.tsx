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
import { useProducts } from "@/features/master/product/hooks/useProducts";
import { useSuppliers } from "@/features/master/suppliers/hooks/useSuppliers";
import { useWarehouses } from "@/features/master/warehouses/hooks/useWarehouses";
import { formatCurrency } from "@/utils/currency";
import { useCreatePurchaseOrder } from "../hooks/useCreatePurchaseOrder";
import type { CreatePurchaseOrderRequest } from "../types";
import { toJakartaISOString } from "@/utils/date";
import FormLogo from "@/components/ui/FormLogo";

type Props = { open: boolean; onOpenChange: (open: boolean) => void };
type PurchaseItemForm = {
  product_id: string;
  quantity: string;
  unit_price: string;
  discount_amount: string;
  tax_amount: string;
};
const emptyItem: PurchaseItemForm = {
  product_id: "",
  quantity: "1",
  unit_price: "0",
  discount_amount: "0",
  tax_amount: "0",
};
const today = () => new Date().toISOString().slice(0, 10);

export default function CreatePurchaseOrderDialog({
  open,
  onOpenChange,
}: Props) {
  const { company, branch } = useAuth();
  const { showMessage } = useAlert();
  const [branchId, setBranchId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [purchaseNo, setPurchaseNo] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(today());
  const [items, setItems] = useState<PurchaseItemForm[]>([{ ...emptyItem }]);
  const [formError, setFormError] = useState("");
  const mutation = useCreatePurchaseOrder();
  const companyId = company?.id ?? null;
  const warehousesQuery = useWarehouses({ companyId, page: 1, per_page: 100 });
  const suppliersQuery = useSuppliers({ companyId, page: 1, per_page: 100 });
  const productsQuery = useProducts({ companyId, page: 1, per_page: 100 });
  const effectiveBranchId = branch?.id ?? (Number(branchId) || null);
  const warehouses = (warehousesQuery.data?.data.data ?? []).filter(
    (item) =>
      item.is_active &&
      !item.deleted_at &&
      (item.branch_id === null || item.branch_id === effectiveBranchId),
  );
  const suppliers = (suppliersQuery.data?.data.data ?? []).filter(
    (item) => item.is_active && !item.deleted_at,
  );
  const products = (productsQuery.data?.data.data ?? []).filter(
    (item) => item.is_active && !item.deleted_at,
  );

  const reset = () => {
    setBranchId("");
    setWarehouseId("");
    setSupplierId("");
    setPurchaseNo("");
    setPurchaseDate(today());
    setItems([{ ...emptyItem }]);
    setFormError("");
  };
  const close = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen && !mutation.isPending) reset();
  };
  const updateItem = (index: number, patch: Partial<PurchaseItemForm>) =>
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );

  const selectProduct = (index: number, productId: string) => {
    const product = products.find((entry) => String(entry.id) === productId);
    updateItem(index, {
      product_id: productId,
      unit_price: product?.cost_price ?? "0",
    });
  };

  const submit = () => {
    setFormError("");
    console.log("purchase date" + purchaseDate);
    if (
      !effectiveBranchId ||
      !warehouseId ||
      !supplierId ||
      !purchaseNo.trim() ||
      !purchaseDate
    ) {
      setFormError(
        "Complete the purchase number, date, branch, warehouse, and supplier.",
      );
      return;
    }
    if (
      items.some(
        (item) =>
          !item.product_id ||
          !/^(?:\d+(?:\.\d{1,3})?|\.\d{1,3})$/.test(item.quantity) ||
          Number(item.quantity) <= 0 ||
          !Number.isFinite(Number(item.unit_price)) ||
          Number(item.unit_price) < 0 ||
          !Number.isFinite(Number(item.discount_amount)) ||
          Number(item.discount_amount) < 0 ||
          !Number.isFinite(Number(item.tax_amount)) ||
          Number(item.tax_amount) < 0,
      )
    ) {
      setFormError(
        "Each item needs a product, positive quantity (up to 3 decimals), and valid price, discount, and tax amounts.",
      );
      return;
    }
    if (new Set(items.map((item) => item.product_id)).size !== items.length) {
      setFormError("Each product can only be added once.");
      return;
    }
    mutation.mutate(
      {
        branch_id: effectiveBranchId,
        warehouse_id: Number(warehouseId),
        supplier_id: Number(supplierId),
        purchase_no: purchaseNo.trim(),
        purchase_date: toJakartaISOString(new Date(purchaseDate)),
        items: items.map((item) => ({
          product_id: Number(item.product_id),
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          discount_amount: Number(item.discount_amount),
          tax_amount: Number(item.tax_amount),
        })),
      } satisfies CreatePurchaseOrderRequest,
      {
        onSuccess: (response) => {
          reset();
          onOpenChange(false);
          showMessage({
            variant: "success",
            title: "Purchase order created",
            description: `${response.data.purchase_no} was saved as a draft.`,
          });
        },
        onError: (error) => {
          const messages = Object.values(error.errors ?? {}).flat();
          setFormError(messages.length ? messages.join("\n") : error.message);
        },
      },
    );
  };

  const subtotal = items.reduce(
    (sum, item) =>
      sum + Number(item.quantity || 0) * Number(item.unit_price || 0),
    0,
  );
  const discount = items.reduce(
    (sum, item) => sum + Number(item.discount_amount || 0),
    0,
  );
  const tax = items.reduce(
    (sum, item) => sum + Number(item.tax_amount || 0),
    0,
  );

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto bg-white p-0 sm:max-w-4xl dark:bg-slate-950">
        <div className="space-y-6 p-6 sm:p-8">
          <DialogHeader>
            <FormLogo />
            <DialogTitle className="text-2xl font-bold tracking-tight">
              Create Purchase Order
            </DialogTitle>
            <DialogDescription>
              Create a draft order for an active supplier. Received quantities
              can be recorded later in Goods Receipts.
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
          {suppliersQuery.isError && (
            <p role="alert" className="text-sm text-red-700">
              Unable to load suppliers: {suppliersQuery.error.message}
            </p>
          )}
          {productsQuery.isError && (
            <p role="alert" className="text-sm text-red-700">
              Unable to load products: {productsQuery.error.message}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="po-number">Purchase order no. *</Label>
              <Input
                id="po-number"
                value={purchaseNo}
                onChange={(event) => setPurchaseNo(event.target.value)}
                maxLength={50}
                placeholder="e.g. PO-2026-001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="po-date">Order date *</Label>
              <Input
                id="po-date"
                type="date"
                value={purchaseDate}
                onChange={(event) => setPurchaseDate(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="po-warehouse">Receiving warehouse *</Label>
              <select
                id="po-warehouse"
                value={warehouseId}
                onChange={(event) => setWarehouseId(event.target.value)}
                disabled={!effectiveBranchId || warehousesQuery.isLoading}
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
              <Label htmlFor="po-supplier">Supplier *</Label>
              <select
                id="po-supplier"
                value={supplierId}
                onChange={(event) => setSupplierId(event.target.value)}
                disabled={suppliersQuery.isLoading}
                className="h-9 w-full rounded-md border border-input bg-white px-3 text-sm dark:bg-slate-900"
              >
                <option value="">Select supplier</option>
                {suppliers.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.code} — {item.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Order items</h3>
                <p className="text-sm text-slate-500">
                  Enter the ordered quantity and amounts per product.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                className="bg-blue-100 text-blue-700 hover:bg-blue-200"
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
              return (
                <div
                  key={index}
                  className="space-y-3 rounded-lg border border-slate-200 p-3 dark:border-slate-800"
                >
                  <div className="flex items-end gap-3">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor={`po-product-${index}`}>Product *</Label>
                      <select
                        id={`po-product-${index}`}
                        value={item.product_id}
                        onChange={(event) =>
                          selectProduct(index, event.target.value)
                        }
                        disabled={productsQuery.isLoading}
                        className="h-9 w-full rounded-md border border-input bg-white px-3 text-sm dark:bg-slate-900"
                      >
                        <option value="">Select product</option>
                        {products
                          .filter(
                            (product) =>
                              !used.includes(String(product.id)) ||
                              String(product.id) === item.product_id,
                          )
                          .map((product) => (
                            <option key={product.id} value={product.id}>
                              {product.sku} — {product.name}
                            </option>
                          ))}
                      </select>
                    </div>
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
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <div className="space-y-2">
                      <Label htmlFor={`po-qty-${index}`}>Quantity *</Label>
                      <Input
                        id={`po-qty-${index}`}
                        type="number"
                        min="0.001"
                        step="0.001"
                        value={item.quantity}
                        onChange={(event) =>
                          updateItem(index, { quantity: event.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`po-price-${index}`}>Unit price *</Label>
                      <Input
                        id={`po-price-${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unit_price}
                        onChange={(event) =>
                          updateItem(index, { unit_price: event.target.value })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`po-discount-${index}`}>Discount</Label>
                      <Input
                        id={`po-discount-${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.discount_amount}
                        onChange={(event) =>
                          updateItem(index, {
                            discount_amount: event.target.value,
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`po-tax-${index}`}>Tax</Label>
                      <Input
                        id={`po-tax-${index}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.tax_amount}
                        onChange={(event) =>
                          updateItem(index, { tax_amount: event.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
          <div className="ml-auto max-w-xs space-y-1 rounded-lg bg-slate-50 p-4 text-sm dark:bg-slate-900">
            <p className="flex justify-between">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </p>
            <p className="flex justify-between">
              <span>Discount</span>
              <span>{formatCurrency(discount)}</span>
            </p>
            <p className="flex justify-between">
              <span>Tax</span>
              <span>{formatCurrency(tax)}</span>
            </p>
            <p className="flex justify-between border-t pt-2 font-semibold">
              <span>Total</span>
              <span>{formatCurrency(subtotal - discount + tax)}</span>
            </p>
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
              type="button"
              variant="outline"
              className="bg-blue-100 text-blue-700 hover:bg-blue-200"
              onClick={submit}
              disabled={
                mutation.isPending ||
                !effectiveBranchId ||
                !warehouses.length ||
                !suppliers.length ||
                !products.length
              }
            >
              {mutation.isPending && (
                <LoaderCircle className="size-4 animate-spin" />
              )}
              Save purchase order
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
