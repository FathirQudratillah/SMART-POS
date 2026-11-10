import axios from "axios";
import { apiClient, getCsrfCookie } from "@/lib/apiClient";
import type { ApiErrorResponse } from "@/types";
import type { CategoryResponse, CategoryUpdateRequest } from "../types";

export async function updateCategory(companyId: number, id: number, payload: CategoryUpdateRequest): Promise<string> {
  try {
    await getCsrfCookie();
    const response = await apiClient.patch<CategoryResponse>(`/companies/${companyId}/categories/${id}`, payload);
    return response.data.message;
  } catch (error: unknown) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      throw error.response?.data ?? { message: "Failed to update category. Please try again.", errors: {} };
    }
    throw error;
  }
}
