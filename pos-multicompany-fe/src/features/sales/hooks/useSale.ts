import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/auth/AuthContext";
import { getSale } from "../api/sales";

export function useSale(id: number) {
  const { company } = useAuth();
  const companyId = company?.id ?? null;
  return useQuery({
    queryKey: ["Sale", companyId, id],
    queryFn: () => getSale(companyId!, id),
    enabled: companyId !== null && Number.isInteger(id) && id > 0,
  });
}
