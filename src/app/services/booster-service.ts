import type { GuildMember } from "discord.js";
import { BoosterRepository } from "~/app/repositories/booster-repository";

export const BoosterService = {
    async createOrUpdateRole(member: GuildMember, name: string, color: number): Promise<{ role: unknown; isNew: boolean }> {
        const guild = member.guild;
        const existing = await BoosterRepository.findByUser(guild.id, member.id);

        let role;
        let isNew = false;

        if (existing) {
            role = guild.roles.cache.get(existing.roleId);
            if (!role) {
                role = await guild.roles.create({ name, color, reason: "Booster custom role" });
                await BoosterRepository.update(existing.id, { roleId: role.id });
                isNew = true;
            } else {
                role = await role.edit({ name, color });
            }
        } else {
            role = await guild.roles.create({ name, color, reason: "Booster custom role" });
            await BoosterRepository.create({ guildId: guild.id, userId: member.id, roleId: role.id });
            isNew = true;
        }

        const referenceRoleId = await BoosterRepository.getReferenceRole(guild.id);
        if (referenceRoleId) {
            const refRole = guild.roles.cache.get(referenceRoleId);
            if (refRole) {
                await role.setPosition(refRole.position - 1).catch(() => null);
            }
        }

        if (!member.roles.cache.has(role.id)) {
            await member.roles.add(role);
        }

        return { role, isNew };
    },

    async removeRole(member: GuildMember): Promise<void> {
        const existing = await BoosterRepository.findByUser(member.guild.id, member.id);
        if (!existing) return;

        const role = member.guild.roles.cache.get(existing.roleId);
        
        if (role) {
            if (member.roles.cache.has(role.id)) {
                await member.roles.remove(role).catch(() => null);
            }
            await role.delete("User stopped boosting").catch(() => null);
        }

        await BoosterRepository.delete(existing.id);
    },
};
