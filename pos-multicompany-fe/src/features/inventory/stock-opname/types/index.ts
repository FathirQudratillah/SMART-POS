import type { ApiResponse, PaginatedResponse } from "@/types";

export type StockOpnameWarehouse = { id: number; company_id: number; code: string; name: string };
export type StockOpnameProduct = { id: number; company_id: number; sku: string; name: string; unit: string };
export type StockOpnameItem = {
  id: number;
  stock_opname_id: number;
  product_id: number;
  system_quantity: number | string;
  counted_quantity: number | string;
  product: StockOpnameProduct;
};
export type StockOpname = {
  id: number;
  company_id: number;
  opname_no: string;
  warehouse_id: number;
  status: "draft" | "approved" | string;
  opname_date: string;
  items_count: number;
  notes: string | null;
  warehouse: StockOpnameWarehouse;
  items: StockOpnameItem[];
  creator?: { id: number; name: string };
  approver?: { id: number; name: string } | null;
};
export type StockOpnamesResponse = ApiResponse<PaginatedResponse<StockOpname>>;
export type StockOpnameResponse = ApiResponse<StockOpname>;
export type CreateStockOpnameRequest = {
  warehouse_id: number;
  notes?: string;
  items: { product_id: number; counted_quantity: number }[];
};
