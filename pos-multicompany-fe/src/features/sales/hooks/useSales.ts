import { useQuery } from "@tanstack/react-query";
import type { CompanyResourceParams } from "@/types";
import { getSales } from "../api/sales";

export function useSales(params: CompanyResourceParams) {
  return useQuery({
    queryKey: ["Sales", params.companyId, params.branchId, params.page, params.per_page, params.search],
    queryFn: () => getSales({ ...params, companyId: params.companyId! }),
    enabled: params.companyId !== null,
  });
}
