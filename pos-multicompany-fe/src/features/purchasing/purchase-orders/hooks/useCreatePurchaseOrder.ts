import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth/AuthContext";
import type { ApiErrorResponse } from "@/types";
import { createPurchaseOrder } from "../api/purchaseOrders";
import type { CreatePurchaseOrderRequest, PurchaseOrderResponse } from "../types";

export function useCreatePurchaseOrder() {
  const { company } = useAuth();
  const queryClient = useQueryClient();
  const companyId = company?.id;
  return useMutation<PurchaseOrderResponse, ApiErrorResponse, CreatePurchaseOrderRequest>({
    mutationFn: (payload) => {
      if (!companyId) throw new Error("Select a company before creating a purchase order.");
      return createPurchaseOrder(companyId, payload);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["PurchaseOrders", companyId] }),
  });
}
