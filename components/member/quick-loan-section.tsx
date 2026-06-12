"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Zap, Clock, Percent, ArrowRight, CircleDollarSign } from "lucide-react";
import { motion } from "framer-motion";
import {
  formatNaira,
  formatDate,
  formatExpiry,
  expiryColorClass,
  getStatusColor,
} from "@/lib/loan-utils";
import { ApplyQuickLoanSheet } from "./apply-quick-loan-sheet";

interface QuickLoanSectionProps {
  userId: Id<"users">;
  hasActiveCoreAndQuick?: boolean;
}

export function QuickLoanSection({ userId, hasActiveCoreAndQuick }: QuickLoanSectionProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const loan = useQuery(api.quickLoans.getActiveQuickLoan, { userId });
  const rejectedLoan = useQuery(api.quickLoans.getLastRejectedQuickLoan, { userId });
  if (loan === undefined || rejectedLoan === undefined) {
    return (
      <div className="rounded-2xl border border-border/60 bg-card p-5 space-y-3 shadow-sm">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-2/3" />
      </div>
    );
  }

  const showApply = !loan;

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden"
      >
        {/* Top accent stripe */}
        <div className="h-1 w-full bg-linear-to-r from-green-400 via-emerald-500 to-green-600" />

        <div className="p-5">
          {/* Header */}
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-9 h-9 rounded-xl bg-linear-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-md shadow-green-500/25">
              <Zap className="w-4.5 h-4.5 text-white" fill="currentColor" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-base">Quick Loan</h3>
              <p className="text-xs text-muted-foreground">Fast, flexible financing</p>
            </div>
          </div>

          {!loan && rejectedLoan ? (
            <div className="space-y-3">
              {/* Rejected loan brief details */}
              <div className="flex items-center justify-between py-2 border-b border-border/40">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge className={getStatusColor(rejectedLoan.status)}>Rejected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Loan Amount</span>
                <span className="font-semibold text-sm">{formatNaira(rejectedLoan.amount)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Date Applied</span>
                <span className="font-semibold text-sm">{formatDate(rejectedLoan.dateApplied)}</span>
              </div>

              {/* Rejection notice */}
              <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 p-3 text-center space-y-1">
                <p className="text-xs text-red-700 dark:text-red-400 font-medium">
                  Your loan application was rejected.
                </p>
                <p className="text-xs text-red-600/80 dark:text-red-400/70">
                  Please contact Admin for details or apply again below.
                </p>
              </div>

              <Button
                className="w-full h-11 font-semibold rounded-xl bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/20 hover:shadow-green-500/35 transition-all duration-200 group"
                disabled={hasActiveCoreAndQuick}
                onClick={() => setSheetOpen(true)}
              >
                Apply Again
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </div>
          ) : showApply ? (
            <div className="space-y-4">
              {/* Feature pills */}
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col items-center gap-1 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-900/40 p-2.5">
                  <Percent className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                  <span className="text-xs font-semibold text-green-700 dark:text-green-400">5% interest</span>
                </div>
                <div className="flex flex-col items-center gap-1 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/40 p-2.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">6 months</span>
                </div>
                <div className="flex flex-col items-center gap-1 rounded-xl bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-900/40 p-2.5">
                  <CircleDollarSign className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                  <span className="text-xs font-semibold text-teal-700 dark:text-teal-400 text-center">₦10K - ₦150K</span>
                </div>
              </div>

              <Button
                className="w-full h-11 font-semibold rounded-xl bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/20 hover:shadow-green-500/35 transition-all duration-200 group"
                disabled={hasActiveCoreAndQuick}
                onClick={() => setSheetOpen(true)}
              >
                Apply for Quick Loan
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
              </Button>

              {hasActiveCoreAndQuick && (
                <p className="text-xs text-muted-foreground text-center">
                  Clear existing loan first to apply for another
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-border/40">
                <span className="text-sm text-muted-foreground">Status</span>
                <Badge className={getStatusColor(loan.status)}>
                  {loan.status === "awaiting-approval"
                    ? "Awaiting Approval"
                    : loan.status.charAt(0).toUpperCase() + loan.status.slice(1)}
                </Badge>
              </div>
              {[
                { label: "Loan Amount", value: formatNaira(loan.amount) },
                loan.totalRepayment ? { label: "Total Repayment", value: formatNaira(loan.totalRepayment) } : null,
                loan.expiryDate ? {
                  label: "Expiry Date",
                  value: formatExpiry(loan.expiryDate),
                  className: expiryColorClass(loan.expiryDate),
                } : null,
                loan.dateDisbursed ? { label: "Disbursed", value: formatDate(loan.dateDisbursed) } : null,
                { label: "Date Applied", value: formatDate(loan.dateApplied) },
              ].filter(Boolean).map((row, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">{row!.label}</span>
                  <span className={`font-semibold text-sm ${(row as { className?: string }).className ?? ""}`}>
                    {row!.value}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>

      <ApplyQuickLoanSheet open={sheetOpen} onOpenChange={setSheetOpen} userId={userId} />
    </>
  );
}
