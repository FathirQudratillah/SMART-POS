import type { ApiResponse, PaginatedResponse } from "@/types";

export type Category = {
  id: number;
  company_id: number;
  parent_id: number | null;
  code: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export type CategoriesResponse = ApiResponse<PaginatedResponse<Category>>;

export type CategoryResponse = ApiResponse<Category>;

export type CategoryFormRequest = {
  parent_id: number | null;
  code: string;
  name: string;
  description: string;
  is_active: boolean;
};

export type CategoryUpdateRequest = Partial<CategoryFormRequest>;

export type CategoryDeleteRequest = {
  ids: number[];
};
