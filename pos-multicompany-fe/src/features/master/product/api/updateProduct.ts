import axios from "axios";

import { apiClient, getCsrfCookie } from "@/lib/apiClient";
import type { ApiErrorResponse } from "@/types";
import type { ProductResponse, ProductUpdateRequest } from "../types";

export const updateProduct = async (
  companyId: number,
  productId: number,
  product: ProductUpdateRequest,
): Promise<string> => {
  try {
    await getCsrfCookie();
    const formData = new FormData();
    formData.append("_method", "PATCH");
    Object.entries(product).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formData.append(
          key,
          value instanceof File
            ? value
            : typeof value === "boolean"
              ? String(Number(value))
              : String(value),
        );
      }
    });

    const response = await apiClient.post<ProductResponse>(
      `/companies/${companyId}/products/${productId}`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      },
    );

    return response.data.message;
  } catch (error: unknown) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      throw (
        error.response?.data ?? {
          message: "Failed to update product. Please try again.",
        }
      );
    }

    throw error;
  }
};
