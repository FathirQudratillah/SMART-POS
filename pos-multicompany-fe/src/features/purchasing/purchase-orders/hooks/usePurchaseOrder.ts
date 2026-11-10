import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/auth/AuthContext";
import { getPurchaseOrder } from "../api/purchaseOrders";

export function usePurchaseOrder(id: number) {
  const { company } = useAuth();
  const companyId = company?.id ?? null;
  return useQuery({
    queryKey: ["PurchaseOrder", companyId, id],
    queryFn: () => getPurchaseOrder(companyId!, id),
    enabled: companyId !== null && Number.isInteger(id) && id > 0,
  });
}
