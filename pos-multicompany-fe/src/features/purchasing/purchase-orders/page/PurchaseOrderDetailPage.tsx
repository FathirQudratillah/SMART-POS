import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePurchaseOrder } from "../hooks/usePurchaseOrder";
import { formatCurrency } from "@/utils/currency";

export default function PurchaseOrderDetailPage() {
  const { id: idParam } = useParams();
  const id = Number(idParam);
  const navigate = useNavigate();
  const query = usePurchaseOrder(id);
  const purchase = query.data?.data;
  const backButton = <Button variant="outline" onClick={() => navigate("/purchase-orders")}><ArrowLeft className="size-4" />Back to purchase orders</Button>;

  if (!Number.isInteger(id) || id < 1) return <div className="space-y-4 p-6">{backButton}<p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">Invalid purchase order ID.</p></div>;
  if (query.isLoading) return <div role="status" className="flex items-center gap-2 p-6 text-slate-600"><LoaderCircle className="size-4 animate-spin" />Loading purchase order...</div>;
  if (query.isError || !purchase) return <div className="space-y-4 p-6">{backButton}<p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{query.isError ? query.error.message : "Purchase order not found."}</p></div>;

  const orderStatus = purchase.status.replaceAll("_", " ");
  return (
    <div className="space-y-6 p-6">
      {backButton}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div><p className="text-sm text-slate-500">Purchase order</p><h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">{purchase.purchase_no}</h1></div>
          <span className="inline-flex w-fit rounded-full bg-amber-50 px-3 py-1 text-sm font-medium capitalize text-amber-700">{orderStatus}</span>
        </div>
        <div className="mt-6 grid gap-5 border-t border-slate-200 pt-6 sm:grid-cols-2 lg:grid-cols-4 dark:border-slate-800">
          <div><p className="text-xs font-semibold uppercase text-slate-500">Supplier</p><p className="mt-1 font-medium">{purchase.supplier.name}</p><p className="text-sm text-slate-500">{purchase.supplier.code}</p></div>
          <div><p className="text-xs font-semibold uppercase text-slate-500">Branch</p><p className="mt-1 font-medium">{purchase.branch.name}</p><p className="text-sm text-slate-500">{purchase.branch.code}</p></div>
          <div><p className="text-xs font-semibold uppercase text-slate-500">Receiving warehouse</p><p className="mt-1 font-medium">{purchase.warehouse.name}</p><p className="text-sm text-slate-500">{purchase.warehouse.code}</p></div>
          <div><p className="text-xs font-semibold uppercase text-slate-500">Order date</p><p className="mt-1 font-medium">{new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(purchase.purchase_date))}</p></div>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="border-b border-slate-200 p-5 dark:border-slate-800"><h2 className="font-semibold">Ordered products</h2></div>
        <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-900"><tr><th className="px-5 py-3">SKU / Product</th><th className="px-5 py-3">Quantity</th><th className="px-5 py-3">Received</th><th className="px-5 py-3">Unit price</th><th className="px-5 py-3">Discount</th><th className="px-5 py-3">Tax</th><th className="px-5 py-3">Line total</th></tr></thead><tbody className="divide-y divide-slate-100 dark:divide-slate-800">{purchase.items.map((item) => <tr key={item.id}><td className="px-5 py-3"><p className="font-mono text-xs text-slate-500">{item.product.sku}</p><p className="font-medium">{item.product.name}</p></td><td className="px-5 py-3 tabular-nums">{Number(item.quantity).toLocaleString("en", { maximumFractionDigits: 3 })} {item.product.unit}</td><td className="px-5 py-3 tabular-nums">{Number(item.received_quantity ?? 0).toLocaleString("en", { maximumFractionDigits: 3 })}</td><td className="px-5 py-3">{formatCurrency(Number(item.unit_price))}</td><td className="px-5 py-3">{formatCurrency(Number(item.discount_amount))}</td><td className="px-5 py-3">{formatCurrency(Number(item.tax_amount))}</td><td className="px-5 py-3 font-medium">{formatCurrency(Number(item.line_total))}</td></tr>)}</tbody></table></div>
        <div className="ml-auto max-w-xs space-y-2 border-t border-slate-200 p-5 text-sm dark:border-slate-800"><p className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(Number(purchase.subtotal))}</span></p><p className="flex justify-between"><span>Discount</span><span>{formatCurrency(Number(purchase.discount_amount))}</span></p><p className="flex justify-between"><span>Tax</span><span>{formatCurrency(Number(purchase.tax_amount))}</span></p><p className="flex justify-between border-t pt-2 text-base font-semibold"><span>Total</span><span>{formatCurrency(Number(purchase.total_amount))}</span></p></div>
      </section>
      {purchase.status !== "received" && purchase.status !== "cancelled" && <div className="flex justify-end"><Button variant="outline" className="bg-blue-100 text-blue-700 hover:bg-blue-200" onClick={() => navigate("/good-receipts")}>Create goods receipt</Button></div>}
    </div>
  );
}
