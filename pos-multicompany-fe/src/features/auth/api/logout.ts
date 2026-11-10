import axios from "axios";

import { apiClient } from "@/lib/apiClient";
import type { ApiResponse } from "@/types";

export const logoutApi = async (): Promise<ApiResponse<null>> => {
  try {
    const response = await apiClient.post<ApiResponse<null>>("/auth/spa/logout");

    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      console.error(
        "Logout gagal:",
        error.response?.data?.message ?? error.message,
      );
    }

    throw error;
  }
};
