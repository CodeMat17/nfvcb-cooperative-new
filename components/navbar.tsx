"use client";

import Link from "next/link";
import { ThemeToggle } from "./theme-toggle";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import Image from "next/image";
import { UserButton } from "@clerk/nextjs";
import { Show } from "@clerk/nextjs";

const ROLE_LABELS: Record<string, string> = {
  "super-admin":     "Super Admin",
  "members-admin":   "Members Admin",
  "quickloan-admin": "Quickloan Admin",
  "coreloan-admin":  "Coreloan Admin",
};

interface NavbarProps {
  isAdmin?: boolean;
  adminRole?: string;
}

export function Navbar({ isAdmin, adminRole }: NavbarProps) {
  const badgeLabel = ROLE_LABELS[adminRole ?? ""] ?? "Admin";
  return (
    <header className='fixed top-0 left-0 right-0 z-50 h-14'>
      {/* Glassmorphism background */}
      <div className='absolute inset-0 backdrop-blur-xl bg-background/75 border-b border-border/50 shadow-sm shadow-black/5' />

      <div className='relative h-full flex items-center justify-between px-4 sm:px-6'>
        <Link href='/' className='flex items-center gap-2.5 group'>
          <motion.div
            whileHover={{ scale: 1.08, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}>
            <Image
              alt='logo'
              src='/logo.png'
              width={30}
              height={30}
              className='rounded'
            />
          </motion.div>

          <div className='flex items-center gap-2'>
            <span className='font-bold text-sm sm:text-base text-foreground tracking-tight'>
              NFVCB{" "}
              <span className='text-green-600 dark:text-green-400'>
                Cooperative
              </span>
            </span>
            {isAdmin && (
              <Badge className='bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800 text-xs font-semibold'>
                {badgeLabel}
              </Badge>
            )}
          </div>
        </Link>

        <div className='flex items-center gap-2'>
          <ThemeToggle />
          {/* <Show when="signed-out">
            <SignInButton />         
          </Show> */}
          <Show when='signed-in'>
            <UserButton />
          </Show>
        </div>
      </div>
    </header>
  );
}
