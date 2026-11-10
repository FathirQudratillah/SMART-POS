import type { Product } from "@/features/master/product/types";
import type { Warehouse } from "@/features/master/warehouses/types";
import type { ApiResponse, PaginatedResponse } from "@/types";

export type StockOverviewItem = {
  id: number;
  company_id: number;
  product_id: number;
  warehouse_id: number;
  quantity: number | string;
  updated_at?: string;
  warehouse: Warehouse;
  product: Product;
};

export type StockOverviewResponse = ApiResponse<
  PaginatedResponse<StockOverviewItem>
>;
