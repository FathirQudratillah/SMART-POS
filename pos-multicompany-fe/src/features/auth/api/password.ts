import axios from "axios";
import { apiClient, getCsrfCookie } from "@/lib/apiClient";
import type { ApiErrorResponse, ApiResponse } from "@/types";

type MessageResponse = ApiResponse<null>;

export type ResetPasswordRequest = {
  email: string;
  token: string;
  password: string;
  password_confirmation: string;
};

async function postPasswordRequest(
  path: string,
  payload: Record<string, string>,
  fallbackMessage: string,
): Promise<string> {
  try {
    await getCsrfCookie();
    const response = await apiClient.post<MessageResponse>(path, payload);
    return response.data.message;
  } catch (error: unknown) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      throw error.response?.data ?? {
        message: fallbackMessage,
        errors: {},
      };
    }

    throw error;
  }
}

export function requestPasswordReset(email: string): Promise<string> {
  return postPasswordRequest(
    "/auth/forgot-password",
    { email },
    "Failed to request a password reset.",
  );
}

export function resetPassword(payload: ResetPasswordRequest): Promise<string> {
  return postPasswordRequest(
    "/auth/reset-password",
    payload,
    "Failed to reset your password.",
  );
}
