import axios from "axios";
import { apiClient, getCsrfCookie } from "@/lib/apiClient";
import type { ApiErrorResponse, CompanyResourceParams } from "@/types";
import type {
  CreatePurchaseOrderRequest,
  PurchaseOrderResponse,
  PurchaseOrdersResponse,
} from "../types";

export async function getPurchaseOrders({
  companyId,
  branchId,
  page = 1,
  per_page = 25,
  search = "",
}: CompanyResourceParams) {
  const response = await apiClient.get<PurchaseOrdersResponse>(
    `/companies/${companyId}/purchases${branchId ? `/${branchId}` : ""}`,
    { params: { page, per_page, search } },
  );
  return response.data;
}

export async function getPurchaseOrder(companyId: number, id: number) {
  const response = await apiClient.get<PurchaseOrderResponse>(
    `/companies/${companyId}/purchase/${id}`,
  );
  return response.data;
}

export async function createPurchaseOrder(
  companyId: number,
  payload: CreatePurchaseOrderRequest,
) {
  try {
    await getCsrfCookie();
    const response = await apiClient.post<PurchaseOrderResponse>(
      `/companies/${companyId}/purchases`,
      payload,
    );
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      throw (
        error.response?.data ?? {
          message: "Failed to create purchase order.",
          errors: {},
        }
      );
    }
    throw error;
  }
}
