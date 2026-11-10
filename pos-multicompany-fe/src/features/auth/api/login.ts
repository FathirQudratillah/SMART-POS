import axios from "axios";

import { apiClient, getCsrfCookie } from "@/lib/apiClient";
import type { ApiResponse } from "@/types";
import type { LoginDataRequest, LoginDataResponse} from "../types";
import type { User } from "@/features/access-control/types";

export const login = async (
  loginData: LoginDataRequest,
): Promise<User> => {
  try {
    await getCsrfCookie();

    const response = await apiClient.post<LoginDataResponse>(
      "/auth/spa/login",
      loginData,
    );

    return response.data.data.user;
  } catch (error: unknown) {
    if (axios.isAxiosError<ApiResponse<null>>(error)) {
      throw new Error(
        error.response?.data?.message ?? "Login gagal. Silakan coba lagi.",
      );
    }

    throw error;
  }
};
