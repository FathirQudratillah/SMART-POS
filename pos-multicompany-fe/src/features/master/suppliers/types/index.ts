import type { ApiResponse, PaginatedResponse } from "@/types";

export type Supplier = {
  id: number;
  company_id: number;
  code: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  tax_number: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type SuppliersResponse = ApiResponse<PaginatedResponse<Supplier>>;

export type SupplierResponse = ApiResponse<Supplier>;

export type SupplierFormRequest = {
  code: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  tax_number: string;
  is_active: boolean;
};

export type SupplierUpdateRequest = Partial<SupplierFormRequest>;

export type SupplierDeleteRequest = {
  ids: number[];
};
