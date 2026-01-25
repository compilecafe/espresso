import type { GuildMember } from "discord.js";
import { getAutoRoleConfig } from "~/repositories/auto-role";

export async function autoAssignRole(member: GuildMember): Promise<void> {
    const setting = await getAutoRoleConfig(member.guild.id);
    if (!setting) return;

    const roleId = member.user.bot ? setting.autoRoleBotRoleId : setting.autoRoleUserRoleId;
    if (!roleId) return;

    const role = member.guild.roles.cache.get(roleId);
    if (!role) return;

    await member.roles.add(role);
}
