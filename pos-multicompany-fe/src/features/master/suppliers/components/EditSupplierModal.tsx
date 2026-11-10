import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { ModalProps } from "@/types";
import SupplierEditForm from "./SupplierEditForm";
import FormLogo from "@/components/ui/FormLogo";

export default function EditSupplierModal({ open, onOpenChange, id }: ModalProps) {
  const [error, setErrorMessage] = useState("");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto no-scrollbar bg-white p-0 sm:max-w-2xl">
        <div className="p-6 sm:p-8">
          <DialogHeader className="mb-6">
            <FormLogo />
            <DialogTitle className="text-2xl font-bold tracking-tight">Edit Supplier</DialogTitle>
            <DialogDescription className="text-gray-600">Update the supplier information. Fill in the required details below and click "Save" to update the supplier.</DialogDescription>
          </DialogHeader>
          {error && <div role="alert" className="mb-4 whitespace-pre-line rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          {id !== undefined && <SupplierEditForm onOpenChange={onOpenChange} setErrorMessage={setErrorMessage} id={id} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
