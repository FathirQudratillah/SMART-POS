import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { PackageCheck } from "lucide-react";
import type { ApiErrorResponse, FormProps } from "@/types";
import { useAlert } from "@/context/AlertContext";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useAddSupplier } from "../hooks/useAddSupplier";
import type { SupplierFormRequest } from "../types";

const initialForm: SupplierFormRequest = {
  code: "", name: "", phone: "", email: "", address: "", tax_number: "", is_active: true,
};

export default function SupplierForm({ onOpenChange, setErrorMessage }: FormProps) {
  const { showMessage } = useAlert();
  const mutation = useAddSupplier();
  const { register, handleSubmit, reset, control, setError, formState: { errors } } =
    useForm<SupplierFormRequest>({ defaultValues: initialForm, mode: "onBlur" });

  const onSubmit: SubmitHandler<SupplierFormRequest> = (payload) => {
    setErrorMessage("");
    mutation.mutate(payload, {
      onSuccess: (message) => {
        showMessage({ variant: "success", title: "Success", description: message });
        reset(initialForm);
        onOpenChange(false);
      },
      onError: (error: ApiErrorResponse) => {
        if (error.errors) {
          Object.entries(error.errors).forEach(([field, messages]) => setError(field as keyof SupplierFormRequest, { type: "server", message: messages[0] }));
          setErrorMessage("Please check the form fields.");
        } else setErrorMessage(error.message || "Failed to create supplier.");
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <section className="space-y-4">
        <div><h3 className="text-xl font-semibold">Supplier Information</h3><p className="text-sm text-gray-600">Details about the supplier.</p></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2"><Label htmlFor="supplier-code">Code *</Label><Input id="supplier-code" autoComplete="off" placeholder="Enter Code" maxLength={50} aria-invalid={!!errors.code} {...register("code", { required: "Code is required.", maxLength: { value: 50, message: "Code cannot exceed 50 characters." } })} />{errors.code && <p className="text-sm text-red-600">{errors.code.message}</p>}</div>
          <div className="space-y-2"><Label htmlFor="supplier-name">Supplier Name *</Label><Input id="supplier-name" autoComplete="name" placeholder="Enter Supplier Name" maxLength={150} aria-invalid={!!errors.name} {...register("name", { required: "Supplier name is required.", maxLength: { value: 150, message: "Name cannot exceed 150 characters." } })} />{errors.name && <p className="text-sm text-red-600">{errors.name.message}</p>}</div>
          <div className="space-y-2"><Label htmlFor="supplier-phone">Phone</Label><Input id="supplier-phone" type="tel" autoComplete="tel" placeholder="Enter Phone" maxLength={30} aria-invalid={!!errors.phone} {...register("phone", { maxLength: { value: 30, message: "Phone cannot exceed 30 characters." } })} />{errors.phone && <p className="text-sm text-red-600">{errors.phone.message}</p>}</div>
          <div className="space-y-2"><Label htmlFor="supplier-email">Email</Label><Input id="supplier-email" type="email" autoComplete="email" placeholder="Enter Email" maxLength={150} aria-invalid={!!errors.email} {...register("email", { maxLength: { value: 150, message: "Email cannot exceed 150 characters." } })} />{errors.email && <p className="text-sm text-red-600">{errors.email.message}</p>}</div>
          <div className="space-y-2"><Label htmlFor="supplier-tax-number">Tax Number</Label><Input id="supplier-tax-number" placeholder="Enter Tax Number" maxLength={50} aria-invalid={!!errors.tax_number} {...register("tax_number", { maxLength: { value: 50, message: "Tax number cannot exceed 50 characters." } })} />{errors.tax_number && <p className="text-sm text-red-600">{errors.tax_number.message}</p>}</div>
          <div className="space-y-2"><Label htmlFor="supplier-address">Address</Label><Input id="supplier-address" placeholder="Enter Address" {...register("address")} /></div>
        </div>
        <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600"><PackageCheck className="h-5 w-5" /></div><div className="space-y-1"><Label htmlFor="supplier-is-active" className="cursor-pointer font-semibold text-slate-800">Supplier Status</Label><p className="text-sm text-slate-500">Enable or disable this supplier.</p></div></div>
          <Controller name="is_active" control={control} render={({ field }) => <Checkbox id="supplier-is-active" checked={field.value} onCheckedChange={field.onChange} className="h-5 w-5 border-slate-400 text-white data-checked:border-green-600 data-checked:bg-green-600" />} />
        </div>
      </section>
      <Button type="submit" variant="outline" disabled={mutation.isPending} className="w-full bg-blue-100 text-blue-700 hover:bg-blue-200">{mutation.isPending ? "Adding Supplier..." : "Add Supplier"}{mutation.isPending && <Spinner />}</Button>
    </form>
  );
}
