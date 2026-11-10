import type { ApiResponse, PaginatedResponse } from "@/types";

export type StockMovement = {
  id: number;
  company_id: number;
  warehouse_id: number;
  product_id: number;
  movement_type:
    | "IN"
    | "OUT"
    | "sale"
    | "purchase_receipt"
    | "transfer_in"
    | "transfer_out"
    | "adjustment_in"
    | "adjustment_out"
    | "opname_in"
    | "opname_out";
  reference_type: string;
  reference_id: number | null;
  quantity_in: number | string;
  quantity_out: number | string;
  unit_cost: number | string | null;
  notes: string | null;
  created_by: number;
  created_at: string;
  product?: { id: number; sku: string; name: string; unit: string };
  warehouse?: { id: number; code: string; name: string; branch_id: number };
  creator?: { id: number; name: string };
};

export type StockMovementsResponse = ApiResponse<PaginatedResponse<StockMovement>>;
