import axios from "axios";
import { apiClient, getCsrfCookie } from "@/lib/apiClient";
import type {
  ApiErrorResponse,
  ApiResponse,
  ApiSuccessMessage,
  CompanyResourceParams,
} from "@/types";
import type {
  CompanyUser,
  CompanyUserResponse,
  CompanyUsersResponse,
  ChangeCompanyUserPasswordRequest,
  CreateCompanyUserRequest,
  DeleteCompanyUsersRequest,
  UpdateCompanyUserRequest,
  UpdateUserPermissionsRequest,
} from "../types";

export async function getCompanyUsers({
  companyId,
  page = 1,
  per_page = 25,
  search = "",
}: CompanyResourceParams): Promise<CompanyUsersResponse> {
  const response = await apiClient.get<CompanyUsersResponse>(
    `/companies/${companyId}/users`,
    { params: { page, per_page, search } },
  );
  return response.data;
}

export async function getCompanyUser(companyId: number, userId: number) {
  const response = await apiClient.get<CompanyUserResponse>(
    `/companies/${companyId}/users/${userId}`,
  );
  return response.data;
}

export async function createCompanyUser(
  companyId: number,
  payload: CreateCompanyUserRequest,
): Promise<ApiResponse<CompanyUser>> {
  return mutate(
    "post",
    `/companies/${companyId}/users`,
    payload,
    "Failed to create user.",
  );
}

export async function updateCompanyUser(
  companyId: number,
  userId: number,
  payload: UpdateCompanyUserRequest,
): Promise<ApiResponse<CompanyUser>> {
  return mutate(
    "patch",
    `/companies/${companyId}/users/${userId}`,
    payload,
    "Failed to update user.",
  );
}

export async function updateUserPermissions(
  companyId: number,
  userId: number,
  payload: UpdateUserPermissionsRequest,
): Promise<ApiResponse<{ user_id: number; branch_id: number }>> {
  return mutate(
    "put",
    `/companies/${companyId}/users/${userId}/permissions`,
    payload,
    "Failed to update user permissions.",
  );
}

export async function changeCompanyUserPassword(
  companyId: number,
  userId: number,
  payload: ChangeCompanyUserPasswordRequest,
): Promise<ApiResponse<null>> {
  return mutate(
    "patch",
    `/companies/${companyId}/users/${userId}/password`,
    payload,
    "Failed to change user password.",
  );
}

export async function deleteCompanyUsers(
  companyId: number,
  payload: DeleteCompanyUsersRequest,
): Promise<string> {
  try {
    await getCsrfCookie();
    const response = await apiClient.delete<ApiSuccessMessage>(
      `/companies/${companyId}/users`,
      { data: payload },
    );
    return response.data.message;
  } catch (error: unknown) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      throw error.response?.data ?? {
        message: "Failed to remove company users.",
        errors: {},
      };
    }
    throw error;
  }
}

async function mutate<T>(
  method: "post" | "patch" | "put",
  url: string,
  payload: unknown,
  fallbackMessage: string,
): Promise<T> {
  try {
    await getCsrfCookie();
    const response = await apiClient.request<T>({ method, url, data: payload });
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError<ApiErrorResponse>(error)) {
      throw error.response?.data ?? { message: fallbackMessage, errors: {} };
    }
    throw error;
  }
}
