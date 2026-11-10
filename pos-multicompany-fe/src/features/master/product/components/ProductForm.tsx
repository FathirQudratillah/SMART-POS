import type { ApiErrorResponse, FormProps } from "@/types";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import type { ProductFormRequest } from "../types";
import { useCreateProduct } from "../hooks/useAddProduct";
import { useAuth } from "@/context/auth/AuthContext";
import { useCategories } from "../../categories/hooks/useCategories";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { PackageCheck, Upload } from "lucide-react";
import { useAlert } from "@/context/AlertContext";
import { useEffect } from "react";

const initialForm: ProductFormRequest = {
  category_id: 1,
  sku: "",
  barcode: "",
  name: "",
  description: "",
  unit: "",
  cost_price: 0,
  selling_price: 0,
  is_active: true,
  image: null,
};

type ProductFormProps = FormProps & {
  categoriesOpen: boolean;
  setCategoriesOpen: (open: boolean) => void;
};

export default function ProductForm({
  setErrorMessage,
  onOpenChange,
  categoriesOpen,
  setCategoriesOpen,
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    setError,
    formState: { errors },
  } = useForm<ProductFormRequest>({
    defaultValues: initialForm,
    mode: "onBlur",
  });

  const { showMessage } = useAlert();

  const createMutation = useCreateProduct();

  const onSubmit: SubmitHandler<ProductFormRequest> = (data) => {
    setErrorMessage("");

    createMutation.mutate(data, {
      onSuccess: (message) => {
        showMessage({
          variant: "success",
          title: "Success",
          description: message,
        });
        reset();
        onOpenChange(false);
      },

      onError: (error: ApiErrorResponse) => {
        if (error.errors) {
          Object.entries(error.errors).forEach(([field, messages]) => {
            setError(field as keyof ProductFormRequest, {
              type: "server",
              message: messages[0],
            });
          });

          setErrorMessage("Please check the form fields.");
        } else {
          setErrorMessage(error.message || "Failed to create product.");
        }
      },
    });
  };
  const isPending = createMutation.isPending;

  const { company } = useAuth();

  const { data: categoriesResponse, isLoading: isLoadingCategories } =
    useCategories({
      companyId: company!.id,
      page: 1,
      per_page: 100,
    });

  const categories = categoriesResponse?.data?.data.filter((category) => category.is_active) ?? [];
  const activeCategoryCount = categories.length;

  useEffect(() => {
    if (!isLoadingCategories && activeCategoryCount === 0) {
      showMessage({
        title: "No Categories Found",
        description: "Please create a category first.",
        variant: "warning",
      });
    }
  }, [activeCategoryCount, isLoadingCategories, showMessage]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Product Information */}
      <section className="space-y-4">
        <div>
          <h3 className="font-semibold text-xl"> Product Information</h3>
          <p className="text-sm text-muted-foreground text-gray-600">
            Details about the product.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="category_id">Category</Label>

          <Controller
            name="category_id"
            control={control}
            render={({ field }) => (
              <Select
                open={categoriesOpen}
                onOpenChange={setCategoriesOpen}
                value={field.value != null ? String(field.value) : ""}
                onValueChange={(value) =>
                  field.onChange(value ? Number(value) : null)
                }
                disabled={isLoadingCategories}
              >
                <SelectTrigger
                  id="category_id"
                  className="w-full"
                  aria-invalid={!!errors.category_id}
                >
                  {field.value != null
                    ? (categories.find(
                        (category) => category.id === field.value,
                      )?.name ?? "Select category")
                    : "Select category"}
                </SelectTrigger>

                <SelectContent
                  className="
                    bg-white
                    text-popover-foreground
                    border
                    shadow-md
                    rounded-md
                    "
                >
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={String(category.id)}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />

          {errors.category_id && (
            <p className="text-sm text-red-600">{errors.category_id.message}</p>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="sku">SKU *</Label>
            <Input
              id="sku"
              type="text"
              autoComplete="off"
              placeholder="Enter SKU"
              aria-invalid={!!errors.sku}
              {...register("sku", {
                required: "SKU is required.",
                minLength: {
                  value: 3,
                  message: "SKU must be at least 3 characters.",
                },
              })}
            />
            {errors.sku && (
              <p className="text-sm text-red-600">{errors.sku.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-name">Product Name *</Label>
            <Input
              id="signup-name"
              autoComplete="name"
              placeholder="Your Product name"
              aria-invalid={!!errors.name}
              {...register("name", {
                required: "Product name is required.",
              })}
            />
            {errors.name && (
              <p className="text-sm text-red-600">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="barcode">Barcode *</Label>
            <Input
              id="barcode"
              type="text"
              autoComplete="off"
              placeholder="Enter Barcode"
              aria-invalid={!!errors.barcode}
              {...register("barcode", {
                required: "Barcode is required.",
              })}
            />
            {errors.barcode && (
              <p className="text-sm text-red-600">{errors.barcode.message}</p>
            )}
          </div>
          <div className="space-y-2 ">
            <Label htmlFor="unit">Unit *</Label>
            <Input
              id="unit"
              type="text"
              autoComplete="off"
              placeholder="Enter Unit"
              aria-invalid={!!errors.unit}
              {...register("unit", {
                required: "Unit is required.",
              })}
            />
            {errors.unit && (
              <p className="text-sm text-red-600">{errors.unit.message}</p>
            )}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="description">Description </Label>
            <Input
              id="description"
              type="text"
              autoComplete="off"
              placeholder="Enter Description"
              aria-invalid={!!errors.description}
              {...register("description", {})}
            />
            {errors.description && (
              <p className="text-sm text-red-600">
                {errors.description.message}
              </p>
            )}
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="image">Product Image</Label>

            <Controller
              name="image"
              control={control}
              render={({ field }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Input
                      id="image"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      aria-invalid={!!errors.image}
                      onBlur={field.onBlur}
                      onChange={(event) =>
                        field.onChange(event.target.files?.[0] ?? null)
                      }
                      ref={field.ref}
                    />

                    <Label
                      htmlFor="image"
                      className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border border-blue-700 bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 text-sm font-medium shadow-xs hover:bg-accent hover:text-accent-foreground"
                    >
                      <Upload className="size-4" />
                      Choose Image
                    </Label>

                    <span className="text-sm text-muted-foreground">
                      {field.value?.name ?? "No file selected"}
                    </span>
                  </div>
                </>
              )}
            />

            <p className="text-sm text-muted-foreground">
              JPEG, PNG, or WebP; maximum size 2 MB.
            </p>

            {errors.image && (
              <p className="text-sm text-red-600">{errors.image.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="costPrice">Cost Price *</Label>
            <Input
              id="costPrice"
              type="number"
              min="0"
              step="1"
              autoComplete="off"
              placeholder="Enter Cost Price"
              aria-invalid={!!errors.cost_price}
              {...register("cost_price", {
                required: "Cost Price is required.",
                valueAsNumber: true,
                min: {
                  value: 0,
                  message: "Cost Price cannot be negative.",
                },
              })}
            />
            {errors.cost_price && (
              <p className="text-sm text-red-600">
                {errors.cost_price.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="selling_price">Selling Price *</Label>
            <Input
              id="selling_price"
              type="number"
              min="0"
              step="1"
              autoComplete="off"
              placeholder="Enter Selling Price"
              aria-invalid={!!errors.selling_price}
              {...register("selling_price", {
                required: "Selling Price is required.",
                valueAsNumber: true,
                min: {
                  value: 0,
                  message: "Selling Price cannot be negative.",
                },
              })}
            />
            {errors.selling_price && (
              <p className="text-sm text-red-600">
                {errors.selling_price.message}
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
                Product Status
              </Label>
              <p className="text-sm text-slate-500">
                Enable or disable this product.
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
        disabled={isPending}
        className="w-full bg-blue-100 text-blue-700 hover:bg-blue-200"
      >
        {isPending ? "Adding Product..." : "Add Product"}
        {isPending && <Spinner />}
      </Button>
    </form>
  );
}
