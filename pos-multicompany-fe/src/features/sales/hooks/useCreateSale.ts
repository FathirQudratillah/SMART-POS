import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth/AuthContext";
import type { ApiErrorResponse } from "@/types";
import { createSale } from "../api/sales";
import type { CreateSaleRequest, SaleResponse } from "../types";

export function useCreateSale() {
  const { company, branch } = useAuth();
  const queryClient = useQueryClient();
  const companyId = company?.id;
  return useMutation<SaleResponse, ApiErrorResponse, CreateSaleRequest>({
    mutationFn: (payload) => {
      if (!companyId) throw new Error("Select a company before creating a sale.");
      return createSale(companyId, { ...payload, branch_id: branch?.id ?? payload.branch_id });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["Sales", companyId] }),
  });
}
