import { useQuery } from "@tanstack/react-query";
import { getDashboardSummary } from "../api/getDashboardSummary";

export function useDashboardSummary(
  companyId: number | null,
  branchId: number | null,
) {
  return useQuery({
    queryKey: ["DashboardSummary", companyId, branchId],
    queryFn: () => getDashboardSummary(companyId!, branchId!),
    enabled: companyId !== null && branchId !== null,
  });
}
