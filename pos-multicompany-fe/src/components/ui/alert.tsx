import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"
import { CheckCircle2, X, CircleAlert, CircleX, Info } from "lucide-react";
import type { AlertMessageProps } from "@/types";
import { AnimatePresence, motion } from "motion/react";



const alertVariants = cva(
  "group/alert relative grid w-full gap-0.5 rounded-lg border px-4 py-3 text-left text-sm has-data-[slot=alert-action]:relative has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2.5 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-current *:[svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground",
        destructive:
          "bg-card text-destructive *:data-[slot=alert-description]:text-destructive/90 *:[svg]:text-current",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "font-medium group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-sm text-balance text-muted-foreground md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
        className
      )}
      {...props}
    />
  )
}

function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn("absolute top-2.5 right-3", className)}
      {...props}
    />
  )
}


const alertStyles = {
  success: {
    icon: CheckCircle2,
    border: "border-green-200",
    iconBg: "bg-green-100",
    iconColor: "text-green-600",
    shadow: "shadow-green-900/10",
    progressBg: "bg-green-100",
    progress: "bg-green-500",
  },
  warning: {
    icon: CircleAlert,
    border: "border-yellow-200",
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-600",
    shadow: "shadow-yellow-900/10",
    progressBg: "bg-yellow-100",
    progress: "bg-yellow-500",
  },
  error: {
    icon: CircleX,
    border: "border-red-200",
    iconBg: "bg-red-100",
    iconColor: "text-red-600",
    shadow: "shadow-red-900/10",
    progressBg: "bg-red-100",
    progress: "bg-red-500",
  },
  info: {
    icon: Info,
    border: "border-blue-200",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
    shadow: "shadow-blue-900/10",
    progressBg: "bg-blue-100",
    progress: "bg-blue-500",
  },
};

function AlertMessage({
  type,
  title,
  description,
  onClose,
}: AlertMessageProps) {
  const styles = alertStyles[type];
  const Icon = styles.icon;

  setTimeout(() => { onClose && onClose(); }, 5000);

  return (
    <motion.div
      initial={{ opacity: 0, x: 40, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.95 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="fixed top-5 right-5 z-61 w-[calc(100%-2rem)] max-w-md"
    >
      <Alert
        className={`rounded-xl border ${styles.border} bg-white p-4 text-gray-800 shadow-xl ${styles.shadow}`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`flex size-11 shrink-0 items-center justify-center rounded-full ${styles.iconBg}`}
          >
            <Icon className={`size-6 ${styles.iconColor}`} />
          </div>

          <div className="flex-1 space-y-1">
            <AlertTitle className="text-sm font-semibold text-gray-900">
              {title}
            </AlertTitle>

            <AlertDescription className="text-sm leading-relaxed text-gray-500">
              {description}
            </AlertDescription>
          </div>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label="Close notification"
              className="rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            >
              <X className="size-4" />
            </button>
          )}
        </div>

        <div
          className={`mt-4 h-1 overflow-hidden rounded-full ${styles.progressBg}`}
        >
          <div className={`h-full w-full rounded-full ${styles.progress}`} />
        </div>
      </Alert>
    </motion.div>
  );
}

export { Alert, AlertTitle, AlertDescription, AlertAction, AlertMessage }
