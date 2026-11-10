export type AlertVariant = "success" | "error" | "warning" | "info";

export type AlertMessageProps = {
  type: AlertVariant;
  title: string;
  description: string;
  onClose?: () => void;
};

export interface AlertMessageOptions {
  variant: AlertVariant;
  title: string;
  description?: string;
  confirmText?: string;
}

export interface AlertConfirmOptions {
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
}

export interface AlertState {
  mode: "message" | "confirm";
  variant: AlertVariant;
  title: string;
  description?: string;
  confirmText: string;
  cancelText: string;
}

export interface AlertContextType {
  showMessage: (options: AlertMessageOptions) => void;
  showConfirm: (options: AlertConfirmOptions) => Promise<boolean>;
}