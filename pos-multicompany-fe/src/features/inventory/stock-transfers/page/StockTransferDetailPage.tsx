import { useState } from "react";
import { ArrowLeft, ArrowRightLeft, LoaderCircle, PackageCheck } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAlert } from "@/context/AlertContext";
import { usePostStockTransfer } from "../hooks/usePostStockTransfer";
import { useStockTransfer } from "../hooks/useStockTransfer";

export default function StockTransferDetailPage() {
  const { id: idParam } = useParams();
  const id = Number(idParam);
  const navigate = useNavigate();
  const { showConfirm, showMessage } = useAlert();
  const { data: response, isLoading, isError, error } = useStockTransfer(id);
  const postMutation = usePostStockTransfer();
  const [postError, setPostError] = useState("");
  const transfer = response?.data;

  if (!Number.isInteger(id) || id < 1) {
    return (
      <div className="space-y-4 p-6">
        <Button variant="outline" onClick={() => navigate("/stock-transfers")}><ArrowLeft className="size-4" />Back to transfers</Button>
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">Invalid stock transfer ID.</p>
      </div>
    );
  }

  const handlePost = async () => {
    if (!transfer) return;
    const confirmed = await showConfirm({
      title: "Post this stock transfer?",
      description: "This will immediately decrease stock in the source warehouse and increase it in the destination warehouse. This action cannot be undone.",
      confirmText: "Post transfer",
      cancelText: "Cancel",
    });
    if (!confirmed) return;

    setPostError("");
    postMutation.mutate(transfer.id, {
      onSuccess: (result) => showMessage({
        variant: "success",
        title: "Transfer posted",
        description: `${result.data.transfer_no} has been posted and stock has been moved.`,
      }),
      onError: (mutationError) => setPostError(mutationError.message || "Unable to post this transfer."),
    });
  };

  if (isLoading) {
    return <div role="status" className="flex items-center gap-2 p-6 text-slate-600"><LoaderCircle className="size-4 animate-spin" />Loading transfer details...</div>;
  }
  if (isError || !transfer) {
    return (
      <div className="space-y-4 p-6">
        <Button variant="outline" onClick={() => navigate("/stock-transfers")}><ArrowLeft className="size-4" />Back to transfers</Button>
        <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          {isError ? (error instanceof Error ? error.message : "Unable to load transfer.") : "Stock transfer not found."}
        </p>
      </div>
    );
  }

  const isDraft = transfer.status === "draft";
  return (
    <div className="space-y-6 p-6">
      <Button variant="outline" onClick={() => navigate("/stock-transfers")}><ArrowLeft className="size-4" />Back to transfers</Button>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <p className="text-sm text-slate-500">Stock transfer</p>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{transfer.transfer_no}</h1>
            <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${isDraft ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>
              {isDraft ? "Draft" : "Posted"}
            </span>
          </div>
          {isDraft && (
            <Button variant="outline" className="bg-yellow-100 text-yellow-700 hover:bg-yellow-200" onClick={handlePost} disabled={postMutation.isPending}>
              {postMutation.isPending ? <LoaderCircle className="size-4 animate-spin" /> : <PackageCheck className="size-4" />}
              Post transfer
            </Button>
          )}
        </div>

        {postError && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{postError}</p>}

        <div className="mt-6 grid gap-5 border-t border-slate-200 pt-6 sm:grid-cols-3 dark:border-slate-800">
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">From warehouse</p>
            <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">{transfer.source_warehouse.name}</p>
            <p className="text-sm text-slate-500">{transfer.source_warehouse.code}</p>
          </div>
          <div className="flex items-center gap-3 sm:justify-center">
            <ArrowRightLeft className="size-5 text-blue-600" />
            <div>
              <p className="text-xs font-semibold uppercase text-slate-500">Transfer date</p>
              <p className="mt-1 text-sm text-slate-700 dark:text-slate-300">{new Intl.DateTimeFormat("en", { dateStyle: "medium", timeStyle: "short" }).format(new Date(transfer.transfer_date))}</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase text-slate-500">To warehouse</p>
            <p className="mt-1 font-medium text-slate-900 dark:text-slate-100">{transfer.destination_warehouse.name}</p>
            <p className="text-sm text-slate-500">{transfer.destination_warehouse.code}</p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="border-b border-slate-200 p-5 dark:border-slate-800">
          <h2 className="font-semibold text-slate-900 dark:text-slate-100">Transferred products</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-900 dark:text-slate-400">
              <tr><th className="px-5 py-3">SKU</th><th className="px-5 py-3">Product</th><th className="px-5 py-3">Quantity</th><th className="px-5 py-3">Unit</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {transfer.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-5 py-3 font-mono text-xs text-slate-500">{item.product.sku}</td>
                  <td className="px-5 py-3 font-medium text-slate-800 dark:text-slate-200">{item.product.name}</td>
                  <td className="px-5 py-3 tabular-nums text-slate-700 dark:text-slate-300">{new Intl.NumberFormat("en", { maximumFractionDigits: 3 }).format(Number(item.quantity))}</td>
                  <td className="px-5 py-3 text-slate-500">{item.product.unit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <h2 className="font-semibold text-slate-900 dark:text-slate-100">Notes</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-400">{transfer.notes || "No notes."}</p>
        <p className="mt-4 text-xs text-slate-500">
          Created by {transfer.creator?.name ?? "—"}
          {transfer.approver ? ` · Posted by ${transfer.approver.name}` : ""}
        </p>
      </section>
    </div>
  );
}
