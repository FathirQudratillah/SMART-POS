import { Controller, useForm, type SubmitHandler } from "react-hook-form";
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
import { PackageCheck } from "lucide-react";
import { useAuth } from "@/context/auth/AuthContext";
import { useCategories } from "../hooks/useCategories";
import { useAddCategory } from "../hooks/useAddCategory";
import type { CategoryFormRequest } from "../types";

const initialForm: CategoryFormRequest = {
  parent_id: null,
  code: "",
  name: "",
  description: "",
  is_active: true,
};

type CategoryFormProps = FormProps & {
  parentCategoryOpen: boolean;
  setParentCategoryOpen: (open: boolean) => void;
};

export default function CategoryForm({
  onOpenChange,
  setErrorMessage,
  parentCategoryOpen,
  setParentCategoryOpen,
}: CategoryFormProps) {
  const { showMessage } = useAlert();
  const { company } = useAuth();
  const { data: categoriesData } = useCategories({
    companyId: company?.id ?? null,
    page: 1,
    per_page: 100,
  });
  const categories = categoriesData?.data.data ?? [];
  const mutation = useAddCategory();
  const {
    register,
    handleSubmit,
    reset,
    control,
    setError,
    formState: { errors },
  } = useForm<CategoryFormRequest>({
    defaultValues: initialForm,
    mode: "onBlur",
  });

  const onSubmit: SubmitHandler<CategoryFormRequest> = (payload) => {
    setErrorMessage("");
    mutation.mutate(payload, {
      onSuccess: (message) => {
        showMessage({ variant: "success", title: "Success", description: message });
        reset(initialForm);
        onOpenChange(false);
      },
      onError: (error: ApiErrorResponse) => {
        if (error.errors) {
          Object.entries(error.errors).forEach(([field, messages]) => {
            setError(field as keyof CategoryFormRequest, {
              type: "server",
              message: messages[0],
            });
          });
          setErrorMessage("Please check the form fields.");
        } else {
          setErrorMessage(error.message || "Failed to create category.");
        }
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
        <div className="space-y-2">
          <Label htmlFor="parent_id">Parent Category</Label>
          <Controller
            name="parent_id"
            control={control}
            render={({ field }) => (
              <Select
                open={parentCategoryOpen}
                onOpenChange={setParentCategoryOpen}
                value={field.value == null ? "none" : String(field.value)}
                onValueChange={(value) =>
                  field.onChange(value === "none" ? null : Number(value))
                }
              >
                <SelectTrigger
                  id="parent_id"
                  className="w-full"
                  aria-invalid={!!errors.parent_id}
                >
                  {categories.find((item) => item.id === field.value)?.name ??
                    "No parent category"}
                </SelectTrigger>
                <SelectContent className="rounded-md border bg-white text-popover-foreground shadow-md">
                  <SelectItem value="none">No parent category</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.parent_id && (
            <p className="text-sm text-red-600">{errors.parent_id.message}</p>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="category-code">Code *</Label>
            <Input
              id="category-code"
              type="text"
              autoComplete="off"
              placeholder="Enter Code"
              maxLength={50}
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
            <Label htmlFor="category-name">Category Name *</Label>
            <Input
              id="category-name"
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
            <Label htmlFor="category-description">Description</Label>
            <Input
              id="category-description"
              placeholder="Enter Description"
              aria-invalid={!!errors.description}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 text-green-600">
              <PackageCheck className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <Label
                htmlFor="is_active"
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
                id="is_active"
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
        disabled={mutation.isPending}
        className="w-full bg-blue-100 text-blue-700 hover:bg-blue-200"
      >
        {mutation.isPending ? "Adding Category..." : "Add Category"}
        {mutation.isPending && <Spinner />}
      </Button>
    </form>
  );
}
