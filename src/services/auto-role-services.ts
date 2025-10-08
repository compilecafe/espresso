import type { GuildMember } from "discord.js";
import { getAutoRoleConfig } from "~/repositories/auto-role";

export async function autoAssignRole(member: GuildMember) {
    const setting = await getAutoRoleConfig(member.guild.id);
    if (!setting) return;

    if (member.user.bot) {
        if (!setting.autoRoleUserRoleId) return;

        const role = member.guild.roles.cache.get(setting.autoRoleUserRoleId);

        if (!role) return;

        await member.roles.add(role);
        return;
    }

    if (!setting.autoRoleUserRoleId) return;
    const role = member.guild.roles.cache.get(setting.autoRoleUserRoleId);

    if (!role) return;

    await member.roles.add(role);
}
