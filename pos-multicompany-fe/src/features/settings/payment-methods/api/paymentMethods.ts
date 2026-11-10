import axios from "axios";
import { apiClient, getCsrfCookie } from "@/lib/apiClient";
import type {
  ApiErrorResponse,
  ApiResponse,
  ApiSuccessMessage,
  CompanyResourceParams,
} from "@/types";
import type {
  PaymentMethodDeleteRequest,
  PaymentMethodFormValues,
  PaymentMethodResponse,
  PaymentMethodsResponse,
} from "../types";

export async function getPaymentMethods({
  companyId,
  page = 1,
  per_page = 25,
  search = "",
}: CompanyResourceParams): Promise<PaymentMethodsResponse> {
  const response = await apiClient.get<PaymentMethodsResponse>(
    `/companies/${companyId}/payment-methods`,
    { params: { page, per_page, search } },
  );
  return response.data;
}

export async function createPaymentMethod(
  companyId: number,
  payload: PaymentMethodFormValues,
): Promise<string> {
  return mutatePaymentMethod(
    () => apiClient.post<PaymentMethodResponse>(
      `/companies/${companyId}/payment-methods`,
      payload,
    ),
    "Failed to create payment method. Please try again.",
  );
}

export async function updatePaymentMethod(
  companyId: number,
  id: number,
  payload: PaymentMethodFormValues,
): Promise<string> {
  return mutatePaymentMethod(
    () => apiClient.patch<PaymentMethodResponse>(
      `/companies/${companyId}/payment-methods/${id}`,
      payload,
    ),
    "Failed to update payment method. Please try again.",
  );
}

export async function deletePaymentMethods(
  companyId: number,
  payload: PaymentMethodDeleteRequest,
): Promise<string> {
  try {
    await getCsrfCookie();
    const response = await apiClient.delete<ApiSuccessMessage>(
      `/companies/${companyId}/payment-methods`,
      { data: payload },
    );
    return response.data.message;
  } catch (error: unknown) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      throw error.response?.data ?? {
        message: "Failed to delete payment methods. Please try again.",
        errors: {},
      };
    }
    throw error;
  }
}

async function mutatePaymentMethod(
  request: () => Promise<{ data: ApiResponse<unknown> }>,
  fallbackMessage: string,
): Promise<string> {
  try {
    await getCsrfCookie();
    const response = await request();
    return response.data.message;
  } catch (error: unknown) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      throw error.response?.data ?? { message: fallbackMessage, errors: {} };
    }
    throw error;
  }
}
