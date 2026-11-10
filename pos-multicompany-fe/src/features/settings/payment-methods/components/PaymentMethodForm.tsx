import { useEffect } from "react";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import type { ApiErrorResponse } from "@/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useAlert } from "@/context/AlertContext";
import { useSavePaymentMethod } from "../hooks/useSavePaymentMethod";
import type { PaymentMethod, PaymentMethodFormValues } from "../types";

type PaymentMethodFormProps = {
  record: PaymentMethod | null;
  onClose: () => void;
  setErrorMessage: (message: string) => void;
};

const emptyValues: PaymentMethodFormValues = {
  code: "",
  name: "",
  type: "",
  is_active: true,
};

export default function PaymentMethodForm({
  record,
  onClose,
  setErrorMessage,
}: PaymentMethodFormProps) {
  const { showMessage } = useAlert();
  const mutation = useSavePaymentMethod();
  const {
    register,
    handleSubmit,
    reset,
    control,
    setError,
    formState: { errors },
  } = useForm<PaymentMethodFormValues>({
    defaultValues: record
      ? {
          code: record.code,
          name: record.name,
          type: record.type,
          is_active: record.is_active,
        }
      : emptyValues,
    mode: "onBlur",
  });

  useEffect(() => {
    reset(
      record
        ? {
            code: record.code,
            name: record.name,
            type: record.type,
            is_active: record.is_active,
          }
        : emptyValues,
    );
  }, [record, reset]);

  const onSubmit: SubmitHandler<PaymentMethodFormValues> = (values) => {
    setErrorMessage("");
    mutation.mutate(
      { id: record?.id, payload: values },
      {
        onSuccess: (message) => {
          showMessage({
            variant: "success",
            title: "Success",
            description: message,
          });
          reset(emptyValues);
          onClose();
        },
        onError: (error: ApiErrorResponse) => {
          if (error.errors) {
            Object.entries(error.errors).forEach(([field, messages]) => {
              if (field in emptyValues) {
                setError(field as keyof PaymentMethodFormValues, {
                  type: "server",
                  message: messages[0],
                });
              }
            });
            setErrorMessage("Please check the form fields.");
          } else {
            setErrorMessage(
              error.message || "Failed to save payment method.",
            );
          }
        },
      },
    );
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <section className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold">Payment Method Information</h3>
          <p className="text-sm text-slate-600">
            Define the payment method code, name, and type.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="payment-method-code">Code *</Label>
            <Input
              id="payment-method-code"
              autoComplete="off"
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
            <Label htmlFor="payment-method-name">Name *</Label>
            <Input
              id="payment-method-name"
              maxLength={100}
              aria-invalid={!!errors.name}
              {...register("name", {
                required: "Name is required.",
                maxLength: {
                  value: 100,
                  message: "Name cannot exceed 100 characters.",
                },
              })}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="payment-method-type">Type *</Label>
            <Input
              id="payment-method-type"
              maxLength={30}
              placeholder="For example: cash, card, bank transfer"
              aria-invalid={!!errors.type}
              {...register("type", {
                required: "Type is required.",
                maxLength: {
                  value: 30,
                  message: "Type cannot exceed 30 characters.",
                },
              })}
            />
            {errors.type && (
              <p className="text-sm text-red-600">{errors.type.message}</p>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div>
            <Label
              htmlFor="payment-method-is-active"
              className="cursor-pointer font-semibold text-slate-800"
            >
              Active
            </Label>
            <p className="text-sm text-slate-500">
              Inactive methods cannot be used for new sales.
            </p>
          </div>
          <Controller
            name="is_active"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="payment-method-is-active"
                checked={field.value}
                onCheckedChange={(checked) => field.onChange(checked === true)}
              />
            )}
          />
        </div>
      </section>
      <Button
        type="submit"
        variant={record ? "default" : "outline"}
        disabled={mutation.isPending}
        className={record ? "w-full bg-blue-500 text-white hover:bg-blue-600" : "w-full bg-blue-100 text-blue-700 hover:bg-blue-200"}
      >
        {mutation.isPending
          ? "Saving Payment Method..."
          : record
            ? "Save Changes"
            : "Add Payment Method"}
        {mutation.isPending && <Spinner />}
      </Button>
    </form>
  );
}
