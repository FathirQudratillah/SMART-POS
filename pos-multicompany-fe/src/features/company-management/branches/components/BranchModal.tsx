import { useEffect, useState } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useAlert } from "@/context/AlertContext";
import { useSaveBranch } from "../hooks/useSaveBranch";
import type { Branch, BranchFormValues } from "../types";

type BranchModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  branch: Branch | null;
};

const initialValues: BranchFormValues = {
  code: "",
  name: "",
  address: "",
  phone: "",
  is_active: true,
};

export default function BranchModal({
  open,
  onOpenChange,
  branch,
}: BranchModalProps) {
  const { showMessage } = useAlert();
  const mutation = useSaveBranch();
  const [formError, setFormError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors },
  } = useForm<BranchFormValues>({
    defaultValues: branch
      ? {
          code: branch.code,
          name: branch.name,
          address: branch.address ?? "",
          phone: branch.phone ?? "",
          is_active: branch.is_active,
        }
      : initialValues,
    mode: "onBlur",
  });

  useEffect(() => {
    reset(
      branch
        ? {
            code: branch.code,
            name: branch.name,
            address: branch.address ?? "",
            phone: branch.phone ?? "",
            is_active: branch.is_active,
          }
        : initialValues,
    );
  }, [branch, reset]);

  const submit: SubmitHandler<BranchFormValues> = (payload) => {
    setFormError("");
    mutation.mutate(
      { payload, id: branch?.id },
      {
        onSuccess: (message) => {
          showMessage({ variant: "success", title: "Success", description: message });
          onOpenChange(false);
        },
        onError: (error) => {
          if (error.errors) {
            Object.entries(error.errors).forEach(([field, messages]) => {
              if (field in initialValues) {
                setError(field as keyof BranchFormValues, {
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
      },
    );
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (nextOpen) {
          setFormError("");
          reset(
            branch
              ? {
                  code: branch.code,
                  name: branch.name,
                  address: branch.address ?? "",
                  phone: branch.phone ?? "",
                  is_active: branch.is_active,
                }
              : initialValues,
          );
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto bg-white p-0 sm:max-w-2xl">
        <div className="p-6 sm:p-8">
          <DialogHeader className="mb-6">
            <FormLogo />
            <DialogTitle className="text-2xl font-bold tracking-tight">
              {branch ? "Edit Branch" : "Add Branch"}
            </DialogTitle>
            <DialogDescription>
              {branch ? "Update branch information." : "Create a branch for your company."}
            </DialogDescription>
          </DialogHeader>
          {formError && (
            <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {formError}
            </p>
          )}
          <form onSubmit={handleSubmit(submit)} className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="branch-code">Code *</Label>
                <Input
                  id="branch-code"
                  maxLength={30}
                  aria-invalid={!!errors.code}
                  {...register("code", {
                    required: "Branch code is required.",
                    maxLength: { value: 30, message: "Code cannot exceed 30 characters." },
                  })}
                />
                {errors.code && <p className="text-sm text-red-600">{errors.code.message}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="branch-name">Name *</Label>
                <Input
                  id="branch-name"
                  maxLength={150}
                  aria-invalid={!!errors.name}
                  {...register("name", {
                    required: "Branch name is required.",
                    maxLength: { value: 150, message: "Name cannot exceed 150 characters." },
                  })}
                />
                {errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="branch-address">Address</Label>
                <Input id="branch-address" {...register("address")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="branch-phone">Phone</Label>
                <Input
                  id="branch-phone"
                  maxLength={30}
                  {...register("phone", {
                    maxLength: { value: 30, message: "Phone cannot exceed 30 characters." },
                  })}
                />
                {errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}
              </div>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div>
                <Label htmlFor="branch-is-active" className="font-semibold">Active branch</Label>
                <p className="text-sm text-slate-500">Inactive branches cannot be used for new operations.</p>
              </div>
              <Controller
                name="is_active"
                control={control}
                render={({ field }) => (
                  <Checkbox
                    id="branch-is-active"
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                  />
                )}
              />
            </div>
            <Button
              type="submit"
              variant={branch ? "default" : "outline"}
              className={branch ? "w-full" : "w-full bg-blue-100 text-blue-700 hover:bg-blue-200"}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Saving Branch..." : branch ? "Save Changes" : "Add Branch"}
              {mutation.isPending && <Spinner />}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
