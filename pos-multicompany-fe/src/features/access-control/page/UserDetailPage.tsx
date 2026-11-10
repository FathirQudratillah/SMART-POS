import { useMemo, useState } from "react";
import { ArrowLeft, KeyRound, LockKeyhole, Save, UserRound } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { Button, buttonVariants } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAlert } from "@/context/AlertContext";
import { useAuth } from "@/context/auth/AuthContext";
import { useBranches } from "@/features/company-management/branches/hooks/useBranches";
import { useCompanyUser } from "../hooks/useCompanyUser";
import {
  useUpdateCompanyUser,
  useChangeCompanyUserPassword,
  useUpdateUserPermissions,
} from "../hooks/useCompanyUserMutations";
import type { AccessPermission, CompanyUserDetail } from "../types";

export default function UserDetailPage() {
  const { id } = useParams();
  const { company, user: authUser } = useAuth();
  const userId = Number(id);
  const query = useCompanyUser(
    company?.id ?? null,
    Number.isInteger(userId) && userId > 0 ? userId : null,
  );
  const branchesQuery = useBranches({
    companyId: company?.id ?? null,
    page: 1,
    per_page: 100,
  });
  const userDetail = query.data?.data;

  if (query.isLoading) {
    return <p role="status" className="p-6 text-sm text-slate-500">Loading user details...</p>;
  }
  if (query.isError) {
    return (
      <p role="alert" className="m-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
        Unable to load user: {query.error.message}
      </p>
    );
  }
  if (!userDetail) return null;

  return (
    <UserDetailEditor
      key={`${userDetail.user.id}:${userDetail.branch.id}`}
      userDetail={userDetail}
      branches={branchesQuery.data?.data.data ?? []}
      branchesError={branchesQuery.isError ? branchesQuery.error.message : ""}
      branchesLoading={branchesQuery.isLoading}
      authUserId={authUser?.id ?? null}
    />
  );
}

