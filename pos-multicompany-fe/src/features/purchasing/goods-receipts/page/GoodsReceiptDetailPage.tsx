import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, LoaderCircle, PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAlert } from "@/context/AlertContext";
import { useGoodsReceipt } from "../hooks/useGoodsReceipt";
import { usePostGoodsReceipt } from "../hooks/usePostGoodsReceipt";

export default function GoodsReceiptDetailPage() {
  const { id: idParam } = useParams();
  const id = Number(idParam);
  const navigate = useNavigate();
  const { showConfirm, showMessage } = useAlert();
  const query = useGoodsReceipt(id);
  const postMutation = usePostGoodsReceipt();
  const [postError, setPostError] = useState("");
  const receipt = query.data?.data;
  const backButton = (
    <Button variant="outline" onClick={() => navigate("/good-receipts")}>
      <ArrowLeft className="size-4" />
      Back to goods receipts
    </Button>
  );

  const post = async () => {
    if (!receipt) return;
    const confirmed = await showConfirm({
      title: "Post this goods receipt?",
      description:
        "Posting adds the received quantities to warehouse stock. This action cannot be undone.",
      confirmText: "Post receipt",
    });
    if (!confirmed) return;
    setPostError("");
    postMutation.mutate(receipt.id, {
      onSuccess: (response) =>
        showMessage({
          variant: "success",
          title: "Goods receipt posted",
          description: `${response.data.receipt_no} has been added to inventory.`,
        }),
      onError: (error) =>
        setPostError(error.message || "Unable to post goods receipt."),
    });
  };

  if (!Number.isInteger(id) || id < 1)
    return (
      <div className="space-y-4 p-6">
        {backButton}
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          Invalid goods receipt ID.
        </p>
      </div>
    );
  if (query.isLoading)
    return (
      <div role="status" className="flex items-center gap-2 p-6 text-slate-600">
        <LoaderCircle className="size-4 animate-spin" />
        Loading goods receipt...
      </div>
    );
  if (query.isError || !receipt)
    return (
      <div className="space-y-4 p-6">
        {backButton}
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {query.isError ? query.error.message : "Goods receipt not found."}
        </p>
      </div>
    );

  const isDraft = receipt.status === "draft";
  return (
    <div className="space-y-6 p-6">
      {backButton}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm text-slate-500">Goods receipt</p>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {receipt.receipt_no}
            </h1>
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${isDraft ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}
            >
              {receipt.status}
            </span>
          </div>
          {isDraft && (
            <Button
              variant="outline"
              className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
              onClick={post}
              disabled={postMutation.isPending}
            >
              {postMutation.isPending ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : (
                <PackageCheck className="size-4" />
              )}
              Post receipt
            </Button>
          )}
        </div>
        {postError && (
          <p
            role="alert"
            className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {postError}
          </p>
        )}
        <div className="mt-6 grid gap-5 border-t border-slate-200 pt-6 sm:grid-cols-2 lg:grid-cols-4 dark:border-slate-800">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">
              Supplier
            </p>
            <p className="mt-1 font-medium">{receipt.supplier.name}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">
              Warehouse
            </p>
            <p className="mt-1 font-medium">{receipt.warehouse.name}</p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">
              Purchase order
            </p>
            <p className="mt-1 font-medium">
              {receipt.purchase?.purchase_no ?? "Direct receipt"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">
              Receipt date
            </p>
            <p className="mt-1 font-medium">
              {new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(
                new Date(receipt.receipt_date),
              )}
            </p>
          </div>
        </div>
      </section>
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="border-b border-slate-200 p-5 dark:border-slate-800">
          <h2 className="font-semibold">Received products</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-900">
              <tr>
                <th className="px-5 py-3">SKU / Product</th>
                <th className="px-5 py-3">Quantity received</th>
                <th className="px-5 py-3">Unit cost</th>
                <th className="px-5 py-3">Total cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {receipt.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-5 py-3">
                    <p className="font-mono text-xs text-slate-500">
                      {item.product.sku}
                    </p>
                    <p className="font-medium">{item.product.name}</p>
                  </td>
                  <td className="px-5 py-3 tabular-nums">
                    {Number(item.quantity_received).toLocaleString("en", {
                      maximumFractionDigits: 3,
                    })}{" "}
                    {item.product.unit}
                  </td>
                  <td className="px-5 py-3">
                    {Number(item.unit_cost).toLocaleString("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    })}
                  </td>
                  <td className="px-5 py-3">
                    {(
                      Number(item.quantity_received) * Number(item.unit_cost)
                    ).toLocaleString("id-ID", {
                      style: "currency",
                      currency: "IDR",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
