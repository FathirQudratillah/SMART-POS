import axios from "axios";
import { apiClient, getCsrfCookie } from "@/lib/apiClient";
import type { ApiErrorResponse } from "@/types";
import type { CustomerFormRequest, CustomerResponse } from "../types";

export async function addCustomer(companyId: number, payload: CustomerFormRequest): Promise<string> {
  try {
    await getCsrfCookie();
    const response = await apiClient.post<CustomerResponse>(`/companies/${companyId}/customers`, payload);
    return response.data.message;
  } catch (error: unknown) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      throw error.response?.data ?? { message: "Failed to add customer. Please try again.", errors: {} };
    }
    throw error;
  }
}
