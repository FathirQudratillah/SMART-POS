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
import { useAuth } from "@/context/auth/AuthContext";
import { useShowCustomer } from "../hooks/useShowCustomer";
import { useUpdateCustomer } from "../hooks/useUpdateCustomer";
import type { CustomerUpdateRequest } from "../types";

export default function CustomerEditForm({
  id,
  onOpenChange,
  setErrorMessage,
}: FormProps) {
  const { showMessage } = useAlert();
  const { company } = useAuth();
  const { data } = useShowCustomer({ companyId: company?.id ?? null, id });
  const customer = data?.data;
  const mutation = useUpdateCustomer(id ?? 0);
  const {
    register,
    handleSubmit,
    reset,
    control,
    setError,
    formState: { errors },
  } = useForm<CustomerUpdateRequest>({
    defaultValues: {
      code: "",
      name: "",
      phone: "",
      email: "",
      address: "",
      is_active: true,
    },
    mode: "onBlur",
  });

  useEffect(() => {
    if (customer)
      reset({
        code: customer.code,
        name: customer.name,
        phone: customer.phone ?? "",
        email: customer.email ?? "",
        address: customer.address ?? "",
        is_active: customer.is_active,
      });
  }, [customer, reset]);

  const onSubmit: SubmitHandler<CustomerUpdateRequest> = (payload) => {
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
            setError(field as keyof CustomerUpdateRequest, {
              type: "server",
              message: messages[0],
            }),
          );
          setErrorMessage("Please check the form fields.");
        } else setErrorMessage(error.message || "Failed to update customer.");
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <section className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold">Customer Information</h3>
          <p className="text-sm text-gray-600">Details about the customer.</p>
        </div>
        <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
              <PackageCheck className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <Label
                htmlFor="edit-customer-is-active"
                className="cursor-pointer font-semibold text-slate-800"
              >
                Customer Status
              </Label>
              <p className="text-sm text-slate-500">
                Enable or disable this customer.
              </p>
            </div>
          </div>
          <Controller
            name="is_active"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="edit-customer-is-active"
                checked={field.value}
                onCheckedChange={field.onChange}
                className="h-5 w-5 border-slate-400 text-white data-checked:border-green-600 data-checked:bg-green-600"
              />
            )}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-slate-500" htmlFor="edit-customer-code">
              Code *
            </Label>
            <Input
              id="edit-customer-code"
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
            <Label htmlFor="edit-customer-name">Customer Name *</Label>
            <Input
              id="edit-customer-name"
              autoComplete="name"
              placeholder="Enter Customer Name"
              maxLength={150}
              aria-invalid={!!errors.name}
              {...register("name", {
                required: "Customer name is required.",
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
            <Label htmlFor="edit-customer-phone">Phone</Label>
            <Input
              id="edit-customer-phone"
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
            <Label htmlFor="edit-customer-email">Email</Label>
            <Input
              id="edit-customer-email"
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
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="edit-customer-address">Address</Label>
            <Input
              id="edit-customer-address"
              placeholder="Enter Address"
              {...register("address")}
            />
          </div>
        </div>
      </section>
      <Button
        type="submit"
        disabled={mutation.isPending || !customer}
        className="w-full bg-blue-400 text-white hover:bg-blue-500"
      >
        {mutation.isPending ? "Updating Customer..." : "Update Customer"}
        {mutation.isPending && <Spinner />}
      </Button>
    </form>
  );
}
