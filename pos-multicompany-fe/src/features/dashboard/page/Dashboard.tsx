import { useEffect } from "react";
import {
  Activity,
  ArrowDownToLine,
  ArrowRight,
  ArrowUpFromLine,
  Banknote,
  Boxes,
  CalendarDays,
  CircleAlert,
  Clock3,
  Package,
  ReceiptText,
  ShoppingCart,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { useAlert } from "@/context/AlertContext";
import { useAuth } from "@/context/auth/AuthContext";
import { useDashboardSummary } from "../hooks/useDashboardSummary";
import type { DashboardRecentSale, DashboardSalesTrend } from "../types";
import { formatCurrency } from "@/utils/currency";
import AdminDashboard from "@/features/admin/page/AdminDashboard";

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function MetricCard({
  title,
  value,
  detail,
  icon: Icon,
  accent,
}: {
  title: string;
  value: string;
  detail: string;
  icon: typeof TrendingUp;
  accent: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {value}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{detail}</p>
        </div>
        <span
          className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${accent}`}
        >
          <Icon className="size-5" />
        </span>
      </div>
    </div>
  );
}

function SalesTrend({ data }: { data: DashboardSalesTrend[] }) {
  const maxRevenue = Math.max(...data.map((day) => day.revenue), 1);

  return (
    <div className="flex h-52 items-end gap-2 sm:gap-4">
      {data.map((day) => {
        const height = day.revenue > 0
          ? Math.max((day.revenue / maxRevenue) * 100, 8)
          : 3;
        return (
          <div
            key={day.date}
            className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
            title={`${day.label}: ${formatCurrency(day.revenue)} (${day.count} sales)`}
          >
            <span className="truncate text-[10px] font-medium text-slate-500 sm:text-xs">
              {day.revenue > 0 ? formatCurrency(day.revenue) : ""}
            </span>
            <div className="flex h-36 w-full items-end rounded-t-lg bg-slate-100 dark:bg-slate-900">
              <div
                className="w-full rounded-t-lg bg-blue-500 transition-all"
                style={{ height: `${height}%` }}
              />
            </div>
            <span className="text-xs text-slate-500">{day.label}</span>
          </div>
        );
      })}
    </div>
  );
}

function RecentSaleRow({ sale }: { sale: DashboardRecentSale }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="flex min-w-0 items-center gap-3">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          <ReceiptText className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
            {sale.invoice_no}
          </p>
          <p className="truncate text-xs text-slate-500">
            {sale.customer?.name ?? "Walk-in customer"} · {formatDate(sale.sale_date)}
          </p>
        </div>
      </div>
      <span className="shrink-0 text-sm font-semibold tabular-nums text-slate-900 dark:text-slate-100">
        {formatCurrency(Number(sale.total_amount))}
      </span>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();

  return user?.is_superadmin ? <AdminDashboard /> : <CompanyDashboard />;
}

function CompanyDashboard() {
  const { user, company, branch } = useAuth();
  const { showMessage } = useAlert();
  const userId = user?.id;
  const emailVerifiedAt = user?.email_verified_at;
  const companyId = company?.id ?? null;
  const branchId = branch?.id ?? null;
  const query = useDashboardSummary(companyId, branchId);
  const summary = query.data?.data;

  useEffect(() => {
    if (userId && !emailVerifiedAt) {
      showMessage({
        variant: "warning",
        title: "Email not verified",
        description: "You must verify your email first.",
      });
    }
  }, [emailVerifiedAt, showMessage, userId]);

  const today = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <section className="flex flex-col justify-between gap-4 rounded-2xl bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] p-6 text-white shadow-sm sm:flex-row sm:items-center sm:p-8">
        <div className="space-y-2">
          <p className="text-sm font-medium text-blue-100/80">{today}</p>

          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Good day{user?.name ? `, ${user.name}` : ""}
          </h1>

          <p className="text-sm text-blue-100/80">
            {company?.name ?? "Company"} ·{" "}
            {branch?.name ?? "Branch not assigned"}
          </p>
        </div>

        <Link
          to="/pos"
          className={buttonVariants({
            variant: "secondary",
            className:
              "w-fit border-0 bg-white text-blue-800 shadow-sm hover:bg-blue-50",
          })}
        >
          <ShoppingCart className="size-4" />
          Open Point of Sale
          <ArrowRight className="size-4" />
        </Link>
      </section>

      {branchId === null && (
        <div
          role="alert"
          className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
        >
          <CircleAlert className="size-5 shrink-0" />
          Assign a branch to your account to view operational dashboard metrics.
        </div>
      )}
      {query.isLoading && branchId !== null && (
        <p role="status" className="text-sm text-slate-500">
          Loading dashboard information...
        </p>
      )}
      {query.isError && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          Unable to load dashboard information: {query.error.message}
        </p>
      )}

      {summary && (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="Sales Today"
              value={formatCurrency(summary.sales_today.revenue)}
              detail={`${summary.sales_today.count} completed sales`}
              icon={TrendingUp}
              accent="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
            />
            <MetricCard
              title="Sales This Month"
              value={formatCurrency(summary.sales_month.revenue)}
              detail="Month to date"
              icon={CalendarDays}
              accent="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
            />
            <MetricCard
              title="Products in Stock"
              value={summary.stock.product_count.toLocaleString("id-ID")}
              detail={`${summary.stock.total_quantity.toLocaleString("id-ID", { maximumFractionDigits: 3 })} units across branch warehouses`}
              icon={Package}
              accent="bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300"
            />
            <MetricCard
              title="Out of Stock"
              value={summary.stock.out_of_stock_count.toLocaleString("id-ID")}
              detail="Products with zero branch stock"
              icon={Boxes}
              accent={
                summary.stock.out_of_stock_count > 0
                  ? "bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                  : "bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300"
              }
            />
          </section>

          <section className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-6">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                    Sales Overview
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Completed sales for the last 7 days
                  </p>
                </div>
                <span className="flex size-9 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                  <Activity className="size-4" />
                </span>
              </div>
              <SalesTrend data={summary.sales_trend} />
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                      Cashier Shifts
                    </h2>
                    <p className="mt-1 text-xs text-slate-500">
                      Currently open in this branch
                    </p>
                  </div>
                  <span className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
                    <Clock3 className="size-5" />
                  </span>
                </div>
                <p className="mt-4 text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {summary.open_shift_count}
                </p>
                <Link
                  to="/cashier-shifts"
                  className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-blue-700 hover:underline dark:text-blue-300"
                >
                  View shifts <ArrowRight className="size-4" />
                </Link>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                  Quick Actions
                </h2>
                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Link
                    to="/cash-in"
                    className={buttonVariants({
                      variant: "outline",
                      className: "justify-start hover:bg-slate-100",
                    })}
                  >
                    <ArrowDownToLine className="size-4 text-emerald-600" />
                    Cash In
                  </Link>
                  <Link
                    to="/cash-out"
                    className={buttonVariants({
                      variant: "outline",
                      className: "justify-start hover:bg-slate-100",
                    })}
                  >
                    <ArrowUpFromLine className="size-4 text-rose-600" />
                    Cash Out
                  </Link>
                  <Link
                    to="/stock-movements"
                    className={buttonVariants({
                      variant: "outline",
                      className: "justify-start hover:bg-slate-100",
                    })}
                  >
                    <Boxes className="size-4 text-yellow-400" />
                    Stock History
                  </Link>
                  <Link
                    to="/sales"
                    className={buttonVariants({
                      variant: "outline",
                      className: "justify-start hover:bg-slate-100",
                    })}
                  >
                    <ReceiptText className="size-4 text-blue-600" />
                    Sales
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-6">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                  Recent Sales
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Latest completed transactions at this branch
                </p>
              </div>
              <Link
                to="/sales"
                className={buttonVariants({ variant: "outline", className: "hover:bg-slate-100", size: "sm" })}
              >
                View all <ArrowRight className="size-4" />
              </Link>
            </div>
            {summary.recent_sales.length ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {summary.recent_sales.map((sale) => (
                  <RecentSaleRow key={sale.id} sale={sale} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                <Banknote className="size-8 text-slate-300" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  No completed sales yet
                </p>
                <p className="text-xs text-slate-500">
                  Completed transactions will appear here.
                </p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
