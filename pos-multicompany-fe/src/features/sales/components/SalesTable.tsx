import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import AppTable from "@/components/layout/AppTable";
import { useAuth } from "@/context/auth/AuthContext";
import { useSales } from "../hooks/useSales";
import type { Sale } from "../types";
import { SalesColumn } from "../columns/SalesColumn";

export default function SalesTable() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const { company, branch } = useAuth();
  const query = useSales({ companyId: company?.id ?? null, branchId: branch?.id ?? null, page, per_page: perPage, search });

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">Sales</h2><p className="text-sm text-slate-500 dark:text-slate-400">Create and review sales transactions.</p></div>
        <Link to="/pos" className={buttonVariants({ variant: "outline", className: "bg-blue-100 text-blue-700 hover:bg-blue-200" })}><ShoppingCart className="size-4" />Open Point of Sale</Link>
      </div>
      {query.isLoading && <p role="status" className="text-sm text-slate-500">Loading sales...</p>}
      {query.isError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">Unable to load sales: {query.error.message}</p>}
      <AppTable<Sale> columns={SalesColumn} data={query.data?.data} page={page} setPage={setPage} per_page={perPage} setPerPage={setPerPage} search={search} setSearch={setSearch} detailPath="/sales" enableSelection={false} itemLabel="sales" />
    </div>
  );
}
