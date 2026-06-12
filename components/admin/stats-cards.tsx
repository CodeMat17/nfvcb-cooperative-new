"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Users, Clock, FileText, Layers } from "lucide-react";

const cards = [
  {
    label: "Total Members",
    icon: Users,
    color: "text-green-600 dark:text-green-400",
    bg: "bg-green-100 dark:bg-green-900/30",
    key: "members",
  },
  {
    label: "Pending Quick Loans",
    icon: Clock,
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-100 dark:bg-amber-900/30",
    key: "quickPending",
  },
  {
    label: "Pending Core Loans",
    icon: FileText,
    color: "text-teal-600 dark:text-teal-400",
    bg: "bg-teal-100 dark:bg-teal-900/30",
    key: "corePending",
  },
  {
    label: "Total Loans",
    icon: Layers,
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-100 dark:bg-blue-900/30",
    key: "totalLoans",
  },
];

export function StatsCards() {
  const members = useQuery(api.users.getAllUsers);
  const quickLoans = useQuery(api.quickLoans.getAllQuickLoans);
  const coreLoans = useQuery(api.coreLoans.getAllCoreLoans);

  const values: Record<string, number | undefined> = {
    members: members?.length,
    quickPending: quickLoans?.filter((l) => l.status === "awaiting-approval").length,
    corePending: coreLoans?.filter((l) => l.status === "awaiting-approval").length,
    totalLoans:
      quickLoans !== undefined && coreLoans !== undefined
        ? quickLoans.length + coreLoans.length
        : undefined,
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {cards.map((card, i) => {
        const value = values[card.key];
        return (
          <motion.div
            key={card.key}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <Card className="border-border/50">
              <CardContent className="pt-4 pb-4 px-4">
                <div
                  className={`w-8 h-8 rounded-lg ${card.bg} flex items-center justify-center mb-3`}
                >
                  <card.icon className={`w-4 h-4 ${card.color}`} />
                </div>
                {value === undefined ? (
                  <Skeleton className="h-7 w-12 mb-1" />
                ) : (
                  <p className="text-2xl font-bold">{value}</p>
                )}
                <p className="text-xs text-muted-foreground">{card.label}</p>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
