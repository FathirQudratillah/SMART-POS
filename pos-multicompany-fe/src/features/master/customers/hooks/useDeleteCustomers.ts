import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth/AuthContext";
import type { ApiErrorResponse } from "@/types";
import type { CustomerDeleteRequest } from "../types";
import { deleteCustomers } from "../api/deleteCustomers";

export function useDeleteCustomers() {
  const { company } = useAuth();
  const queryClient = useQueryClient();
  const companyId = company?.id;

  return useMutation<string, ApiErrorResponse, CustomerDeleteRequest>({
    mutationFn: (payload) => {
      if (!companyId)
        throw new Error("Select a company before deleting customers.");
      return deleteCustomers(companyId, payload);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["Customers", companyId] }),
  });
}
