import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  ArrowRight,
  Building2,
  ShieldCheck,
  UserCheck,
  Users,
  UserX,
} from "lucide-react";
import { Link } from "react-router-dom";
import { buttonVariants } from "@/components/ui/button";
import { adminKeys, getAdminDashboard } from "../api/admin";

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  detail: string;
  icon: typeof Users;
  color: string;
}) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {label}
          </p>
          <p className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            {value.toLocaleString("id-ID")}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{detail}</p>
        </div>
        <span className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${color}`}>
          <Icon className="size-5" />
        </span>
      </div>
    </article>
  );
}

function formatActivityDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function AdminDashboard() {
  const query = useQuery({
    queryKey: adminKeys.dashboard(),
    queryFn: getAdminDashboard,
  });
  const data = query.data?.data;

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <section className="flex flex-col justify-between gap-4 rounded-2xl bg-gradient-to-r from-[#1E3A8A] to-[#2563EB] p-6 text-white shadow-sm sm:flex-row sm:items-center sm:p-8">
        <div className="space-y-2">
          <p className="flex items-center gap-2 text-sm font-medium text-blue-100/80">
            <ShieldCheck className="size-4" />
            SMART POS · System administration
          </p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Admin Dashboard
          </h1>
          <p className="text-sm text-blue-100/80">
            Overview of users, companies, and system activity.
          </p>
        </div>
        <Link
          to="/admin/users"
          className={buttonVariants({
            variant: "secondary",
            className:
              "w-fit border-0 bg-white text-blue-800 shadow-sm hover:bg-blue-50",
          })}
        >
          <Users className="size-4" />
          Manage users
          <ArrowRight className="size-4" />
        </Link>
      </section>

      {query.isLoading && (
        <p role="status" className="text-sm text-slate-500">
          Loading admin dashboard...
        </p>
      )}
      {query.isError && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          Unable to load admin dashboard: {query.error.message}
        </p>
      )}
      {data && (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              label="Total users"
              value={data.users.total}
              detail="Registered user accounts"
              icon={Users}
              color="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
            />
            <StatCard
              label="Active users"
              value={data.users.active}
              detail="Accounts ready to access the system"
              icon={UserCheck}
              color="bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
            />
            <StatCard
              label="Inactive users"
              value={data.users.inactive}
              detail="Deactivated accounts"
              icon={UserX}
              color="bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
            />
            <StatCard
              label="Companies"
              value={data.companies}
              detail="Companies registered in the system"
              icon={Building2}
              color="bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300"
            />
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-6">
            <div className="mb-4 flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                <Activity className="size-5" />
              </span>
              <div>
                <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                  Activity log
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Latest recorded changes across the system
                </p>
              </div>
            </div>
            {data.recent_activities.length ? (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.recent_activities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex flex-col justify-between gap-2 py-3 sm:flex-row sm:items-center"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                        {activity.action} · {activity.entity_type}
                        {activity.entity_id ? ` #${activity.entity_id}` : ""}
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        By {activity.actor_name ?? "System"}
                      </p>
                    </div>
                    <time className="shrink-0 text-xs text-slate-500 dark:text-slate-400">
                      {formatActivityDate(activity.created_at)}
                    </time>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                <Activity className="size-8 text-slate-300 dark:text-slate-700" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  No activity has been recorded yet
                </p>
                <p className="text-xs text-slate-500">
                  System changes will appear here.
                </p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
