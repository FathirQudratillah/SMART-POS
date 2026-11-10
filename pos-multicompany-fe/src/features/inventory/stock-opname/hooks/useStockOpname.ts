import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/auth/AuthContext";
import { getStockOpname } from "../api/stockOpnames";

export function useStockOpname(id: number) {
  const { company } = useAuth();
  const companyId = company?.id ?? null;
  return useQuery({
    queryKey: ["StockOpname", companyId, id],
    queryFn: () => getStockOpname(companyId!, id),
    enabled: companyId !== null && Number.isInteger(id) && id > 0,
  });
}
