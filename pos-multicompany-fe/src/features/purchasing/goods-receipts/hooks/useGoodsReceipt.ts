import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/auth/AuthContext";
import { getGoodsReceipt } from "../api/goodsReceipts";

export function useGoodsReceipt(id: number) {
  const { company } = useAuth();
  const companyId = company?.id ?? null;
  return useQuery({
    queryKey: ["GoodsReceipt", companyId, id],
    queryFn: () => getGoodsReceipt(companyId!, id),
    enabled: companyId !== null && Number.isInteger(id) && id > 0,
  });
}
