"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatNaira, formatDate } from "@/lib/loan-utils";
import { Search } from "lucide-react";

type Filter = "all" | "quick" | "core";

export function ClearedLoansTab() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  const quickLoans = useQuery(api.quickLoans.getAllQuickLoans);
  const coreLoans = useQuery(api.coreLoans.getAllCoreLoans);
  const users = useQuery(api.users.getAllUsers);

  const usersMap = Object.fromEntries(
    (users ?? []).map((u) => [u._id, u.name])
  );

  const cleared = [
    ...((filter === "all" || filter === "quick")
      ? (quickLoans ?? [])
          .filter((l) => l.status === "repaid")
          .map((l) => ({
            id: l._id,
            userId: l.userId,
            type: "Quick" as const,
            amount: l.amount,
            dateApproved: l.dateApproved,
            dateCleared: l.clearedDate,
            approvedBy: l.approvedByAdmin,
            clearedBy: l.clearedByAdmin,
          }))
      : []),
    ...((filter === "all" || filter === "core")
      ? (coreLoans ?? [])
          .filter((l) => l.status === "repaid")
          .map((l) => ({
            id: l._id,
            userId: l.userId,
            type: "Core" as const,
            amount: l.amountApproved || l.amountRequested,
            dateApproved: l.dateApproved,
            dateCleared: l.clearedDate,
            approvedBy: l.approvedByAdmin,
            clearedBy: l.clearedByAdmin,
          }))
      : []),
  ]
    .filter((l) =>
      (usersMap[l.userId] ?? "").toLowerCase().includes(search.toLowerCase())
    )
    .sort(
      (a, b) =>
        new Date(b.dateCleared ?? 0).getTime() -
        new Date(a.dateCleared ?? 0).getTime()
    );

  const isLoading =
    quickLoans === undefined || coreLoans === undefined || users === undefined;

  return (
    <div className="space-y-4">
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by member name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5">
          {(["all", "quick", "core"] as Filter[]).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "outline"}
              className={
                filter === f
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : ""
              }
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
      ) : cleared.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground text-sm">
          No cleared loans
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {cleared.map((loan) => (
            <div
              key={loan.id}
              className="rounded-xl border bg-card p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold leading-tight">
                  {usersMap[loan.userId] ?? "Unknown"}
                </p>
                <Badge
                  className={
                    loan.type === "Quick"
                      ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                      : "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400"
                  }
                >
                  {loan.type}
                </Badge>
              </div>
              <div className="text-sm flex flex-wrap gap-x-4 gap-y-1">
                <span>
                  <span className="text-muted-foreground">Amount: </span>
                  {formatNaira(loan.amount)}
                </span>
                <span>
                  <span className="text-muted-foreground">Approved: </span>
                  {formatDate(loan.dateApproved)}
                </span>
                <span>
                  <span className="text-muted-foreground">Cleared: </span>
                  {formatDate(loan.dateCleared)}
                </span>
                {loan.approvedBy && (
                  <span>
                    <span className="text-muted-foreground">Approved by: </span>
                    {loan.approvedBy}
                  </span>
                )}
                <span>
                  <span className="text-muted-foreground">Cleared by: </span>
                  {loan.clearedBy ?? "—"}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
