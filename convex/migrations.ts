import { internalMutation } from "./_generated/server";

export const fixPinTypes = internalMutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    let fixed = 0;
    for (const user of users) {
      const pin = (user as unknown as Record<string, unknown>).pin;
      if (typeof pin !== "string") {
        await ctx.db.patch(user._id, { pin: String(pin) });
        fixed++;
      }
    }
    return { total: users.length, fixed };
  },
});
