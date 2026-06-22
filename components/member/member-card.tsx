"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { formatNaira, formatMonthYear } from "@/lib/loan-utils";
import { Doc } from "@/convex/_generated/dataModel";
import { Calendar, TrendingUp, Wallet } from "lucide-react";

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
      initial='initial'
      animate='animate'
      className='relative rounded-2xl overflow-hidden shadow-xl shadow-green-500/10 dark:shadow-green-400/5'>
      {/* Gradient background */}
      <div className='absolute inset-0 bg-linear-to-br from-emerald-500 via-emerald-600 to-teal-700' />

      {/* Decorative orbs */}
      <div className='absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-2xl' />
      <div className='absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-teal-300/20 blur-xl' />
      <div className='absolute top-1/2 right-8 w-24 h-24 rounded-full bg-emerald-300/15 blur-lg' />

      {/* Dot grid pattern */}
      <div
        className='absolute inset-0 opacity-40'
        style={{
          backgroundImage:
            "radial-gradient(circle, white 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      <div className='relative px-4 sm:px-6 py-6 text-white'>
        <motion.div
          variants={stagger.item}
          className='flex flex-col sm:flex-row items-start justify-between gap-2 mb-5'>
          <div className='min-w-0'>
            <p className='text-white/80 text-xs font-medium uppercase tracking-widest mb-1'>
              Welcome back
            </p>
            <h2 className='text-2xl font-bold leading-tight'>
              {user.name}
            </h2>
          </div>
         
          <div className='flex items-center bg-emerald-700/60 backdrop-blur-sm px-2 py-1 border border-emerald-700/30 rounded-xl gap-.5 text-white/75'>
            <div className='flex items-center gap-1.5 text-white/75 text-sm'>
            
              <span>Member since {formatMonthYear(user.dateJoined)}</span>
            </div>
          </div>
        </motion.div>

        {/* Stats row */}
        <motion.div
          variants={stagger.item}
          className='relative flex flex-col mt-6 gap-2 sm:gap-4 border-t border-white/20 pt-2'>
       

          <div className='pt-1 flex items-center justify-around gap-8'>
            <div className='text-sm'>
              <div className='flex items-center gap-1.5 text-white/75 mb-1'>
                <TrendingUp className='hidden w-5 h-5' />
                <span>Monthly Contribution</span>
              </div>
              <p className='text-center font-bold text-xl'>
                ₦{user.monthlyContribution?.toLocaleString() || "0"}
              </p>
            </div>
            <div className='text-sm'>
              <div className='flex items-center gap-1.5 text-white/75 mb-1'>
                <Wallet className='hidden w-5 h-5' />
                <span>Total Contribution</span>
              </div>
              <p className='text-center font-bold text-xl'>
                ₦{user.totalContribution?.toLocaleString() || "0"}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
