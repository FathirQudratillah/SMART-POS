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
import { useCategories } from "../hooks/useCategories";
import { useShowCategory } from "../hooks/useShowCategory";
import { useUpdateCategory } from "../hooks/useUpdateCategory";
import type { CategoryUpdateRequest } from "../types";

type CategoryEditFormProps = FormProps & {
  parentCategoryOpen: boolean;
  setParentCategoryOpen: (open: boolean) => void;
};

export default function CategoryEditForm({
  id,
  onOpenChange,
  setErrorMessage,
  parentCategoryOpen,
  setParentCategoryOpen,
}: CategoryEditFormProps) {
  const { showMessage } = useAlert();
  const { company } = useAuth();
  const { data: categoryData } = useShowCategory({
    companyId: company?.id ?? null,
    id,
  });
  const category = categoryData?.data;
  const { data: categoriesData } = useCategories({
    companyId: company?.id ?? null,
    page: 1,
    per_page: 100,
  });
  const categories = (categoriesData?.data.data ?? []).filter(
    (item) => item.id !== id,
  );
  const mutation = useUpdateCategory(id ?? 0);
  const {
    register,
    handleSubmit,
    reset,
    control,
    setError,
    formState: { errors },
  } = useForm<CategoryUpdateRequest>({
    defaultValues: {
      parent_id: null,
      code: "",
      name: "",
      description: "",
      is_active: true,
    },
    mode: "onBlur",
  });

  useEffect(() => {
    if (category)
      reset({
        parent_id: category.parent_id ?? null,
        code: category.code,
        name: category.name,
        description: category.description ?? "",
        is_active: category.is_active,
      });
  }, [category, reset]);

  const onSubmit: SubmitHandler<CategoryUpdateRequest> = (payload) => {
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
            setError(field as keyof CategoryUpdateRequest, {
              type: "server",
              message: messages[0],
            }),
          );
          setErrorMessage("Please check the form fields.");
        } else setErrorMessage(error.message || "Failed to update category.");
      },
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <section className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold">Category Information</h3>
          <p className="text-sm text-gray-600">Details about the category.</p>
        </div>
        <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
              <PackageCheck className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <Label
                htmlFor="edit-category-is-active"
                className="cursor-pointer font-semibold text-slate-800"
              >
                Category Status
              </Label>
              <p className="text-sm text-slate-500">
                Enable or disable this category.
              </p>
            </div>
          </div>
          <Controller
            name="is_active"
            control={control}
            render={({ field }) => (
              <Checkbox
                id="edit-category-is-active"
                checked={field.value}
                onCheckedChange={field.onChange}
                className="h-5 w-5 border-slate-400 text-white data-checked:border-green-600 data-checked:bg-green-600"
              />
            )}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-slate-500" htmlFor="edit-category-code">
              Code *
            </Label>
            <Input
              id="edit-category-code"
              type="text"
              autoComplete="off"
              placeholder="Enter Code"
              maxLength={50}
              aria-invalid={!!errors.code}
              disabled
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
            <Label htmlFor="edit-category-name">Category Name *</Label>
            <Input
              id="edit-category-name"
              autoComplete="off"
              placeholder="Enter Category Name"
              maxLength={120}
              aria-invalid={!!errors.name}
              {...register("name", {
                required: "Category name is required.",
                maxLength: {
                  value: 120,
                  message: "Name cannot exceed 120 characters.",
                },
              })}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label className="text-slate-500" htmlFor="edit-parent_id">
              Parent Category
            </Label>
            <Controller
              name="parent_id"
              control={control}
              render={({ field }) => (
                <Select
                  open={parentCategoryOpen}
                  onOpenChange={setParentCategoryOpen}
                  disabled
                  value={field.value == null ? "none" : String(field.value)}
                  onValueChange={(value) =>
                    field.onChange(value === "none" ? null : Number(value))
                  }
                >
                  <SelectTrigger id="edit-parent_id" className="w-full">
                    {categories.find((item) => item.id === field.value)?.name ??
                      "No parent category"}
                  </SelectTrigger>
                  <SelectContent className="rounded-md border bg-white text-popover-foreground shadow-md">
                    <SelectItem value="none">No parent category</SelectItem>
                    {categories.map((item) => (
                      <SelectItem key={item.id} value={String(item.id)}>
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="edit-category-description">Description</Label>
            <Input
              id="edit-category-description"
              placeholder="Enter Description"
              {...register("description")}
            />
          </div>
        </div>
      </section>
      <Button
        type="submit"
        disabled={mutation.isPending || !category}
        className="w-full bg-blue-400 text-white hover:bg-blue-500"
      >
        {mutation.isPending ? "Updating Category..." : "Update Category"}
        {mutation.isPending && <Spinner />}
      </Button>
    </form>
  );
}
