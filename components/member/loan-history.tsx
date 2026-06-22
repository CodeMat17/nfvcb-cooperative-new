"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { History, FileX } from "lucide-react";
import { motion } from "framer-motion";
import { formatNaira, formatDate, getStatusColor } from "@/lib/loan-utils";

function repaidTiming(clearedDate: string, expiryDate?: string): string {
  if (!expiryDate) return "";
  const cleared = new Date(clearedDate).setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate).setHours(0, 0, 0, 0);
  const diffDays = Math.round((cleared - expiry) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return `${Math.abs(diffDays)} day${Math.abs(diffDays) === 1 ? "" : "s"} before expiry`;
  if (diffDays === 0) return "repaid on expiry date";
  return `${diffDays} day${diffDays === 1 ? "" : "s"} after expiry`;
}

interface LoanHistoryProps {
  userId: Id<"users">;
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <div className="w-14 h-14 rounded-2xl bg-muted/60 flex items-center justify-center mb-3">
        <FileX className="w-7 h-7 text-muted-foreground/50" />
      </div>
      <p className="text-sm font-medium text-muted-foreground">No {label} history yet</p>
      <p className="text-xs text-muted-foreground/60 mt-1">Your loans will appear here</p>
    </div>
  );
}

const PAGE_SIZE = 10;

export function LoanHistory({ userId }: LoanHistoryProps) {
  const quickLoans = useQuery(api.quickLoans.getUserQuickLoanHistory, { userId });
  const coreLoans = useQuery(api.coreLoans.getUserCoreLoanHistory, { userId });
  const [quickVisible, setQuickVisible] = useState(PAGE_SIZE);
  const [coreVisible, setCoreVisible] = useState(PAGE_SIZE);

  const sortedQuick = quickLoans
    ?.slice()
    .sort((a, b) => new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime()) ?? [];
  const sortedCore = coreLoans
    ?.slice()
    .sort((a, b) => new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime()) ?? [];

  const quickItems = sortedQuick.slice(0, quickVisible);
  const coreItems = sortedCore.slice(0, coreVisible);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
      className='rounded-2xl border border-border/60 bg-card shadow-sm overflow-hidden'>
      <div className='h-1 w-full bg-linear-to-r from-violet-400 via-purple-500 to-indigo-500' />

      <div className='p-5'>
        <div className='flex items-center gap-2.5 mb-4'>
          <div className='w-9 h-9 rounded-xl bg-linear-to-br from-violet-400 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-500/25'>
            <History className='w-4.5 h-4.5 text-white' />
          </div>
          <div>
            <h3 className='font-bold text-foreground text-base'>
              Loan History
            </h3>
            <p className='text-xs text-muted-foreground'>All your past loans</p>
          </div>
        </div>

        <Tabs defaultValue='quick'>
          <TabsList className='w-full rounded-xl h-10'>
            <TabsTrigger
              value='quick'
              className='flex-1 rounded-lg text-sm font-semibold'>
              Quick Loans
            </TabsTrigger>
            <TabsTrigger
              value='core'
              className='flex-1 rounded-lg text-sm font-semibold'>
              Core Loans
            </TabsTrigger>
          </TabsList>

          <TabsContent value='quick' className='mt-3'>
            {quickLoans === undefined ? (
              <div className='space-y-2'>
                <Skeleton className='h-16 w-full rounded-xl' />
                <Skeleton className='h-16 w-full rounded-xl' />
              </div>
            ) : quickLoans.length === 0 ? (
              <EmptyState label='quick loan' />
            ) : (
              <>
                <div className='space-y-2'>
                  {quickItems.map((loan, i) => (
                    <motion.div
                      key={loan._id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className='flex items-start justify-between p-3.5 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors gap-2'>
                      <div className='space-y-0.5 min-w-0'>
                        <p className='font-bold text-sm'>
                          {formatNaira(loan.amount)}
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          Applied: {formatDate(loan.dateApplied)}
                        </p>
                        {loan.dateApproved && (
                          <p className='text-xs text-muted-foreground'>
                            Approved: {formatDate(loan.dateApproved)}
                          </p>
                        )}
                        {loan.clearedDate && (
                          <p className='text-xs text-muted-foreground'>
                            Repaid: {formatDate(loan.clearedDate)}
                            {loan.expiryDate && (
                              <span className='ml-1 text-muted-foreground/60'>
                                ({repaidTiming(loan.clearedDate, loan.expiryDate)})
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                      <Badge
                        className={`${getStatusColor(loan.status)} shrink-0 text-xs font-semibold`}>
                        {loan.status}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
                {quickVisible < sortedQuick.length && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuickVisible((v) => v + PAGE_SIZE)}
                    className="w-full mt-3 h-8 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Load more ({sortedQuick.length - quickVisible} remaining)
                  </Button>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value='core' className='mt-3'>
            {coreLoans === undefined ? (
              <div className='space-y-2'>
                <Skeleton className='h-16 w-full rounded-xl' />
                <Skeleton className='h-16 w-full rounded-xl' />
              </div>
            ) : coreLoans.length === 0 ? (
              <EmptyState label='core loan' />
            ) : (
              <>
                <div className='space-y-2'>
                  {coreItems.map((loan, i) => (
                    <motion.div
                      key={loan._id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className='flex items-start justify-between p-3.5 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors gap-2'>
                      <div className='space-y-0.5 min-w-0'>
                        <p className='font-bold text-sm'>
                          {formatNaira(loan.amountRequested)}
                        </p>
                        {loan.amountApproved ? (
                          <p className='text-sm text-emerald-600 dark:text-emerald-400'>
                            Approved:{" "}
                            <span className="font-black">{formatNaira(loan.amountApproved)}</span>
                          </p>
                        ) : null}
                        <p className='text-xs text-muted-foreground'>
                          Applied: {formatDate(loan.dateApplied)}
                        </p>
                        {loan.dateApproved && (
                          <p className='text-xs text-muted-foreground'>
                            Approved: {formatDate(loan.dateApproved)}
                          </p>
                        )}
                        {loan.clearedDate && (
                          <p className='text-xs text-muted-foreground'>
                            Repaid: {formatDate(loan.clearedDate)}
                            {loan.expiryDate && (
                              <span className='ml-1 text-muted-foreground/60'>
                                ({repaidTiming(loan.clearedDate, loan.expiryDate)})
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                      <Badge
                        className={`${getStatusColor(loan.status)} shrink-0 text-xs font-semibold`}>
                        {loan.status}
                      </Badge>
                    </motion.div>
                  ))}
                </div>
                {coreVisible < sortedCore.length && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCoreVisible((v) => v + PAGE_SIZE)}
                    className="w-full mt-3 h-8 text-xs text-muted-foreground hover:text-foreground"
                  >
                    Load more ({sortedCore.length - coreVisible} remaining)
                  </Button>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
}
