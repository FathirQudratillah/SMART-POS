import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, LoaderCircle, PackageCheck, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAlert } from "@/context/AlertContext";
import { useAuth } from "@/context/auth/AuthContext";
import { formatCurrency } from "@/utils/currency";
import { getPaymentMethods } from "../api/sales";
import { useCompleteSale } from "../hooks/useCompleteSale";
import { useSale } from "../hooks/useSale";

export default function SaleDetailPage() {
  const { id: idParam } = useParams();
  const id = Number(idParam);
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const hasAutoPrinted = useRef(false);
  const { company } = useAuth();
  const { showConfirm, showMessage } = useAlert();
  const query = useSale(id);
  const completeMutation = useCompleteSale();
  const [paymentMethodId, setPaymentMethodId] = useState("");
  const [amountTendered, setAmountTendered] = useState("");
  const [referenceNo, setReferenceNo] = useState("");
  const [completeError, setCompleteError] = useState("");
  const paymentMethodsQuery = useQuery({
    queryKey: ["PaymentMethods", company?.id],
    queryFn: () => getPaymentMethods(company!.id),
    enabled: company?.id !== undefined,
  });
  const paymentMethods = (paymentMethodsQuery.data?.data ?? []).filter((item) => item.is_active && !item.deleted_at);
  const sale = query.data?.data;
  const isDraft = sale?.status === "draft";
  const backButton = <Button variant="outline" onClick={() => navigate("/sales")}><ArrowLeft className="size-4" />Back to sales</Button>;

  useEffect(() => {
    if (
      searchParams.get("print") !== "1" ||
      sale?.status !== "completed" ||
      hasAutoPrinted.current
    ) {
      return;
    }

    hasAutoPrinted.current = true;
    window.print();
    setSearchParams((current) => {
      const next = new URLSearchParams(current);
      next.delete("print");
      return next;
    }, { replace: true });
  }, [sale?.status, searchParams, setSearchParams]);

  const complete = async () => {
    if (!sale) return;
    if (!paymentMethodId) {
      setCompleteError("Select a payment method.");
      return;
    }
    const tendered = Number(amountTendered);
    if (!Number.isFinite(tendered) || tendered < Number(sale.total_amount)) {
      setCompleteError("Amount tendered must be at least the sale total.");
      return;
    }
    const confirmed = await showConfirm({
      title: "Complete this sale?",
      description: "Payment will be recorded and warehouse stock will be reduced. This action cannot be undone.",
      confirmText: "Complete sale",
    });
    if (!confirmed) return;

    setCompleteError("");
    completeMutation.mutate({
      id: sale.id,
      payload: {
        payment_method_id: Number(paymentMethodId),
        amount_tendered: tendered,
        reference_no: referenceNo.trim() || undefined,
      },
    }, {
      onSuccess: (response) => {
        showMessage({
          variant: "success",
          title: "Sale completed",
          description: `${response.data.invoice_no} is completed and stock has been updated.`,
        });
        navigate(`/sales/${response.data.id}?print=1`, { replace: true });
      },
      onError: (error) => {
        const messages = Object.values(error.errors ?? {}).flat();
        setCompleteError(messages.length ? messages.join("\n") : error.message);
      },
    });
  };

  if (!Number.isInteger(id) || id < 1) return <div className="space-y-4 p-6">{backButton}<p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">Invalid sale ID.</p></div>;
  if (query.isLoading) return <div role="status" className="flex items-center gap-2 p-6 text-slate-600"><LoaderCircle className="size-4 animate-spin" />Loading sale...</div>;
  if (query.isError || !sale) return <div className="space-y-4 p-6">{backButton}<p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{query.isError ? query.error.message : "Sale not found."}</p></div>;

  return (
    <div className="sale-detail-page space-y-6 p-4 sm:p-6">
      <div className="sale-page-actions flex flex-wrap items-center justify-between gap-3 print:hidden">
        {backButton}
        {sale.status === "completed" && (
          <Button type="button" variant="outline" className="bg-blue-100 text-blue-700 hover:bg-blue-200" onClick={() => window.print()}>
            <Printer className="size-4" />
            Print invoice
          </Button>
        )}
      </div>

      <div className="sale-invoice mx-auto w-full max-w-5xl space-y-5">
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-sm text-slate-500">Sales invoice</p>
              <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
                {sale.invoice_no}
              </h1>
            </div>
            <span
              className={`inline-flex w-fit rounded-full px-3 py-1 text-sm font-medium ${
                sale.status === "completed"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {sale.status}
            </span>
          </div>
          <div className="mt-6 grid gap-5 border-t border-slate-200 pt-6 sm:grid-cols-2 lg:grid-cols-4 dark:border-slate-800">
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Customer</p>
              <p className="mt-1 font-medium">{sale.customer?.name ?? "Walk-in customer"}</p>
              <p className="text-sm text-slate-500">{sale.customer?.phone ?? ""}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Branch</p>
              <p className="mt-1 font-medium">{sale.branch.name}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Primary warehouse</p>
              <p className="mt-1 font-medium">{sale.warehouse.name}</p>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Sale date</p>
              <p className="mt-1 font-medium">
                {new Intl.DateTimeFormat("id-ID", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(sale.sale_date))}
              </p>
            </div>
          </div>
        </section>

        <section className="sale-items overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
          <div className="border-b border-slate-200 p-5 dark:border-slate-800">
            <h2 className="font-semibold">Sale items</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-900">
                <tr>
                  <th className="px-5 py-3">SKU / Product</th>
                  <th className="px-5 py-3">Warehouse</th>
                  <th className="px-5 py-3">Quantity</th>
                  <th className="px-5 py-3">Unit price</th>
                  <th className="px-5 py-3">Line total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {sale.items.map((item) => (
                  <tr key={item.id}>
                    <td className="px-5 py-3">
                      <p className="font-mono text-xs text-slate-500">{item.sku}</p>
                      <p className="font-medium">{item.product_name}</p>
                    </td>
                    <td className="px-5 py-3">
                      {item.warehouse?.name ?? sale.warehouse.name}
                    </td>
                    <td className="px-5 py-3 tabular-nums">
                      {Number(item.quantity).toLocaleString("en", {
                        maximumFractionDigits: 3,
                      })}{" "}
                      {item.product?.unit ?? ""}
                    </td>
                    <td className="px-5 py-3">
                      {formatCurrency(Number(item.unit_price))}
                    </td>
                    <td className="px-5 py-3 font-medium">
                      {formatCurrency(Number(item.line_total))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="ml-auto max-w-xs space-y-2 border-t border-slate-200 p-5 text-sm dark:border-slate-800">
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
            <p className="flex justify-between border-t pt-2 text-base font-semibold">
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
        </section>

        {sale.payments.length > 0 && (
          <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
            <h2 className="font-semibold">Payments</h2>
            <div className="mt-3 space-y-2">
              {sale.payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex flex-wrap justify-between gap-2 border-t border-slate-100 pt-3 text-sm dark:border-slate-800"
                >
                  <span>
                    {payment.payment_method?.name ?? "Payment"} · {payment.status}
                    {payment.reference_no ? ` · ${payment.reference_no}` : ""}
                  </span>
                  <span className="font-medium">
                    {formatCurrency(Number(payment.amount))}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {isDraft && (
        <section className="sale-page-actions space-y-4 rounded-xl border border-blue-200 bg-blue-50/50 p-5 dark:border-blue-900 dark:bg-blue-950/20 print:hidden">
          <div>
            <h2 className="font-semibold">Complete sale</h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              Choose a payment method and amount tendered to record payment and update inventory.
            </p>
          </div>
          {completeError && (
            <p role="alert" className="whitespace-pre-line rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {completeError}
            </p>
          )}
          {paymentMethodsQuery.isError && (
            <p role="alert" className="text-sm text-red-700">
              Unable to load payment methods: {paymentMethodsQuery.error.message}
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="sale-payment-method">Payment method *</Label>
              <select
                id="sale-payment-method"
                value={paymentMethodId}
                onChange={(event) => setPaymentMethodId(event.target.value)}
                disabled={paymentMethodsQuery.isLoading}
                className="h-9 w-full rounded-md border border-input bg-white px-3 text-sm dark:bg-slate-900"
              >
                <option value="">Select payment method</option>
                {paymentMethods.map((method) => (
                  <option key={method.id} value={method.id}>{method.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sale-amount-tendered">Amount tendered *</Label>
              <Input
                id="sale-amount-tendered"
                type="number"
                min={sale.total_amount}
                step="0.01"
                value={amountTendered}
                onChange={(event) => setAmountTendered(event.target.value)}
                placeholder={String(sale.total_amount)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sale-reference">Payment reference</Label>
              <Input
                id="sale-reference"
                value={referenceNo}
                onChange={(event) => setReferenceNo(event.target.value)}
                maxLength={100}
                placeholder="Optional"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={complete}
              disabled={completeMutation.isPending || paymentMethods.length === 0}
            >
              {completeMutation.isPending ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <PackageCheck className="size-4" />
              )}
              Complete sale
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
