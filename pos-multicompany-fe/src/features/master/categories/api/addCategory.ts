import axios from "axios";
import { apiClient, getCsrfCookie } from "@/lib/apiClient";
import type { ApiErrorResponse } from "@/types";
import type { CategoryFormRequest, CategoryResponse } from "../types";

export async function addCategory(companyId: number, payload: CategoryFormRequest): Promise<string> {
  try {
    await getCsrfCookie();
    const response = await apiClient.post<CategoryResponse>(`/companies/${companyId}/categories`, payload);
    return response.data.message;
  } catch (error: unknown) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      throw error.response?.data ?? { message: "Failed to add category. Please try again.", errors: {} };
    }
    throw error;
  }
}
