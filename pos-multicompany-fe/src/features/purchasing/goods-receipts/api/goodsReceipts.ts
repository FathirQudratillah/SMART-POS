import axios from "axios";
import { apiClient, getCsrfCookie } from "@/lib/apiClient";
import type { ApiErrorResponse, CompanyResourceParams } from "@/types";
import type {
  CreateGoodsReceiptRequest,
  GoodsReceiptResponse,
  GoodsReceiptsResponse,
} from "../types";

export async function getGoodsReceipts({
  companyId,
  branchId,
  page = 1,
  per_page = 25,
  search = "",
}: CompanyResourceParams) {
  const response = await apiClient.get<GoodsReceiptsResponse>(
    `/companies/${companyId}/goods-receipts${branchId ? `/${branchId}` : ""}`,
    { params: { page, per_page, search } },
  );
  return response.data;
}

export async function getGoodsReceipt(companyId: number, id: number) {
  const response = await apiClient.get<GoodsReceiptResponse>(
    `/companies/${companyId}/goods-receipt/${id}`,
  );
  return response.data;
}

export async function createGoodsReceipt(
  companyId: number,
  payload: CreateGoodsReceiptRequest,
) {
  return postWithError<GoodsReceiptResponse>(
    `/companies/${companyId}/goods-receipts`,
    payload,
  );
}

export async function postGoodsReceipt(companyId: number, id: number) {
  return postWithError<GoodsReceiptResponse>(
    `/companies/${companyId}/goods-receipts/${id}/post`,
  );
}

async function postWithError<T>(url: string, payload?: unknown): Promise<T> {
  try {
    await getCsrfCookie();
    const response = await apiClient.post<T>(url, payload);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      throw (
        error.response?.data ?? {
          message: "Goods receipt request failed.",
          errors: {},
        }
      );
    }
    throw error;
  }
}
