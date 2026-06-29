"use client";

import { ClearedLoansTab } from "@/components/admin/cleared-loans-tab";
import { CoreLoansTab } from "@/components/admin/core-loans-tab";
import { MembersTab } from "@/components/admin/members-tab";
import { QuickLoansTab } from "@/components/admin/quick-loans-tab";
import { StatsCards } from "@/components/admin/stats-cards";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUser } from "@clerk/nextjs";
import { LogOut, Users } from "lucide-react";
import Link from "next/link";


const TAB_ACCESS: Record<string, string[]> = {
  "super-admin":     ["members", "quick", "core", "cleared"],
  "members-admin":   ["members"],
  "quickloan-admin": ["quick"],
  "coreloan-admin":  ["core"],
};

export default function AdminPage() {
  const { user } = useUser();
  const adminName =
    user?.fullName ||
    user?.username ||
    (user?.primaryEmailAddress?.emailAddress
      ? user.primaryEmailAddress.emailAddress.split("@")[0]
      : "Admin");

  const role = (user?.publicMetadata?.role as string | undefined) ?? "";
  const visibleTabs = TAB_ACCESS[role] ?? [];
  const canApprove = role === "super-admin";
  const defaultTab = visibleTabs[0] ?? "members";

  return (
    <div className='min-h-screen bg-background'>
      <Navbar isAdmin adminRole={role} />

      <main className='pt-14'>
        <div className='max-w-7xl mx-auto px-4 py-6 space-y-6'>
          <div className='flex items-start justify-between gap-3'>
            <div className='min-w-0'>
              <h1 className='text-xl font-bold'>Admin Dashboard</h1>
              <p className='text-sm text-muted-foreground truncate'>
                Welcome, {adminName}
              </p>
            </div>
            <div className='flex items-center gap-2 shrink-0'>
              <Link href='/member'>
                <Button
                  variant='ghost'
                  size='sm'
                  className='text-green-700 dark:text-green-400 hover:text-green-800'>
                  <Users className='w-4 h-4 sm:mr-1.5' />
                  <span className='hidden sm:inline'>Member Portal</span>
                </Button>
              </Link>

            </div>
          </div>

          <StatsCards />

          <Tabs key={defaultTab} defaultValue={defaultTab}>
            <div className='overflow-x-auto -mx-4 px-4'>
              <TabsList className='w-max min-w-full sm:min-w-0 sm:w-auto'>
                {visibleTabs.includes("members") && <TabsTrigger value='members'>Members</TabsTrigger>}
                {visibleTabs.includes("quick") && <TabsTrigger value='quick'>Quick Loans</TabsTrigger>}
                {visibleTabs.includes("core") && <TabsTrigger value='core'>Core Loans</TabsTrigger>}
                {visibleTabs.includes("cleared") && <TabsTrigger value='cleared'>Cleared</TabsTrigger>}
              </TabsList>
            </div>

            {visibleTabs.includes("members") && (
              <TabsContent value='members' className='mt-4'>
                <MembersTab />
              </TabsContent>
            )}
            {visibleTabs.includes("quick") && (
              <TabsContent value='quick' className='mt-4'>
                <QuickLoansTab adminName={adminName} canApprove={canApprove} />
              </TabsContent>
            )}
            {visibleTabs.includes("core") && (
              <TabsContent value='core' className='mt-4'>
                <CoreLoansTab adminName={adminName} canApprove={canApprove} />
              </TabsContent>
            )}
            {visibleTabs.includes("cleared") && (
              <TabsContent value='cleared' className='mt-4'>
                <ClearedLoansTab />
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>
    </div>
  );
}