function UserDetailEditor({
  userDetail,
  branches,
  branchesError,
  branchesLoading,
  authUserId,
}: {
  userDetail: CompanyUserDetail;
  branches: { id: number; code: string; name: string }[];
  branchesError: string;
  branchesLoading: boolean;
  authUserId: number | null;
}) {
  const { showMessage } = useAlert();
  const userId = userDetail.user.id;
  const updateUser = useUpdateCompanyUser(userId);
  const changePassword = useChangeCompanyUserPassword(userId);
  const updatePermissions = useUpdateUserPermissions(userId);
  const [name, setName] = useState(userDetail.user.name);
  const [phone, setPhone] = useState(userDetail.user.phone ?? "");
  const [branchId, setBranchId] = useState(userDetail.branch.id);
  const [permissionIds, setPermissionIds] = useState(userDetail.permission_ids);
  const [profileError, setProfileError] = useState("");
  const [permissionError, setPermissionError] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const isSelf = authUserId === userId;
  const { refreshUser } = useAuth();

  const permissionsByModule = useMemo(
    () =>
      userDetail.permissions.reduce<Record<string, AccessPermission[]>>(
        (groups, permission) => {
          (groups[permission.module] ??= []).push(permission);
          return groups;
        },
        {},
      ),
    [userDetail.permissions],
  );

  const saveProfile = () => {
    setProfileError("");
    updateUser.mutate(
      { name: name.trim(), phone: phone.trim(), branch_id: branchId },
      {
        onSuccess: (message) =>
          showMessage({ variant: "success", title: "User updated", description: message }),
        onError: (error) => setProfileError(error.message),
      },
    );
  };

  const saveUserPermissions = () => {
    setPermissionError("");
    updatePermissions.mutate(
      { branch_id: branchId, permission_ids: permissionIds },
      {
        onSuccess: (message) =>
          showMessage({ variant: "success", title: "Permissions updated", description: message }),
        onError: (error) => setPermissionError(error.message),
      },
    );
  };

  const savePassword = () => {
    setPasswordError("");
    if (newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== passwordConfirmation) {
      setPasswordError("Password confirmation does not match.");
      return;
    }

    changePassword.mutate(
      { password: newPassword, password_confirmation: passwordConfirmation },
      {
        onSuccess: (message) => {
          setNewPassword("");
          setPasswordConfirmation("");
          showMessage({ variant: "success", title: "Password changed", description: message });
          refreshUser();
        },
        onError: (error) => setPasswordError(error.message),
      },
    );
  };

  const togglePermission = (permissionId: number, checked: boolean) => {
    setPermissionIds((current) =>
      checked
        ? [...new Set([...current, permissionId])]
        : current.filter((id) => id !== permissionId),
    );
  };

  const toggleModule = (module: string, checked: boolean) => {
    const ids = (permissionsByModule[module] ?? []).map((permission) => permission.id);
    setPermissionIds((current) => {
      const currentSet = new Set(current);
      ids.forEach((id) => (checked ? currentSet.add(id) : currentSet.delete(id)));
      return [...currentSet];
    });
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 sm:p-6">
      <Link
        to="/users"
        className={buttonVariants({ variant: "outline", className: "w-fit" })}
      >
        <ArrowLeft className="size-4" /> Back to users
      </Link>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
            <UserRound className="size-5" />
          </span>
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
              User Details
            </h1>
            <p className="text-sm text-slate-500">{userDetail.user.email}</p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="user-detail-name">Name</Label>
            <Input
              id="user-detail-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="user-detail-email">Email</Label>
            <Input
              id="user-detail-email"
              value={userDetail.user.email}
              readOnly
              disabled
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="user-detail-phone">Phone</Label>
            <Input
              id="user-detail-phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="user-detail-branch">Assigned branch</Label>
            <select
              id="user-detail-branch"
              value={branchId || ""}
              onChange={(event) => setBranchId(Number(event.target.value))}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm dark:border-slate-800 dark:bg-slate-950"
              disabled={branchesLoading}
            >
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.code} — {branch.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        {profileError && (
          <p
            role="alert"
            className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {profileError}
          </p>
        )}
        {branchesError && (
          <p
            role="alert"
            className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            Unable to load branch options: {branchesError}
          </p>
        )}
        <div className="mt-5 flex justify-end">
          <Button
            onClick={saveProfile}
            variant="outline"
            className="bg-blue-100 text-blue-700 hover:bg-blue-200"
            disabled={
              updateUser.isPending ||
              !name.trim() ||
              !branchId ||
              branchesLoading ||
              !!branchesError
            }
          >
            <Save className="size-4" />
            {updateUser.isPending ? "Saving..." : "Save User"}
          </Button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex size-10 items-center justify-center rounded-xl bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300">
            <LockKeyhole className="size-5" />
          </span>
          <div>
            <h2 className="font-semibold text-slate-900 dark:text-slate-100">
              Change Password
            </h2>
            <p className="text-sm text-slate-500">
              Set a new password for {userDetail.user.name}.
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="user-new-password">New password</Label>
            <Input
              id="user-new-password"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="user-password-confirmation">Confirm new password</Label>
            <Input
              id="user-password-confirmation"
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={passwordConfirmation}
              onChange={(event) => setPasswordConfirmation(event.target.value)}
            />
          </div>
        </div>
        {passwordError && (
          <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {passwordError}
          </p>
        )}
        <div className="mt-5 flex justify-end">
          <Button
            onClick={savePassword}
            variant="outline"
            className="bg-blue-100 text-blue-700 hover:bg-blue-200"
            disabled={
              changePassword.isPending ||
              !newPassword ||
              !passwordConfirmation
            }
          >
            <LockKeyhole className="size-4" />
            {changePassword.isPending ? "Changing Password..." : "Change Password"}
          </Button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-950 sm:p-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-violet-50 text-violet-700 dark:bg-violet-950 dark:text-violet-300">
              <KeyRound className="size-5" />
            </span>
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-slate-100">
                Individual Permissions
              </h2>
              <p className="text-sm text-slate-500">
                Set access for {userDetail.branch.name}; these overrides do not
                change another user&apos;s access.
              </p>
            </div>
          </div>
          {userDetail.uses_custom_permissions && (
            <span className="w-fit rounded-full bg-violet-50 px-3 py-1 text-xs font-medium text-violet-700">
              Custom permissions active
            </span>
          )}
        </div>
        {isSelf ? (
          <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            You cannot change your own permissions.
          </p>
        ) : userDetail.permissions.length === 0 ? (
          <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-600">
            No permissions are available. Add permission definitions before
            configuring access.
          </p>
        ) : (
          <>
            <div className="space-y-4">
              {Object.entries(permissionsByModule).map(
                ([module, permissions]) => {
                  const moduleIds = permissions.map(
                    (permission) => permission.id,
                  );
                  const allChecked = moduleIds.every((id) =>
                    permissionIds.includes(id),
                  );
                  const someChecked = moduleIds.some((id) =>
                    permissionIds.includes(id),
                  );
                  return (
                    <div
                      key={module}
                      className="rounded-xl border border-slate-200 dark:border-slate-800"
                    >
                      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                        <h3 className="font-semibold capitalize text-slate-800 dark:text-slate-100">
                          {module.replaceAll("_", " ")}
                        </h3>
                        <label className="flex items-center gap-2 text-xs text-slate-500">
                          Select module
                          <Checkbox
                            checked={allChecked}
                            onCheckedChange={(checked) =>
                              toggleModule(module, checked === true)
                            }
                            aria-label={`Select all ${module} permissions`}
                          />
                        </label>
                        {someChecked && !allChecked && (
                          <span className="sr-only">
                            Some permissions in this module are selected
                          </span>
                        )}
                      </div>
                      <div className="grid gap-3 p-4 sm:grid-cols-2">
                        {permissions.map((permission) => (
                          <label
                            key={permission.id}
                            className="flex cursor-pointer items-start gap-3 rounded-lg bg-slate-50 p-3 dark:bg-slate-900"
                          >
                            <Checkbox
                              checked={permissionIds.includes(permission.id)}
                              onCheckedChange={(checked) =>
                                togglePermission(
                                  permission.id,
                                  checked === true,
                                )
                              }
                            />
                            <span>
                              <span className="block text-sm font-medium text-slate-800 dark:text-slate-100">
                                {permission.name}
                              </span>
                              <span className="mt-0.5 block text-xs text-slate-500">
                                {permission.description || permission.code}
                              </span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  );
                },
              )}
            </div>
            {permissionError && (
              <p
                role="alert"
                className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700"
              >
                {permissionError}
              </p>
            )}
            <div className="mt-5 flex justify-end">
              <Button
                onClick={saveUserPermissions}
                disabled={updatePermissions.isPending}
                variant="outline"
                className="bg-blue-100 text-blue-700 hover:bg-blue-200"
              >
                <Save className="size-4" />
                {updatePermissions.isPending
                  ? "Saving Permissions..."
                  : "Save Permissions"}
              </Button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
