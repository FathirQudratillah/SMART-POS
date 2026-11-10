import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth/AuthContext";
import type { ApiErrorResponse } from "@/types";
import type { WarehouseDeleteRequest } from "../types";
import { deleteWarehouses } from "../api/deleteWarehouses";

export function useDeleteWarehouses() {
  const { company } = useAuth();
  const queryClient = useQueryClient();
  const companyId = company?.id;

  return useMutation<string, ApiErrorResponse, WarehouseDeleteRequest>({
    mutationFn: (payload) => {
      if (!companyId) throw new Error("Select a company before deleting warehouses.");
      return deleteWarehouses(companyId, payload);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["Warehouses", companyId] }),
  });
}
