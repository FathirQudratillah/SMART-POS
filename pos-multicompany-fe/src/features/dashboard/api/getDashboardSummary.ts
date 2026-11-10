import { apiClient } from "@/lib/apiClient";
import type { DashboardResponse } from "../types";

export async function getDashboardSummary(
  companyId: number,
  branchId: number,
): Promise<DashboardResponse> {
  const response = await apiClient.get<DashboardResponse>(
    `/companies/${companyId}/dashboard`,
    { params: { branch_id: branchId } },
  );
  return response.data;
}
