import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth/AuthContext";
import type { ApiErrorResponse } from "@/types";
import {
  changeCompanyUserPassword,
  createCompanyUser,
  deleteCompanyUsers,
  updateCompanyUser,
  updateUserPermissions,
} from "../api/companyUsers";
import type {
  CreateCompanyUserRequest,
  ChangeCompanyUserPasswordRequest,
  DeleteCompanyUsersRequest,
  UpdateCompanyUserRequest,
  UpdateUserPermissionsRequest,
} from "../types";

export function useCreateCompanyUser() {
  const { company } = useAuth();
  const queryClient = useQueryClient();
  const companyId = company?.id;

  return useMutation<
    Awaited<ReturnType<typeof createCompanyUser>>,
    ApiErrorResponse,
    CreateCompanyUserRequest
  >({
    mutationFn: (payload: CreateCompanyUserRequest) => {
      if (!companyId) throw new Error("Select a company before creating users.");
      return createCompanyUser(companyId, payload);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["CompanyUsers", companyId] }),
  });
}

export function useUpdateCompanyUser(userId: number) {
  const { company } = useAuth();
  const queryClient = useQueryClient();
  const companyId = company?.id;

  return useMutation<string, ApiErrorResponse, UpdateCompanyUserRequest>({
    mutationFn: async (payload) => {
      if (!companyId) throw new Error("Select a company before updating users.");
      const response = await updateCompanyUser(companyId, userId, payload);
      return response.message;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["CompanyUsers", companyId] });
      void queryClient.invalidateQueries({ queryKey: ["CompanyUser", companyId, userId] });
    },
  });
}

export function useUpdateUserPermissions(userId: number) {
  const { company } = useAuth();
  const queryClient = useQueryClient();
  const companyId = company?.id;

  return useMutation<string, ApiErrorResponse, UpdateUserPermissionsRequest>({
    mutationFn: async (payload) => {
      if (!companyId) throw new Error("Select a company before setting permissions.");
      const response = await updateUserPermissions(companyId, userId, payload);
      return response.message;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["CompanyUser", companyId, userId] }),
  });
}

export function useChangeCompanyUserPassword(userId: number) {
  const { company } = useAuth();
  const companyId = company?.id;

  return useMutation<string, ApiErrorResponse, ChangeCompanyUserPasswordRequest>({
    mutationFn: async (payload) => {
      if (!companyId) throw new Error("Select a company before changing user passwords.");
      const response = await changeCompanyUserPassword(companyId, userId, payload);
      return response.message;
    },
  });
}

export function useDeleteCompanyUsers() {
  const { company } = useAuth();
  const queryClient = useQueryClient();
  const companyId = company?.id;

  return useMutation<string, ApiErrorResponse, DeleteCompanyUsersRequest>({
    mutationFn: (payload) => {
      if (!companyId) throw new Error("Select a company before removing users.");
      return deleteCompanyUsers(companyId, payload);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["CompanyUsers", companyId] }),
  });
}
