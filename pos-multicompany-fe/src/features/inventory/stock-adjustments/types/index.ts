import type { ApiResponse, PaginatedResponse } from "@/types";

export type StockAdjustmentWarehouse = { id: number; company_id: number; code: string; name: string };
export type StockAdjustmentProduct = { id: number; company_id: number; sku: string; name: string; unit: string };
export type StockAdjustmentItem = {
  id: number;
  stock_adjustment_id: number;
  product_id: number;
  quantity: number | string;
  product: StockAdjustmentProduct;
};
export type StockAdjustment = {
  id: number;
  company_id: number;
  adjustment_no: string;
  warehouse_id: number;
  adjustment_type: "increase" | "decrease";
  status: "draft" | "approved" | string;
  adjustment_date: string;
  reason: string;
  warehouse: StockAdjustmentWarehouse;
  items: StockAdjustmentItem[];
  creator?: { id: number; name: string };
  approver?: { id: number; name: string } | null;
};
export type StockAdjustmentsResponse = ApiResponse<PaginatedResponse<StockAdjustment>>;
export type StockAdjustmentResponse = ApiResponse<StockAdjustment>;
export type CreateStockAdjustmentRequest = {
  warehouse_id: number;
  adjustment_type: "increase" | "decrease";
  reason: string;
  items: { product_id: number; quantity: number }[];
};
