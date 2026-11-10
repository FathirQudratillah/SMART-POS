import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth/AuthContext";
import type { ApiErrorResponse } from "@/types";
import type { SupplierUpdateRequest } from "../types";
import { updateSupplier } from "../api/updateSupplier";

export function useUpdateSupplier(id: number) {
  const { company } = useAuth();
  const queryClient = useQueryClient();
  const companyId = company?.id;

  return useMutation<string, ApiErrorResponse, SupplierUpdateRequest>({
    mutationFn: (payload) => {
      if (!companyId) throw new Error("Select a company before updating a supplier.");
      return updateSupplier(companyId, id, payload);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["Suppliers", companyId] }),
        queryClient.invalidateQueries({ queryKey: ["Supplier", companyId, id] }),
      ]);
    },
  });
}
