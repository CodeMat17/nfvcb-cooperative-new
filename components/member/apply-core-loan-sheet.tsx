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
import { Input } from "@/components/ui/input";
import { PinInput } from "@/components/pin-input";
import { Loader2, AlertCircle, CheckCircle2, ChevronLeft } from "lucide-react";
import { toast } from "sonner";
import { NIGERIAN_BANKS, formatNaira } from "@/lib/loan-utils";
import { format } from "date-fns";

interface ApplyCoreLoanSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: Id<"users">;
}

interface FormData {
  amountRequested: string;
  accountNumber: string;
  accountName: string;
  bank: string;
  existingLoan: string;
  guarantor1: { id: string; name: string; phone: string };
  guarantor2: { id: string; name: string; phone: string };
}

function GuarantorSearch({
  label,
  value,
  onSelect,
  excludeIds,
}: {
  label: string;
  value: { id: string; name: string; phone: string };
  onSelect: (v: { id: string; name: string; phone: string }) => void;
  excludeIds: string[];
}) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const allUsers = useQuery(api.users.getAllUsers);

  const filtered =
    query.length > 0
      ? (allUsers ?? []).filter(
          (u) =>
            u.name.toLowerCase().includes(query.toLowerCase()) &&
            !excludeIds.includes(u._id)
        )
      : [];

  return (
    <div className="space-y-2 relative">
      <Label>{label}</Label>
      {value.name ? (
        <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-3 py-2">
          <div>
            <p className="text-sm font-medium">{value.name}</p>
            <p className="text-xs text-muted-foreground">{value.phone}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              onSelect({ id: "", name: "", phone: "" });
              setQuery("");
            }}
          >
            Change
          </Button>
        </div>
      ) : (
        <div className="relative">
          <Input
            placeholder="Search by name…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
          />
          {open && filtered.length > 0 && (
            <div className="absolute z-50 w-full mt-1 rounded-lg border bg-popover shadow-lg overflow-hidden">
              {filtered.slice(0, 6).map((u) => (
                <button
                  key={u._id}
                  className="w-full text-left px-3 py-2 hover:bg-muted text-sm transition-colors"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    onSelect({ id: u._id, name: u.name, phone: u.phone ?? "" });
                    setQuery("");
                    setOpen(false);
                  }}
                >
                  <span className="font-medium">{u.name}</span>
                  <span className="text-muted-foreground ml-2 text-xs">
                    {u.phone}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ApplyCoreLoanSheet({
  open,
  onOpenChange,
  userId,
}: ApplyCoreLoanSheetProps) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>({
    amountRequested: "",
    accountNumber: "",
    accountName: "",
    bank: "",
    existingLoan: "None",
    guarantor1: { id: "", name: "", phone: "" },
    guarantor2: { id: "", name: "", phone: "" },
  });
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [loading, setLoading] = useState(false);

  const user = useQuery(api.users.getUserById, { userId });
  const applyLoan = useMutation(api.coreLoans.applyCoreLoan);

  const pinValid = user && pin.length === 6 && pin === user.pin;

  function updateForm<K extends keyof FormData>(key: K, value: FormData[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function canProceedStep1() {
    return (
      form.amountRequested &&
      Number(form.amountRequested) > 0 &&
      form.accountNumber &&
      form.accountName &&
      form.bank &&
      form.existingLoan
    );
  }

  function canProceedStep2() {
    return form.guarantor1.id && form.guarantor2.id;
  }

  async function handleSubmit() {
    if (!user || !pinValid) return;
    if (pin !== user.pin) {
      setPinError("Incorrect PIN");
      return;
    }
    setLoading(true);
    try {
      await applyLoan({
        userId,
        loanDate: new Date().toISOString(),
        mobileNumber: user.phone ?? "",
        amountRequested: Number(form.amountRequested),
        accountNumber: form.accountNumber,
        accountName: form.accountName,
        bank: form.bank,
        existingLoan: form.existingLoan,
        guarantor1Name: form.guarantor1.name,
        guarantor1Phone: form.guarantor1.phone,
        guarantor2Name: form.guarantor2.name,
        guarantor2Phone: form.guarantor2.phone,
      });
      toast.success("Core loan application submitted successfully!");
      onOpenChange(false);
      setStep(1);
      setForm({
        amountRequested: "",
        accountNumber: "",
        accountName: "",
        bank: "",
        existingLoan: "None",
        guarantor1: { id: "", name: "", phone: "" },
        guarantor2: { id: "", name: "", phone: "" },
      });
      setPin("");
      setPinError("");
    } catch {
      toast.error("Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="px-6 w-full sm:w-[600px] overflow-y-auto">
        <SheetHeader className="mb-2">
          <SheetTitle>Apply for Core Loan</SheetTitle>
        </SheetHeader>

        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-colors ${
                  s === step
                    ? "bg-green-600 text-white"
                    : s < step
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {s}
              </div>
              {s < 3 && (
                <div
                  className={`h-0.5 w-8 ${s < step ? "bg-green-500" : "bg-muted"}`}
                />
              )}
            </div>
          ))}
          <span className="ml-2 text-sm text-muted-foreground">
            Step {step} of 3
          </span>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Amount Requested (₦)</Label>
              <Input
                type="number"
                placeholder="e.g. 500000"
                value={form.amountRequested}
                onChange={(e) => updateForm("amountRequested", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Account Number</Label>
              <Input
                placeholder="10-digit account number"
                maxLength={10}
                value={form.accountNumber}
                onChange={(e) => updateForm("accountNumber", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Account Name</Label>
              <Input
                placeholder="Account name"
                value={form.accountName}
                onChange={(e) => updateForm("accountName", e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Bank</Label>
              <Select
                value={form.bank}
                onValueChange={(v) => updateForm("bank", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select bank" />
                </SelectTrigger>
                <SelectContent>
                  {NIGERIAN_BANKS.map((b) => (
                    <SelectItem key={b} value={b}>
                      {b}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Existing Loan</Label>
              <Select
                value={form.existingLoan}
                onValueChange={(v) => updateForm("existingLoan", v)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="None">None</SelectItem>
                  <SelectItem value="Yes">Yes – has existing loan</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              disabled={!canProceedStep1()}
              onClick={() => setStep(2)}
            >
              Next →
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <GuarantorSearch
              label="Guarantor 1"
              value={form.guarantor1}
              onSelect={(v) => updateForm("guarantor1", v)}
              excludeIds={[userId, form.guarantor2.id].filter(Boolean)}
            />
            <GuarantorSearch
              label="Guarantor 2"
              value={form.guarantor2}
              onSelect={(v) => updateForm("guarantor2", v)}
              excludeIds={[userId, form.guarantor1.id].filter(Boolean)}
            />
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep(1)}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                disabled={!canProceedStep2()}
                onClick={() => setStep(3)}
              >
                Next →
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-5">
            <div className="rounded-xl border bg-muted/30 p-4 space-y-2 text-sm">
              <p className="font-semibold text-base mb-3">Review Application</p>
              {[
                [
                  "Amount Requested",
                  formatNaira(Number(form.amountRequested)),
                ],
                ["Account Number", form.accountNumber],
                ["Account Name", form.accountName],
                ["Bank", form.bank],
                ["Existing Loan", form.existingLoan],
                ["Guarantor 1", `${form.guarantor1.name} (${form.guarantor1.phone})`],
                ["Guarantor 2", `${form.guarantor2.name} (${form.guarantor2.phone})`],
                ["Date", format(new Date(), "MMM dd, yyyy")],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between gap-3 min-w-0">
                  <span className="text-muted-foreground shrink-0">{label}</span>
                  <span className="font-medium text-right wrap-break-word min-w-0">{val}</span>
                </div>
              ))}
            </div>

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

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep(2)}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <Button
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                disabled={!pinValid || loading}
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
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
