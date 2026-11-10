import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Pencil, Phone } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button, buttonVariants } from "@/components/ui/button";
import { useAuth } from "@/context/auth/AuthContext";
import { getBranch } from "../api/getBranches";
import BranchModal from "../components/BranchModal";

export default function BranchDetailPage() {
  const { id } = useParams();
  const { company } = useAuth();
  const [editOpen, setEditOpen] = useState(false);
  const branchId = Number(id);
  const query = useQuery({
    queryKey: ["Branch", company?.id, branchId],
    queryFn: () => getBranch(company!.id, branchId),
    enabled: company !== null && Number.isInteger(branchId) && branchId > 0,
  });
  const branch = query.data?.data;

  if (query.isLoading) {
    return <p role="status" className="p-6 text-sm text-slate-500">Loading branch...</p>;
  }
  if (query.isError) {
    return (
      <p role="alert" className="m-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
        Unable to load branch: {query.error.message}
      </p>
    );
  }
  if (!branch) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link to="/branches" className={buttonVariants({ variant: "outline" })}>
          <ArrowLeft className="size-4" /> Back to branches
        </Link>
        <Button onClick={() => setEditOpen(true)}>
          <Pencil className="size-4" /> Edit Branch
        </Button>
      </div>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="font-mono text-sm text-slate-500">{branch.code}</p>
            <h1 className="mt-1 text-2xl font-bold text-slate-900 dark:text-slate-100">
              {branch.name}
            </h1>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${
            branch.is_active
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-600"
          }`}>
            {branch.is_active ? "Active" : "Inactive"}
          </span>
        </div>
        <dl className="mt-6 grid gap-5 border-t border-slate-100 pt-5 sm:grid-cols-2 dark:border-slate-800">
          <div className="flex gap-3">
            <MapPin className="mt-0.5 size-4 shrink-0 text-slate-400" />
            <div>
              <dt className="text-xs font-medium uppercase text-slate-500">Address</dt>
              <dd className="mt-1 text-sm text-slate-800 dark:text-slate-200">
                {branch.address || "No address provided"}
              </dd>
            </div>
          </div>
          <div className="flex gap-3">
            <Phone className="mt-0.5 size-4 shrink-0 text-slate-400" />
            <div>
              <dt className="text-xs font-medium uppercase text-slate-500">Phone</dt>
              <dd className="mt-1 text-sm text-slate-800 dark:text-slate-200">
                {branch.phone || "No phone provided"}
              </dd>
            </div>
          </div>
        </dl>
      </section>
      <BranchModal open={editOpen} onOpenChange={setEditOpen} branch={branch} />
    </div>
  );
}
