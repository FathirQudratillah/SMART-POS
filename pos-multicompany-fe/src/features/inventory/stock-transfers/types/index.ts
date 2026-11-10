import type { ApiResponse, PaginatedResponse } from "@/types";

export type StockTransferWarehouse = {
  id: number;
  company_id: number;
  code: string;
  name: string;
};

export type StockTransferProduct = {
  id: number;
  company_id: number;
  sku: string;
  name: string;
  unit: string;
};

export type StockTransferItem = {
  id: number;
  stock_transfer_id: number;
  product_id: number;
  quantity: number | string;
  product: StockTransferProduct;
};

export type StockTransfer = {
  id: number;
  company_id: number;
  transfer_no: string;
  source_warehouse_id: number;
  destination_warehouse_id: number;
  status: "draft" | "approved" | string;
  transfer_date: string;
  created_by: number;
  approved_by: number | null;
  notes: string | null;
  source_warehouse: StockTransferWarehouse;
  destination_warehouse: StockTransferWarehouse;
  creator?: { id: number; name: string };
  approver?: { id: number; name: string } | null;
  items: StockTransferItem[];
  created_at: string;
  updated_at: string;
};

export type StockTransferResponse = ApiResponse<StockTransfer>;
export type StockTransfersResponse = ApiResponse<PaginatedResponse<StockTransfer>>;

export type CreateStockTransferRequest = {
  source_warehouse_id: number;
  destination_warehouse_id: number;
  notes?: string;
  items: { product_id: number; quantity: number }[];
};
