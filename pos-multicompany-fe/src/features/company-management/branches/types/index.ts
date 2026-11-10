import type { ApiResponse, PaginatedResponse } from "@/types";

export type Branch = {
  id: number;
  company_id: number;
  code: string;
  name: string;
  address: string;
  phone: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type BranchResponse = ApiResponse<PaginatedResponse<Branch>>
export type BranchItemResponse = ApiResponse<Branch>;

export type BranchFormValues = {
  code: string;
  name: string;
  address: string;
  phone: string;
  is_active: boolean;
};

export type BranchDeleteRequest = {
  ids: number[];
};