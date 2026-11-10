import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Banknote,
  Image as ImageIcon,
  LoaderCircle,
  LockKeyhole,
  Minus,
  Plus,
  Search,
  ShoppingCart,
} from "lucide-react";
import { Link } from "react-router-dom";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAlert } from "@/context/AlertContext";
import { useAuth } from "@/context/auth/AuthContext";
import { useCustomers } from "@/features/master/customers/hooks/useCustomers";
import { getStockOverview } from "@/features/inventory/stock-overview/api/getStockOverview";
import type { StockOverviewItem } from "@/features/inventory/stock-overview/types";
import { formatCurrency } from "@/utils/currency";
import {
  closeCashierShift,
  getOpenCashierShift,
  getPaymentMethods,
  startCashierShift,
} from "../api/sales";
import { useCompleteSale } from "../hooks/useCompleteSale";
import { useCreateSale } from "../hooks/useCreateSale";
import type { ApiErrorResponse } from "@/types";
import type {
  CashierShiftResponse,
  CreateSaleRequest,
  Sale,
  SaleResponse,
} from "../types";
import { toJakartaISOString } from "@/utils/date";

type CartItem = { productId: number; quantity: number };
type BranchProduct = {
  product: StockOverviewItem["product"];
  quantity: number;
  stockByWarehouse: { warehouseId: number; quantity: number }[];
};
const createInvoiceNumber = () =>
  `POS-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

function getErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "errors" in error) {
    const errors = (error as ApiErrorResponse).errors;
    const messages = Object.values(errors ?? {}).flat();
    if (messages.length) return messages.join("\n");
  }
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }
  return "The sale could not be completed. Please try again.";
}

function POSInvoice({
  sale,
  companyName,
}: {
  sale: Sale;
  companyName: string;
}) {
  return (
    <article className="pos-print-invoice hidden">
      <header className="border-b border-slate-300 pb-4 text-center">
        <h1 className="text-xl font-bold">{companyName || "SMART POS"}</h1>
        <p className="mt-1 text-sm">Sales invoice</p>
        <p className="mt-2 font-mono text-lg font-semibold">{sale.invoice_no}</p>
      </header>

      <div className="grid grid-cols-2 gap-4 border-b border-slate-200 py-4 text-sm">
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">Customer</p>
          <p className="mt-1 font-medium">{sale.customer?.name ?? "Walk-in customer"}</p>
          {sale.customer?.phone && <p>{sale.customer.phone}</p>}
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">Date</p>
          <p className="mt-1">
            {new Intl.DateTimeFormat("id-ID", {
              dateStyle: "medium",
              timeStyle: "short",
            }).format(new Date(sale.sale_date))}
          </p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">Branch</p>
          <p className="mt-1">{sale.branch.name}</p>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-slate-500">Cashier</p>
          <p className="mt-1">{sale.creator?.name ?? "—"}</p>
        </div>
      </div>

      <table className="mt-4 w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-300 text-xs uppercase text-slate-500">
            <th className="py-2 pr-2">Product</th>
            <th className="px-2 py-2 text-right">Qty</th>
            <th className="px-2 py-2 text-right">Price</th>
            <th className="py-2 pl-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {sale.items.map((item) => (
            <tr key={item.id} className="border-b border-slate-100">
              <td className="py-2 pr-2">
                <p className="font-medium">{item.product_name}</p>
                <p className="text-xs text-slate-500">{item.sku}</p>
              </td>
              <td className="px-2 py-2 text-right tabular-nums">
                {Number(item.quantity).toLocaleString("id-ID", {
                  maximumFractionDigits: 3,
                })}{" "}
                {item.product?.unit ?? ""}
              </td>
              <td className="px-2 py-2 text-right">
                {formatCurrency(Number(item.unit_price))}
              </td>
              <td className="py-2 pl-2 text-right font-medium">
                {formatCurrency(Number(item.line_total))}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="ml-auto mt-4 w-full max-w-xs space-y-2 text-sm">
        <p className="flex justify-between">
          <span>Subtotal</span>
          <span>{formatCurrency(Number(sale.subtotal))}</span>
        </p>
        <p className="flex justify-between">
          <span>Discount</span>
          <span>{formatCurrency(Number(sale.discount_amount))}</span>
        </p>
        <p className="flex justify-between">
          <span>Tax</span>
          <span>{formatCurrency(Number(sale.tax_amount))}</span>
        </p>
        <p className="flex justify-between border-t border-slate-300 pt-2 text-base font-bold">
          <span>Total</span>
          <span>{formatCurrency(Number(sale.total_amount))}</span>
        </p>
        <p className="flex justify-between">
          <span>Paid</span>
          <span>{formatCurrency(Number(sale.paid_amount))}</span>
        </p>
        {Number(sale.change_amount) > 0 && (
          <p className="flex justify-between">
            <span>Change</span>
            <span>{formatCurrency(Number(sale.change_amount))}</span>
          </p>
        )}
      </div>

      {sale.payments.length > 0 && (
        <div className="mt-4 border-t border-slate-200 pt-3 text-sm">
          <p className="mb-2 font-semibold">Payment</p>
          {sale.payments.map((payment) => (
            <p key={payment.id} className="flex justify-between gap-3">
              <span>
                {payment.payment_method?.name ?? "Payment"}
                {payment.reference_no ? ` · ${payment.reference_no}` : ""}
              </span>
              <span>{formatCurrency(Number(payment.amount))}</span>
            </p>
          ))}
        </div>
      )}

      <footer className="mt-6 border-t border-slate-200 pt-3 text-center text-xs text-slate-500">
        Thank you for your purchase.
      </footer>
    </article>
  );
}

export default function POSPage() {
  const { company, branch } = useAuth();
  const { showConfirm, showMessage } = useAlert();
  const [customerId, setCustomerId] = useState("");
  const [search, setSearch] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [amountTendered, setAmountTendered] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [openingCash, setOpeningCash] = useState("0.00");
  const [closingCash, setClosingCash] = useState("");
  const [shiftError, setShiftError] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [pendingSale, setPendingSale] = useState<Sale | null>(null);
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const lastPrintedSaleId = useRef<number | null>(null);
  const [formError, setFormError] = useState("");
  const queryClient = useQueryClient();
  const createMutation = useCreateSale();
  const completeMutation = useCompleteSale();
  const companyId = company?.id ?? null;
  const branchId = branch?.id ?? null;

  useEffect(() => {
    if (!completedSale || lastPrintedSaleId.current === completedSale.id) return;
    lastPrintedSaleId.current = completedSale.id;
    window.print();
  }, [completedSale]);

  const customersQuery = useCustomers({ companyId, page: 1, per_page: 100 });
  const customers = (customersQuery.data?.data.data ?? []).filter(
    (item) => item.is_active && !item.deleted_at,
  );
  const stocksQuery = useQuery({
    queryKey: ["POSBranchStock", companyId, branchId],
    queryFn: async () => {
      if (companyId === null || branchId === null)
        throw new Error("No branch is assigned to this user.");
      const rows: StockOverviewItem[] = [];
      let page = 1;
      while (true) {
        const response = await getStockOverview({
          companyId,
          branchId,
          page,
          per_page: 100,
        });
        rows.push(...response.data.data);
        if (page >= response.data.last_page) break;
        page += 1;
      }
      return rows;
    },
    enabled: companyId !== null && branchId !== null,
  });
  const products = [
    ...(stocksQuery.data ?? [])
      .reduce((productMap, row) => {
        if (!row.product.is_active || row.product.deleted_at) return productMap;
        const availableQuantity = Math.max(0, Number(row.quantity));
        const product = productMap.get(row.product_id);
        if (product) {
          product.quantity += availableQuantity;
          product.stockByWarehouse.push({
            warehouseId: row.warehouse_id,
            quantity: availableQuantity,
          });
        } else {
          productMap.set(row.product_id, {
            product: row.product,
            quantity: availableQuantity,
            stockByWarehouse: [
              { warehouseId: row.warehouse_id, quantity: availableQuantity },
            ],
          });
        }
        return productMap;
      }, new Map<number, BranchProduct>())
      .values(),
  ];
  const visibleProducts = products.filter((stock) => {
    const term = search.trim().toLocaleLowerCase();
    return (
      !term ||
      stock.product.name.toLocaleLowerCase().includes(term) ||
      stock.product.sku.toLocaleLowerCase().includes(term)
    );
  });
  const shiftQuery = useQuery({
    queryKey: ["OpenCashierShift", companyId, branchId],
    queryFn: () => getOpenCashierShift(companyId!, branchId!),
    enabled: companyId !== null && branchId !== null,
  });
  const openShiftMutation = useMutation<
    CashierShiftResponse,
    ApiErrorResponse,
    number
  >({
    mutationFn: (amount) => {
      if (companyId === null || branchId === null) {
        throw new Error(
          "Your account must be assigned to a branch before opening a cashier shift.",
        );
      }
      return startCashierShift(companyId, {
        branch_id: branchId,
        opening_cash: amount,
      });
    },
    onSuccess: (response) => {
      queryClient.setQueryData(
        ["OpenCashierShift", companyId, branchId],
        response,
      );
      setFormError("");
      showMessage({
        variant: "success",
        title: "Cashier shift opened",
        description: "You can now make sales for this branch.",
      });
    },
  });
  const shift = shiftQuery.data?.data ?? null;
  const closeShiftMutation = useMutation<
    CashierShiftResponse,
    ApiErrorResponse,
    { shiftId: number; closingCash: number }
  >({
    mutationFn: ({ shiftId, closingCash: amount }) => {
      if (companyId === null)
        throw new Error("Select a company before closing a shift.");
      return closeCashierShift(companyId, shiftId, amount);
    },
    onSuccess: (response) => {
      queryClient.setQueryData(["OpenCashierShift", companyId, branchId], {
        ...response,
        data: null,
        message: "No open cashier shift found.",
      });
      setClosingCash("");
      setShiftError("");
      showMessage({
        variant: "success",
        title: "Cashier shift closed",
        description: `Expected: ${formatCurrency(Number(response.data?.expected_cash ?? 0))} · Counted: ${formatCurrency(Number(response.data?.closing_cash ?? 0))} · Variance: ${formatCurrency(Number(response.data?.closing_cash ?? 0) - Number(response.data?.expected_cash ?? 0))}.`,
      });
    },
    onError: (error) => setShiftError(getErrorMessage(error)),
  });
  const paymentMethodsQuery = useQuery({
    queryKey: ["PaymentMethods", companyId],
    queryFn: () => getPaymentMethods(companyId!),
    enabled: companyId !== null,
  });
  const paymentMethods = (paymentMethodsQuery.data?.data ?? []).filter(
    (method) => method.is_active && !method.deleted_at,
  );
  const selectedPaymentMethod = paymentMethods.find(
    (method) => String(method.id) === paymentMethodId,
  );
  const cartDetails = cart
    .map((item) => {
      const stock = products.find(
        (entry) => entry.product.id === item.productId,
      );
      return stock
        ? {
            ...item,
            stock,
            lineTotal: item.quantity * Number(stock.product.selling_price),
          }
        : null;
    })
    .filter(
      (item): item is CartItem & { stock: BranchProduct; lineTotal: number } =>
        item !== null,
    );
  const total = cartDetails.reduce((sum, item) => sum + item.lineTotal, 0);
  const tendered = Number(amountTendered) || 0;
  const change = Math.max(0, tendered - total);
  const busy =
    createMutation.isPending ||
    completeMutation.isPending ||
    openShiftMutation.isPending ||
    closeShiftMutation.isPending;
  const locked = pendingSale !== null;

  const resetOrder = () => {
    setCustomerId("");
    setPaymentMethodId("");
    setAmountTendered("");
    setReferenceNo("");
    setCart([]);
    setPendingSale(null);
    setFormError("");
  };

  const addProduct = (stock: BranchProduct) => {
    if (locked) return;
    setCart((current) => {
      const existing = current.find(
        (item) => item.productId === stock.product.id,
      );
      if (!existing)
        return [...current, { productId: stock.product.id, quantity: 1 }];
      if (existing.quantity >= Number(stock.quantity)) return current;
      return current.map((item) =>
        item.productId === stock.product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      );
    });
  };

  const setQuantity = (productId: number, quantity: number) => {
    const stock = products.find((item) => item.product.id === productId);
    if (!stock) return;
    if (quantity <= 0) {
      setCart((current) =>
        current.filter((item) => item.productId !== productId),
      );
      return;
    }
    if (quantity > Number(stock.quantity)) return;
    setCart((current) =>
      current.map((item) =>
        item.productId === productId ? { ...item, quantity } : item,
      ),
    );
  };

  const validateCheckout = () => {
    if (!branchId || !shift) {
      setFormError(
        "Your account must have a branch and an open cashier shift before checkout.",
      );
      return false;
    }
    if (!cartDetails.length) {
      setFormError("Add at least one product to the cart.");
      return false;
    }
    if (!selectedPaymentMethod) {
      setFormError("Select a payment method.");
      return false;
    }
    if (!Number.isFinite(tendered) || tendered < total) {
      setFormError("Amount received must be at least the total due.");
      return false;
    }
    if (
      selectedPaymentMethod.type.toLowerCase() !== "cash" &&
      tendered !== total
    ) {
      setFormError(
        "For non-cash payments, amount received must equal the total due.",
      );
      return false;
    }
    return true;
  };

  const finishPayment = async (sale: Sale) => {
    if (!validateCheckout()) return;
    setFormError("");
    try {
      const response = await completeMutation.mutateAsync({
        id: sale.id,
        payload: {
          payment_method_id: Number(paymentMethodId),
          amount_tendered: tendered,
          reference_no: referenceNo.trim() || undefined,
        },
      });
      showMessage({
        variant: "success",
        title: "Payment complete",
        description: `${response.data.invoice_no} completed. Change: ${formatCurrency(Number(response.data.change_amount))}.`,
      });
      setCompletedSale(response.data);
      resetOrder();
      queryClient.invalidateQueries({
        queryKey: ["POSBranchStock", companyId, branchId],
      });
      queryClient.invalidateQueries({
        queryKey: ["OpenCashierShift", companyId, branchId],
      });
    } catch (error: unknown) {
      setFormError(
        `${getErrorMessage(error)}\nDraft ${sale.invoice_no} was saved. Update payment details and try checkout again.`,
      );
    }
  };

  const checkout = async () => {
    if (!validateCheckout()) return;
    if (pendingSale) {
      await finishPayment(pendingSale);
      return;
    }

    setFormError("");
    const saleItems: {
      product_id: number;
      warehouse_id: number;
      quantity: number;
    }[] = [];
    for (const item of cartDetails) {
      let remainingMilliUnits = Math.round(item.quantity * 1000);
      for (const stock of [...item.stock.stockByWarehouse].sort(
        (left, right) => left.warehouseId - right.warehouseId,
      )) {
        const availableMilliUnits = Math.round(stock.quantity * 1000);
        const allocatedMilliUnits = Math.min(
          remainingMilliUnits,
          availableMilliUnits,
        );
        if (allocatedMilliUnits > 0) {
          saleItems.push({
            product_id: item.productId,
            warehouse_id: stock.warehouseId,
            quantity: allocatedMilliUnits / 1000,
          });
          remainingMilliUnits -= allocatedMilliUnits;
        }
        if (remainingMilliUnits === 0) break;
      }
      if (remainingMilliUnits > 0) {
        setFormError(
          `Available stock for ${item.stock.product.name} changed. Refresh the page and review the order.`,
        );
        void stocksQuery.refetch();
        return;
      }
    }
    const primaryWarehouseId = saleItems[0]?.warehouse_id;
    if (!primaryWarehouseId) {
      setFormError("No branch warehouse has available stock for this order.");
      return;
    }
    const invoiceNo = createInvoiceNumber();
    const payload: CreateSaleRequest = {
      branch_id: branchId!,
      warehouse_id: primaryWarehouseId,
      cashier_shift_id: shift!.id,
      customer_id: Number(customerId) || null,
      invoice_no: invoiceNo,
      sale_date: toJakartaISOString(new Date()),
      items: saleItems,
    };
    try {
      const draftResponse: SaleResponse =
        await createMutation.mutateAsync(payload);
      setPendingSale(draftResponse.data);
      await finishPayment(draftResponse.data);
    } catch (error: unknown) {
      setFormError(getErrorMessage(error));
    }
  };

  const openShift = () => {
    setFormError("");
    if (
      !/^\d+(?:\.\d{1,2})?$/.test(openingCash) ||
      !Number.isFinite(Number(openingCash)) ||
      Number(openingCash) < 0
    ) {
      setFormError(
        "Enter a non-negative opening cash amount with up to 2 decimal places.",
      );
      return;
    }
    openShiftMutation.mutate(Number(openingCash), {
      onError: (error) => {
        setFormError(getErrorMessage(error));
        void shiftQuery.refetch();
      },
    });
  };

  const closeShift = async () => {
    if (!shift) return;
    const amount = Number(closingCash);
    if (
      !/^\d+(?:\.\d{1,2})?$/.test(closingCash) ||
      !Number.isFinite(amount) ||
      amount < 0
    ) {
      setShiftError(
        "Enter the counted closing cash with up to 2 decimal places.",
      );
      return;
    }
    const expected = Number(shift.expected_cash ?? shift.opening_cash);
    const confirmed = await showConfirm({
      title: "Close cashier shift?",
      description: `Expected cash is ${formatCurrency(expected)}. Closing with ${formatCurrency(amount)} will record a variance of ${formatCurrency(amount - expected)}. Draft sales must be completed before the shift can close.`,
      confirmText: "Close shift",
    });
    if (!confirmed) return;
    setShiftError("");
    closeShiftMutation.mutate({ shiftId: shift.id, closingCash: amount });
  };

  const setQuickCash = (amount: number) => setAmountTendered(amount.toFixed(2));
  const quickCashAmounts = [
    ...new Set([total, Math.ceil(total / 10000) * 10000, 50000, 100000]),
  ]
    .filter((amount) => amount >= total)
    .sort((left, right) => left - right)
    .slice(0, 4);

  return (
    <>
    <div className="pos-page -m-4 flex min-h-[calc(100dvh-3.5rem)] flex-col overflow-hidden bg-slate-100 md:-m-6 dark:bg-slate-950">
      {/* Header */}
      <header className="z-10 flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 shadow-sm sm:px-6 dark:border-slate-800 dark:bg-slate-950">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            to="/sales"
            aria-label="Back to sales"
            className={buttonVariants({ variant: "outline", size: "icon" })}
          >
            <ArrowLeft className="size-4" />
          </Link>
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm shadow-blue-600/20">
            <ShoppingCart className="size-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold tracking-tight text-slate-950 sm:text-lg dark:text-white">
              Point of Sale
            </h1>
            <p className="truncate text-xs text-slate-500 sm:text-sm">
              {branch
                ? `${branch.code} · ${branch.name}`
                : "No branch assigned to your account"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {shift && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Shift open
            </span>
          )}
          {pendingSale && (
            <span className="max-w-52 truncate rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-300">
              Draft · {pendingSale.invoice_no}
            </span>
          )}
        </div>
      </header>

      <main className="grid min-h-0 flex-1 lg:grid-cols-[minmax(0,1fr)_440px]">
        {/* Product browser */}
        <section className="flex min-h-[440px] min-w-0 flex-col border-b border-slate-200 lg:min-h-0 lg:border-b-0 lg:border-r dark:border-slate-800">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-4 sm:px-6 dark:border-slate-800 dark:bg-slate-950">
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">
                Products
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Select a product to add it to the current order.
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {visibleProducts.length} products
            </span>
          </div>

          <div className="border-b border-slate-200 bg-white px-4 py-3 sm:px-6 dark:border-slate-800 dark:bg-slate-950">
            <div className="relative max-w-2xl">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                disabled={!branchId}
                placeholder="Search by product name or SKU..."
                className="h-11 rounded-xl border-slate-200 bg-slate-50 pl-9 focus-visible:bg-white dark:border-slate-700 dark:bg-slate-900"
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
            {stocksQuery.isError && (
              <p
                role="alert"
                className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
              >
                Unable to load stock: {stocksQuery.error.message}
              </p>
            )}

            {!branchId ? (
              <div
                role="alert"
                className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-amber-300 bg-amber-50/70 p-6 text-center dark:border-amber-900 dark:bg-amber-950/20"
              >
                <LockKeyhole className="mb-3 size-8 text-amber-600" />
                <p className="font-semibold text-slate-800 dark:text-slate-100">
                  Branch assignment required
                </p>
                <p className="mt-1 max-w-sm text-sm text-slate-500">
                  Your account is not assigned to a branch. Contact an
                  administrator to continue.
                </p>
              </div>
            ) : stocksQuery.isLoading ? (
              <div
                role="status"
                className="flex min-h-56 items-center justify-center gap-2 text-sm text-slate-500"
              >
                <LoaderCircle className="size-5 animate-spin" />
                Loading products...
              </div>
            ) : visibleProducts.length ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {visibleProducts.map((stock) => {
                  const cartItem = cart.find(
                    (item) => item.productId === stock.product.id,
                  );
                  const available = Number(stock.quantity);
                  const outOfStock = available <= 0;
                  const atLimit = (cartItem?.quantity ?? 0) >= available;

                  return (
                    <button
                      key={stock.product.id}
                      type="button"
                      onClick={() => addProduct(stock)}
                      disabled={locked || atLimit || outOfStock}
                      className="group relative flex min-h-40 flex-col justify-between overflow-hidden rounded-2xl border border-slate-200 bg-white p-3.5 text-left shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-blue-800"
                    >
                      {cartItem && (
                        <span className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                          {cartItem.quantity}
                        </span>
                      )}
                      <div className="mb-3 flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
                        {stock.product.image_url ? (
                          <img
                            src={stock.product.image_url}
                            alt={stock.product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <ImageIcon
                            aria-hidden="true"
                            className="size-8 text-slate-400"
                          />
                        )}
                      </div>
                      <div className="min-w-0 pr-7">
                        <p className="line-clamp-2 text-sm font-semibold leading-5 text-slate-900 dark:text-slate-100">
                          {stock.product.name}
                        </p>
                        <p className="mt-1.5 truncate font-mono text-[11px] text-slate-400">
                          {stock.product.sku}
                        </p>
                      </div>
                      <div className="mt-5">
                        <p className="font-bold tracking-tight text-blue-700 dark:text-blue-300">
                          {formatCurrency(Number(stock.product.selling_price))}
                        </p>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <span
                            className={`rounded-full px-2 py-1 text-[10px] font-semibold ${outOfStock ? "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300" : available <= 5 ? "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300" : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"}`}
                          >
                            {outOfStock
                              ? "Out of stock"
                              : `${available.toLocaleString("en", { maximumFractionDigits: 3 })} in stock`}
                          </span>
                          <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700 transition group-hover:bg-blue-600 group-hover:text-white dark:bg-blue-950 dark:text-blue-300">
                            <Plus className="size-4" />
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white px-6 text-center dark:border-slate-700 dark:bg-slate-900/50">
                <Search className="mb-3 size-8 text-slate-300" />
                <p className="font-medium text-slate-700 dark:text-slate-200">
                  {search ? "No matching products" : "No available products"}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {search
                    ? "Try another product name or SKU."
                    : "There are currently no available products in this branch."}
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Checkout panel */}
        <aside className="flex min-h-[620px] min-w-0 flex-col bg-white lg:min-h-0 dark:bg-slate-950">
          <div className="shrink-0 border-b border-slate-200 px-4 py-4 sm:px-5 dark:border-slate-800">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-white">
                  Checkout
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  Customer and cashier details
                </p>
              </div>
              <span className="rounded-lg bg-blue-50 p-2 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                <ShoppingCart className="size-4" />
              </span>
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="pos-customer"
                className="text-xs font-semibold text-slate-600 dark:text-slate-300"
              >
                Customer
              </Label>
              <select
                id="pos-customer"
                value={customerId}
                onChange={(event) => setCustomerId(event.target.value)}
                disabled={customersQuery.isLoading || locked}
                className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 disabled:opacity-60 dark:border-slate-700 dark:bg-slate-900"
              >
                <option value="">
                  {customersQuery.isLoading
                    ? "Loading customers..."
                    : customers.length === 0
                      ? "No customer"
                      : "Choose Customers"}
                </option>
                {customers.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.code} — {item.name}
                  </option>
                ))}
              </select>
              {customersQuery.isError && (
                <p role="alert" className="text-xs text-red-700">
                  Unable to load customers: {customersQuery.error.message}
                </p>
              )}
              {!customersQuery.isLoading &&
                !customersQuery.isError &&
                customers.length === 0 && (
                  <p className="text-xs text-slate-500">
                    No active customers found. You can continue as a walk-in
                    customer.
                  </p>
                )}
            </div>

            <div className="mt-3">
              {!branchId ? (
                <p
                  role="alert"
                  className="rounded-xl bg-amber-50 px-3 py-2.5 text-xs text-amber-800 dark:bg-amber-950/30 dark:text-amber-300"
                >
                  A branch assignment is required to open a cashier shift.
                </p>
              ) : shiftQuery.isLoading ? (
                <p className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-xs text-slate-500 dark:bg-slate-900">
                  <LoaderCircle className="size-3.5 animate-spin" /> Checking
                  cashier shift...
                </p>
              ) : shift ? (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 dark:border-emerald-900 dark:bg-emerald-950/30">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="size-2 shrink-0 rounded-full bg-emerald-500" />
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                        Cashier shift active
                      </p>
                      <p className="text-[11px] text-emerald-700/80 dark:text-emerald-400">
                        Opened{" "}
                        {new Intl.DateTimeFormat("id-ID", {
                          timeStyle: "short",
                        }).format(new Date(shift.opened_at))}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-xs font-bold tabular-nums text-emerald-800 dark:text-emerald-300">
                    {formatCurrency(
                      Number(shift.expected_cash ?? shift.opening_cash),
                    )}
                  </span>
                </div>
              ) : (
                <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-3 dark:border-amber-900 dark:bg-amber-950/20">
                  <p className="mb-2 text-xs font-semibold text-amber-900 dark:text-amber-300">
                    Open a cashier shift to start selling
                  </p>
                  <div className="flex items-end gap-2">
                    <div className="min-w-0 flex-1 space-y-1">
                      <Label htmlFor="pos-opening-cash" className="text-xs">
                        Opening cash
                      </Label>
                      <Input
                        id="pos-opening-cash"
                        type="number"
                        min="0"
                        step="0.01"
                        value={openingCash}
                        onChange={(event) => setOpeningCash(event.target.value)}
                        disabled={locked}
                        className="h-9 bg-white dark:bg-slate-900"
                      />
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      onClick={openShift}
                      disabled={openShiftMutation.isPending || locked}
                    >
                      {openShiftMutation.isPending && (
                        <LoaderCircle className="size-3.5 animate-spin" />
                      )}
                      Open shift
                    </Button>
                  </div>
                </div>
              )}
              {shiftQuery.isError && (
                <p role="alert" className="mt-1 text-xs text-red-700">
                  Unable to check cashier shift: {shiftQuery.error.message}
                </p>
              )}
              {shiftError && (
                <p
                  role="alert"
                  className="mt-2 whitespace-pre-line rounded-lg bg-red-50 p-2 text-xs text-red-700"
                >
                  {shiftError}
                </p>
              )}
            </div>
          </div>

          {/* Shift controls */}
          {shift && (
            <details className="shrink-0 border-b border-slate-200 bg-slate-50/80 dark:border-slate-800 dark:bg-slate-900/50">
              <summary className="cursor-pointer list-none px-4 py-3 text-xs font-semibold text-slate-600 marker:hidden sm:px-5 dark:text-slate-300">
                <span className="flex items-center justify-between">
                  <span>
                    Shift balance ·{" "}
                    {formatCurrency(
                      Number(shift.expected_cash ?? shift.opening_cash),
                    )}{" "}
                    expected
                  </span>
                  <span className="text-blue-600">
                    Shift controls <span aria-hidden="true">⌄</span>
                  </span>
                </span>
              </summary>
              <div className="space-y-3 border-t border-slate-200 px-4 py-3 sm:px-5 dark:border-slate-800">
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-slate-500">Opening</p>
                    <p className="mt-1 font-semibold tabular-nums">
                      {formatCurrency(Number(shift.opening_cash))}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-slate-500">Cash in</p>
                    <p className="mt-1 font-semibold tabular-nums text-emerald-700">
                      {formatCurrency(Number(shift.cash_in_total ?? 0))}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-slate-500">Cash out</p>
                    <p className="mt-1 font-semibold tabular-nums text-rose-700">
                      {formatCurrency(Number(shift.cash_out_total ?? 0))}
                    </p>
                  </div>
                </div>

                <div className="flex items-end gap-2">
                  <div className="min-w-0 flex-1 space-y-1">
                    <Label htmlFor="pos-closing-cash" className="text-xs">
                      Counted closing cash
                    </Label>
                    <Input
                      id="pos-closing-cash"
                      type="number"
                      min="0"
                      step="0.01"
                      value={closingCash}
                      onChange={(event) => setClosingCash(event.target.value)}
                      placeholder={String(
                        shift.expected_cash ?? shift.opening_cash,
                      )}
                      disabled={locked || closeShiftMutation.isPending}
                      className="h-9"
                    />
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="destructive"
                    onClick={closeShift}
                    disabled={
                      locked ||
                      closeShiftMutation.isPending
                    }
                  >
                    {closeShiftMutation.isPending ? (
                      <LoaderCircle className="size-3.5 animate-spin" />
                    ) : (
                      <LockKeyhole className="size-3.5" />
                    )}
                    Close shift
                  </Button>
                </div>
              </div>
            </details>
          )}

          {/* Cart */}
          <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3 sm:px-5 dark:border-slate-800">
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                Current order
              </h3>
              <p className="text-[11px] text-slate-500">
                Review items before payment
              </p>
            </div>
            <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              {cartDetails.reduce((sum, item) => sum + item.quantity, 0)} items
            </span>
          </div>

          <div className="min-h-32 flex-1 overflow-y-auto px-4 sm:px-5">
            {!cartDetails.length ? (
              <div className="flex h-full min-h-36 flex-col items-center justify-center gap-2 text-center">
                <span className="flex size-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-900">
                  <ShoppingCart className="size-5" />
                </span>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Your cart is empty
                </p>
                <p className="max-w-52 text-xs text-slate-400">
                  Choose products from the catalog to build an order.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {cartDetails.map((item) => (
                  <div
                    key={item.productId}
                    className="flex items-center gap-2.5 py-3"
                  >
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-xs font-bold text-slate-500 dark:bg-slate-800">
                      {item.quantity}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-100">
                        {item.stock.product.name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-slate-500">
                        {formatCurrency(
                          Number(item.stock.product.selling_price),
                        )}{" "}
                        each
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-7 rounded-lg"
                        aria-label={`Decrease ${item.stock.product.name}`}
                        disabled={locked}
                        onClick={() =>
                          setQuantity(item.productId, item.quantity - 1)
                        }
                      >
                        <Minus className="size-3" />
                      </Button>
                      <span className="w-6 text-center text-xs font-semibold tabular-nums">
                        {item.quantity}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="size-7 rounded-lg"
                        aria-label={`Increase ${item.stock.product.name}`}
                        disabled={
                          locked || item.quantity >= Number(item.stock.quantity)
                        }
                        onClick={() =>
                          setQuantity(item.productId, item.quantity + 1)
                        }
                      >
                        <Plus className="size-3" />
                      </Button>
                    </div>
                    <div className="w-24 shrink-0 text-right">
                      <p className="text-xs font-bold tabular-nums text-slate-900 dark:text-white">
                        {formatCurrency(item.lineTotal)}
                      </p>
                      <button
                        type="button"
                        aria-label={`Remove ${item.stock.product.name}`}
                        disabled={locked}
                        onClick={() => setQuantity(item.productId, 0)}
                        className="mt-1 text-[10px] font-medium text-rose-600 hover:text-rose-700 disabled:opacity-40"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment */}
          <div className="shrink-0 space-y-3 border-t border-slate-200 bg-slate-50 p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900/70">
            {formError && (
              <p
                role="alert"
                className="whitespace-pre-line rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
              >
                {formError}
              </p>
            )}
            {pendingSale && (
              <p className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
                Draft {pendingSale.invoice_no} is awaiting payment. The order is
                locked to prevent duplicate sales.
              </p>
            )}
            {paymentMethodsQuery.isError && (
              <p role="alert" className="text-xs text-red-700">
                Unable to load payment methods:{" "}
                {paymentMethodsQuery.error.message}
              </p>
            )}

            <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-950">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Subtotal</span>
                <span className="font-medium tabular-nums text-slate-700 dark:text-slate-200">
                  {formatCurrency(total)}
                </span>
              </div>
              <div className="mt-2 flex items-end justify-between gap-3 border-t border-dashed border-slate-200 pt-2 dark:border-slate-800">
                <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Total due
                </span>
                <span className="text-xl font-extrabold tracking-tight tabular-nums text-slate-950 dark:text-white">
                  {formatCurrency(total)}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="min-w-0 space-y-1.5">
                <Label
                  htmlFor="pos-payment-method"
                  className="text-xs font-semibold"
                >
                  Payment method
                </Label>
                <select
                  id="pos-payment-method"
                  value={paymentMethodId}
                  onChange={(event) => setPaymentMethodId(event.target.value)}
                  disabled={paymentMethodsQuery.isLoading || locked}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white px-2.5 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/15 dark:border-slate-700 dark:bg-slate-950"
                >
                  <option value="">
                    {paymentMethodsQuery.isLoading
                      ? "Loading..."
                      : "Select method"}
                  </option>
                  {paymentMethods.map((method) => (
                    <option key={method.id} value={method.id}>
                      {method.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="min-w-0 space-y-1.5">
                <Label
                  htmlFor="pos-amount-tendered"
                  className="text-xs font-semibold"
                >
                  Amount received
                </Label>
                <Input
                  id="pos-amount-tendered"
                  type="number"
                  min={total}
                  step="0.01"
                  value={amountTendered}
                  onChange={(event) => setAmountTendered(event.target.value)}
                  placeholder="0.00"
                  disabled={locked}
                  className="h-10 bg-white text-xs dark:bg-slate-950"
                />
              </div>
            </div>

            {selectedPaymentMethod?.type.toLowerCase() === "cash" && (
              <div className="flex flex-wrap gap-1.5">
                {quickCashAmounts.map((amount) => (
                  <Button
                    key={amount}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setQuickCash(amount)}
                    disabled={locked}
                    className="h-8 rounded-lg bg-white text-[11px] dark:bg-slate-950"
                  >
                    {amount === total ? "Exact" : formatCurrency(amount)}
                  </Button>
                ))}
              </div>
            )}

            {selectedPaymentMethod &&
              selectedPaymentMethod.type.toLowerCase() !== "cash" && (
                <div className="space-y-1.5">
                  <Label
                    htmlFor="pos-reference"
                    className="text-xs font-semibold"
                  >
                    Payment reference{" "}
                    <span className="font-normal text-slate-400">
                      (optional)
                    </span>
                  </Label>
                  <Input
                    id="pos-reference"
                    value={referenceNo}
                    onChange={(event) => setReferenceNo(event.target.value)}
                    maxLength={100}
                    placeholder="Enter transaction reference"
                    disabled={locked}
                    className="h-9 bg-white text-xs dark:bg-slate-950"
                  />
                </div>
              )}

            <div className="flex items-center justify-between rounded-lg bg-slate-100 px-3 py-2 dark:bg-slate-800">
              <span className="flex items-center gap-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
                <Banknote className="size-4" /> Change
              </span>
              <span className="text-sm font-bold tabular-nums text-slate-900 dark:text-white">
                {formatCurrency(change)}
              </span>
            </div>

            <Button
              type="button"
              className="h-12 w-full rounded-xl bg-blue-600 text-sm font-bold text-white shadow-md shadow-blue-600/15 hover:bg-blue-700 disabled:shadow-none"
              onClick={checkout}
              disabled={
                busy ||
                !cartDetails.length ||
                !shift ||
                !branchId ||
                !selectedPaymentMethod ||
                tendered < total
              }
            >
              {busy && <LoaderCircle className="size-4 animate-spin" />}
              {pendingSale ? "Retry payment" : `Pay ${formatCurrency(total)}`}
            </Button>
            <p className="text-center text-[10px] text-slate-400">
              Please verify the order and payment amount before completing the
              sale.
            </p>
          </div>
        </aside>
      </main>
    </div>
    {completedSale && (
      <POSInvoice sale={completedSale} companyName={company?.name ?? ""} />
    )}
    </>
  );
}
