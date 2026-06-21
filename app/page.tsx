"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useAuth } from "@clerk/nextjs";
import { motion, AnimatePresence } from "framer-motion";
import { PinInput } from "@/components/pin-input";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle, Shield, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";

export default function HomePage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const [pin, setPin] = useState("");
  const [submittedPin, setSubmittedPin] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [shakeKey, setShakeKey] = useState(0);

  function handleAdminClick() {
    router.push(isSignedIn ? "/dashboard" : "/sign-in");
  }

  const user = useQuery(
    api.users.getUserByPin,
    submittedPin !== null ? { pin: submittedPin } : "skip"
  );

  const isLoading = submittedPin !== null && user === undefined;

  function handleSubmit() {
    if (pin.length < 6) return;
    setError("");
    setSubmittedPin(pin);
  }

  if (submittedPin !== null && user !== undefined) {
    if (user === null) {
      if (!error) {
        setError("Invalid PIN. Please try again.");
        setShakeKey((k) => k + 1);
        setPin("");
        setSubmittedPin(null);
      }
    } else {
      localStorage.setItem("userId", user._id);
      localStorage.setItem("userName", user.name);
      router.push("/member");
    }
  }

  return (
    <div className="min-h-screen relative flex flex-col items-center justify-center p-4 overflow-hidden mesh-bg">

      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        <motion.div
          className="absolute -top-32 -left-32 w-96 h-96 rounded-full"
          style={{
            background: "radial-gradient(circle, oklch(0.75 0.18 150 / 35%) 0%, transparent 70%)",
          }}
          animate={{ scale: [1, 1.15, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-40 -right-40 w-md h-112 rounded-full"
          style={{
            background: "radial-gradient(circle, oklch(0.70 0.16 165 / 30%) 0%, transparent 70%)",
          }}
          animate={{ scale: [1, 1.2, 1], rotate: [0, -120, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/3 w-64 h-64 rounded-full"
          style={{
            background: "radial-gradient(circle, oklch(0.80 0.12 175 / 25%) 0%, transparent 70%)",
          }}
          animate={{ scale: [1, 1.3, 1], x: [-20, 20, -20], y: [-15, 15, -15] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />
        <motion.div
          className="absolute top-20 right-20 w-48 h-48 rounded-full"
          style={{
            background: "radial-gradient(circle, oklch(0.72 0.20 145 / 28%) 0%, transparent 70%)",
          }}
          animate={{ scale: [1, 1.25, 1], rotate: [0, 180, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 3 }}
        />

        {/* Floating sparkle dots */}
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-emerald-400/40"
            style={{
              left: `${15 + i * 14}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
            animate={{ y: [-10, 10, -10], opacity: [0.3, 0.8, 0.3] }}
            transition={{ duration: 3 + i * 0.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.4 }}
          />
        ))}
      </div>

      {/* Theme toggle */}
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Floating badge above card */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="mb-6 z-10"
      >
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
          <span className="text-xs font-semibold text-green-700 dark:text-green-400 tracking-wide uppercase">
            Staff Cooperative Society
          </span>
        </div>
      </motion.div>

      {/* Main card */}
      <motion.div
        initial={{ opacity: 0, y: 32, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md z-10"
      >
        <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-green-500/10 dark:shadow-green-400/5 gradient-border">
          {/* Card gradient top accent */}
          <div className="h-1 w-full bg-linear-to-r from-green-400 via-emerald-500 to-teal-500" />

          {/* Card inner glow */}
          <div className="absolute inset-0 bg-linear-to-b from-green-50/50 to-transparent dark:from-green-900/10 pointer-events-none" />

          <div className="relative px-5 pt-8 pb-8 sm:px-8 sm:pt-10 sm:pb-10">
            {/* Logo */}
            <div className="flex justify-center mb-6">
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
                className="relative"
              >
              
                <Image alt="logo" priority src="/logo.png" width={50} height={50} className="rounded shrink-0" />
                <motion.div
                  className="absolute -inset-1 rounded-2xl bg-linear-to-br from-green-400 to-teal-500 blur-lg opacity-40"
                  animate={{ opacity: [0.3, 0.6, 0.3] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                />
              
              </motion.div>
            </div>

            {/* Heading */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-center mb-2"
            >
              <h1 className="text-3xl font-bold tracking-tight shimmer-text">
                NFVCB COOPERATIVE CONTRIBUTIONS APP
              </h1>
              <p className="text-muted-foreground text-sm mt-8">
                Enter your 6-digit PIN to access your account
              </p>
            </motion.div>

            {/* PIN input */}
            <div className="space-y-5">
              <motion.div
                key={shakeKey}
                animate={error ? { x: [0, -10, 10, -10, 10, -6, 6, 0] } : { x: 0 }}
                transition={{ duration: 0.4 }}
              >
                <PinInput
                  value={pin}
                  onChange={(v) => {
                    setPin(v);
                    setError("");
                    if (v.length === 6) {
                      setSubmittedPin(v);
                    }
                  }}
                  disabled={isLoading}
                  hasError={!!error}
                />
              </motion.div>

              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: "auto" }}
                    exit={{ opacity: 0, y: -8, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl px-4 py-3">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {error}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.45 }}
              >
                <Button
                  className="w-full h-12 text-base font-semibold rounded-xl bg-linear-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40 transition-all duration-200 hover:scale-[1.01]"
                  disabled={pin.length < 6 || isLoading}
                  onClick={handleSubmit}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Verifying…
                    </>
                  ) : (
                    "Continue →"
                  )}
                </Button>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
                className="text-center text-sm text-muted-foreground"
              >
                Admin?{" "}
                <button
                  onClick={handleAdminClick}
                  className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 hover:text-green-700 font-semibold underline-offset-4 hover:underline transition-colors"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Sign in here
                </button>
              </motion.p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bottom tagline */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="mt-8 text-xs text-muted-foreground/60 z-10 text-center"
      >
        National Film and Video Censors Board · Cooperative Society
      </motion.p>
    </div>
  );
}
