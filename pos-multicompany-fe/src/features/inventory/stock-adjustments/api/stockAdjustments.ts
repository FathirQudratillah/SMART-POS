import axios from "axios";
import { apiClient, getCsrfCookie } from "@/lib/apiClient";
import type { ApiErrorResponse, CompanyResourceParams } from "@/types";
import type {
  CreateStockAdjustmentRequest,
  StockAdjustmentResponse,
  StockAdjustmentsResponse,
} from "../types";

export async function getStockAdjustments({
  companyId,
  page = 1,
  per_page = 25,
  search = "",
}: CompanyResourceParams) {
  const response = await apiClient.get<StockAdjustmentsResponse>(
    `/companies/${companyId}/stock-adjustments`,
    { params: { page, per_page, search } },
  );
  return response.data;
}

export async function getStockAdjustment(companyId: number, id: number) {
  const response = await apiClient.get<StockAdjustmentResponse>(
    `/companies/${companyId}/stock-adjustments/${id}`,
  );
  return response.data;
}

export async function createStockAdjustment(
  companyId: number,
  payload: CreateStockAdjustmentRequest,
) {
  return postWithError<StockAdjustmentResponse>(
    `/companies/${companyId}/stock-adjustments`,
    payload,
  );
}

export async function postStockAdjustment(companyId: number, id: number) {
  return postWithError<StockAdjustmentResponse>(
    `/companies/${companyId}/stock-adjustments/${id}/post`,
  );
}

async function postWithError<T>(url: string, payload?: unknown): Promise<T> {
  try {
    await getCsrfCookie();
    const response = await apiClient.post<T>(url, payload);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      throw (
        error.response?.data ?? {
          message: "Stock adjustment request failed.",
          errors: {},
        }
      );
    }
    throw error;
  }
}
