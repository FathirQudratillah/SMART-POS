import axios from "axios";

import { apiClient, getCsrfCookie } from "@/lib/apiClient";
import type { ApiErrorResponse, ApiSuccessMessage } from "@/types";
import type { ProductDeleteRequest } from "../types";

export const deleteProducts = async (
  companyId: number,
  request: ProductDeleteRequest,
): Promise<string> => {
  try {
    await getCsrfCookie();
    const response = await apiClient.delete<ApiSuccessMessage>(
      `/companies/${companyId}/products`,
      {
        data: request,
      },
    );

    return response.data.message;
  } catch (error: unknown) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      throw (
        error.response?.data ?? {
          message: "Failed to delete products. Please try again.",
        }
      );
    }

    throw error;
  }
};
