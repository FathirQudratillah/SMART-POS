import axios from "axios";
import { apiClient, getCsrfCookie } from "@/lib/apiClient";
import type { ApiErrorResponse, CompanyResourceParams } from "@/types";
import type {
  CashierShiftResponse,
  CashierShiftsResponse,
  CompleteSaleRequest,
  CreateSaleRequest,
  PaymentMethodsResponse,
  StartCashierShiftRequest,
  SaleResponse,
  SalesResponse,
} from "../types";
export { createCashMovement } from "@/features/finance/cash-movements/api/cashMovements";

export async function getSales({ companyId, branchId, page = 1, per_page = 25, search = "" }: CompanyResourceParams) {
  const response = await apiClient.get<SalesResponse>(`/companies/${companyId}/sales`, {
    params: { branch_id: branchId ?? undefined, page, per_page, search },
  });
  return response.data;
}

export async function getSale(companyId: number, id: number) {
  const response = await apiClient.get<SaleResponse>(`/companies/${companyId}/sales/${id}`);
  return response.data;
}

export async function getOpenCashierShift(companyId: number, branchId: number) {
  const response = await apiClient.get<CashierShiftResponse>(`/companies/${companyId}/cashier-shifts/open`, {
    params: { branch_id: branchId },
  });
  return response.data;
}

export async function getCashierShifts({
  companyId,
  branchId,
  page = 1,
  per_page = 25,
  search = "",
  status = "all",
}: CompanyResourceParams & { status?: "all" | "open" | "closed" }) {
  const response = await apiClient.get<CashierShiftsResponse>(
    `/companies/${companyId}/cashier-shifts`,
    {
      params: {
        branch_id: branchId ?? undefined,
        page,
        per_page,
        search,
        status: status === "all" ? undefined : status,
      },
    },
  );
  return response.data;
}

export async function startCashierShift(companyId: number, payload: StartCashierShiftRequest) {
  return postWithError<CashierShiftResponse>(`/companies/${companyId}/cashier-shifts/open`, payload);
}

export async function closeCashierShift(companyId: number, shiftId: number, closingCash: number) {
  return postWithError<CashierShiftResponse>(`/companies/${companyId}/cashier-shifts/${shiftId}/close`, {
    closing_cash: closingCash,
  });
}

export async function getPaymentMethods(companyId: number) {
  const response = await apiClient.get<PaymentMethodsResponse>(`/companies/${companyId}/sales-payment-methods`);
  return response.data;
}

export async function createSale(companyId: number, payload: CreateSaleRequest) {
  return postWithError<SaleResponse>(`/companies/${companyId}/sales`, payload);
}

export async function completeSale(companyId: number, id: number, payload: CompleteSaleRequest) {
  return postWithError<SaleResponse>(`/companies/${companyId}/sales/${id}/complete`, payload);
}

async function postWithError<T>(url: string, payload: unknown): Promise<T> {
  try {
    await getCsrfCookie();
    const response = await apiClient.post<T>(url, payload);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      throw error.response?.data ?? { message: "Sales request failed.", errors: {} };
    }
    throw error;
  }
}
