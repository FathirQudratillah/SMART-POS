import { useQuery } from "@tanstack/react-query";
import type { CompanyResourceParams } from "@/types";
import { showWarehouse } from "../api/showWarehouse";

export function useShowWarehouse({ companyId, id }: CompanyResourceParams) {
  return useQuery({
    queryKey: ["Warehouse", companyId, id],
    queryFn: () => showWarehouse({ companyId: companyId!, id: id! }),
    enabled: companyId !== null && id !== undefined,
  });
}
