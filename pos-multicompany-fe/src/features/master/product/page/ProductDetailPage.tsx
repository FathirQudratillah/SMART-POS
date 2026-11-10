import { useParams, useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  CalendarDays,
  Edit,
  Package,
  Tag,
  Trash,
  Wallet,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/auth/AuthContext";
import { useShowProduct } from "../hooks/useShowProduct";
import EditProductModal from "../components/EditProductModal";
import { useState } from "react";
import { formatCurrency } from "@/utils/currency";
import { formatDate } from "@/utils/date";
import { useDeleteCategories } from "../../categories/hooks/useDeleteCategories";
import { useAlert } from "@/context/AlertContext";

export default function ProductDetailPage() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { id } = useParams();

  const { showConfirm, showMessage } = useAlert();

  const { company } = useAuth();

  const productId = Number(id);

  const { data, isLoading, isError } = useShowProduct({
    companyId: company?.id ?? null,
    id: productId,
  });

  const product = data?.data;

  const deleteMutation = useDeleteCategories();

  const handleDelete = async () => {
    if (!product) return;
    const confirmed = await showConfirm({
      title: "Delete product?",
      description: `Are you sure you want to delete "${product.name}"?`,
      confirmText: "Yes, delete",
      cancelText: "Cancel",
    });
    if (!confirmed) return;
    deleteMutation.mutate(
      { ids: [product.id] },
      {
        onSuccess: (message) => {
          showMessage({
            variant: "success",
            title: "Success",
            description: message,
          });
          navigate("/products");
        },
        onError: (error) =>
          showMessage({
            variant: "error",
            title: "Error",
            description: error.message,
          }),
      },
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen space-y-6 bg-slate-50 p-4 sm:p-6 lg:p-8">
        <Skeleton className="h-5 w-48 bg-slate-200" />

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <Skeleton className="h-10 w-64 bg-slate-200" />
          <Skeleton className="mt-3 h-4 w-40 bg-slate-200" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-28 rounded-xl bg-slate-200" />
          <Skeleton className="h-28 rounded-xl bg-slate-200" />
        </div>

        <Skeleton className="h-64 rounded-xl bg-slate-200" />
        <Skeleton className="h-40 rounded-xl bg-slate-200" />
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="flex min-h-100 flex-col items-center justify-center gap-3">
        <Package className="size-12 text-slate-300" />

        <h2 className="text-lg font-semibold">Product not found</h2>

        <p className="text-sm text-muted-foreground">
          Unable to retrieve product information.
        </p>

        <Button variant="outline" onClick={() => navigate("/products")}>
          <ArrowLeft className="mr-2 size-4" />
          Back to products
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen space-y-6 bg-slate-50 p-4 sm:p-6 lg:p-8">
      {/* Breadcrumb */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => navigate("/products")}
            className="text-slate-500 transition-colors hover:text-blue-600"
          >
            Products
          </button>

          <span className="text-slate-300">/</span>

          <span className="font-medium text-slate-800">Detail Product</span>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="shrink-0 border-slate-200 bg-white hover:bg-slate-50"
          onClick={() => navigate("/products")}
        >
          <ArrowLeft className="size-4" />
        </Button>
      </div>

      {/* Header */}
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                {product.name}
              </h1>

              <Badge
                className={
                  product.is_active
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                    : "border border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-100"
                }
              >
                {product.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>

            <p className="text-sm text-slate-500">
              Manage and view product information
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            className="bg-red-100 text-red-700 hover:bg-red-200"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
          >
            <Trash className="mr-2 size-4" />
            Delete
          </Button>
          <Button
            variant="outline"
            className="bg-blue-100 text-blue-700 shadow-sm hover:bg-blue-200"
            onClick={() => setOpen(true)}
          >
            <Edit className="mr-2 size-4" />
            Edit Category
          </Button>
        </div>
      </div>

      {/* Price Summary */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-blue-50">
              <Wallet className="size-6 text-blue-600" />
            </div>

            <div className="min-w-0 space-y-1">
              <p className="text-sm font-medium text-slate-500">
                Selling Price
              </p>

              <p className="text-xl font-bold text-slate-900">
                {formatCurrency(Number(product.selling_price))}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 bg-white shadow-sm">
          <CardContent className="flex items-center gap-4 p-5">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
              <Tag className="size-6 text-emerald-600" />
            </div>

            <div className="min-w-0 space-y-1">
              <p className="text-sm font-medium text-slate-500">Cost Price</p>

              <p className="text-xl font-bold text-slate-900">
                {formatCurrency(Number(product.cost_price))}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* General Information */}
      <Card className="gap-0 overflow-hidden border border-slate-200 bg-white py-0 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/70 px-5 py-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-800">
            <Package className="size-5 text-blue-600" />
            General Information
          </CardTitle>

          <p className="text-sm font-normal text-slate-500">
            Basic information about this product
          </p>
        </CardHeader>

        <CardContent className="grid gap-x-10 gap-y-0 px-5 sm:grid-cols-2">
          <DetailItem label="Product Name" value={product.name} />
          <DetailItem label="SKU" value={product.sku} />
          <DetailItem label="Category" value={product.category?.name || "-"} />
          <DetailItem label="Barcode" value={product.barcode || "-"} />
          <DetailItem label="Unit" value={product.unit} />

          <DetailItem
            label="Status"
            value={
              <Badge
                className={
                  product.is_active
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                    : "border border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-100"
                }
              >
                {product.is_active ? "Active" : "Inactive"}
              </Badge>
            }
          />
        </CardContent>
      </Card>

      {/* Description */}
      <Card className="gap-0 overflow-hidden border border-slate-200 bg-white py-0 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/70 px-5 py-4">
          <CardTitle className="text-base font-semibold text-slate-800">
            Description
          </CardTitle>

          <p className="text-sm font-normal text-slate-500">
            Additional product details
          </p>
        </CardHeader>

        <CardContent className="p-5">
          <p className="text-sm leading-7 whitespace-pre-wrap text-slate-600">
            {product.description || "No description available."}
          </p>
        </CardContent>
      </Card>

      {/* Metadata */}
      <Card className="gap-0 overflow-hidden border border-slate-200 bg-white py-0 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/70 px-5 py-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-800">
            <CalendarDays className="size-5 text-blue-600" />
            Additional Information
          </CardTitle>

          <p className="text-sm font-normal text-slate-500">
            Record creation and modification details
          </p>
        </CardHeader>

        <CardContent className="grid gap-x-10 gap-y-0 px-5 sm:grid-cols-2">
          <DetailItem
            label="Created At"
            value={formatDate(product.created_at)}
          />

          <DetailItem
            label="Last Updated"
            value={formatDate(product.updated_at)}
          />
        </CardContent>
      </Card>
      <EditProductModal open={open} onOpenChange={setOpen} id={productId} />
    </div>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex min-h-19 flex-col justify-center gap-2 border-b border-slate-100 py-4 last:border-b-0">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <div className="text-sm font-semibold text-slate-800">{value}</div>
    </div>
  );
}
