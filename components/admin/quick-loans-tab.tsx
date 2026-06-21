"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  formatNaira,
  formatDate,
  getStatusColor,
  formatExpiry,
  expiryColorClass,
} from "@/lib/loan-utils";
import { toast } from "sonner";
import { Search, CheckCircle, XCircle, BadgeCheck, Loader2 } from "lucide-react";

interface Action {
  type: "approve" | "reject" | "repaid";
  loanId: Id<"quickLoans">;
  label: string;
}

interface QuickLoansTabProps {
  adminName: string;
}

export function QuickLoansTab({ adminName }: QuickLoansTabProps) {
  const [search, setSearch] = useState("");
  const [action, setAction] = useState<Action | null>(null);
  const [loading, setLoading] = useState(false);

  const loans = useQuery(api.quickLoans.getAllQuickLoans);
  const users = useQuery(api.users.getAllUsers);
  const approve = useMutation(api.quickLoans.approveQuickLoan);
  const reject = useMutation(api.quickLoans.rejectQuickLoan);
  const clear = useMutation(api.quickLoans.clearQuickLoan);

  const usersMap = Object.fromEntries(
    (users ?? []).map((u) => [u._id, u.name])
  );

  const filtered = (loans ?? [])
    .filter((l) => {
      const name = usersMap[l.userId] ?? "";
      return name.toLowerCase().includes(search.toLowerCase());
    })
    .sort(
      (a, b) =>
        new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime()
    );

  async function handleConfirm() {
    if (!action) return;
    setLoading(true);
    try {
      if (action.type === "approve")
        await approve({ loanId: action.loanId, adminName });
      else if (action.type === "reject")
        await reject({ loanId: action.loanId, adminName });
      else await clear({ loanId: action.loanId, adminName });
      toast.success(
        action.type === "repaid"
          ? "Loan marked as repaid successfully."
          : `Loan ${action.type}d successfully.`
      );
      setAction(null);
    } catch {
      toast.error("Action failed. Please try again.");
    } finally {
      setLoading(false);
    }
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
          No quick loans found
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
                  {usersMap[loan.userId] ?? "Unknown"}
                </p>
                <Badge className={getStatusColor(loan.status)}>
                  {loan.status}
                </Badge>
              </div>
              <div className="text-sm flex flex-wrap gap-x-4 gap-y-1">
                <span>
                  <span className="text-muted-foreground">Amount: </span>
                  {formatNaira(loan.amount)}
                </span>
                <span>
                  <span className="text-muted-foreground">Applied: </span>
                  {formatDate(loan.dateApplied)}
                </span>
                {loan.dateApproved && (
                  <span>
                    <span className="text-muted-foreground">Approved: </span>
                    {formatDate(loan.dateApproved)}
                  </span>
                )}
                {loan.dateDisbursed && (
                  <span>
                    <span className="text-muted-foreground">Disbursed: </span>
                    {formatDate(loan.dateDisbursed)}
                  </span>
                )}
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
                      onClick={() =>
                        setAction({
                          type: "approve",
                          loanId: loan._id,
                          label: `Approve ₦${loan.amount.toLocaleString()} quick loan for ${usersMap[loan.userId]}?`,
                        })
                      }
                    >
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      className="flex-1 sm:flex-none"
                      onClick={() =>
                        setAction({
                          type: "reject",
                          loanId: loan._id,
                          label: `Reject quick loan for ${usersMap[loan.userId]}?`,
                        })
                      }
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
                    onClick={() =>
                      setAction({
                        type: "repaid",
                        loanId: loan._id,
                        label: `Mark loan for ${usersMap[loan.userId]} as repaid?`,
                      })
                    }
                  >
                    <BadgeCheck className="w-3 h-3 mr-1" />
                    Mark Repaid
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!action} onOpenChange={() => setAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Action</AlertDialogTitle>
            <AlertDialogDescription>{action?.label}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirm}
              disabled={loading}
              className={
                action?.type === "reject"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-green-600 hover:bg-green-700"
              }
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
