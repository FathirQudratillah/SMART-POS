import type { ApiResponse, PaginatedResponse } from "@/types";

export type CashMovement = {
  id: number;
  company_id: number;
  branch_id: number;
  cashier_shift_id: number | null;
  movement_type: "cash_in" | "cash_out";
  reference_type: string;
  reference_id: number | null;
  amount: number | string;
  description: string;
  created_by: number;
  created_at: string;
  branch?: { id: number; code: string; name: string };
  cashier_shift?: { id: number; opened_at: string; status: string } | null;
  creator?: { id: number; name: string };
};

export type CreateCashMovementRequest = {
  branch_id: number;
  cashier_shift_id: number;
  movement_type: "cash_in" | "cash_out";
  reference_type: "manual";
  amount: number;
  description: string;
};

export type CashMovementsResponse = ApiResponse<PaginatedResponse<CashMovement>>;
