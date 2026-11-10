import axios from "axios";
import { apiClient, getCsrfCookie } from "@/lib/apiClient";
import type { ApiErrorResponse, CompanyResourceParams } from "@/types";
import type { CreateStockOpnameRequest, StockOpnameResponse, StockOpnamesResponse } from "../types";

export async function getStockOpnames({ companyId, page = 1, per_page = 25, search = "" }: CompanyResourceParams) {
  const response = await apiClient.get<StockOpnamesResponse>(`/companies/${companyId}/stock-opnames`, { params: { page, per_page, search } });
  return response.data;
}

export async function getStockOpname(companyId: number, id: number) {
  const response = await apiClient.get<StockOpnameResponse>(`/companies/${companyId}/stock-opnames/${id}`);
  return response.data;
}

export async function createStockOpname(companyId: number, payload: CreateStockOpnameRequest) {
  return postWithError<StockOpnameResponse>(`/companies/${companyId}/stock-opnames`, payload);
}

export async function postStockOpname(companyId: number, id: number) {
  return postWithError<StockOpnameResponse>(`/companies/${companyId}/stock-opnames/${id}/post`);
}

async function postWithError<T>(url: string, payload?: unknown): Promise<T> {
  try {
    await getCsrfCookie();
    const response = await apiClient.post<T>(url, payload);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      throw error.response?.data ?? { message: "Stock opname request failed.", errors: {} };
    }
    throw error;
  }
}
