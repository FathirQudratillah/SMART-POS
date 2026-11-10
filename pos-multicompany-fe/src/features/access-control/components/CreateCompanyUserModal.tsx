import { useState } from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FormLogo from "@/components/ui/FormLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useAlert } from "@/context/AlertContext";
import { useAuth } from "@/context/auth/AuthContext";
import { useBranches } from "@/features/company-management/branches/hooks/useBranches";
import { useCreateCompanyUser } from "../hooks/useCompanyUserMutations";
import type { CreateCompanyUserRequest } from "../types";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const initialValues: CreateCompanyUserRequest = {
  name: "",
  email: "",
  phone: "",
  password: "",
  branch_id: 0,
};

export default function CreateCompanyUserModal({ open, onOpenChange }: Props) {
  const { company } = useAuth();
  const { showMessage } = useAlert();
  const [formError, setFormError] = useState("");
  const branchesQuery = useBranches({
    companyId: company?.id ?? null,
    page: 1,
    per_page: 100,
  });
  const createMutation = useCreateCompanyUser();
  const {
    register,
    handleSubmit,
    reset,
    control,
    setError,
    formState: { errors },
  } = useForm<CreateCompanyUserRequest>({
    defaultValues: initialValues,
    mode: "onBlur",
  });

  const submit: SubmitHandler<CreateCompanyUserRequest> = (payload) => {
    setFormError("");
    createMutation.mutate(payload, {
      onSuccess: (response) => {
        showMessage({
          variant: "success",
          title: "User created",
          description: response.message,
        });
        reset(initialValues);
        onOpenChange(false);
      },
      onError: (error) => {
        if (error.errors) {
          Object.entries(error.errors).forEach(([field, messages]) => {
            if (field in initialValues) {
              setError(field as keyof CreateCompanyUserRequest, {
                type: "server",
                message: messages[0],
              });
            }
          });
          setFormError("Please check the form fields.");
        } else {
          setFormError(error.message);
        }
      },
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) {
          reset(initialValues);
          setFormError("");
        }
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto bg-white p-0 sm:max-w-2xl">
        <div className="p-6 sm:p-8">
          <DialogHeader className="mb-6">
            <FormLogo />
            <DialogTitle className="text-2xl font-bold tracking-tight">
              Add Company User
            </DialogTitle>
            <DialogDescription>
              Create a login account and assign it to a branch. Configure its individual permissions from the user detail page.
            </DialogDescription>
          </DialogHeader>
          {formError && (
            <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {formError}
            </p>
          )}
          {branchesQuery.isError && (
            <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              Unable to load branches: {branchesQuery.error.message}
            </p>
          )}
          <form onSubmit={handleSubmit(submit)} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="company-user-name">Full name *</Label>
                <Input
                  id="company-user-name"
                  autoComplete="name"
                  maxLength={150}
                  {...register("name", { required: "Name is required." })}
                />
                {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-user-email">Email *</Label>
                <Input
                  id="company-user-email"
                  type="email"
                  autoComplete="email"
                  maxLength={150}
                  {...register("email", {
                    required: "Email is required.",
                    pattern: { value: /^\S+@\S+\.\S+$/, message: "Enter a valid email address." },
                  })}
                />
                {errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="company-user-phone">Phone</Label>
                <Input id="company-user-phone" maxLength={30} {...register("phone")} />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="company-user-password">Initial password *</Label>
                <Input
                  id="company-user-password"
                  type="password"
                  autoComplete="new-password"
                  minLength={8}
                  {...register("password", {
                    required: "Initial password is required.",
                    minLength: { value: 8, message: "Password must be at least 8 characters." },
                  })}
                />
                {errors.password && <p className="text-sm text-red-600">{errors.password.message}</p>}
                <p className="text-xs text-slate-500">
                  Share this initial password securely with the new user.
                </p>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="company-user-branch">Branch *</Label>
                <Controller
                  name="branch_id"
                  control={control}
                  rules={{ validate: (value) => value > 0 || "Select a branch." }}
                  render={({ field }) => (
                    <select
                      id="company-user-branch"
                      value={field.value || ""}
                      onChange={(event) => field.onChange(Number(event.target.value))}
                      className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm"
                      disabled={branchesQuery.isLoading}
                    >
                      <option value="">Select branch</option>
                      {(branchesQuery.data?.data.data ?? []).map((branch) => (
                        <option key={branch.id} value={branch.id}>
                          {branch.code} — {branch.name}
                        </option>
                      ))}
                    </select>
                  )}
                />
                {errors.branch_id && <p className="text-sm text-red-600">{errors.branch_id.message}</p>}
              </div>
            </div>
            <Button
              type="submit"
              variant="outline"
              className="w-full bg-blue-100 text-blue-700 hover:bg-blue-200"
              disabled={createMutation.isPending || branchesQuery.isLoading || branchesQuery.isError}
            >
              {createMutation.isPending ? "Creating User..." : "Create User"}
              {createMutation.isPending && <Spinner />}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
