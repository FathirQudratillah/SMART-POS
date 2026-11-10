import type { ApiResponse, PaginatedResponse } from "@/types";

export type GoodsReceiptItem = {
  id: number;
  goods_receipt_id: number;
  purchase_item_id: number | null;
  product_id: number;
  quantity_received: number | string;
  unit_cost: number | string;
  product: { id: number; sku: string; name: string; unit: string };
};

export type GoodsReceipt = {
  id: number;
  company_id: number;
  branch_id: number;
  warehouse_id: number;
  supplier_id: number;
  purchase_id: number | null;
  receipt_no: string;
  receipt_date: string;
  status: string;
  items_count?: number;
  branch: { id: number; code: string; name: string };
  warehouse: { id: number; code: string; name: string };
  supplier: { id: number; code: string; name: string };
  purchase?: { id: number; purchase_no: string } | null;
  items: GoodsReceiptItem[];
};

export type GoodsReceiptsResponse = ApiResponse<PaginatedResponse<GoodsReceipt>>;
export type GoodsReceiptResponse = ApiResponse<GoodsReceipt>;

export type CreateGoodsReceiptRequest = {
  branch_id: number;
  warehouse_id: number;
  supplier_id: number;
  purchase_id: number | null;
  receipt_no: string;
  receipt_date: string;
  items: {
    purchase_item_id?: number;
    product_id: number;
    quantity_received: number;
    unit_cost: number;
  }[];
};
