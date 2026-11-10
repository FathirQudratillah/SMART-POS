import type { Dispatch, SetStateAction } from "react";

export * from "./menu";
export * from "./responses";
export * from "./alert";



export type CompanyResourceParams = {
  companyId: number | null;
  branchId?: number | null;
  warehouseId?: number | null;
  id?: number;
  page?: number;
  per_page?: number;
  search?: string;
};

export type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  id?: number;
};

export type FormProps = {
  onOpenChange: (open: boolean) => void;
  setErrorMessage: Dispatch<SetStateAction<string>>;
  id?: number;
};
