import { useQuery } from "@tanstack/react-query";
import type { CompanyResourceParams } from "@/types";
import { getGoodsReceipts } from "../api/goodsReceipts";

export function useGoodsReceipts({
  companyId,
  branchId,
  page,
  per_page,
  search,
}: CompanyResourceParams) {
  return useQuery({
    queryKey: ["GoodsReceipts", companyId, branchId, page, per_page, search],
    queryFn: () =>
      getGoodsReceipts({ companyId: companyId!, branchId, page, per_page, search }),
    enabled: companyId !== null,
  });
}
