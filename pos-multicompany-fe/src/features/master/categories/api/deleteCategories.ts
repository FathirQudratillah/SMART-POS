import axios from "axios";
import { apiClient, getCsrfCookie } from "@/lib/apiClient";
import type { ApiErrorResponse, ApiSuccessMessage } from "@/types";
import type { CategoryDeleteRequest } from "../types";

export async function deleteCategories(companyId: number, payload: CategoryDeleteRequest): Promise<string> {
  try {
    await getCsrfCookie();
    const response = await apiClient.delete<ApiSuccessMessage>(`/companies/${companyId}/categories`, { data: payload });
    return response.data.message;
  } catch (error: unknown) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      throw error.response?.data ?? { message: "Failed to delete categories. Please try again.", errors: {} };
    }
    throw error;
  }
}
