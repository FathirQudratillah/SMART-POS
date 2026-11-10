import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/auth/AuthContext";
import { getStockAdjustment } from "../api/stockAdjustments";

export function useStockAdjustment(id: number) {
  const { company } = useAuth();
  const companyId = company?.id ?? null;
  return useQuery({
    queryKey: ["StockAdjustment", companyId, id],
    queryFn: () => getStockAdjustment(companyId!, id),
    enabled: companyId !== null && Number.isInteger(id) && id > 0,
  });
}
