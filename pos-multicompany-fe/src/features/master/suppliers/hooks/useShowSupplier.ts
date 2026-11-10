import { useQuery } from "@tanstack/react-query";
import type { CompanyResourceParams } from "@/types";
import { showSupplier } from "../api/showSupplier";

export function useShowSupplier({ companyId, id }: CompanyResourceParams) {
  return useQuery({
    queryKey: ["Supplier", companyId, id],
    queryFn: () => showSupplier({ companyId: companyId!, id: id! }),
    enabled: companyId !== null && id !== undefined,
  });
}
