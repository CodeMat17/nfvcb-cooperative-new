"use client";

import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { PinInput } from "@/components/pin-input";
import { Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { QUICK_LOAN_AMOUNTS, calcQuickLoan, formatNaira } from "@/lib/loan-utils";

interface ApplyQuickLoanSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: Id<"users">;
}

export function ApplyQuickLoanSheet({
  open,
  onOpenChange,
  userId,
}: ApplyQuickLoanSheetProps) {
  const [amount, setAmount] = useState<number | null>(null);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [loading, setLoading] = useState(false);

  const user = useQuery(api.users.getUserById, { userId });
  const applyLoan = useMutation(api.quickLoans.applyQuickLoan);

  const summary = amount ? calcQuickLoan(amount) : null;
  const pinValid = user && pin.length === 6 && pin === user.pin;

  async function handleSubmit() {
    if (!amount || !user) return;
    if (pin !== user.pin) {
      setPinError("Incorrect PIN");
      return;
    }
    setLoading(true);
    try {
      await applyLoan({ userId, amount });
      toast.success("Loan application submitted!", {
        description: "Your quick loan request has been received. The admin will review and consider your application.",
        duration: 6000,
      });
      onOpenChange(false);
      setAmount(null);
      setPin("");
      setPinError("");
    } catch {
      toast.error("Failed to submit application. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:w-[500px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Apply for Quick Loan</SheetTitle>
        </SheetHeader>

        <div className="px-6 pb-8 space-y-6">
          <div className="rounded-xl border border-amber-200 bg-amber-50 dark:bg-amber-950/20 dark:border-amber-800 p-4 space-y-2">
            <p className="text-sm font-semibold text-amber-800 dark:text-amber-400 mb-1">
              Terms & Conditions
            </p>
            {[
              "5% interest rate on the principal amount",
              "Repayment period: 6 months from disbursement",
              "Defaulting will result in blacklisting from future loans",
            ].map((t) => (
              <div key={t} className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-300">
                <span className="mt-0.5 text-amber-500">•</span>
                {t}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <Label>Select Loan Amount</Label>
            <Select
              onValueChange={(v) => setAmount(Number(v))}
              value={amount?.toString() ?? ""}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose an amount" />
              </SelectTrigger>
              <SelectContent>
                {QUICK_LOAN_AMOUNTS.map((a) => (
                  <SelectItem key={a} value={a.toString()}>
                    {formatNaira(a)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {summary && (
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 dark:bg-amber-950/10 dark:border-amber-900 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Principal</span>
                <span className="font-medium">{formatNaira(summary.principal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Interest (5%)</span>
                <span className="font-medium text-amber-600 dark:text-amber-400">
                  {formatNaira(summary.interest)}
                </span>
              </div>
              <div className="h-px bg-amber-200 dark:bg-amber-800" />
              <div className="flex justify-between text-sm font-semibold">
                <span>Total Repayment</span>
                <span>{formatNaira(summary.totalRepayment)}</span>
              </div>
            </div>
          )}

          <div className="space-y-3">
            <Label>Confirm your PIN</Label>
            <PinInput
              value={pin}
              onChange={(v) => {
                setPin(v);
                setPinError("");
              }}
              hasError={!!pinError}
              disabled={loading}
            />
            {pinError && (
              <div className="flex items-center gap-2 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {pinError}
              </div>
            )}
            {pinValid && (
              <div className="flex items-center gap-2 text-green-600 text-sm">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                PIN confirmed
              </div>
            )}
          </div>

          <Button
            className="w-full bg-green-600 hover:bg-green-700 text-white h-11"
            disabled={!amount || !pinValid || loading}
            onClick={handleSubmit}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting…
              </>
            ) : (
              "Submit Application"
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
