import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { adminKeys, deleteAdminUser, getAdminUsers } from "../api/admin";
import { useAuth } from "@/context/auth/AuthContext";

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();
  const query = useQuery({
    queryKey: adminKeys.users(search, page),
    queryFn: () => getAdminUsers(search, page),
  });
  const removeUser = useMutation({
    mutationFn: deleteAdminUser,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: adminKeys.all });
    },
  });
  const result = query.data?.data;

  const confirmDelete = (id: number, name: string) => {
    if (!window.confirm(`Hapus akun ${name}? Akun akan dinonaktifkan dan diarsipkan.`)) return;
    removeUser.mutate(id);
  };

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
            User management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            View user accounts and their company access. User records are
            read-only here.
          </p>
        </div>
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            placeholder="Search name, email, or phone"
            aria-label="Search users"
            className="h-10 rounded-lg border-slate-200 bg-white pl-10 shadow-none focus-visible:ring-blue-500 dark:border-slate-800 dark:bg-slate-950"
          />
        </div>
      </header>

      {query.isLoading && (
        <p role="status" className="text-sm text-slate-500">
          Loading users...
        </p>
      )}
      {(query.isError || removeUser.isError) && (
        <p
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          {query.error?.message ?? removeUser.error?.message}
        </p>
      )}

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-950">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-900">
            <TableRow className="border-b border-slate-200 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-900">
              <TableHead className="h-12 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 sm:px-5">
                User
              </TableHead>
              <TableHead className="h-12 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Phone
              </TableHead>
              <TableHead className="h-12 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Companies
              </TableHead>
              <TableHead className="h-12 px-4 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Status
              </TableHead>
              <TableHead className="h-12 px-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 sm:px-5">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result?.data.map((account) => (
              <TableRow
                key={account.id}
                className="border-b border-slate-100 hover:bg-blue-50/60 dark:border-slate-800 dark:hover:bg-slate-900"
              >
                <TableCell className="whitespace-normal px-4 py-3.5 sm:px-5">
                  <div className="flex min-w-52 items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-50 text-sm font-semibold text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      {account.name.trim().charAt(0).toUpperCase() || "?"}
                    </span>
                    <div className="min-w-0">
                      <Link
                        to={`/admin/users/${account.id}`}
                        className="block truncate font-medium text-slate-800 hover:text-blue-700 dark:text-slate-100 dark:hover:text-blue-300"
                      >
                        {account.name}
                      </Link>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {account.email}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3.5 text-sm text-slate-600 dark:text-slate-300">
                  {account.phone || "—"}
                </TableCell>
                <TableCell className="px-4 py-3.5 text-sm text-slate-600 dark:text-slate-300">
                  {account.companies_count ?? 0}
                </TableCell>
                <TableCell className="px-4 py-3.5">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                        account.is_active
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {account.is_active ? "Active" : "Inactive"}
                    </span>
                    {account.is_superadmin && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                        <ShieldCheck className="size-3" />
                        Superadmin
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-3.5 sm:px-5">
                  <div className="flex justify-end gap-1">
                    <Link
                      to={`/admin/users/${account.id}`}
                      aria-label={`View ${account.name}`}
                      className={buttonVariants({
                        variant: "outline",
                        size: "icon",
                        className: "bg-blue-100 text-blue-700 hover:bg-blue-200",
                      })}
                    >
                      <UserRound className="size-4" />
                    </Link>
                    {!account.is_superadmin &&
                      account.id !== currentUser?.id && (
                        <Button
                          type="button"
                          variant="outline"
                          className="bg-red-100 text-red-700 hover:bg-red-200"
                          size="icon"
                          aria-label={`Delete ${account.name}`}
                          disabled={removeUser.isPending}
                          onClick={() =>
                            confirmDelete(account.id, account.name)
                          }
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!query.isLoading && result?.data.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-36 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Search className="size-8 text-slate-300 dark:text-slate-700" />
                    <p className="font-medium text-slate-700 dark:text-slate-300">
                      No users found
                    </p>
                    <p className="text-sm text-slate-500">
                      Try adjusting your search.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {result && (
          <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:px-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {result.total.toLocaleString("id-ID")} users
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
