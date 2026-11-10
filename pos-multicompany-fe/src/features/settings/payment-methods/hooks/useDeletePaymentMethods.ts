import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth/AuthContext";
import type { ApiErrorResponse } from "@/types";
import { deletePaymentMethods } from "../api/paymentMethods";
import type { PaymentMethodDeleteRequest } from "../types";

export function useDeletePaymentMethods() {
  const { company } = useAuth();
  const queryClient = useQueryClient();
  const companyId = company?.id;

  return useMutation<string, ApiErrorResponse, PaymentMethodDeleteRequest>({
    mutationFn: (payload) => {
      if (!companyId) {
        throw new Error("Select a company before deleting payment methods.");
      }
      return deletePaymentMethods(companyId, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["ManagePaymentMethods", companyId],
      });
      return queryClient.invalidateQueries({
        queryKey: ["PaymentMethods", companyId],
      });
    },
  });
}
