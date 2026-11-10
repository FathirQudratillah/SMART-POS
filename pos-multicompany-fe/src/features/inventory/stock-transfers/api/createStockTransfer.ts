import axios from "axios";
import { apiClient, getCsrfCookie } from "@/lib/apiClient";
import type { ApiErrorResponse } from "@/types";
import type { CreateStockTransferRequest, StockTransferResponse } from "../types";

export async function createStockTransfer(
  companyId: number,
  payload: CreateStockTransferRequest,
): Promise<StockTransferResponse> {
  try {
    await getCsrfCookie();
    const response = await apiClient.post<StockTransferResponse>(
      `/companies/${companyId}/stock-transfers`,
      payload,
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      throw error.response?.data ?? {
        message: "Failed to create stock transfer. Please try again.",
        errors: {},
      };
    }
    throw error;
  }
}
