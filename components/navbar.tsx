"use client";

import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";

interface NavbarProps {
  isAdmin?: boolean;
}

export function Navbar({ isAdmin }: NavbarProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14">
      {/* Glassmorphism background */}
      <div className="absolute inset-0 backdrop-blur-xl bg-background/75 border-b border-border/50 shadow-sm shadow-black/5" />

      <div className="relative h-full flex items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 group">
          <motion.div
            whileHover={{ scale: 1.08, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="relative w-8 h-8 rounded-xl bg-linear-to-br from-green-400 via-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-green-500/30 shrink-0"
          >
            <Shield className="w-4 h-4 text-white" strokeWidth={2} />
            <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </motion.div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-sm sm:text-base text-foreground tracking-tight">
              NFVCB{" "}
              <span className="text-green-600 dark:text-green-400">Cooperative</span>
            </span>
            {isAdmin && (
              <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 text-xs font-semibold">
                Admin
              </Badge>
            )}
          </div>
        </Link>

        <ThemeToggle />
      </div>
    </header>
  );
}
