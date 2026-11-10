import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  Edit,
  Trash,
  Warehouse as WarehouseIcon,
  MapPin,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/context/auth/AuthContext";
import { useAlert } from "@/context/AlertContext";
import { formatDate } from "@/utils/date";
import { useShowWarehouse } from "../hooks/useShowWarehouse";
import { useDeleteWarehouses } from "../hooks/useDeleteWarehouses";
import EditWarehouseModal from "../components/EditWarehouseModal";

export default function WarehouseDetailPage() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { id } = useParams();
  const { company } = useAuth();
  const { showConfirm, showMessage } = useAlert();
  const warehouseId = Number(id);
  const { data, isLoading, isError } = useShowWarehouse({
    companyId: company?.id ?? null,
    id: warehouseId,
  });
  const warehouse = data?.data;
  const deleteMutation = useDeleteWarehouses();
  const handleDelete = async () => {
    if (!warehouse) return;
    const confirmed = await showConfirm({
      title: "Delete warehouse?",
      description: `Are you sure you want to delete "${warehouse.name}"?`,
      confirmText: "Yes, delete",
      cancelText: "Cancel",
    });
    if (!confirmed) return;
    deleteMutation.mutate(
      { ids: [warehouse.id] },
      {
        onSuccess: (message) => {
          showMessage({
            variant: "success",
            title: "Success",
            description: message,
          });
          navigate("/warehouses");
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
  if (isLoading)
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
  if (isError || !warehouse)
    return (
      <div className="flex min-h-100 flex-col items-center justify-center gap-3">
        <WarehouseIcon className="size-12 text-slate-300" />
        <h2 className="text-lg font-semibold">Warehouse not found</h2>
        <p className="text-sm text-muted-foreground">
          Unable to retrieve warehouse information.
        </p>
        <Button variant="outline" onClick={() => navigate("/warehouses")}>
          <ArrowLeft className="mr-2 size-4" />
          Back to warehouses
        </Button>
      </div>
    );
  return (
    <div className="min-h-screen space-y-6 bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm">
          <button
            onClick={() => navigate("/warehouses")}
            className="text-slate-500 transition-colors hover:text-blue-600"
          >
            Warehouses
          </button>
          <span className="text-slate-300">/</span>
          <span className="font-medium text-slate-800">Detail Warehouse</span>
        </div>
        <Button
          variant="outline"
          size="icon"
          className="shrink-0 border-slate-200 bg-white hover:bg-slate-50"
          onClick={() => navigate("/warehouses")}
        >
          <ArrowLeft className="size-4" />
        </Button>
      </div>
      <div className="flex flex-col justify-between gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">
                {warehouse.name}
              </h1>
              <Badge
                className={
                  warehouse.is_active
                    ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
                    : "border border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-100"
                }
              >
                {warehouse.is_active ? "Active" : "Inactive"}
              </Badge>
            </div>
            <p className="text-sm text-slate-500">
              Manage and view warehouse information
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
            Edit Warehouse
          </Button>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <SummaryCard
          icon={<WarehouseIcon className="size-6 text-blue-600" />}
          label="Warehouse Code"
          value={warehouse.code}
          color="bg-blue-50"
        />
        <SummaryCard
          icon={<MapPin className="size-6 text-emerald-600" />}
          label="Branch"
          value={
            warehouse?.branch?.name
              ? `${warehouse.branch.name}`
              : "No branch assigned"
          }
          color="bg-emerald-50"
        />
      </div>
      <Card className="gap-0 overflow-hidden border border-slate-200 bg-white py-0 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/70 px-5 py-4">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-slate-800">
            <WarehouseIcon className="size-5 text-blue-600" />
            General Information
          </CardTitle>
          <p className="text-sm font-normal text-slate-500">
            Basic information about this warehouse
          </p>
        </CardHeader>
        <CardContent className="grid gap-x-10 gap-y-0 px-5 sm:grid-cols-2">
          <DetailItem label="Warehouse Name" value={warehouse.name} />
          <DetailItem label="Code" value={warehouse.code} />
          <DetailItem
            label="Branch"
            value={warehouse.branch?.name || "-"}
          />
          <DetailItem
            label="Status"
            value={<StatusBadge active={!!warehouse.is_active} />}
          />
        </CardContent>
      </Card>
      <Card className="gap-0 overflow-hidden border border-slate-200 bg-white py-0 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/70 px-5 py-4">
          <CardTitle className="text-base font-semibold text-slate-800">
            Address
          </CardTitle>
          <p className="text-sm font-normal text-slate-500">
            Warehouse location details
          </p>
        </CardHeader>
        <CardContent className="p-5">
          <p className="whitespace-pre-wrap text-sm leading-7 text-slate-600">
            {warehouse.address || "No address available."}
          </p>
        </CardContent>
      </Card>
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
            value={formatDate(warehouse.created_at)}
          />
          <DetailItem
            label="Last Updated"
            value={formatDate(warehouse.updated_at)}
          />
        </CardContent>
      </Card>
      <EditWarehouseModal open={open} onOpenChange={setOpen} id={warehouseId} />
    </div>
  );
}
function SummaryCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <Card className="border border-slate-200 bg-white shadow-sm">
      <CardContent className="flex items-center gap-4 p-5">
        <div
          className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${color}`}
        >
          {icon}
        </div>
        <div className="min-w-0 space-y-1">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="text-xl font-bold text-slate-900">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}
function StatusBadge({ active }: { active: boolean }) {
  return (
    <Badge
      className={
        active
          ? "border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50"
          : "border border-slate-200 bg-slate-100 text-slate-600 hover:bg-slate-100"
      }
    >
      {active ? "Active" : "Inactive"}
    </Badge>
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
