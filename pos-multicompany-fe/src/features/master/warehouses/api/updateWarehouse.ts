import axios from "axios";
import { apiClient, getCsrfCookie } from "@/lib/apiClient";
import type { ApiErrorResponse } from "@/types";
import type { WarehouseResponse, WarehouseUpdateRequest } from "../types";

export async function updateWarehouse(companyId: number, id: number, payload: WarehouseUpdateRequest): Promise<string> {
  try {
    await getCsrfCookie();
    const response = await apiClient.patch<WarehouseResponse>(`/companies/${companyId}/warehouses/${id}`, payload);
    return response.data.message;
  } catch (error: unknown) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      throw error.response?.data ?? { message: "Failed to update warehouse. Please try again.", errors: {} };
    }
    throw error;
  }
}
