import { apiClient } from "@/lib/apiClient";
import type { UserData, UserDataResponse } from "../types";
import axios from "axios";

export const getUserData = async (): Promise<UserData | null> => {
  try {
    const response = await apiClient.get<UserDataResponse>("/auth/me");

    return response.data.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 401) {
        return null;
      }

      console.error(
        "Gagal mengambil data user:",
        error.response?.data?.message ?? error.message,
      );
    } else {
      console.error("Terjadi kesalahan:", error);
    }

    throw error;
  }
};
