import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/context/auth/AuthContext";
import type { ApiErrorResponse } from "@/types";
import { createPaymentMethod, updatePaymentMethod } from "../api/paymentMethods";
import type { PaymentMethodFormValues } from "../types";

type SavePaymentMethodVariables = {
  id?: number;
  payload: PaymentMethodFormValues;
};

export function useSavePaymentMethod() {
  const { company } = useAuth();
  const queryClient = useQueryClient();
  const companyId = company?.id;

  return useMutation<string, ApiErrorResponse, SavePaymentMethodVariables>({
    mutationFn: ({ id, payload }) => {
      if (!companyId) {
        throw new Error("Select a company before saving payment methods.");
      }
      return id === undefined
        ? createPaymentMethod(companyId, payload)
        : updatePaymentMethod(companyId, id, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ["ManagePaymentMethods", companyId],
      });
      void queryClient.invalidateQueries({ queryKey: ["PaymentMethods", companyId] });
    },
  });
}
