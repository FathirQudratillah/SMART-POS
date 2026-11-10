import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth/AuthContext";
import type { ApiErrorResponse } from "@/types";
import { createStockOpname } from "../api/stockOpnames";
import type { CreateStockOpnameRequest, StockOpnameResponse } from "../types";

export function useCreateStockOpname() {
  const { company } = useAuth();
  const queryClient = useQueryClient();
  const companyId = company?.id;
  return useMutation<StockOpnameResponse, ApiErrorResponse, CreateStockOpnameRequest>({
    mutationFn: (payload) => {
      if (!companyId) throw new Error("Select a company before creating an opname.");
      return createStockOpname(companyId, payload);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["StockOpnames", companyId] }),
  });
}
