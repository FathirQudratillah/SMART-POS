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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { useAuth } from "@/context/auth/AuthContext";
import { useBranches } from "@/features/company-management/branches/hooks/useBranches";
import { useShowWarehouse } from "../hooks/useShowWarehouse";
import { useUpdateWarehouse } from "../hooks/useUpdateWarehouse";
import type { WarehouseUpdateRequest } from "../types";

type WarehouseEditFormProps = FormProps & {
  branchOpen: boolean;
  setBranchOpen: (open: boolean) => void;
};

export default function WarehouseEditForm({
  id,
  onOpenChange,
  setErrorMessage,
  branchOpen,
  setBranchOpen,
}: WarehouseEditFormProps) {
  const { showMessage } = useAlert();
  const { company } = useAuth();
  const { data: warehouseData } = useShowWarehouse({
    companyId: company?.id ?? null,
    id,
  });
  const warehouse = warehouseData?.data;
  const { data: branchesData } = useBranches({
    companyId: company?.id ?? null,
    page: 1,
    per_page: 100,
  });
  const branches = branchesData?.data.data ?? [];
  const mutation = useUpdateWarehouse(id ?? 0);
  const {
    register,
    handleSubmit,
    reset,
    control,
    setError,
    formState: { errors },
  } = useForm<WarehouseUpdateRequest>({
    defaultValues: {
      branch_id: null,
      code: "",
      name: "",
      address: "",
      is_active: true,
    },
    mode: "onBlur",
  });

  useEffect(() => {
    if (warehouse)
      reset({
        branch_id: warehouse.branch_id ?? null,
        code: warehouse.code,
        name: warehouse.name,
        address: warehouse.address ?? "",
        is_active: warehouse.is_active ?? true,
      });
  }, [warehouse, reset]);

  const onSubmit: SubmitHandler<WarehouseUpdateRequest> = (payload) => {
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
            setError(field as keyof WarehouseUpdateRequest, {
              type: "server",
              message: messages[0],
            }),
          );
          setErrorMessage("Please check the form fields.");
        } else setErrorMessage(error.message || "Failed to update warehouse.");
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
        <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
              <PackageCheck className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <Label
                htmlFor="edit-warehouse-is-active"
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
                id="edit-warehouse-is-active"
                checked={field.value}
                onCheckedChange={field.onChange}
                className="h-5 w-5 border-slate-400 text-white data-checked:border-green-600 data-checked:bg-green-600"
              />
            )}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-slate-500" htmlFor="edit-warehouse-branch">
            Branch
          </Label>
          <Controller
            name="branch_id"
            control={control}
            render={({ field }) => (
              <Select
                open={branchOpen}
                onOpenChange={setBranchOpen}
                disabled
                value={field.value == null ? "none" : String(field.value)}
                onValueChange={(value) =>
                  field.onChange(value === "none" ? null : Number(value))
                }
              >
                <SelectTrigger id="edit-warehouse-branch" className="w-full">
                  {branches.find((branch) => branch.id === field.value)?.name ??
                    "No branch"}
                </SelectTrigger>
                <SelectContent className="rounded-md border bg-white text-popover-foreground shadow-md">
                  <SelectItem value="none">No branch</SelectItem>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={String(branch.id)}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-slate-500" htmlFor="edit-warehouse-code">
              Code *
            </Label>
            <Input
              id="edit-warehouse-code"
              autoComplete="off"
              placeholder="Enter Code"
              maxLength={40}
              disabled
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
            <Label htmlFor="edit-warehouse-name">Warehouse Name *</Label>
            <Input
              id="edit-warehouse-name"
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
            <Label htmlFor="edit-warehouse-address">Address</Label>
            <Input
              id="edit-warehouse-address"
              placeholder="Enter Address"
              {...register("address")}
            />
          </div>
        </div>
      </section>
      <Button
        type="submit"
        disabled={mutation.isPending || !warehouse}
        className="w-full bg-blue-400 text-white hover:bg-blue-500"
      >
        {mutation.isPending ? "Updating Warehouse..." : "Update Warehouse"}
        {mutation.isPending && <Spinner />}
      </Button>
    </form>
  );
}
