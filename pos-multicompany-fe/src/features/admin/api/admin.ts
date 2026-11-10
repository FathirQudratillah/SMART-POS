import { apiClient } from "@/lib/apiClient";
import type { ApiResponse, PaginatedResponse } from "@/types";

export type AdminActivity = {
  id: number;
  action: string;
  entity_type: string;
  entity_id: number | null;
  created_at: string;
  actor_name: string | null;
};

export type AdminDashboardData = {
  users: { total: number; active: number; inactive: number };
  companies: number;
  recent_activities: AdminActivity[];
};

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  is_superadmin: boolean;
  email_verified_at: string | null;
  created_at: string;
  companies_count?: number;
  companies?: { id: number; name: string; code: string }[];
  branches?: { id: number; name: string; code: string; company_id: number }[];
  roles?: { id: number; name: string; code: string }[];
};

export const adminKeys = {
  all: ["admin"] as const,
  dashboard: () => [...adminKeys.all, "dashboard"] as const,
  users: (search: string, page: number) =>
    [...adminKeys.all, "users", search, page] as const,
  user: (id: number) => [...adminKeys.all, "user", id] as const,
};

export async function getAdminDashboard() {
  const response = await apiClient.get<ApiResponse<AdminDashboardData>>(
    "/admin/dashboard",
  );
  return response.data;
}

export async function getAdminUsers(search: string, page: number) {
  const response = await apiClient.get<ApiResponse<PaginatedResponse<AdminUser>>>(
    "/admin/users",
    { params: { search: search || undefined, page, per_page: 20 } },
  );
  return response.data;
}

export async function getAdminUser(id: number) {
  const response = await apiClient.get<ApiResponse<AdminUser>>(`/admin/users/${id}`);
  return response.data;
}

export async function deleteAdminUser(id: number) {
  const response = await apiClient.delete<ApiResponse<null>>(`/admin/users/${id}`);
  return response.data;
}
