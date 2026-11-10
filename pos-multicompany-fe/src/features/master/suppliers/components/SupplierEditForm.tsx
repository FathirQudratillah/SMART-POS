import { useEffect } from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { PackageCheck } from "lucide-react";
import type { ApiErrorResponse, FormProps } from "@/types";
import { useAlert } from "@/context/AlertContext";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useShowSupplier } from "../hooks/useShowSupplier";
import { useUpdateSupplier } from "../hooks/useUpdateSupplier";
import { useAuth } from "@/context/auth/AuthContext";
import type { SupplierUpdateRequest } from "../types";

export default function SupplierEditForm({
  id,
  onOpenChange,
  setErrorMessage,
}: FormProps) {
  const { showMessage } = useAlert();
  const { company } = useAuth();
  const { data } = useShowSupplier({ companyId: company?.id ?? null, id });
  const supplier = data?.data;
  const mutation = useUpdateSupplier(id ?? 0);
  const {
    register,
    handleSubmit,
    reset,
    control,
    setError,
    formState: { errors },
  } = useForm<SupplierUpdateRequest>({
    defaultValues: {
      code: "",
      name: "",
      phone: "",
      email: "",
      address: "",
      tax_number: "",
      is_active: true,
    },
    mode: "onBlur",
  });

  useEffect(() => {
    if (supplier)
      reset({
        code: supplier.code,
        name: supplier.name,
        phone: supplier.phone ?? "",
        email: supplier.email ?? "",
        address: supplier.address ?? "",
        tax_number: supplier.tax_number ?? "",
        is_active: supplier.is_active,
      });
  }, [supplier, reset]);

  const onSubmit: SubmitHandler<SupplierUpdateRequest> = (payload) => {
    setErrorMessage("");
    mutation.mutate(payload, {
      onSuccess: (message) => {
        showMessage({ variant: "success", title: "Success", description: message });
        reset();
        onOpenChange(false);
      },
      onError: (error: ApiErrorResponse) => {
        if (error.errors) {
          Object.entries(error.errors).forEach(([field, messages]) =>
            setError(field as keyof SupplierUpdateRequest, {
              type: "server",
              message: messages[0],
            }),
          );
          setErrorMessage("Please check the form fields.");
        } else setErrorMessage(error.message || "Failed to update supplier.");
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <section className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold">Supplier Information</h3>
          <p className="text-sm text-gray-600">Details about the supplier.</p>
        </div>
        <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
              <PackageCheck className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <Label
                htmlFor="edit-supplier-is-active"
                className="cursor-pointer font-semibold text-slate-800"
              >
                Supplier Status
              </Label>
              <p className="text-sm text-slate-500">
                Enable or disable this supplier.
              </p>
            </div>
          </div>
          <Controller
            name="is_active"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="edit-supplier-is-active"
                checked={field.value}
                onCheckedChange={field.onChange}
                className="h-5 w-5 border-slate-400 text-white data-checked:border-green-600 data-checked:bg-green-600"
              />
            )}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-slate-500" htmlFor="edit-supplier-code">
              Code *
            </Label>
            <Input
              id="edit-supplier-code"
              autoComplete="off"
              placeholder="Enter Code"
              maxLength={50}
              disabled
              aria-invalid={!!errors.code}
              {...register("code", {
                required: "Code is required.",
                maxLength: {
                  value: 50,
                  message: "Code cannot exceed 50 characters.",
                },
              })}
            />
            {errors.code && (
              <p className="text-sm text-red-600">{errors.code.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-supplier-name">Supplier Name *</Label>
            <Input
              id="edit-supplier-name"
              autoComplete="name"
              placeholder="Enter Supplier Name"
              maxLength={150}
              aria-invalid={!!errors.name}
              {...register("name", {
                required: "Supplier name is required.",
                maxLength: {
                  value: 150,
                  message: "Name cannot exceed 150 characters.",
                },
              })}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-supplier-phone">Phone</Label>
            <Input
              id="edit-supplier-phone"
              type="tel"
              autoComplete="tel"
              placeholder="Enter Phone"
              maxLength={30}
              aria-invalid={!!errors.phone}
              {...register("phone", {
                maxLength: {
                  value: 30,
                  message: "Phone cannot exceed 30 characters.",
                },
              })}
            />
            {errors.phone && (
              <p className="text-sm text-red-600">{errors.phone.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-supplier-email">Email</Label>
            <Input
              id="edit-supplier-email"
              type="email"
              autoComplete="email"
              placeholder="Enter Email"
              maxLength={150}
              aria-invalid={!!errors.email}
              {...register("email", {
                maxLength: {
                  value: 150,
                  message: "Email cannot exceed 150 characters.",
                },
              })}
            />
            {errors.email && (
              <p className="text-sm text-red-600">{errors.email.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-supplier-tax-number">Tax Number</Label>
            <Input
              id="edit-supplier-tax-number"
              placeholder="Enter Tax Number"
              maxLength={50}
              aria-invalid={!!errors.tax_number}
              {...register("tax_number", {
                maxLength: {
                  value: 50,
                  message: "Tax number cannot exceed 50 characters.",
                },
              })}
            />
            {errors.tax_number && (
              <p className="text-sm text-red-600">
                {errors.tax_number.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-supplier-address">Address</Label>
            <Input
              id="edit-supplier-address"
              placeholder="Enter Address"
              {...register("address")}
            />
          </div>
        </div>
      </section>
      <Button
        type="submit"
        disabled={mutation.isPending || !supplier}
        className="w-full bg-blue-400 text-white hover:bg-blue-500"
      >
        {mutation.isPending ? "Updating Supplier..." : "Update Supplier"}
        {mutation.isPending && <Spinner />}
      </Button>
    </form>
  );
}
