import { GuildMember } from "discord.js";
import { getUserBoosterRole, removeUserBoosterRole } from "~/repositories/booster";

export async function handleBoosterStopped(member: GuildMember): Promise<void> {
    const guildId = member.guild.id;
    const userId = member.id;

    const row = await getUserBoosterRole(guildId, userId);

    if (!row) return;

    const role = member.guild.roles.cache.get(row.roleId);
    if (role && member.roles.cache.has(role.id)) {
        await member.roles.remove(role).catch(() => null);
    }

    if (role) {
        await role.delete("User stopped boosting").catch(() => null);
    }

    await removeUserBoosterRole(row.id);
}
