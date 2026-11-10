import axios from "axios";
import { apiClient, getCsrfCookie } from "@/lib/apiClient";
import type { ApiErrorResponse, ApiSuccessMessage } from "@/types";
import type { SupplierDeleteRequest } from "../types";

export async function deleteSuppliers(companyId: number, payload: SupplierDeleteRequest): Promise<string> {
  try {
    await getCsrfCookie();
    const response = await apiClient.delete<ApiSuccessMessage>(`/companies/${companyId}/suppliers`, { data: payload });
    return response.data.message;
  } catch (error: unknown) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      throw error.response?.data ?? { message: "Failed to delete suppliers. Please try again.", errors: {} };
    }
    throw error;
  }
}
