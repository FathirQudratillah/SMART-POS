import { useState, type FormEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowDownToLine, ArrowUpFromLine, Banknote, LoaderCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAlert } from "@/context/AlertContext";
import { useAuth } from "@/context/auth/AuthContext";
import type { ApiErrorResponse } from "@/types";
import { formatCurrency } from "@/utils/currency";
import { getOpenCashierShift } from "@/features/sales/api/sales";
import { createCashMovement } from "../api/cashMovements";

type MovementType = "cash_in" | "cash_out";

type CashMovementEntryPageProps = {
  movementType: MovementType;
};

function getErrorMessage(error: unknown): string {
  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    return error.message;
  }
  return "The cash movement could not be recorded. Please try again.";
}

export default function CashMovementEntryPage({
  movementType,
}: CashMovementEntryPageProps) {
  const { company, branch } = useAuth();
  const { showMessage } = useAlert();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState("");
  const companyId = company?.id ?? null;
  const branchId = branch?.id ?? null;
  const isCashIn = movementType === "cash_in";
  const title = isCashIn ? "Cash In" : "Cash Out";
  const shiftQuery = useQuery({
    queryKey: ["OpenCashierShift", companyId, branchId],
    queryFn: () => getOpenCashierShift(companyId!, branchId!),
    enabled: companyId !== null && branchId !== null,
  });
  const shift = shiftQuery.data?.data ?? null;
  const movementMutation = useMutation<
    Awaited<ReturnType<typeof createCashMovement>>,
    ApiErrorResponse,
    { amount: number; description: string }
  >({
    mutationFn: ({ amount: value, description: detail }) => {
      if (companyId === null || branchId === null || shift === null) {
        throw new Error("An open cashier shift is required to record cash movement.");
      }
      return createCashMovement(companyId, {
        branch_id: branchId,
        cashier_shift_id: shift.id,
        movement_type: movementType,
        reference_type: "manual",
        amount: value,
        description: detail,
      });
    },
    onSuccess: () => {
      setAmount("");
      setDescription("");
      setFormError("");
      void queryClient.invalidateQueries({
        queryKey: ["OpenCashierShift", companyId, branchId],
      });
      void queryClient.invalidateQueries({ queryKey: ["CashMovements"] });
      showMessage({
        variant: "success",
        title: `${title} recorded`,
        description: "Cash movement has been added to the current shift.",
      });
    },
    onError: (error) => setFormError(getErrorMessage(error)),
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");
    const parsedAmount = Number(amount);
    if (
      !/^\d+(?:\.\d{1,2})?$/.test(amount) ||
      !Number.isFinite(parsedAmount) ||
      parsedAmount <= 0
    ) {
      setFormError("Enter an amount greater than zero with up to 2 decimal places.");
      return;
    }
    if (!description.trim()) {
      setFormError("Enter a description for the cash movement.");
      return;
    }
    if (!shift || !branchId) {
      setFormError("Open a cashier shift in Point Of Sale before recording cash movement.");
      return;
    }
    if (!isCashIn && parsedAmount > Number(shift.expected_cash ?? shift.opening_cash)) {
      setFormError("Cash out cannot exceed the expected cash balance.");
      return;
    }
    movementMutation.mutate({
      amount: parsedAmount,
      description: description.trim(),
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-100">
          {title}
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Record a manual cash movement for the active cashier shift.
        </p>
      </div>

      <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        {branchId === null && (
          <p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
            Your account must be assigned to a branch to record cash movement.
          </p>
        )}
        {shiftQuery.isLoading && (
          <p role="status" className="text-sm text-slate-500">
            Checking the active cashier shift...
          </p>
        )}
        {shiftQuery.isError && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            Unable to check cashier shift: {shiftQuery.error.message}
          </p>
        )}
        {shift && (
          <div className="flex items-center justify-between gap-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                <Banknote className="size-5" />
              </span>
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  Expected cash balance
                </p>
                <p className="text-xs text-slate-500">Active cashier shift</p>
              </div>
            </div>
            <p className="text-lg font-semibold tabular-nums text-slate-900 dark:text-slate-100">
              {formatCurrency(Number(shift.expected_cash ?? shift.opening_cash))}
            </p>
          </div>
        )}
        {!shiftQuery.isLoading && !shiftQuery.isError && !shift && branchId !== null && (
          <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-800">
            No cashier shift is open for this branch. Open a shift in{" "}
            <Link to="/pos" className="font-semibold underline">
              Point Of Sale
            </Link>{" "}
            before recording cash movement.
          </div>
        )}

        <form className="space-y-4" onSubmit={submit}>
          <div className="space-y-2">
            <Label htmlFor="cash-movement-amount">Amount</Label>
            <Input
              id="cash-movement-amount"
              type="number"
              min="0.01"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0.00"
              disabled={!shift || movementMutation.isPending}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="cash-movement-description">Description</Label>
            <Input
              id="cash-movement-description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Reason for this cash movement"
              disabled={!shift || movementMutation.isPending}
              required
            />
          </div>
          {formError && (
            <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              {formError}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              to="/cash-movements"
              className={buttonVariants({ variant: "outline" })}
            >
              View movement history
            </Link>
            <Button
              type="submit"
              variant="outline"
              disabled={!shift || movementMutation.isPending}
              className="bg-blue-100 text-blue-700 hover:bg-blue-200"
            >
              {movementMutation.isPending ? (
                <LoaderCircle className="size-4 animate-spin" />
              ) : isCashIn ? (
                <ArrowDownToLine className="size-4" />
              ) : (
                <ArrowUpFromLine className="size-4" />
              )}
              Record {title.toLowerCase()}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}
