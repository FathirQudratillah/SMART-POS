import axios from "axios";
import { apiClient, getCsrfCookie } from "@/lib/apiClient";
import type { ApiErrorResponse } from "@/types";
import type { StockTransferResponse } from "../types";

export async function postStockTransfer(
  companyId: number,
  id: number,
): Promise<StockTransferResponse> {
  try {
    await getCsrfCookie();
    const response = await apiClient.post<StockTransferResponse>(
      `/companies/${companyId}/stock-transfers/${id}/post`,
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      throw error.response?.data ?? {
        message: "Failed to post stock transfer. Please try again.",
        errors: {},
      };
    }
    throw error;
  }
}
