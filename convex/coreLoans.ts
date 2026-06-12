import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { addMonths } from "date-fns";

export const applyCoreLoan = mutation({
  args: {
    userId: v.id("users"),
    loanDate: v.string(),
    mobileNumber: v.string(),
    amountRequested: v.number(),
    accountNumber: v.string(),
    accountName: v.string(),
    bank: v.string(),
    existingLoan: v.string(),
    guarantor1Name: v.string(),
    guarantor1Phone: v.string(),
    guarantor2Name: v.string(),
    guarantor2Phone: v.string(),
  },
  handler: async (ctx, args) => {
    const now = new Date().toISOString();
    return await ctx.db.insert("coreLoans", {
      ...args,
      amountApproved: 0,
      status: "awaiting-approval",
      dateApplied: now,
    });
  },
});

export const getLastRepaidCoreLoan = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const loans = await ctx.db
      .query("coreLoans")
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

export const getLastRejectedCoreLoan = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const loans = await ctx.db
      .query("coreLoans")
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

export const getActiveCoreLoan = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    const loans = await ctx.db
      .query("coreLoans")
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

export const getUserCoreLoanHistory = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db
      .query("coreLoans")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();
  },
});

export const getAllCoreLoans = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("coreLoans").collect();
  },
});

export const approveCoreLoan = mutation({
  args: {
    loanId: v.id("coreLoans"),
    amountApproved: v.number(),
    interestRate: v.number(),
    adminName: v.string(),
  },
  handler: async (ctx, { loanId, amountApproved, interestRate, adminName }) => {
    const now = new Date();
    const expiry = addMonths(now, 24).toISOString();
    await ctx.db.patch(loanId, {
      status: "approved",
      amountApproved,
      interestRate,
      dateApproved: now.toISOString(),
      expiryDate: expiry,
      approvedByAdmin: adminName,
    });
    const loan = await ctx.db.get(loanId);
    if (loan) {
      await ctx.db.insert("activityLogs", {
        adminName,
        action: `Approved core loan of ₦${amountApproved.toLocaleString()}`,
        targetUserId: loan.userId,
        timestamp: now.toISOString(),
      });
    }
  },
});

export const rejectCoreLoan = mutation({
  args: {
    loanId: v.id("coreLoans"),
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
        action: `Rejected core loan application`,
        targetUserId: loan.userId,
        timestamp: new Date().toISOString(),
      });
    }
  },
});

export const clearCoreLoan = mutation({
  args: {
    loanId: v.id("coreLoans"),
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
      action: `Marked core loan of ₦${loan.amountApproved?.toLocaleString() ?? loan.amountRequested.toLocaleString()} as repaid`,
      targetUserId: loan.userId,
      timestamp: now,
    });
  },
});
