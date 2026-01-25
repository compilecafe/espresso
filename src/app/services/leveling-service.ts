import type { Client, GuildMember, TextChannel } from "discord.js";
import { LevelingRepository } from "~/app/repositories/leveling-repository";
import { randomInt } from "~/framework";

interface LevelingConfig {
    levelingCooldownMs: number;
    levelingMinXpText: number;
    levelingMaxXpText: number;
    levelingMinXpVoice: number;
    levelingMaxXpVoice: number;
    isLevelingNotificationActive: boolean;
    levelingNotificationChannelId: string | null;
    levelingNotificationTemplate: string;
}

const xpCooldowns = new Map<string, number>();

export const LevelingService = {
    getLevelFromXP(xp: number): number {
        let level = 0;
        let neededXP = 100;
        while (xp >= neededXP) {
            level++;
            neededXP += 5 * level * level + 50 * level + 100;
        }
        return level;
    },

    getXPForLevel(level: number): number {
        let xp = 0;
        for (let i = 1; i <= level; i++) {
            xp += 5 * i * i + 50 * i + 100;
        }
        return xp;
    },

    canGainXP(guildId: string, userId: string, cooldownMs: number): boolean {
        const key = `${guildId}:${userId}`;
        const last = xpCooldowns.get(key) ?? 0;
        if (Date.now() - last < cooldownMs) return false;
        xpCooldowns.set(key, Date.now());
        return true;
    },

    calculateTextXP(config: LevelingConfig): number {
        return randomInt(config.levelingMinXpText, config.levelingMaxXpText);
    },

    calculateVoiceXP(config: LevelingConfig, durationMinutes: number): number {
        const minXP = durationMinutes * config.levelingMinXpVoice;
        const maxXP = durationMinutes * config.levelingMaxXpVoice;
        return randomInt(minXP, maxXP);
    },

    async awardTextXP(client: Client, guildId: string, member: GuildMember, channelId: string): Promise<void> {
        const config = await LevelingRepository.getLevelingConfig(guildId);
        if (!config) return;

        if (!this.canGainXP(guildId, member.id, config.levelingCooldownMs)) return;

        const channelConfig = await LevelingRepository.getSpecialChannel(guildId, channelId);
        if (channelConfig?.blacklisted) return;

        let xp = this.calculateTextXP(config);
        
        if (channelConfig) {
            xp = Math.floor(xp * (channelConfig.modifier / 100));
        }

        if (member.premiumSince) {
            xp = Math.floor(xp * 1.1);
        }

        await this.addXP(client, guildId, member.id, xp, 0, config);
    },

    async awardVoiceXP(client: Client, guildId: string, member: GuildMember, channelId: string, durationMinutes: number): Promise<void> {
        const config = await LevelingRepository.getLevelingConfig(guildId);
        if (!config) return;

        const channelConfig = await LevelingRepository.getSpecialChannel(guildId, channelId);
        if (channelConfig?.blacklisted) return;

        let xp = this.calculateVoiceXP(config, durationMinutes);
        
        if (channelConfig) {
            xp = Math.floor(xp * (channelConfig.modifier / 100));
        }

        if (member.premiumSince) {
            xp = Math.floor(xp * 1.1);
        }

        await this.addXP(client, guildId, member.id, 0, xp, config);
    },

    async addXP(client: Client, guildId: string, userId: string, textXp: number, voiceXp: number, config: LevelingConfig): Promise<void> {
        const userLevel = await LevelingRepository.getUserLevel(guildId, userId);
        
        const newTextXp = (userLevel?.textXp ?? 0) + textXp;
        const newVoiceXp = (userLevel?.voiceXp ?? 0) + voiceXp;
        const totalXP = newTextXp + newVoiceXp;
        const currentLevel = userLevel?.level ?? 0;
        const newLevel = this.getLevelFromXP(totalXP);

        await LevelingRepository.upsertUserLevel({
            guildId,
            userId,
            textXp: newTextXp,
            voiceXp: newVoiceXp,
            level: newLevel,
        });

        if (newLevel > currentLevel) {
            await this.handleLevelUp(client, guildId, userId, newLevel, config);
        }
    },

    async handleLevelUp(client: Client, guildId: string, userId: string, level: number, config: LevelingConfig): Promise<void> {
        const roleConfig = await LevelingRepository.getRoleForLevel(guildId, level);
        if (roleConfig) {
            const guild = client.guilds.cache.get(guildId);
            const member = await guild?.members.fetch(userId);
            if (member) {
                await member.roles.add(roleConfig.roleId).catch(() => null);
            }
        }

        if (!config.isLevelingNotificationActive) return;

        const guild = client.guilds.cache.get(guildId);
        if (!guild) return;

        const channelId = config.levelingNotificationChannelId ?? guild.systemChannelId;
        if (!channelId) return;

        const channel = guild.channels.cache.get(channelId);
        if (!channel?.isTextBased()) return;

        const message = config.levelingNotificationTemplate
            .replace("{user}", `<@${userId}>`)
            .replace("{level}", level.toString());

        await (channel as TextChannel).send({ content: message }).catch(() => null);
    },
};
