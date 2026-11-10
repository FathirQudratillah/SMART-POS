import type { ApiErrorResponse, FormProps } from "@/types";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Controller, useForm, useWatch, type SubmitHandler } from "react-hook-form";
import type { ProductUpdateRequest } from "../types";
import { useAuth } from "@/context/auth/AuthContext";
import { useUpdateProduct } from "../hooks/useUpdateProduct";
import { useShowProduct } from "../hooks/useShowProduct";
import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { PackageCheck, Upload } from "lucide-react";
import { useAlert } from "@/context/AlertContext";

const initialForm: ProductUpdateRequest = {
  barcode: "",
  name: "",
  description: "",
  is_active: true,
};

type ProductFormProps = FormProps & {
  categoriesOpen: boolean;
  setCategoriesOpen: (open: boolean) => void;
};

export default function ProductEditForm({
  setErrorMessage,
  onOpenChange,
  id,
}: ProductFormProps) {
  const { company } = useAuth();
  const { showMessage } = useAlert();

  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors },
  } = useForm<ProductUpdateRequest>({
    defaultValues: initialForm,
    mode: "onBlur",
  });

  const {
      data,
    } = useShowProduct({
      companyId: company?.id ?? null,
      id,
    });
  
    const product = data?.data;

    useEffect(() => {
      if (product) {
        reset({
          name: product.name,
          barcode: product.barcode ?? "",
          description: product.description ?? "",
          is_active: product.is_active,
          image: null,
        });
      }
    }, [product, reset]);


  const [preview, setPreview] = useState<string | null>(null);
  
  const imageChanged = useWatch({
    control,
    name: "image",
  });

  useEffect(() => {
    if (imageChanged) {
      const imageUrl = URL.createObjectURL(imageChanged);

      setPreview(imageUrl);

      return () => URL.revokeObjectURL(imageUrl);
    }

    setPreview(product?.image_url ?? null);
  }, [imageChanged, product?.image_url]);

    

  const updateMutation = useUpdateProduct(id as number);

  const onSubmit: SubmitHandler<ProductUpdateRequest> = (data) => {
    setErrorMessage("");

    updateMutation.mutate(data, {
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
            setError(field as keyof ProductUpdateRequest, {
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
  const isPending = updateMutation.isPending;


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
                Enable or disable this product for transactions.
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

        <div className="space-y-2">
          <Label className="text-slate-500" htmlFor="category_id">
            Category
          </Label>
          <Input
            id="sku"
            type="text"
            autoComplete="off"
            placeholder="Enter SKU"
            value={product?.category?.name}
            disabled
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label className="text-slate-500" htmlFor="sku">
              SKU *
            </Label>
            <Input
              id="sku"
              type="text"
              autoComplete="off"
              placeholder="Enter SKU"
              value={product?.sku}
              disabled
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="signup-name">Product Name *</Label>
            <Input
              id="signup-name"
              autoComplete="name"
              placeholder="Your Product name"
              aria-invalid={!!errors.name}
              {...register("name", {})}
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
              {...register("barcode", {})}
            />
            {errors.barcode && (
              <p className="text-sm text-red-600">{errors.barcode.message}</p>
            )}
          </div>
          <div className="space-y-2 ">
            <Label className="text-slate-500" htmlFor="unit">
              Unit *
            </Label>
            <Input
              id="unit"
              type="text"
              autoComplete="off"
              placeholder="Enter Unit"
              value={product?.unit}
              disabled
            />
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
            <Label htmlFor="image">Replace Product Image</Label>
            {preview && (
              <img
                src={preview}
                alt="Product Preview"
                className="h-32 w-32 rounded-md object-cover"
              />
            )}
            <Controller
              name="image"
              control={control}
              render={({ field }) => (
                <>
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
                  {field.value && (
                    <p className="text-sm text-muted-foreground">
                      Selected: {field.value.name}
                    </p>
                  )}
                </>
              )}
            />
            <p className="text-sm text-muted-foreground">
              JPEG, PNG, or WebP; maximum size 2 MB. Leave empty to keep the
              current image.
            </p>
            {errors.image && (
              <p className="text-sm text-red-600">{errors.image.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label className="text-slate-500" htmlFor="costPrice">
              Cost Price *
            </Label>
            <Input
              id="costPrice"
              type="number"
              min="0"
              step="1000"
              autoComplete="off"
              placeholder="Enter Cost Price"
              value={product?.cost_price}
              disabled
            />
          </div>
          <div className="space-y-2">
            <Label className="text-slate-500" htmlFor="selling_price">
              Selling Price *
            </Label>
            <Input
              id="selling_price"
              type="number"
              min="0"
              step="1000"
              autoComplete="off"
              placeholder="Enter Selling Price"
              value={product?.selling_price}
              disabled
            />
          </div>
        </div>
      </section>

      <Button
        type="submit"
        disabled={isPending}
        className="w-full bg-blue-400 hover:bg-blue-500 text-white"
      >
        {isPending ? "Updating Product..." : "Update Product"}
        {isPending && <Spinner />}
      </Button>
    </form>
  );
}
