import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/auth/AuthContext";
import { getStockTransfer } from "../api/getStockTransfer";

export function useStockTransfer(id: number) {
  const { company } = useAuth();
  const companyId = company?.id ?? null;

  return useQuery({
    queryKey: ["StockTransfer", companyId, id],
    queryFn: () => getStockTransfer(companyId!, id),
    enabled: companyId !== null && Number.isInteger(id) && id > 0,
  });
}
