import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth/AuthContext";
import type { ApiErrorResponse } from "@/types";
import type { CustomerFormRequest } from "../types";
import { addCustomer } from "../api/addCustomer";

export function useAddCustomer() {
  const { company } = useAuth();
  const queryClient = useQueryClient();
  const companyId = company?.id;

  return useMutation<string, ApiErrorResponse, CustomerFormRequest>({
    mutationFn: (payload) => {
      if (!companyId) throw new Error("Select a company before creating a customer.");
      return addCustomer(companyId, payload);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["Customers", companyId] }),
  });
}
