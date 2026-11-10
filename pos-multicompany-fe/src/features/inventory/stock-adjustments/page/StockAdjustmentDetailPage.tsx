import { useState } from "react";
import { ArrowLeft, LoaderCircle, PackageCheck } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAlert } from "@/context/AlertContext";
import { usePostStockAdjustment } from "../hooks/usePostStockAdjustment";
import { useStockAdjustment } from "../hooks/useStockAdjustment";

export default function StockAdjustmentDetailPage() {
  const { id: idParam } = useParams();
  const id = Number(idParam);
  const navigate = useNavigate();
  const { showConfirm, showMessage } = useAlert();
  const query = useStockAdjustment(id);
  const postMutation = usePostStockAdjustment();
  const [postError, setPostError] = useState("");
  const adjustment = query.data?.data;

  const post = async () => {
    if (!adjustment) return;
    const confirmed = await showConfirm({
      title: "Post this stock adjustment?",
      description:
        "Posting will immediately change the selected warehouse stock and cannot be undone.",
      confirmText: "Post adjustment",
    });
    if (!confirmed) return;
    setPostError("");
    postMutation.mutate(adjustment.id, {
      onSuccess: (response) =>
        showMessage({
          variant: "success",
          title: "Adjustment posted",
          description: `${response.data.adjustment_no} has been applied to stock.`,
        }),
      onError: (error) =>
        setPostError(error.message || "Unable to post the adjustment."),
    });
  };

  const backButton = (
    <Button variant="outline" onClick={() => navigate("/stock-adjustments")}>
      <ArrowLeft className="size-4" />
      Back to adjustments
    </Button>
  );
  if (!Number.isInteger(id) || id < 1)
    return (
      <div className="space-y-4 p-6">
        {backButton}
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          Invalid adjustment ID.
        </p>
      </div>
    );
  if (query.isLoading)
    return (
      <div role="status" className="flex items-center gap-2 p-6 text-slate-600">
        <LoaderCircle className="size-4 animate-spin" />
        Loading adjustment...
      </div>
    );
  if (query.isError || !adjustment)
    return (
      <div className="space-y-4 p-6">
        {backButton}
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
        >
          {query.isError ? query.error.message : "Stock adjustment not found."}
        </p>
      </div>
    );

  const isDraft = adjustment.status === "draft";
  return (
    <div className="space-y-6 p-6">
      {backButton}
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm text-slate-500">Stock adjustment</p>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
              {adjustment.adjustment_no}
            </h1>
            <span
              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${isDraft ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}
            >
              {isDraft ? "Draft" : "Posted"}
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
              Post adjustment
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
        <div className="mt-6 grid gap-5 border-t border-slate-200 pt-6 sm:grid-cols-3 dark:border-slate-800">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">
              Warehouse
            </p>
            <p className="mt-1 font-medium">{adjustment.warehouse.name}</p>
            <p className="text-sm text-slate-500">
              {adjustment.warehouse.code}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">
              Adjustment type
            </p>
            <p
              className={`mt-1 font-medium ${adjustment.adjustment_type === "increase" ? "text-emerald-700" : "text-amber-700"}`}
            >
              {adjustment.adjustment_type === "increase"
                ? "Increase stock"
                : "Decrease stock"}
            </p>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">
              Date
            </p>
            <p className="mt-1 text-sm">
              {new Intl.DateTimeFormat("en", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(new Date(adjustment.adjustment_date))}
            </p>
          </div>
        </div>
      </section>
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
        <div className="border-b border-slate-200 p-5 dark:border-slate-800">
          <h2 className="font-semibold">Adjustment items</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-900">
              <tr>
                <th className="px-5 py-3">SKU</th>
                <th className="px-5 py-3">Product</th>
                <th className="px-5 py-3">Quantity</th>
                <th className="px-5 py-3">Unit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {adjustment.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-5 py-3 font-mono text-xs text-slate-500">
                    {item.product.sku}
                  </td>
                  <td className="px-5 py-3 font-medium">{item.product.name}</td>
                  <td className="px-5 py-3 tabular-nums">
                    {new Intl.NumberFormat("en", {
                      maximumFractionDigits: 3,
                    }).format(Number(item.quantity))}
                  </td>
                  <td className="px-5 py-3 text-slate-500">
                    {item.product.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <h2 className="font-semibold">Reason</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-400">
          {adjustment.reason}
        </p>
        <p className="mt-4 text-xs text-slate-500">
          Created by {adjustment.creator?.name ?? "—"}
          {adjustment.approver
            ? ` · Posted by ${adjustment.approver.name}`
            : ""}
        </p>
      </section>
    </div>
  );
}
