import type { ApiResponse, PaginatedResponse } from "@/types";

export type PaymentMethod = {
  id: number;
  company_id: number;
  code: string;
  name: string;
  type: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export type PaymentMethodsResponse = ApiResponse<PaginatedResponse<PaymentMethod>>;
export type PaymentMethodResponse = ApiResponse<PaymentMethod>;

export type PaymentMethodFormValues = {
  code: string;
  name: string;
  type: string;
  is_active: boolean;
};

export type PaymentMethodDeleteRequest = {
  ids: number[];
};
