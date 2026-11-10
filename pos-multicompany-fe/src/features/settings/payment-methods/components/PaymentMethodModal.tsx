import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import FormLogo from "@/components/ui/FormLogo";
import PaymentMethodForm from "./PaymentMethodForm";
import type { PaymentMethod } from "../types";

type PaymentMethodModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record: PaymentMethod | null;
};

export default function PaymentMethodModal({
  open,
  onOpenChange,
  record,
}: PaymentMethodModalProps) {
  const [error, setErrorMessage] = useState("");
  const isEditing = record !== null;

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) setErrorMessage("");
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto bg-white p-0 sm:max-w-2xl">
        <div className="p-6 sm:p-8">
          <DialogHeader className="mb-6">
            <FormLogo />
            <DialogTitle className="text-2xl font-bold tracking-tight">
              {isEditing ? "Edit Payment Method" : "Add Payment Method"}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {isEditing
                ? "Update the payment method details and save your changes."
                : "Fill in the details below to add a payment method."}
            </DialogDescription>
          </DialogHeader>
          {error && (
            <div
              role="alert"
              className="mb-4 whitespace-pre-line rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </div>
          )}
          <PaymentMethodForm
            record={record}
            onClose={() => onOpenChange(false)}
            setErrorMessage={setErrorMessage}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
