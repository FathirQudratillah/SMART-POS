import axios from "axios";
import { apiClient, getCsrfCookie } from "@/lib/apiClient";
import type { ApiErrorResponse } from "@/types";
import type { WarehouseFormRequest, WarehouseResponse } from "../types";

export async function addWarehouse(companyId: number, payload: WarehouseFormRequest): Promise<string> {
  try {
    await getCsrfCookie();
    const response = await apiClient.post<WarehouseResponse>(`/companies/${companyId}/warehouses`, payload);
    return response.data.message;
  } catch (error: unknown) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      throw error.response?.data ?? { message: "Failed to add warehouse. Please try again.", errors: {} };
    }
    throw error;
  }
}
