import type { ApiResponse, PaginatedResponse } from "@/types";

export type PurchaseOrderItem = {
  id: number;
  purchase_id: number;
  product_id: number;
  quantity: number | string;
  received_quantity: number | string;
  unit_price: number | string;
  discount_amount: number | string;
  tax_amount: number | string;
  line_total: number | string;
  product: { id: number; sku: string; name: string; unit: string };
};

export type PurchaseOrder = {
  id: number;
  company_id: number;
  branch_id: number;
  warehouse_id: number;
  supplier_id: number;
  purchase_no: string;
  purchase_date: string;
  subtotal: number | string;
  discount_amount: number | string;
  tax_amount: number | string;
  total_amount: number | string;
  status: string;
  items_count?: number;
  branch: { id: number; code: string; name: string };
  warehouse: { id: number; code: string; name: string };
  supplier: { id: number; code: string; name: string };
  items: PurchaseOrderItem[];
};

export type PurchaseOrdersResponse = ApiResponse<PaginatedResponse<PurchaseOrder>>;
export type PurchaseOrderResponse = ApiResponse<PurchaseOrder>;

export type CreatePurchaseOrderRequest = {
  branch_id: number;
  warehouse_id: number;
  supplier_id: number;
  purchase_no: string;
  purchase_date: string;
  items: {
    product_id: number;
    quantity: number;
    unit_price: number;
    discount_amount: number;
    tax_amount: number;
  }[];
};
