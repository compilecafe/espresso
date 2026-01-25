import type { GuildMember } from "discord.js";
import { GuildRepository } from "~/app/repositories/guild-repository";

export const AutoRoleService = {
    async assignRole(member: GuildMember): Promise<void> {
        const settings = await GuildRepository.find(member.guild.id);
        if (!settings) return;

        const roleId = member.user.bot ? settings.autoRoleBotRoleId : settings.autoRoleUserRoleId;
        if (!roleId) return;

        const role = member.guild.roles.cache.get(roleId);
        if (!role) return;

        await member.roles.add(role).catch(() => null);
    },
};
