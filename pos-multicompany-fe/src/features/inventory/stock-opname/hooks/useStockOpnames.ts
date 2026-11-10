import { useQuery } from "@tanstack/react-query";
import type { CompanyResourceParams } from "@/types";
import { getStockOpnames } from "../api/stockOpnames";

export function useStockOpnames({ companyId, page, per_page, search }: CompanyResourceParams) {
  return useQuery({
    queryKey: ["StockOpnames", companyId, page, per_page, search],
    queryFn: () => getStockOpnames({ companyId: companyId!, page, per_page, search }),
    enabled: companyId !== null,
  });
}
