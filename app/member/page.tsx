"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { MemberCard } from "@/components/member/member-card";
import { QuickLoanSection } from "@/components/member/quick-loan-section";
import { CoreLoanSection } from "@/components/member/core-loan-section";
import { LoanHistory } from "@/components/member/loan-history";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Copy, LogOut, LayoutDashboard } from "lucide-react";
import Link from "next/link";

const ADMIN_PINS = [
  process.env.NEXT_PUBLIC_ADMIN_PIN_1,
  process.env.NEXT_PUBLIC_ADMIN_PIN_2,
  process.env.NEXT_PUBLIC_ADMIN_PIN_3,
  process.env.NEXT_PUBLIC_ADMIN_PIN_4,
  process.env.NEXT_PUBLIC_ADMIN_PIN_5,
].filter(Boolean);
import { toast } from "sonner";
import { REPAYMENT_ACCOUNT } from "@/lib/loan-utils";

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] as const } },
};

export default function MemberPage() {
  const router = useRouter();
  const [userId] = useState<Id<"users"> | null>(() => {
    if (typeof window === "undefined") return null;
    return (localStorage.getItem("userId") as Id<"users">) ?? null;
  });

  useEffect(() => {
    if (!userId) router.replace("/");
  }, [userId, router]);

  const user = useQuery(api.users.getUserById, userId ? { userId } : "skip");

  const activeQuickLoan = useQuery(
    api.quickLoans.getActiveQuickLoan,
    userId ? { userId } : "skip"
  );

  const activeCoreLoan = useQuery(
    api.coreLoans.getActiveCoreLoan,
    userId ? { userId } : "skip"
  );

  const hasActiveCoreAndQuick =
    activeQuickLoan !== undefined &&
    activeCoreLoan !== undefined &&
    activeQuickLoan !== null &&
    activeCoreLoan !== null &&
    ["awaiting-approval", "approved"].includes(activeQuickLoan.status) &&
    ["awaiting-approval", "approved"].includes(activeCoreLoan.status);

  function handleCopyAccount() {
    navigator.clipboard.writeText(REPAYMENT_ACCOUNT.account);
    toast.success("Account number copied!");
  }

  function handleLogout() {
    localStorage.removeItem("userId");
    localStorage.removeItem("userName");
    router.replace("/");
  }

  if (!userId) return null;

  return (
    <div className="min-h-screen mesh-bg">
      <Navbar />

      <main className="pt-14">
        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          <AnimatePresence mode="wait">
            {user === undefined ? (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <Skeleton className="h-40 w-full rounded-2xl" />
                <Skeleton className="h-24 w-full rounded-2xl" />
                <Skeleton className="h-40 w-full rounded-2xl" />
                <Skeleton className="h-40 w-full rounded-2xl" />
              </motion.div>
            ) : user === null ? (
              <motion.div
                key="error"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 text-muted-foreground"
              >
                Session expired.{" "}
                <button className="text-green-600 underline font-medium" onClick={handleLogout}>
                  Sign in again
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                variants={container}
                initial="hidden"
                animate="show"
                className="space-y-4"
              >
                {/* Sign out row */}
                <motion.div variants={item} className="flex items-center justify-between">
                  {ADMIN_PINS.includes(user.pin) ? (
                    <Link href="/dashboard">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-green-700 dark:text-green-400 hover:text-green-800 rounded-xl font-semibold"
                      >
                        <LayoutDashboard className="w-4 h-4 mr-1.5" />
                        Admin
                      </Button>
                    </Link>
                  ) : (
                    <span />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground rounded-xl"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-1.5" />
                    Sign out
                  </Button>
                </motion.div>

                {/* Member card */}
                <motion.div variants={item}>
                  <MemberCard user={user} />
                </motion.div>

                {/* Repayment account banner */}
                <motion.div variants={item}>
                  <div className="relative rounded-2xl overflow-hidden border border-amber-200/60 dark:border-amber-800/40 shadow-sm">
                    <div className="absolute inset-0 bg-linear-to-r from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/20" />
                    <div className="relative flex items-center justify-between gap-3 px-4 py-3.5">
                      <div className="flex items-center gap-3">
                       
                        <div>
                          <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide">
                            Loan Repayment Account
                          </p>
                          <p className="text-sm text-amber-800 dark:text-amber-300 mt-0.5">
                            {REPAYMENT_ACCOUNT.bank} ·{" "}
                            <span className="font-mono font-bold">{REPAYMENT_ACCOUNT.account}</span>
                          </p>
                          <p className="text-xs text-amber-600 dark:text-amber-500">{REPAYMENT_ACCOUNT.name}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/30 rounded-xl shrink-0 font-semibold"
                        onClick={handleCopyAccount}
                      >
                        <Copy className="w-3.5 h-3.5 mr-1.5" />
                        Copy
                      </Button>
                    </div>
                  </div>
                </motion.div>

                {/* Loan sections */}
                <motion.div variants={item}>
                  <QuickLoanSection userId={userId} hasActiveCoreAndQuick={hasActiveCoreAndQuick} />
                </motion.div>

                <motion.div variants={item}>
                  <CoreLoanSection userId={userId} hasActiveCoreAndQuick={hasActiveCoreAndQuick} />
                </motion.div>

                <motion.div variants={item}>
                  <LoanHistory userId={userId} />
                </motion.div>

                <motion.div variants={item} className="h-4" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
