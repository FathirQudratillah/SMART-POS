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
import { useCreateGoodsReceipt } from "../hooks/useCreateGoodsReceipt";
import { usePurchaseOrders } from "@/features/purchasing/purchase-orders/hooks/usePurchaseOrders";
import { getPurchaseOrder } from "@/features/purchasing/purchase-orders/api/purchaseOrders";
import type { PurchaseOrder } from "@/features/purchasing/purchase-orders/types";
import type { CreateGoodsReceiptRequest } from "../types";
import { toJakartaISOString } from "@/utils/date";
import FormLogo from "@/components/ui/FormLogo";

type Props = { open: boolean; onOpenChange: (open: boolean) => void };
type ReceiptItemForm = {
  purchase_item_id?: number;
  product_id: string;
  quantity_received: string;
  unit_cost: string;
};
const emptyItem: ReceiptItemForm = {
  product_id: "",
  quantity_received: "1",
  unit_cost: "0",
};
const today = () => new Date().toISOString().slice(0, 10);

export default function CreateGoodsReceiptDialog({
  open,
  onOpenChange,
}: Props) {
  const { company, branch } = useAuth();
  const { showMessage } = useAlert();
  const [branchId, setBranchId] = useState("");
  const [warehouseId, setWarehouseId] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [purchaseId, setPurchaseId] = useState("");
  const [selectedPurchase, setSelectedPurchase] =
    useState<PurchaseOrder | null>(null);
  const [isLoadingPurchase, setIsLoadingPurchase] = useState(false);
  const [receiptNo, setReceiptNo] = useState("");
  const [receiptDate, setReceiptDate] = useState(today());
  const [items, setItems] = useState<ReceiptItemForm[]>([{ ...emptyItem }]);
  const [formError, setFormError] = useState("");
  const mutation = useCreateGoodsReceipt();
  const companyId = company?.id ?? null;
  const warehousesQuery = useWarehouses({ companyId, page: 1, per_page: 100 });
  const suppliersQuery = useSuppliers({ companyId, page: 1, per_page: 100 });
  const productsQuery = useProducts({ companyId, page: 1, per_page: 100 });
  const purchaseOrdersQuery = usePurchaseOrders({
    companyId,
    branchId: branch?.id ?? null,
    page: 1,
    per_page: 100,
  });
  const selectedPurchaseId = Number(purchaseId) || 0;

  const warehouses = (warehousesQuery.data?.data.data ?? []).filter(
    (item) => item.is_active && !item.deleted_at,
  );
  const suppliers = (suppliersQuery.data?.data.data ?? []).filter(
    (item) => item.is_active && !item.deleted_at,
  );
  const products = (productsQuery.data?.data.data ?? []).filter(
    (item) => item.is_active && !item.deleted_at,
  );
  const effectiveBranchId =
    selectedPurchase?.branch_id ?? branch?.id ?? (Number(branchId) || null);
  const filteredWarehouses = warehouses.filter(
    (item) => item.branch_id === null || item.branch_id === effectiveBranchId,
  );
  const purchaseOrders = (purchaseOrdersQuery.data?.data.data ?? []).filter(
    (item) => !["received", "cancelled"].includes(item.status),
  );

  const reset = () => {
    setBranchId("");
    setWarehouseId("");
    setSupplierId("");
    setPurchaseId("");
    setSelectedPurchase(null);
    setReceiptNo("");
    setReceiptDate(today());
    setItems([{ ...emptyItem }]);
    setFormError("");
  };
  const close = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen && !mutation.isPending) reset();
  };
  const updateItem = (index: number, patch: Partial<ReceiptItemForm>) =>
    setItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    );

  const choosePurchase = async (value: string) => {
    setPurchaseId(value);
    setFormError("");
    setSelectedPurchase(null);
    if (!value) {
      setItems([{ ...emptyItem }]);
      setBranchId("");
      setWarehouseId("");
      setSupplierId("");
      return;
    }

    if (!companyId) {
      setFormError("Select a company before loading a purchase order.");
      return;
    }

    setIsLoadingPurchase(true);
    try {
      const { data: purchase } = await getPurchaseOrder(
        companyId,
        Number(value),
      );
      const remainingItems = purchase.items
        .map((item) => ({
          purchase_item_id: item.id,
          product_id: String(item.product_id),
          quantity_received: String(
            Math.max(
              0,
              Number(item.quantity) - Number(item.received_quantity ?? 0),
            ),
          ),
          unit_cost: String(item.unit_price),
        }))
        .filter((item) => Number(item.quantity_received) > 0);
      setSelectedPurchase(purchase);
      setItems(remainingItems);
      setBranchId(String(purchase.branch_id));
      setWarehouseId(String(purchase.warehouse_id));
      setSupplierId(String(purchase.supplier_id));
    } catch (error: unknown) {
      setFormError(
        error instanceof Error
          ? error.message
          : "Unable to load the selected purchase order.",
      );
      setPurchaseId("");
    } finally {
      setIsLoadingPurchase(false);
    }
  };
  const chooseProduct = (index: number, productId: string) => {
    const product = products.find((entry) => String(entry.id) === productId);
    updateItem(index, {
      product_id: productId,
      unit_cost: product?.cost_price ?? "0",
    });
  };

  const submit = () => {
    setFormError("");
    if (
      !receiptNo.trim() ||
      !receiptDate ||
      !effectiveBranchId ||
      !warehouseId ||
      !supplierId
    ) {
      setFormError(
        "Complete the receipt number, date, branch, warehouse, and supplier.",
      );
      return;
    }
    if (selectedPurchaseId && isLoadingPurchase) {
      setFormError("Wait for the purchase order details to finish loading.");
      return;
    }
    if (selectedPurchaseId && !selectedPurchase) {
      setFormError("The selected purchase order could not be loaded.");
      return;
    }
    if (
      !items.length ||
      items.some(
        (item) =>
          !item.product_id ||
          !/^(?:\d+(?:\.\d{1,3})?|\.\d{1,3})$/.test(item.quantity_received) ||
          Number(item.quantity_received) <= 0 ||
          !Number.isFinite(Number(item.unit_cost)) ||
          Number(item.unit_cost) < 0,
      )
    ) {
      setFormError(
        "Add at least one product with a positive received quantity (up to 3 decimals) and a valid unit cost.",
      );
      return;
    }

    const payload: CreateGoodsReceiptRequest = {
      branch_id: effectiveBranchId,
      warehouse_id: Number(warehouseId),
      supplier_id: Number(supplierId),
      purchase_id: selectedPurchaseId || null,
      receipt_no: receiptNo.trim(),
      receipt_date: toJakartaISOString(new Date(receiptDate)),
      items: items.map((item) => ({
        ...(item.purchase_item_id
          ? { purchase_item_id: item.purchase_item_id }
          : {}),
        product_id: Number(item.product_id),
        quantity_received: Number(item.quantity_received),
        unit_cost: Number(item.unit_cost),
      })),
    };

    mutation.mutate(payload, {
      onSuccess: (response) => {
        reset();
        onOpenChange(false);
        showMessage({
          variant: "success",
          title: "Goods receipt created",
          description: `${response.data.receipt_no} was saved as a draft. Post it to add received stock.`,
        });
      },
      onError: (error) => {
        const messages = Object.values(error.errors ?? {}).flat();
        setFormError(messages.length ? messages.join("\n") : error.message);
      },
    });
  };

  const canAddProduct = !selectedPurchaseId && items.length < products.length;
  const canSubmit =
    !mutation.isPending &&
    Boolean(
      effectiveBranchId &&
      filteredWarehouses.length &&
      suppliers.length &&
      products.length,
    );

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto bg-white p-0 sm:max-w-4xl dark:bg-slate-950">
        <div className="space-y-6 p-6 sm:p-8">
          <DialogHeader>
            <FormLogo />
            <DialogTitle className="text-2xl font-bold tracking-tight">
              Create Goods Receipt
            </DialogTitle>
            <DialogDescription>
              Save received quantities as a draft. Inventory is updated only
              when the receipt is posted.
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
          {purchaseOrdersQuery.isError && (
            <p role="alert" className="text-sm text-red-700">
              Unable to load purchase orders:{" "}
              {purchaseOrdersQuery.error.message}
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
              <Label htmlFor="receipt-number">Receipt no. *</Label>
              <Input
                id="receipt-number"
                value={receiptNo}
                onChange={(event) => setReceiptNo(event.target.value)}
                maxLength={50}
                placeholder="e.g. GR-2026-001"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receipt-date">Receipt date *</Label>
              <Input
                id="receipt-date"
                type="date"
                value={receiptDate}
                onChange={(event) => setReceiptDate(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="receipt-purchase">Purchase order</Label>
              <select
                id="receipt-purchase"
                value={purchaseId}
                onChange={(event) => void choosePurchase(event.target.value)}
                disabled={purchaseOrdersQuery.isLoading || isLoadingPurchase}
                className="h-9 w-full rounded-md border border-input bg-white px-3 text-sm dark:bg-slate-900"
              >
                <option value="">Direct receipt (no PO)</option>
                {purchaseOrders.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.purchase_no} — {item.supplier?.name ?? "Supplier"} (
                    {item.status.replaceAll("_", " ")})
                  </option>
                ))}
              </select>
              {isLoadingPurchase && (
                <p role="status" className="text-xs text-slate-500">
                  Loading purchase order items...
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="receipt-warehouse">Warehouse *</Label>
              <select
                id="receipt-warehouse"
                value={warehouseId}
                onChange={(event) => setWarehouseId(event.target.value)}
                disabled={
                  !effectiveBranchId ||
                  !!selectedPurchase ||
                  warehousesQuery.isLoading
                }
                className="h-9 w-full rounded-md border border-input bg-white px-3 text-sm dark:bg-slate-900"
              >
                <option value="">Select warehouse</option>
                {filteredWarehouses.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.code} — {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="receipt-supplier">Supplier *</Label>
              <select
                id="receipt-supplier"
                value={supplierId}
                onChange={(event) => setSupplierId(event.target.value)}
                disabled={!!selectedPurchase || suppliersQuery.isLoading}
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
                <h3 className="font-semibold">Received items</h3>
                <p className="text-sm text-slate-500">
                  {selectedPurchase
                    ? `Remaining quantities for ${selectedPurchase.purchase_no}.`
                    : "For direct receipts, choose products and enter quantities."}
                </p>
              </div>
              {canAddProduct && (
                <Button
                  type="button"
                  variant="outline"
                  className="bg-blue-100 text-blue-700 hover:bg-blue-200"
                  size="sm"
                  onClick={() =>
                    setItems((current) => [...current, { ...emptyItem }])
                  }
                >
                  <Plus className="size-4" />
                  Add item
                </Button>
              )}
            </div>
            {selectedPurchase && items.length === 0 && (
              <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                There are no remaining quantities on this purchase order.
              </p>
            )}
            {items.map((item, index) => {
              const used = items
                .filter((_, itemIndex) => itemIndex !== index)
                .map((entry) => entry.product_id);
              const poItem = selectedPurchase?.items.find(
                (entry) => entry.id === item.purchase_item_id,
              );
              return (
                <div
                  key={`${item.purchase_item_id ?? "direct"}-${index}`}
                  className="grid gap-3 rounded-lg border border-slate-200 p-3 sm:grid-cols-[1fr_150px_170px_auto] dark:border-slate-800"
                >
                  <div className="space-y-2">
                    <Label htmlFor={`receipt-product-${index}`}>
                      Product *
                    </Label>
                    <select
                      id={`receipt-product-${index}`}
                      value={item.product_id}
                      onChange={(event) =>
                        chooseProduct(index, event.target.value)
                      }
                      disabled={
                        Boolean(selectedPurchase) || productsQuery.isLoading
                      }
                      className="h-9 w-full rounded-md border border-input bg-white px-3 text-sm dark:bg-slate-900"
                    >
                      <option value="">Select product</option>
                      {(selectedPurchase
                        ? selectedPurchase.items.map((entry) => entry.product)
                        : products
                      )
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
                  <div className="space-y-2">
                    <Label htmlFor={`receipt-qty-${index}`}>
                      Received qty *
                    </Label>
                    <Input
                      id={`receipt-qty-${index}`}
                      type="number"
                      min="0.001"
                      step="0.001"
                      max={
                        poItem
                          ? Math.max(
                              0,
                              Number(poItem.quantity) -
                                Number(poItem.received_quantity ?? 0),
                            )
                          : undefined
                      }
                      value={item.quantity_received}
                      onChange={(event) =>
                        updateItem(index, {
                          quantity_received: event.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`receipt-cost-${index}`}>Unit cost *</Label>
                    <Input
                      id={`receipt-cost-${index}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unit_cost}
                      onChange={(event) =>
                        updateItem(index, { unit_cost: event.target.value })
                      }
                    />
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
              disabled={!canSubmit || isLoadingPurchase}
            >
              {(mutation.isPending || isLoadingPurchase) && (
                <LoaderCircle className="size-4 animate-spin" />
              )}
              Save receipt draft
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
