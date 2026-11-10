import { useQuery } from "@tanstack/react-query";
import { getCompanyUser } from "../api/companyUsers";

export function useCompanyUser(companyId: number | null, userId: number | null) {
  return useQuery({
    queryKey: ["CompanyUser", companyId, userId],
    queryFn: () => getCompanyUser(companyId!, userId!),
    enabled: companyId !== null && userId !== null,
  });
}
