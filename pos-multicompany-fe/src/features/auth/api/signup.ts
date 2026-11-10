import axios from "axios";

import { apiClient, getCsrfCookie } from "@/lib/apiClient";
import type { ApiErrorResponse } from "@/types";
import type { SignupFormRequest, SignupResponse} from "../types";


export const signup = async (signup: SignupFormRequest): Promise<string> => {
  try {
    await getCsrfCookie();

    const response = await apiClient.post<SignupResponse>(
      "/auth/signup",
      signup,
    );

    return response.data.message;
  } catch (error: unknown) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      throw (
        error.response?.data ?? {
          message: "Signup failed. Please try again.",
        }
      );
    }


    throw error;
  }
};
