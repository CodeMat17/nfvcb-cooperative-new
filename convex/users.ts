import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getUserByPin = query({
  args: { pin: v.string() },
  handler: async (ctx, { pin }) => {
    return await ctx.db
      .query("users")
      .withIndex("by_pin", (q) => q.eq("pin", pin))
      .first();
  },
});

export const verifyUserByPin = mutation({
  args: { pin: v.string() },
  handler: async (ctx, args) => {
    // Only search for user with exact PIN match
    const user = await ctx.db
      .query("users")
      .withIndex("by_pin", (q) => q.eq("pin", args.pin))
      .first();

    if (user) {
      return { success: true, user, message: "User verified successfully" };
    } else {
      return {
        success: false,
        user: null,
        message: "Invalid PIN or user does not exist",
      };
    }
  },
});


export const getAllPins = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    return users.map((u) => u.pin);
  },
});

export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

export const getUserById = query({
  args: { userId: v.id("users") },
  handler: async (ctx, { userId }) => {
    return await ctx.db.get(userId);
  },
});

export const searchUsersByName = query({
  args: { prefix: v.string() },
  handler: async (ctx, { prefix }) => {
    const users = await ctx.db.query("users").collect();
    const lower = prefix.toLowerCase();
    return users.filter((u) => u.name.toLowerCase().includes(lower));
  },
});

export const addUser = mutation({
  args: {
    name: v.string(),
    dateJoined: v.string(),
    ippis: v.string(),
    pin: v.string(),
    monthlyContribution: v.number(),
    totalContribution: v.number(),
    phone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("users", args);
  },
});

export const updateUserInfo = mutation({
  args: {
    userId: v.id("users"),
    name: v.string(),
    pin: v.string(),
    dateJoined: v.string(),
  },
  handler: async (ctx, { userId, name, pin, dateJoined }) => {
    await ctx.db.patch(userId, { name, pin, dateJoined });
  },
});

export const updateContributions = mutation({
  args: {
    userId: v.id("users"),
    monthlyContribution: v.number(),
    totalContribution: v.number(),
  },
  handler: async (ctx, { userId, monthlyContribution, totalContribution }) => {
    await ctx.db.patch(userId, {
      monthlyContribution,
      totalContribution,
      lastContributionUpdate: new Date().toISOString(),
    });
  },
});
