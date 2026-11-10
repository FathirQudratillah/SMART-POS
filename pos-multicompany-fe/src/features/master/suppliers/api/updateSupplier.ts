import axios from "axios";
import { apiClient, getCsrfCookie } from "@/lib/apiClient";
import type { ApiErrorResponse } from "@/types";
import type { SupplierResponse, SupplierUpdateRequest } from "../types";

export async function updateSupplier(companyId: number, id: number, payload: SupplierUpdateRequest): Promise<string> {
  try {
    await getCsrfCookie();
    const response = await apiClient.patch<SupplierResponse>(`/companies/${companyId}/suppliers/${id}`, payload);
    return response.data.message;
  } catch (error: unknown) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      throw error.response?.data ?? { message: "Failed to update supplier. Please try again.", errors: {} };
    }
    throw error;
  }
}
