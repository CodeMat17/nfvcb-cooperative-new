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
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b">
                  {[
                    "Member",
                    "Amount",
                    "Applied",
                    "Approved",
                    "Expiry",
                    "Disbursed",
                    "Status",
                    "Actions",
                  ].map((h) => (
                    <th
                      key={h}
                      className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No quick loans found
                    </td>
                  </tr>
                ) : (
                  filtered.map((loan) => (
                    <tr
                      key={loan._id}
                      className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium whitespace-nowrap">
                        {usersMap[loan.userId] ?? "Unknown"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {formatNaira(loan.amount)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {formatDate(loan.dateApplied)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {formatDate(loan.dateApproved)}
                      </td>
                      <td
                        className={`px-4 py-3 whitespace-nowrap text-sm ${expiryColorClass(loan.expiryDate)}`}
                      >
                        {formatExpiry(loan.expiryDate)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {formatDate(loan.dateDisbursed)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={getStatusColor(loan.status)}>
                          {loan.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1.5">
                          {loan.status === "awaiting-approval" && (
                            <>
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white h-7 text-xs"
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
                                className="h-7 text-xs"
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
                              className="bg-emerald-600 hover:bg-emerald-700 text-white h-7 text-xs"
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
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
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
