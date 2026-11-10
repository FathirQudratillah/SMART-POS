import { useQuery } from "@tanstack/react-query";
import type { CompanyResourceParams } from "@/types";
import { getStockAdjustments } from "../api/stockAdjustments";

export function useStockAdjustments({ companyId, page, per_page, search }: CompanyResourceParams) {
  return useQuery({
    queryKey: ["StockAdjustments", companyId, page, per_page, search],
    queryFn: () => getStockAdjustments({ companyId: companyId!, page, per_page, search }),
    enabled: companyId !== null,
  });
}
