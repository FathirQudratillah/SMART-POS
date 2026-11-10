import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth/AuthContext";
import type { ApiErrorResponse } from "@/types";
import type { SupplierDeleteRequest } from "../types";
import { deleteSuppliers } from "../api/deleteSuppliers";

export function useDeleteSuppliers() {
  const { company } = useAuth();
  const queryClient = useQueryClient();
  const companyId = company?.id;

  return useMutation<string, ApiErrorResponse, SupplierDeleteRequest>({
    mutationFn: (payload) => {
      if (!companyId) throw new Error("Select a company before deleting suppliers.");
      return deleteSuppliers(companyId, payload);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["Suppliers", companyId] }),
  });
}
