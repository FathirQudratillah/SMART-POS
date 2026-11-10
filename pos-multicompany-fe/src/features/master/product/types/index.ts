import type { ApiResponse, PaginatedResponse } from "@/types";

export type Product = {
  id: number;
  company_id: number;
  category_id: number;
  sku: string;
  name: string;
  unit: string;
  barcode?: string;
  image_path?: string | null;
  image_url?: string | null;
  description?: string;
  cost_price?: string;
  selling_price?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  category?: {
    id: number;
    name: string;
  };
}

export type ProductsResponse = ApiResponse<PaginatedResponse<Product>>;

export type ProductResponse = ApiResponse<Product>;

export type ProductFormRequest = {
  category_id: number;
  sku: string;
  barcode: string;
  name: string;
  description: string;
  unit: string;
  cost_price: number;
  selling_price: number;
  is_active: boolean;
  image?: File | null;
};

export type ProductUpdateRequest = {
  name?: string;
  description?: string;
  barcode?: string;
  is_active?: boolean;
  image?: File | null;
}

export type ProductDeleteRequest = {
  ids: number[];
}