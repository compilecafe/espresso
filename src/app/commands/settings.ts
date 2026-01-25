import { command, adminOnly, guildOnly } from "~/framework";
import { GuildRepository } from "~/app/repositories/guild-repository";

export default command("settings", "Configure bot settings for this server")
    .guard(guildOnly, adminOnly)
    .subcommand("leveling", "Configure leveling settings", (sub) =>
        sub
            .channel("channel", "Notification channel for level ups")
            .boolean("enabled", "Enable/disable leveling notifications")
            .execute(async (ctx) => {
                await ctx.defer(true);

                const channel = ctx.getChannel("channel");
                const enabled = ctx.getBoolean("enabled");

                const updates: Record<string, unknown> = {};
                const changes: string[] = [];

                if (channel) {
                    updates["levelingNotificationChannelId"] = channel.id;
                    changes.push(`Notification channel: ${channel}`);
                }
                if (enabled !== null) {
                    updates["isLevelingNotificationActive"] = enabled;
                    changes.push(`Notifications: ${enabled ? "enabled" : "disabled"}`);
                }

                if (changes.length === 0) {
                    await ctx.error("No settings provided to update.");
                    return;
                }

                await GuildRepository.update(ctx.guild!.id, updates);
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

                const updates: Record<string, unknown> = {};
                const changes: string[] = [];

                if (userRole) {
                    updates["autoRoleUserRoleId"] = userRole.id;
                    changes.push(`User role: ${userRole}`);
                }
                if (botRole) {
                    updates["autoRoleBotRoleId"] = botRole.id;
                    changes.push(`Bot role: ${botRole}`);
                }

                if (changes.length === 0) {
                    await ctx.error("No roles provided to configure.");
                    return;
                }

                await GuildRepository.update(ctx.guild!.id, updates);
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

                await GuildRepository.update(ctx.guild!.id, { boosterReferenceRoleId: referenceRole.id });
                await ctx.success(`Booster reference role set to: ${referenceRole}`);
            })
    );
