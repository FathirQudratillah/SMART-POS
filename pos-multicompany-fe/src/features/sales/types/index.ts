import type { ApiResponse, PaginatedResponse } from "@/types";
import type { CashMovement } from "@/features/finance/cash-movements/types";

export type { CashMovement } from "@/features/finance/cash-movements/types";
export type { CreateCashMovementRequest } from "@/features/finance/cash-movements/types";

export type SaleItem = {
  id: number;
  sale_id: number;
  product_id: number;
  warehouse_id?: number | null;
  product_name: string;
  sku: string;
  quantity: number | string;
  unit_price: number | string;
  discount_amount: number | string;
  tax_amount: number | string;
  cost_price: number | string | null;
  line_total: number | string;
  product?: { id: number; sku: string; name: string; unit: string };
  warehouse?: { id: number; code: string; name: string } | null;
};

export type SalePayment = {
  id: number;
  payment_method_id: number;
  amount: number | string;
  reference_no: string | null;
  paid_at: string | null;
  status: string;
  payment_method?: { id: number; code: string; name: string; type: string };
};

export type Sale = {
  id: number;
  company_id: number;
  branch_id: number;
  warehouse_id: number;
  cashier_shift_id: number;
  customer_id: number | null;
  invoice_no: string;
  sale_date: string;
  subtotal: number | string;
  discount_amount: number | string;
  tax_amount: number | string;
  total_amount: number | string;
  paid_amount: number | string;
  change_amount: number | string;
  status: string;
  items_count?: number;
  branch: { id: number; code: string; name: string };
  warehouse: { id: number; code: string; name: string };
  customer?: { id: number; code: string; name: string; phone?: string | null } | null;
  cashier_shift?: { id: number; opened_at: string; status: string };
  creator?: { id: number; name: string };
  items: SaleItem[];
  payments: SalePayment[];
};

export type SalesResponse = ApiResponse<PaginatedResponse<Sale>>;
export type SaleResponse = ApiResponse<Sale>;
export type CashierShift = {
  id: number;
  company_id: number;
  branch_id: number;
  user_id: number;
  opened_at: string;
  opening_cash: number | string;
  cash_in_total?: number | string;
  cash_out_total?: number | string;
  expected_cash?: number | string;
  closing_cash?: number | string | null;
  closed_at?: string | null;
  status: string;
  current_expected_cash?: number | string;
  cash_movements?: CashMovement[];
  branch?: { id: number; code: string; name: string };
  user?: { id: number; name: string };
};
export type CashierShiftResponse = ApiResponse<CashierShift | null>;
export type CashierShiftsResponse = ApiResponse<PaginatedResponse<CashierShift>>;

export type StartCashierShiftRequest = {
  branch_id: number;
  opening_cash: number;
};

export type CreateSaleRequest = {
  branch_id: number;
  warehouse_id: number;
  cashier_shift_id: number;
  customer_id: number | null;
  invoice_no: string;
  sale_date: string;
  items: { product_id: number; warehouse_id?: number; quantity: number }[];
};

export type CompleteSaleRequest = {
  payment_method_id: number;
  amount_tendered: number;
  reference_no?: string;
};

export type PaymentMethod = {
  id: number;
  company_id: number | null;
  code: string;
  name: string;
  type: string;
  is_active: boolean;
  deleted_at?: string | null;
};

export type PaymentMethodsResponse = ApiResponse<PaymentMethod[]>;
