import type { GuildMember } from "discord.js";
import { getUserBoosterRole, removeUserBoosterRole } from "~/repositories/booster";

export async function handleBoosterStopped(member: GuildMember): Promise<void> {
    const row = await getUserBoosterRole(member.guild.id, member.id);
    if (!row) return;

    const role = member.guild.roles.cache.get(row.roleId);

    if (role) {
        if (member.roles.cache.has(role.id)) {
            await member.roles.remove(role).catch(() => null);
        }
        await role.delete("User stopped boosting").catch(() => null);
    }

    await removeUserBoosterRole(row.id);
}
