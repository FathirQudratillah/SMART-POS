import type { ApiResponse, PaginatedResponse } from "@/types";

export type Customer = {
  id: number;
  company_id: number;
  code: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type CustomersResponse = ApiResponse<PaginatedResponse<Customer>>;

export type CustomerResponse = ApiResponse<Customer>;

export type CustomerFormRequest = {
  code: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  is_active: boolean;
};

export type CustomerUpdateRequest = Partial<CustomerFormRequest>;

export type CustomerDeleteRequest = {
  ids: number[];
};
