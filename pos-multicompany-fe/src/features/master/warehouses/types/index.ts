import type { Branch } from "@/features/company-management/branches/types";
import type { ApiResponse, PaginatedResponse } from "@/types";

export type Warehouse = {
  id: number;
  company_id: number;
  branch_id: number | null;
  code: string;
  name: string;
  address?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  branch?: Branch | null;
};

export type WarehousesResponse = ApiResponse<PaginatedResponse<Warehouse>>;

export type WarehouseResponse = ApiResponse<Warehouse>;

export type WarehouseFormRequest = {
  branch_id: number | null;
  code: string;
  name: string;
  address: string;
  is_active: boolean;
};

export type WarehouseUpdateRequest = Partial<WarehouseFormRequest>;

export type WarehouseDeleteRequest = {
  ids: number[];
};
