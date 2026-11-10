import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth/AuthContext";
import type { ApiErrorResponse } from "@/types";
import type { CustomerUpdateRequest } from "../types";
import { updateCustomer } from "../api/updateCustomer";

export function useUpdateCustomer(id: number) {
  const { company } = useAuth();
  const queryClient = useQueryClient();
  const companyId = company?.id;

  return useMutation<string, ApiErrorResponse, CustomerUpdateRequest>({
    mutationFn: (payload) => {
      if (!companyId) throw new Error("Select a company before updating a customer.");
      return updateCustomer(companyId, id, payload);
    },
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["Customers", companyId] }),
        queryClient.invalidateQueries({ queryKey: ["Customer", companyId, id] }),
      ]);
    },
  });
}
