import { command, adminOnly } from "~/framework";

export default command("settings", "Configure bot settings for this server")
    .guard(adminOnly)
    .subcommand("leveling", "Configure leveling settings", (sub) =>
        sub
            .channel("channel", "Notification channel for level ups")
            .boolean("enabled", "Enable/disable leveling notifications")
            .execute(async (ctx) => {
                await ctx.defer(true);

                const channel = ctx.getChannel("channel");
                const enabled = ctx.getBoolean("enabled");

                const changes: string[] = [];
                if (channel) changes.push(`Notification channel: ${channel}`);
                if (enabled !== null) changes.push(`Notifications: ${enabled ? "enabled" : "disabled"}`);

                if (changes.length === 0) {
                    await ctx.error("No settings provided to update.");
                    return;
                }

                await ctx.success(`Leveling settings updated:\n${changes.join("\n")}`);
            })
    )
    .subcommand("autorole", "Configure auto-role settings", (sub) =>
        sub
            .role("user-role", "Role to assign to new users")
            .role("bot-role", "Role to assign to new bots")
            .execute(async (ctx) => {
                await ctx.defer(true);

                const userRole = ctx.getRole("user-role");
                const botRole = ctx.getRole("bot-role");

                const changes: string[] = [];
                if (userRole) changes.push(`User role: ${userRole}`);
                if (botRole) changes.push(`Bot role: ${botRole}`);

                if (changes.length === 0) {
                    await ctx.error("No roles provided to configure.");
                    return;
                }

                await ctx.success(`Auto-role settings updated:\n${changes.join("\n")}`);
            })
    )
    .subcommand("booster", "Configure booster role settings", (sub) =>
        sub
            .role("reference", "Reference role for positioning custom booster roles")
            .execute(async (ctx) => {
                await ctx.defer(true);

                const referenceRole = ctx.getRole("reference");

                if (!referenceRole) {
                    await ctx.error("Please provide a reference role.");
                    return;
                }

                await ctx.success(`Booster reference role set to: ${referenceRole}`);
            })
    );
