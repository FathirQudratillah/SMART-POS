import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  CheckCircle2,
  Mail,
  MapPin,
  ShieldCheck,
  Trash2,
  UserRound,
  XCircle,
} from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Button, buttonVariants } from "@/components/ui/button";
import { adminKeys, deleteAdminUser, getAdminUser } from "../api/admin";

function formatDate(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default function AdminUserDetailPage() {
  const id = Number(useParams().id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: adminKeys.user(id),
    queryFn: () => getAdminUser(id),
    enabled: Number.isInteger(id) && id > 0,
  });
  const removeUser = useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminKeys.all });
      navigate("/admin/users");
    },
  });
  const account = query.data?.data;

  if (query.isLoading) {
    return (
      <p role="status" className="p-6 text-sm text-slate-500">
        Loading user details...
      </p>
    );
  }
  if (query.isError) {
    return (
      <p
        role="alert"
        className="m-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:m-6"
      >
        Unable to load user: {query.error.message}
      </p>
    );
  }
  if (!account) {
    return (
      <div className="space-y-4 p-4 sm:p-6">
        <Link
          to="/admin/users"
          className={buttonVariants({ variant: "outline", className: "w-fit" })}
        >
          <ArrowLeft className="size-4" />
          Back to users
        </Link>
        <p role="alert" className="text-sm text-slate-500">
          User details are unavailable.
        </p>
      </div>
    );
  }

  const confirmDelete = () => {
    if (window.confirm(`Hapus akun ${account.name}? Akun akan dinonaktifkan dan diarsipkan.`)) {
      removeUser.mutate(account.id);
    }
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <Link
        to="/admin/users"
        className={buttonVariants({ variant: "outline", className: "w-fit" })}
      >
        <ArrowLeft className="size-4" />
        Back to users
      </Link>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-6">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
          <div className="flex min-w-0 items-center gap-4">
            <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <UserRound className="size-7" />
            </span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-2xl">
                  {account.name}
                </h1>
                {account.is_superadmin && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    <ShieldCheck className="size-3.5" />
                    Superadmin
                  </span>
                )}
              </div>
              <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
                {account.email}
              </p>
            </div>
          </div>
          {!account.is_superadmin && (
            <Button
              type="button"
              variant="outline"
              onClick={confirmDelete}
              disabled={removeUser.isPending}
              className="w-full sm:w-auto bg-red-100 text-red-700 hover:bg-red-200"
            >
              <Trash2 className="size-4" />
              Delete user
            </Button>
          )}
        </div>
        {removeUser.isError && (
          <p
            role="alert"
            className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            Unable to delete user: {removeUser.error.message}
          </p>
        )}

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
            <span className="mt-0.5 text-slate-400">
              <UserRound className="size-4" />
            </span>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Phone
              </p>
              <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100">
                {account.phone || "—"}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
            <span className="mt-0.5 text-slate-400">
              {account.is_active ? (
                <CheckCircle2 className="size-4 text-emerald-600" />
              ) : (
                <XCircle className="size-4 text-slate-400" />
              )}
            </span>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Account status
              </p>
              <p
                className={`mt-1 text-sm font-medium ${
                  account.is_active
                    ? "text-emerald-700 dark:text-emerald-300"
                    : "text-slate-600 dark:text-slate-300"
                }`}
              >
                {account.is_active ? "Active" : "Inactive"}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
            <span className="mt-0.5 text-slate-400">
              <Mail className="size-4" />
            </span>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Email verified
              </p>
              <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100">
                {account.email_verified_at
                  ? formatDate(account.email_verified_at)
                  : "Not verified"}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-xl bg-slate-50 p-4 dark:bg-slate-900">
            <span className="mt-0.5 text-slate-400">
              <CalendarDays className="size-4" />
            </span>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                Registered
              </p>
              <p className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-100">
                {formatDate(account.created_at)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
              <Building2 className="size-4" />
            </span>
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                Companies
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Company memberships
              </p>
            </div>
          </div>
          {account.companies?.length ? (
            <ul className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
              {account.companies.map((company) => (
                <li
                  key={company.id}
                  className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                >
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                    {company.name}
                  </span>
                  <span className="shrink-0 rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                    {company.code}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">
              No company memberships.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-6">
          <div className="flex items-center gap-3">
            <span className="flex size-9 items-center justify-center rounded-lg bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
              <MapPin className="size-4" />
            </span>
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                Branches and roles
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Assigned access across the system
              </p>
            </div>
          </div>
          {account.branches?.length || account.roles?.length ? (
            <ul className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
              {account.branches?.map((branch) => (
                <li
                  key={`branch-${branch.id}`}
                  className="flex items-center justify-between gap-3 py-3 first:pt-0"
                >
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                    {branch.name}
                  </span>
                  <span className="shrink-0 rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                    {branch.code}
                  </span>
                </li>
              ))}
              {account.roles?.map((role) => (
                <li
                  key={`role-${role.id}`}
                  className="flex items-center justify-between gap-3 py-3 last:pb-0"
                >
                  <span className="text-sm font-medium text-slate-800 dark:text-slate-100">
                    {role.name}
                  </span>
                  <span className="shrink-0 rounded-md bg-blue-50 px-2 py-1 text-xs text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                    Role
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-slate-900 dark:text-slate-400">
              No branch or role assignments.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
