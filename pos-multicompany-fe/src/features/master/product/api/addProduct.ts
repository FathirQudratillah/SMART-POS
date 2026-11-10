import axios from "axios";

import { apiClient, getCsrfCookie } from "@/lib/apiClient";
import type { ApiErrorResponse } from "@/types";
import type { ProductFormRequest, ProductsResponse } from "../types";

export const addProduct = async (companyId: number, product: ProductFormRequest): Promise<string> => {
  try {
    await getCsrfCookie();
    const formData = new FormData();

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

    const response = await apiClient.post<ProductsResponse>(
      `/companies/${companyId}/products`,
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
          message: "Failed to add product. Please try again.",
        }
      );
    }

    throw error;
  }
};
