import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth/AuthContext";
import type { ApiErrorResponse } from "@/types";
import type { WarehouseFormRequest } from "../types";
import { addWarehouse } from "../api/addWarehouse";

export function useAddWarehouse() {
  const { company } = useAuth();
  const queryClient = useQueryClient();
  const companyId = company?.id;

  return useMutation<string, ApiErrorResponse, WarehouseFormRequest>({
    mutationFn: (payload) => {
      if (!companyId) throw new Error("Select a company before creating a warehouse.");
      return addWarehouse(companyId, payload);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["Warehouses", companyId] }),
  });
}
