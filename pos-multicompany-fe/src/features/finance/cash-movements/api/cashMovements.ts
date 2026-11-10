import axios from "axios";
import { apiClient, getCsrfCookie } from "@/lib/apiClient";
import type { ApiErrorResponse, ApiResponse, PaginatedResponse } from "@/types";
import type {
  CashMovement,
  CashMovementsResponse,
  CreateCashMovementRequest,
} from "../types";

export type CashMovementParams = {
  companyId: number;
  branchId: number | null;
  page: number;
  per_page: number;
  search: string;
  movementType: "all" | "cash_in" | "cash_out";
};

export async function getCashMovements({
  companyId,
  branchId,
  page,
  per_page,
  search,
  movementType,
}: CashMovementParams): Promise<CashMovementsResponse> {
  const response = await apiClient.get<ApiResponse<PaginatedResponse<CashMovement>>>(
    `/companies/${companyId}/cash-movements`,
    {
      params: {
        branch_id: branchId ?? undefined,
        page,
        per_page,
        search,
        movement_type: movementType === "all" ? undefined : movementType,
      },
    },
  );
  return response.data;
}

export async function createCashMovement(
  companyId: number,
  payload: CreateCashMovementRequest,
): Promise<ApiResponse<CashMovement>> {
  try {
    await getCsrfCookie();
    const response = await apiClient.post<ApiResponse<CashMovement>>(
      `/companies/${companyId}/cash-movements`,
      payload,
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      throw error.response?.data ?? {
        message: "Cash movement request failed.",
        errors: {},
      };
    }
    throw error;
  }
}
