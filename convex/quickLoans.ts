import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { addMonths } from "date-fns";

export const getLastRejectedQuickLoan = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const loans = await ctx.db
      .query("quickLoans")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    // Only show rejected state if the most recent closed loan is rejected.
    // If a newer repaid loan exists, return null so the apply form shows instead.
    const lastClosed = loans
      .filter((l) => l.status === "rejected" || l.status === "repaid")
      .sort(
        (a, b) =>
          new Date(b.dateApplied).getTime() - new Date(a.dateApplied).getTime()
      )[0];
    return lastClosed?.status === "rejected" ? lastClosed : null;
  },
});

export const applyQuickLoan = mutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
  },
  handler: async (ctx, { userId, amount }) => {
    const now = new Date().toISOString();
    return await ctx.db.insert("quickLoans", {
      userId,
      amount,
      status: "awaiting-approval",
      dateApplied: now,
      interestRate: 5,
      totalRepayment: amount * 1.05,
    });
  },
});

export const getActiveQuickLoan = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const loans = await ctx.db
      .query("quickLoans")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return (
      loans
        .filter((l) => l.status !== "rejected" && l.status !== "repaid")
        .sort(
          (a, b) =>
            new Date(b.dateApplied).getTime() -
            new Date(a.dateApplied).getTime()
        )[0] ?? null
    );
  },
});

export const getUserQuickLoanHistory = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("quickLoans")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const getAllQuickLoans = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("quickLoans").collect();
  },
});

export const approveQuickLoan = mutation({
  args: {
    loanId: v.id("quickLoans"),
    adminName: v.string(),
  },
  handler: async (ctx, { loanId, adminName }) => {
    const now = new Date();
    const expiry = addMonths(now, 6).toISOString();
    await ctx.db.patch(loanId, {
      status: "approved",
      dateApproved: now.toISOString(),
      expiryDate: expiry,
      disbursed: true,
      dateDisbursed: now.toISOString(),
      approvedByAdmin: adminName,
    });
    const loan = await ctx.db.get(loanId);
    if (loan) {
      await ctx.db.insert("activityLogs", {
        adminName,
        action: `Approved quick loan of ₦${loan.amount.toLocaleString()}`,
        targetUserId: loan.userId,
        timestamp: now.toISOString(),
      });
    }
  },
});

export const rejectQuickLoan = mutation({
  args: {
    loanId: v.id("quickLoans"),
    adminName: v.string(),
  },
  handler: async (ctx, { loanId, adminName }) => {
    await ctx.db.patch(loanId, {
      status: "rejected",
      rejectedByAdmin: adminName,
    });
    const loan = await ctx.db.get(loanId);
    if (loan) {
      await ctx.db.insert("activityLogs", {
        adminName,
        action: `Rejected quick loan of ₦${loan.amount.toLocaleString()}`,
        targetUserId: loan.userId,
        timestamp: new Date().toISOString(),
      });
    }
  },
});

export const getLastRepaidQuickLoan = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const loans = await ctx.db
      .query("quickLoans")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
    return (
      loans
        .filter((l) => l.status === "repaid")
        .sort(
          (a, b) =>
            new Date(b.dateApplied).getTime() -
            new Date(a.dateApplied).getTime()
        )[0] ?? null
    );
  },
});

export const clearQuickLoan = mutation({
  args: {
    loanId: v.id("quickLoans"),
    adminName: v.string(),
  },
  handler: async (ctx, { loanId, adminName }) => {
    const loan = await ctx.db.get(loanId);
    if (!loan || loan.status !== "approved") {
      throw new Error("Only approved loans can be marked as repaid.");
    }
    const now = new Date().toISOString();
    await ctx.db.patch(loanId, {
      status: "repaid",
      clearedDate: now,
      clearedByAdmin: adminName,
    });
    await ctx.db.insert("activityLogs", {
      adminName,
      action: `Marked quick loan of ₦${loan.amount.toLocaleString()} as repaid`,
      targetUserId: loan.userId,
      timestamp: now,
    });
  },
});
