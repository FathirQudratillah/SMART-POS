import axios from "axios";
import { apiClient, getCsrfCookie } from "@/lib/apiClient";
import type { ApiErrorResponse } from "@/types";
import type { SupplierFormRequest, SupplierResponse } from "../types";

export async function addSupplier(companyId: number, payload: SupplierFormRequest): Promise<string> {
  try {
    await getCsrfCookie();
    const response = await apiClient.post<SupplierResponse>(`/companies/${companyId}/suppliers`, payload);
    return response.data.message;
  } catch (error: unknown) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      throw error.response?.data ?? { message: "Failed to add supplier. Please try again.", errors: {} };
    }
    throw error;
  }
}
