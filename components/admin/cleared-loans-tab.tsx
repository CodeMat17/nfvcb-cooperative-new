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
          .filter((l) => l.status === "cleared")
          .map((l) => ({
            id: l._id,
            userId: l.userId,
            type: "Quick" as const,
            amount: l.amount,
            dateApproved: l.dateApproved,
            dateCleared: l.clearedDate,
            clearedBy: l.clearedByAdmin,
          }))
      : []),
    ...((filter === "all" || filter === "core")
      ? (coreLoans ?? [])
          .filter((l) => l.status === "cleared")
          .map((l) => ({
            id: l._id,
            userId: l.userId,
            type: "Core" as const,
            amount: l.amountApproved || l.amountRequested,
            dateApproved: l.dateApproved,
            dateCleared: l.clearedDate,
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
                    "Type",
                    "Amount",
                    "Date Approved",
                    "Date Cleared",
                    "Cleared By",
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
                {cleared.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      No cleared loans
                    </td>
                  </tr>
                ) : (
                  cleared.map((loan) => (
                    <tr
                      key={loan.id}
                      className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium">
                        {usersMap[loan.userId] ?? "Unknown"}
                      </td>
                      <td className="px-4 py-3">
                        <Badge
                          className={
                            loan.type === "Quick"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                              : "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400"
                          }
                        >
                          {loan.type}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {formatNaira(loan.amount)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {formatDate(loan.dateApproved)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        {formatDate(loan.dateCleared)}
                      </td>
                      <td className="px-4 py-3">{loan.clearedBy ?? "—"}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
