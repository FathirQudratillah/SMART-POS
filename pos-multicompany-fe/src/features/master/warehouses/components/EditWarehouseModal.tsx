import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { ModalProps } from "@/types";
import WarehouseEditForm from "./WarehouseEditForm";
import FormLogo from "@/components/ui/FormLogo";

export default function EditWarehouseModal({ open, onOpenChange, id }: ModalProps) {
  const [error, setErrorMessage] = useState("");
  const [branchOpen, setBranchOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto no-scrollbar bg-white p-0 sm:max-w-2xl" onScroll={() => setBranchOpen(false)}>
        <div className="p-6 sm:p-8">
          <DialogHeader className="mb-6">
            <FormLogo />
            <DialogTitle className="text-2xl font-bold tracking-tight">Edit Warehouse</DialogTitle>
            <DialogDescription className="text-gray-600">Update the warehouse information. Fill in the required details below and click "Save" to update the warehouse.</DialogDescription>
          </DialogHeader>
          {error && <div role="alert" className="mb-4 whitespace-pre-line rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>}
          {id !== undefined && <WarehouseEditForm onOpenChange={onOpenChange} setErrorMessage={setErrorMessage} branchOpen={branchOpen} setBranchOpen={setBranchOpen} id={id} />}
        </div>
      </DialogContent>
    </Dialog>
  );
}
