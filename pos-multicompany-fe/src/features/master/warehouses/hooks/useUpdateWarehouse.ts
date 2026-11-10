import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth/AuthContext";
import type { ApiErrorResponse } from "@/types";
import type { WarehouseUpdateRequest } from "../types";
import { updateWarehouse } from "../api/updateWarehouse";

export function useUpdateWarehouse(id: number) {
  const { company } = useAuth();
  const queryClient = useQueryClient();
  const companyId = company?.id;

  return useMutation<string, ApiErrorResponse, WarehouseUpdateRequest>({
    mutationFn: (payload) => {
      if (!companyId) throw new Error("Select a company before updating a warehouse.");
      return updateWarehouse(companyId, id, payload);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["Warehouses", companyId] }),
        queryClient.invalidateQueries({ queryKey: ["Warehouse", companyId, id] }),
      ]);
    },
  });
}
