"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { formatNaira, formatDate } from "@/lib/loan-utils";
import { Doc } from "@/convex/_generated/dataModel";

interface MemberCardProps {
  user: Doc<"users">;
}

const stagger = {
  container: { animate: { transition: { staggerChildren: 0.1 } } },
  item: {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
  },
};

export function MemberCard({ user }: MemberCardProps) {
  return (
    <motion.div
      variants={stagger.container}
      initial="initial"
      animate="animate"
      className="relative rounded-2xl overflow-hidden shadow-xl shadow-green-500/10 dark:shadow-green-400/5"
    >
      {/* Gradient background */}
      <div className="absolute inset-0 bg-linear-to-br from-emerald-500 via-emerald-600 to-teal-700" />

      {/* Decorative orbs */}
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
      <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-teal-300/20 blur-xl" />
      <div className="absolute top-1/2 right-8 w-24 h-24 rounded-full bg-emerald-300/15 blur-lg" />

      {/* Dot grid pattern */}
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      <div className="relative px-4 sm:px-6 py-6 text-white">
        <motion.div variants={stagger.item} className="flex flex-col sm:flex-row items-start justify-between gap-2 mb-5">
          <div className="min-w-0">
            <p className="text-white/80 text-xs font-medium uppercase tracking-widest mb-1">
              Welcome back
            </p>
            <h2 className="text-2xl font-bold leading-tight truncate">
              {user.name}
            </h2>
          </div>
          <Badge className="bg-white/10 text-white border-white/30 text-xs backdrop-blur-sm shrink-0">
            Member since {formatDate(user.dateJoined)}
          </Badge>
        </motion.div>

        <motion.div variants={stagger.item} className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="rounded-xl bg-white/15 backdrop-blur-sm p-3 sm:p-4 border border-white/20">
            <div className="flex items-center gap-1.5 mb-1.5">
              {/* <Wallet className="w-3.5 h-3.5 text-white/90" /> */}
              <p className="text-white/80 text-sm font-medium">Monthly Contribution</p>
            </div>
            <p className="text-lg sm:text-xl font-bold tracking-tight">
              {formatNaira(user.monthlyContribution)}
            </p>
          </div>

          <div className="rounded-xl bg-white/15 backdrop-blur-sm p-3 sm:p-4 border border-white/20">
            <div className="flex items-center gap-1.5 mb-1.5">
              {/* <TrendingUp className="w-3.5 h-3.5 text-white/70" /> */}
              <p className="text-white/80 text-sm font-medium">Total Contribution</p>
            </div>
            <p className="text-lg sm:text-xl font-bold tracking-tight">
              {formatNaira(user.totalContribution)}
            </p>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
