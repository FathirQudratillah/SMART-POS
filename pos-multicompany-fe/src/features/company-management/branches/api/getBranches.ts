import { apiClient } from "@/lib/apiClient";
import type { BranchResponse } from "../types";
import type { CompanyResourceParams } from "@/types";
import type { BranchItemResponse, BranchFormValues, BranchDeleteRequest } from "../types";
import axios from "axios";
import { getCsrfCookie } from "@/lib/apiClient";
import type { ApiErrorResponse, ApiSuccessMessage } from "@/types";

export const getBranches = async ({
  companyId,
  page = 1,
  per_page = 25,
  search = ""
}: CompanyResourceParams): Promise<BranchResponse> => {
  const response = await apiClient.get<BranchResponse>(`/companies/${companyId}/branches`, {
    params: {
      page,
      per_page,
      search
    },
  });

  return response.data;
};

export async function getBranch(companyId: number, id: number) {
  const response = await apiClient.get<BranchItemResponse>(
    `/companies/${companyId}/branches/${id}`,
  );
  return response.data;
}

export async function saveBranch(
  companyId: number,
  payload: BranchFormValues,
  id?: number,
): Promise<string> {
  try {
    await getCsrfCookie();
    const response = id === undefined
      ? await apiClient.post<BranchItemResponse>(`/companies/${companyId}/branches`, payload)
      : await apiClient.patch<BranchItemResponse>(`/companies/${companyId}/branches/${id}`, payload);
    return response.data.message;
  } catch (error: unknown) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      throw error.response?.data ?? { message: "Failed to save branch.", errors: {} };
    }
    throw error;
  }
}

export async function deleteBranches(
  companyId: number,
  payload: BranchDeleteRequest,
): Promise<string> {
  try {
    await getCsrfCookie();
    const response = await apiClient.delete<ApiSuccessMessage>(
      `/companies/${companyId}/branches`,
      { data: payload },
    );
    return response.data.message;
  } catch (error: unknown) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      throw error.response?.data ?? { message: "Failed to delete branches.", errors: {} };
    }
    throw error;
  }
}
