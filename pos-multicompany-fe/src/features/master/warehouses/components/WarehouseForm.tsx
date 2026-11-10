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
import { useAddWarehouse } from "../hooks/useAddWarehouse";
import type { WarehouseFormRequest } from "../types";

const initialForm: WarehouseFormRequest = {
  branch_id: null,
  code: "",
  name: "",
  address: "",
  is_active: true,
};

type WarehouseFormProps = FormProps;

export default function WarehouseForm({
  onOpenChange,
  setErrorMessage,
}: WarehouseFormProps) {
  const { showMessage } = useAlert();
  const { branch } = useAuth();
  const mutation = useAddWarehouse();
  const {
    register,
    handleSubmit,
    reset,
    control,
    setError,
    formState: { errors },
  } = useForm<WarehouseFormRequest>({
    defaultValues: initialForm,
    mode: "onBlur",
  });

  

  const onSubmit: SubmitHandler<WarehouseFormRequest> = (payload) => {
    setErrorMessage("");
     const requestPayload: WarehouseFormRequest = {
       ...payload,
       branch_id: branch?.id ?? null,
     };
    mutation.mutate(requestPayload, {
      onSuccess: (message) => {
        showMessage({ variant: "success", title: "Success", description: message });
        reset(initialForm);
        onOpenChange(false);
      },
      onError: (error: ApiErrorResponse) => {
        if (error.errors) {
          Object.entries(error.errors).forEach(([field, messages]) =>
            setError(field as keyof WarehouseFormRequest, {
              type: "server",
              message: messages[0],
            }),
          );
          setErrorMessage("Please check the form fields.");
        } else setErrorMessage(error.message || "Failed to create warehouse.");
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <section className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold">Warehouse Information</h3>
          <p className="text-sm text-gray-600">Details about the warehouse.</p>
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="warehouse-code">Code *</Label>
            <Input
              id="warehouse-code"
              autoComplete="off"
              placeholder="Enter Code"
              maxLength={40}
              aria-invalid={!!errors.code}
              {...register("code", {
                required: "Code is required.",
                maxLength: {
                  value: 40,
                  message: "Code cannot exceed 40 characters.",
                },
              })}
            />
            {errors.code && (
              <p className="text-sm text-red-600">{errors.code.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="warehouse-name">Warehouse Name *</Label>
            <Input
              id="warehouse-name"
              autoComplete="off"
              placeholder="Enter Warehouse Name"
              maxLength={150}
              aria-invalid={!!errors.name}
              {...register("name", {
                required: "Warehouse name is required.",
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
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="warehouse-address">Address</Label>
            <Input
              id="warehouse-address"
              placeholder="Enter Address"
              {...register("address")}
            />
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
              <PackageCheck className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <Label
                htmlFor="warehouse-is-active"
                className="cursor-pointer font-semibold text-slate-800"
              >
                Warehouse Status
              </Label>
              <p className="text-sm text-slate-500">
                Enable or disable this warehouse.
              </p>
            </div>
          </div>
          <Controller
            name="is_active"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="warehouse-is-active"
                checked={field.value}
                onCheckedChange={field.onChange}
                className="h-5 w-5 border-slate-400 text-white data-checked:border-green-600 data-checked:bg-green-600"
              />
            )}
          />
        </div>
      </section>
      <Button
        type="submit"
        variant="outline"
        className="w-full bg-blue-100 text-blue-700 hover:bg-blue-200"
        disabled={mutation.isPending}
      >
        {mutation.isPending ? "Adding Warehouse..." : "Add Warehouse"}
        {mutation.isPending && <Spinner />}
      </Button>
    </form>
  );
}
