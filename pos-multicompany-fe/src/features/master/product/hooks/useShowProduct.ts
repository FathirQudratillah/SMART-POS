import { useQuery } from "@tanstack/react-query";
import type { CompanyResourceParams } from "@/types";
import { showProduct } from "../api/showProduct";

export function useShowProduct({
  companyId,
  id
}: CompanyResourceParams) {
  return useQuery({
    queryKey: ["Product", companyId, id],
    queryFn: () =>
      showProduct({
        companyId: companyId!,
        id: id!,
      }),
    enabled: companyId !== null,
  });
}
