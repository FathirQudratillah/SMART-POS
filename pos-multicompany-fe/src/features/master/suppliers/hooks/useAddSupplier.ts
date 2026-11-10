import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth/AuthContext";
import type { ApiErrorResponse } from "@/types";
import type { SupplierFormRequest } from "../types";
import { addSupplier } from "../api/addSupplier";

export function useAddSupplier() {
  const { company } = useAuth();
  const queryClient = useQueryClient();
  const companyId = company?.id;

  return useMutation<string, ApiErrorResponse, SupplierFormRequest>({
    mutationFn: (payload) => {
      if (!companyId) throw new Error("Select a company before creating a supplier.");
      return addSupplier(companyId, payload);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["Suppliers", companyId] }),
  });
}
