import axios from "axios";
import { apiClient, getCsrfCookie } from "@/lib/apiClient";
import type { ApiErrorResponse, ApiSuccessMessage } from "@/types";
import type { WarehouseDeleteRequest } from "../types";

export async function deleteWarehouses(companyId: number, payload: WarehouseDeleteRequest): Promise<string> {
  try {
    await getCsrfCookie();
    const response = await apiClient.delete<ApiSuccessMessage>(`/companies/${companyId}/warehouses`, { data: payload });
    return response.data.message;
  } catch (error: unknown) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      throw error.response?.data ?? { message: "Failed to delete warehouses. Please try again.", errors: {} };
    }
    throw error;
  }
}
