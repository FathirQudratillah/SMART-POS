import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import { AlertMessage } from "@/components/ui/alert";
import type { AlertContextType, AlertState, AlertMessageOptions, AlertConfirmOptions } from "@/types/alert";

    

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export function AlertProvider({ children }: { children: ReactNode }) {
  const [alert, setAlert] = useState<AlertState | null>(null);

  const resolver = useRef<((confirmed: boolean) => void) | null>(null);

  const closeAlert = useCallback((confirmed: boolean) => {
    resolver.current?.(confirmed);
    resolver.current = null;
    setAlert(null);
  }, []);

  // Success, Error, Warning, Info
  const showMessage = useCallback((options: AlertMessageOptions) => {
    if (resolver.current) {
      resolver.current(false);
      resolver.current = null;
    }

    setAlert({
      mode: "message",
      variant: options.variant,
      title: options.title,
      description: options.description,
      confirmText: options.confirmText ?? "OK",
      cancelText: "",
    });
  }, []);

  // Confirmation
  const showConfirm = useCallback(
    (options: AlertConfirmOptions): Promise<boolean> => {
      if (resolver.current) {
        resolver.current(false);
      }

      setAlert({
        mode: "confirm",
        variant: "warning",
        title: options.title,
        description: options.description,
        confirmText: options.confirmText ?? "Confirm",
        cancelText: options.cancelText ?? "Cancel",
      });

      return new Promise((resolve) => {
        resolver.current = resolve;
      });
    },
    [],
  );

  const Icon =
    alert?.variant === "success"
      ? CheckCircle2
      : alert?.variant === "error"
        ? AlertCircle
        : alert?.variant === "warning"
          ? TriangleAlert
          : Info;

  const iconClass =
    alert?.variant === "success"
      ? "bg-green-100 text-green-600"
      : alert?.variant === "error"
        ? "bg-red-100 text-red-600"
        : alert?.variant === "warning"
          ? "bg-amber-100 text-amber-600"
          : "bg-blue-100 text-blue-600";

  const actionClass =
    alert?.variant === "error" || alert?.mode === "confirm"
      ? "bg-red-100 text-red-700 hover:bg-red-200"
      : "";

  return (
    <AlertContext.Provider value={{ showMessage, showConfirm }}>
      {children}

      {alert?.mode === "confirm" && (
        <AlertDialog
          open={!!alert}
          onOpenChange={(open) => {
            if (!open) closeAlert(false);
          }}
        >
          <AlertDialogContent className="bg-white ring-0 shadow-2xl">
            {alert && (
              <>
                <AlertDialogHeader>
                  <div
                    className={`mb-2 flex size-11 items-center justify-center rounded-full ${iconClass}`}
                  >
                    <Icon className="size-5" />
                  </div>

                  <AlertDialogTitle>{alert.title}</AlertDialogTitle>

                  {alert.description && (
                    <AlertDialogDescription>
                      {alert.description}
                    </AlertDialogDescription>
                  )}
                </AlertDialogHeader>

                <AlertDialogFooter>
                  {alert.mode === "confirm" && (
                    <AlertDialogCancel
                      variant="outline"
                      className="bg-red-100 text-red-700 hover:bg-red-200"
                      onClick={() => closeAlert(false)}
                    >
                      {alert.cancelText}
                    </AlertDialogCancel>
                  )}

                  <AlertDialogAction
                    className={actionClass}
                    onClick={() => closeAlert(true)}
                  >
                    {alert.confirmText}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </>
            )}
          </AlertDialogContent>
        </AlertDialog>
      )}
      {alert?.mode === "message" && (
        <AlertMessage
          type={alert?.variant ?? "info"}
          onClose={() => closeAlert(false)}
          title={alert?.title ?? ""}
          description={alert?.description ?? ""}
        />
      )}
    </AlertContext.Provider>
  );
}

// Custom Hook
export function useAlert() {
  const context = useContext(AlertContext);

  if (!context) {
    throw new Error("useAlert must be used within AlertProvider");
  }

  return context;
}
