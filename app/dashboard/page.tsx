"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/navbar";
import { StatsCards } from "@/components/admin/stats-cards";
import { MembersTab } from "@/components/admin/members-tab";
import { QuickLoansTab } from "@/components/admin/quick-loans-tab";
import { CoreLoansTab } from "@/components/admin/core-loans-tab";
import { ClearedLoansTab } from "@/components/admin/cleared-loans-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PinInput } from "@/components/pin-input";
import { AlertCircle, LogOut, Loader2, Users } from "lucide-react";
import Link from "next/link";

const ADMIN_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN ?? "123456";

export default function AdminPage() {
  const [authed, setAuthed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("adminAuthed") === "1" && !!localStorage.getItem("adminName");
  });
  const [adminName, setAdminName] = useState(() => {
    if (typeof window === "undefined") return "";
    return localStorage.getItem("adminName") ?? "";
  });
  const [pin, setPin] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [error, setError] = useState("");
  const [shakeKey, setShakeKey] = useState(0);
  const [loading, setLoading] = useState(false);

  function handleLogin() {
    if (!nameInput.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (pin !== ADMIN_PIN) {
      setError("Invalid PIN. Try again.");
      setShakeKey((k) => k + 1);
      setPin("");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem("adminAuthed", "1");
      localStorage.setItem("adminName", nameInput.trim());
      setAdminName(nameInput.trim());
      setAuthed(true);
      setLoading(false);
    }, 400);
  }

  function handleLogout() {
    localStorage.removeItem("adminAuthed");
    localStorage.removeItem("adminName");
    setAuthed(false);
    setAdminName("");
    setPin("");
    setNameInput("");
  }

  if (!authed) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-green-50 via-background to-emerald-50 dark:from-green-950/20 dark:via-background dark:to-emerald-950/20 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-xl border-border/50">
            <CardHeader className="text-center pt-8">
              <div className="flex justify-center mb-3">
                <div className="w-14 h-14 rounded-full bg-linear-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                  <svg
                    viewBox="0 0 24 24"
                    className="w-8 h-8 text-white fill-current"
                  >
                    <path d="M12 2C9 2 7 5 7 8c0 2 1 3.5 2.5 4.5C11 14 12 16 12 18c0-2 1-4 2.5-5.5C16 11.5 17 10 17 8c0-3-2-6-5-6z" />
                    <circle cx="12" cy="20" r="2" />
                  </svg>
                </div>
              </div>
              <CardTitle className="text-xl">Admin Sign In</CardTitle>
              <p className="text-sm text-muted-foreground">
                NFVCB Cooperative Admin Panel
              </p>
            </CardHeader>
            <CardContent className="pb-8 px-8 space-y-5">
              <div className="space-y-2">
                <Label>Your Name</Label>
                <Input
                  placeholder="Enter your name"
                  value={nameInput}
                  onChange={(e) => {
                    setNameInput(e.target.value);
                    setError("");
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label>Admin PIN</Label>
                <motion.div
                  key={shakeKey}
                  animate={
                    error && error.includes("PIN")
                      ? { x: [0, -10, 10, -10, 10, 0] }
                      : { x: 0 }
                  }
                  transition={{ duration: 0.4 }}
                >
                  <PinInput
                    value={pin}
                    onChange={(v) => {
                      setPin(v);
                      setError("");
                    }}
                    hasError={!!error && error.includes("PIN")}
                    disabled={loading}
                  />
                </motion.div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 dark:bg-red-950/30 rounded-lg px-3 py-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white h-11"
                disabled={pin.length < 6 || !nameInput.trim() || loading}
                onClick={handleLogin}
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Sign In"
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar isAdmin />

      <main className="pt-14">
        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground truncate">
                Welcome, {adminName}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Link href="/member">
                <Button variant="ghost" size="sm" className="text-green-700 dark:text-green-400 hover:text-green-800">
                  <Users className="w-4 h-4 sm:mr-1.5" />
                  <span className="hidden sm:inline">Member Portal</span>
                </Button>
              </Link>
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </div>
          </div>

          <StatsCards />

          <Tabs defaultValue="members">
            <div className="overflow-x-auto -mx-4 px-4">
              <TabsList className="w-max min-w-full sm:min-w-0 sm:w-auto">
                <TabsTrigger value="members">Members</TabsTrigger>
                <TabsTrigger value="quick">Quick Loans</TabsTrigger>
                <TabsTrigger value="core">Core Loans</TabsTrigger>
                <TabsTrigger value="cleared">Cleared</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="members" className="mt-4">
              <MembersTab />
            </TabsContent>
            <TabsContent value="quick" className="mt-4">
              <QuickLoansTab adminName={adminName} />
            </TabsContent>
            <TabsContent value="core" className="mt-4">
              <CoreLoansTab adminName={adminName} />
            </TabsContent>
            <TabsContent value="cleared" className="mt-4">
              <ClearedLoansTab />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
