"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2, Clock, Percent, ArrowRight, CircleDollarSign, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import {
  formatNaira,
  formatDate,
  formatExpiry,
  expiryColorClass,
  getStatusColor,
} from "@/lib/loan-utils";
import { ApplyCoreLoanSheet } from "./apply-core-loan-sheet";

interface CoreLoanSectionProps {
  userId: Id<"users">;
  hasActiveCoreAndQuick?: boolean;
}

export function CoreLoanSection({ userId, hasActiveCoreAndQuick }: CoreLoanSectionProps) {
  const [sheetOpen, setSheetOpen] = useState(false);
  const loan = useQuery(api.coreLoans.getActiveCoreLoan, { userId });
  const repaidLoan = useQuery(api.coreLoans.getLastRepaidCoreLoan, { userId });
  const rejectedLoan = useQuery(api.coreLoans.getLastRejectedCoreLoan, { userId });

  if (loan === undefined || repaidLoan === undefined || rejectedLoan === undefined) {
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
        transition={{ duration: 0.4, delay: 0.05, ease: "easeOut" }}
        className='rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden'>
        {/* Top accent stripe */}
        <div className='h-1 w-full bg-linear-to-r from-teal-400 via-cyan-500 to-teal-600' />

        <div className='p-5'>
          {/* Header */}
          <div className='flex items-center gap-2.5 mb-4'>
            <div className='w-9 h-9 rounded-xl bg-linear-to-br from-teal-400 to-cyan-600 flex items-center justify-center shadow-md shadow-teal-500/25'>
              <Building2 className='w-4.5 h-4.5 text-white' />
            </div>
            <div>
              <h3 className='font-bold text-foreground text-base'>Core Loan</h3>
              <p className='text-xs text-muted-foreground'>
                Long-term financial support
              </p>
            </div>
          </div>

          {!loan && rejectedLoan ? (
            <div className='space-y-3'>
              {/* Rejected loan brief details */}
              <div className='flex items-center justify-between py-2 border-b border-border/40'>
                <span className='text-sm text-muted-foreground'>Status</span>
                <Badge className={getStatusColor(rejectedLoan.status)}>
                  Rejected
                </Badge>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>
                  Amount Requested
                </span>
                <span className='font-semibold text-sm'>
                  {formatNaira(rejectedLoan.amountRequested)}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>
                  Date Applied
                </span>
                <span className='font-semibold text-sm'>
                  {formatDate(rejectedLoan.dateApplied)}
                </span>
              </div>

              {/* Rejection notice */}
              <div className='rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/40 p-3 text-center space-y-1'>
                <div className='flex items-center justify-center gap-1.5'>
                  <XCircle className='w-4 h-4 text-red-600 dark:text-red-400' />
                  <p className='text-xs text-red-700 dark:text-red-400 font-medium'>
                    Your loan application was rejected.
                  </p>
                </div>
                <p className='text-xs text-red-600/80 dark:text-red-400/70'>
                  Please contact Admin for details or apply again below.
                </p>
              </div>

              <Button
                className='w-full h-11 font-semibold rounded-xl bg-linear-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white shadow-lg shadow-teal-500/20 hover:shadow-teal-500/35 transition-all duration-200 group'
                disabled={hasActiveCoreAndQuick}
                onClick={() => setSheetOpen(true)}>
                Apply Again
                <ArrowRight className='w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform' />
              </Button>
            </div>
          ) : showApply ? (
            <div className='space-y-4'>
              {repaidLoan && (
                <div className='rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/40 p-3 text-center space-y-1'>
                  <div className='flex items-center justify-center gap-1.5'>
                    <CheckCircle2 className='w-4 h-4 text-blue-600 dark:text-blue-400' />
                    <p className='text-xs text-blue-700 dark:text-blue-400 font-medium'>
                      Your loan has been fully repaid.
                    </p>
                  </div>
                  <p className='text-xs text-blue-600/80 dark:text-blue-400/70'>
                    You can apply for a new loan below.
                  </p>
                </div>
              )}

              {/* Feature pills */}
              <div className='grid grid-cols-3 gap-2'>
                <div className='flex flex-col items-center gap-1 rounded-xl bg-teal-50 dark:bg-teal-900/20 border border-teal-100 dark:border-teal-900/40 p-2.5'>
                  <Percent className='w-3.5 h-3.5 text-teal-600 dark:text-teal-400' />
                  <span className='text-xs font-semibold text-teal-700 dark:text-teal-400 text-center leading-tight'>
                    8% / 10% deducted
                  </span>
                </div>
                <div className='flex flex-col items-center gap-1 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 border border-cyan-100 dark:border-cyan-900/40 p-2.5'>
                  <Clock className='w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400' />
                  <span className='text-xs font-semibold text-cyan-700 dark:text-cyan-400'>
                    24 months
                  </span>
                </div>
                <div className='flex flex-col items-center gap-1 rounded-xl bg-sky-50 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-900/40 p-2.5'>
                  <CircleDollarSign className='w-3.5 h-3.5 text-sky-600 dark:text-sky-400' />
                  <span className='text-xs font-semibold text-sky-700 dark:text-sky-400 text-center leading-tight'>
                    Custom amt
                  </span>
                </div>
              </div>

              <Button
                className='w-full h-11 font-semibold rounded-xl bg-linear-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white shadow-lg shadow-teal-500/20 hover:shadow-teal-500/35 transition-all duration-200 group'
                disabled={hasActiveCoreAndQuick}
                onClick={() => setSheetOpen(true)}>
                {repaidLoan ? "Apply for New Loan" : "Apply for Core Loan"}
                <ArrowRight className='w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform' />
              </Button>

              {hasActiveCoreAndQuick && (
                <p className='text-xs text-muted-foreground text-center'>
                  Clear existing loan first to apply for another
                </p>
              )}
            </div>
          ) : (
            <div className='space-y-3'>
              <div className='flex items-center justify-between py-2 border-b border-border/40'>
                <span className='text-sm text-muted-foreground'>Status</span>
                <Badge className={getStatusColor(loan.status)}>
                  {loan.status === "awaiting-approval"
                    ? "Awaiting Approval"
                    : loan.status.charAt(0).toUpperCase() +
                      loan.status.slice(1)}
                </Badge>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>
                  Amount Requested
                </span>
                <span className='font-semibold text-sm'>
                  {formatNaira(loan.amountRequested)}
                </span>
              </div>
              {(loan.amountApproved ?? 0) > 0 && (
                <div className='flex items-center justify-between text-green-600 dark:text-green-400'>
                  <span className='text-sm'>
                    Amount Approved
                  </span>
                  <span className='font-black '>
                    {formatNaira(loan.amountApproved!)}
                  </span>
                </div>
              )}
              {loan.interestRate && (loan.amountApproved ?? 0) > 0 && (
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>
                    Net Disbursed ({loan.interestRate}% deducted)
                  </span>
                  <span className='font-semibold text-sm'>
                    {formatNaira(
                      loan.amountApproved! * (1 - loan.interestRate / 100),
                    )}
                  </span>
                </div>
              )}
              {loan.expiryDate && (
                <div className='flex items-center justify-between'>
                  <span className='text-sm text-muted-foreground'>
                    Expiry Date
                  </span>
                  <span
                    className={`font-semibold text-sm ${expiryColorClass(loan.expiryDate)}`}>
                    {formatExpiry(loan.expiryDate)}
                  </span>
                </div>
              )}
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>
                  Guarantors
                </span>
                <span className='text-sm text-right'>
                  {loan.guarantor1Name}, {loan.guarantor2Name}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span className='text-sm text-muted-foreground'>
                  Date Applied
                </span>
                <span className='text-sm'>{formatDate(loan.dateApplied)}</span>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <ApplyCoreLoanSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        userId={userId}
      />
    </>
  );
}
