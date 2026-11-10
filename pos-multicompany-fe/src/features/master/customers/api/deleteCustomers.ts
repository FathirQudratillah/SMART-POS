import axios from "axios";
import { apiClient, getCsrfCookie } from "@/lib/apiClient";
import type { ApiErrorResponse, ApiSuccessMessage } from "@/types";
import type { CustomerDeleteRequest } from "../types";

export async function deleteCustomers(
  companyId: number,
  payload: CustomerDeleteRequest,
): Promise<string> {
  try {
    await getCsrfCookie();
    const response = await apiClient.delete<ApiSuccessMessage>(
      `/companies/${companyId}/customers`,
      { data: payload },
    );
    return response.data.message;
  } catch (error: unknown) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      throw (
        error.response?.data ?? {
          message: "Failed to delete customers. Please try again.",
          errors: {},
        }
      );
    }
    throw error;
  }
}
