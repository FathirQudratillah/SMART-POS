import axios from "axios";
import { apiClient, getCsrfCookie } from "@/lib/apiClient";
import type { ApiErrorResponse } from "@/types";
import type { CustomerResponse, CustomerUpdateRequest } from "../types";

export async function updateCustomer(companyId: number, id: number, payload: CustomerUpdateRequest): Promise<string> {
  try {
    await getCsrfCookie();
    const response = await apiClient.patch<CustomerResponse>(`/companies/${companyId}/customers/${id}`, payload);
    return response.data.message;
  } catch (error: unknown) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      throw error.response?.data ?? { message: "Failed to update customer. Please try again.", errors: {} };
    }
    throw error;
  }
}
