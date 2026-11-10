import type { ApiResponse, PaginatedResponse } from "@/types";
import type { Branch } from "@/features/company-management/branches/types";

export type User = {
  id: number;
  is_superadmin?: boolean;
  name: string;
  email: string;
  email_verified_at?: string;
  phone: string | null;
  password?: string;
  created_at?: string;
  updated_at?: string;
};

export type CompanyUser = User & {
  is_active: boolean;
  joined_at: string | null;
  branches: Branch[];
};

export type CompanyUsersResponse = ApiResponse<PaginatedResponse<CompanyUser>>;

export type AccessPermission = {
  id: number;
  name: string;
  code: string;
  module: string;
  description: string | null;
};

export type CompanyUserDetail = {
  user: CompanyUser;
  branch: Branch;
  permissions: AccessPermission[];
  permission_ids: number[];
  uses_custom_permissions: boolean;
};

export type CompanyUserResponse = ApiResponse<CompanyUserDetail>;

export type CreateCompanyUserRequest = {
  name: string;
  email: string;
  phone: string;
  password: string;
  branch_id: number;
};

export type UpdateCompanyUserRequest = {
  name: string;
  phone: string;
  branch_id: number;
};

export type UpdateUserPermissionsRequest = {
  branch_id: number;
  permission_ids: number[];
};

export type ChangeCompanyUserPasswordRequest = {
  password: string;
  password_confirmation: string;
};

export type DeleteCompanyUsersRequest = {
  ids: number[];
};
