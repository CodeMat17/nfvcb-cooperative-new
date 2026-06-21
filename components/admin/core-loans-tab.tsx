"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id, Doc } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  formatNaira,
  formatDate,
  getStatusColor,
  formatExpiry,
  expiryColorClass,
} from "@/lib/loan-utils";
import { toast } from "sonner";
import { generateCoreLoanPDF } from "./core-loan-pdf";
import {
  Search,
  CheckCircle,
  XCircle,
  BadgeCheck,
  Download,
  Loader2,
} from "lucide-react";

interface CoreLoansTabProps {
  adminName: string;
}

export function CoreLoansTab({ adminName }: CoreLoansTabProps) {
  const [search, setSearch] = useState("");
  const [rejectTarget, setRejectTarget] = useState<Id<"coreLoans"> | null>(
    null
  );
  const [clearTarget, setClearTarget] = useState<Id<"coreLoans"> | null>(null);
  const [approveTarget, setApproveTarget] = useState<Doc<"coreLoans"> | null>(
    null
  );
  const [approveForm, setApproveForm] = useState({
    amount: "",
    rate: "10",
  });
  const [loading, setLoading] = useState(false);

  const loans = useQuery(api.coreLoans.getAllCoreLoans);
  const users = useQuery(api.users.getAllUsers);
  const approve = useMutation(api.coreLoans.approveCoreLoan);
  const reject = useMutation(api.coreLoans.rejectCoreLoan);
  const clear = useMutation(api.coreLoans.clearCoreLoan);

  const usersMap = Object.fromEntries(
    (users ?? []).map((u) => [u._id, u])
  );

  const filtered = (loans ?? [])
    .filter((l) => {
      const name = usersMap[l.userId]?.name ?? "";
      return name.toLowerCase().includes(search.toLowerCase());
    })
    .sort(
      (a, b) =>
        new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime()
    );

  async function handleApprove() {
    if (!approveTarget) return;
    setLoading(true);
    try {
      await approve({
        loanId: approveTarget._id,
        amountApproved: Number(approveForm.amount),
        interestRate: Number(approveForm.rate),
        adminName,
      });
      toast.success("Core loan approved.");
      setApproveTarget(null);
    } catch {
      toast.error("Failed to approve.");
    } finally {
      setLoading(false);
    }
  }

  async function handleReject() {
    if (!rejectTarget) return;
    setLoading(true);
    try {
      await reject({ loanId: rejectTarget, adminName });
      toast.success("Loan rejected.");
      setRejectTarget(null);
    } catch {
      toast.error("Failed to reject.");
    } finally {
      setLoading(false);
    }
  }

  async function handleClear() {
    if (!clearTarget) return;
    setLoading(true);
    try {
      await clear({ loanId: clearTarget, adminName });
      toast.success("Loan marked as repaid.");
      setClearTarget(null);
    } catch {
      toast.error("Failed to clear.");
    } finally {
      setLoading(false);
    }
  }

  function downloadPDF(loan: Doc<"coreLoans">) {
    const user = usersMap[loan.userId];
    generateCoreLoanPDF(loan, user);
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Search by member name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loans === undefined || users === undefined ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground text-sm">
          No core loans found
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((loan) => (
            <div
              key={loan._id}
              className="rounded-xl border bg-card p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold leading-tight">
                  {usersMap[loan.userId]?.name ?? "Unknown"}
                </p>
                <Badge className={getStatusColor(loan.status)}>
                  {loan.status}
                </Badge>
              </div>
              <div className="text-sm flex flex-wrap gap-x-4 gap-y-1">
                <span>
                  <span className="text-muted-foreground">Requested: </span>
                  {formatNaira(loan.amountRequested)}
                </span>
                <span>
                  <span className="text-muted-foreground">Approved: </span>
                  {loan.amountApproved && loan.amountApproved > 0
                    ? formatNaira(loan.amountApproved)
                    : "—"}
                </span>
                <span>
                  <span className="text-muted-foreground">Applied: </span>
                  {formatDate(loan.dateApplied)}
                </span>
                {loan.expiryDate && (
                  <span className={expiryColorClass(loan.expiryDate)}>
                    <span className="text-muted-foreground">Expiry: </span>
                    {formatExpiry(loan.expiryDate)}
                  </span>
                )}
                {loan.approvedByAdmin && (
                  <span>
                    <span className="text-muted-foreground">Approved by: </span>
                    {loan.approvedByAdmin}
                  </span>
                )}
                {loan.rejectedByAdmin && (
                  <span>
                    <span className="text-muted-foreground">Rejected by: </span>
                    {loan.rejectedByAdmin}
                  </span>
                )}
                {loan.clearedByAdmin && (
                  <span>
                    <span className="text-muted-foreground">Cleared by: </span>
                    {loan.clearedByAdmin}
                  </span>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                {loan.status === "awaiting-approval" && (
                  <>
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white flex-1 sm:flex-none"
                      onClick={() => {
                        setApproveTarget(loan);
                        setApproveForm({
                          amount: loan.amountRequested.toString(),
                          rate: "10",
                        });
                      }}
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1 sm:flex-none"
                      onClick={() => setRejectTarget(loan._id)}
                    >
                      <XCircle className="w-3 h-3 mr-1" />
                      Reject
                    </Button>
                  </>
                )}
                {loan.status === "approved" && (
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white flex-1 sm:flex-none"
                    onClick={() => setClearTarget(loan._id)}
                  >
                    <BadgeCheck className="w-3 h-3 mr-1" />
                    Mark Repaid
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1 sm:flex-none"
                  onClick={() => downloadPDF(loan)}
                >
                  <Download className="w-3 h-3 mr-1" />
                  PDF
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Approve Dialog */}
      <Dialog
        open={!!approveTarget}
        onOpenChange={() => setApproveTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Approve Core Loan —{" "}
              {approveTarget
                ? usersMap[approveTarget.userId]?.name
                : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Amount Approved (₦)</Label>
              <Input
                type="number"
                value={approveForm.amount}
                onChange={(e) =>
                  setApproveForm((f) => ({ ...f, amount: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Interest Rate</Label>
              <Select
                value={approveForm.rate}
                onValueChange={(v) =>
                  setApproveForm((f) => ({ ...f, rate: v }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="8">8%</SelectItem>
                  <SelectItem value="10">10%</SelectItem>
                  <SelectItem value="22">22%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveTarget(null)}>
              Cancel
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={handleApprove}
              disabled={loading || !approveForm.amount}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Approve"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Confirm */}
      <AlertDialog
        open={!!rejectTarget}
        onOpenChange={() => setRejectTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Core Loan?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will reject the loan application.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleReject}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Reject"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Repaid Confirm */}
      <AlertDialog
        open={!!clearTarget}
        onOpenChange={() => setClearTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark as Repaid?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the core loan as fully repaid. The member will be
              able to apply for a new loan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-emerald-600 hover:bg-emerald-700"
              onClick={handleClear}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Confirm"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
