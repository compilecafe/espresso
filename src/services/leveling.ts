import type { TextChannel } from "discord.js";
import type { BotClient } from "~/client";
import {
    addUserLevel,
    getLevelingConfig,
    getRoleForLevel,
    getSpecialLevelingChannel,
    getUserLevel,
    setUserLevel,
} from "~/repositories/leveling";
import type { AwardXPOptions } from "~/types";
import { calculateXP, canGainXP, updateXP } from "~/utils/level";

export async function awardXP(options: AwardXPOptions, isBooster: boolean = false): Promise<void> {
    const { client, guildId, userId, channelId, type } = options;

    const setting = await getLevelingConfig(guildId);
    if (!setting) return;

    if (!canGainXP(guildId, userId, setting.levelingCooldownMs)) return;

    let xpGained: number | null = calculateXP(options, setting);

    xpGained = await applyChannelModifier(guildId, channelId, xpGained);
    if (xpGained === null) return;

    if (isBooster) xpGained = Math.floor(xpGained * 1.1);

    const userRow = await getUserLevel(guildId, userId);
    const { newTextXp, newVoiceXp, newLevel, leveledUp } = updateXP(userRow, type, xpGained);

    if (userRow) {
        await setUserLevel({ textXp: newTextXp, voiceXp: newVoiceXp, level: newLevel }, userRow.id);
    } else {
        await addUserLevel({ userId, guildId, textXp: newTextXp, voiceXp: newVoiceXp, level: newLevel });
    }

    if (leveledUp) {
        await handleLevelUp(client, guildId, userId, newLevel);
    }
}

async function handleLevelUp(client: BotClient, guildId: string, userId: string, level: number): Promise<void> {
    const roleConfig = await getRoleForLevel(guildId, level);
    if (roleConfig) {
        const member = await client.guilds.cache.get(guildId)?.members.fetch(userId);
        await member?.roles.add(roleConfig.roleId);
    }
    await sendLevelUpMessage(client, guildId, userId, level);
}

async function sendLevelUpMessage(
    client: BotClient,
    guildId: string,
    userId: string,
    level: number
): Promise<void> {
    const guild = client.guilds.cache.get(guildId);
    if (!guild) return;

    const member = await guild.members.fetch(userId).catch(() => null);
    if (!member) return;

    const setting = await getLevelingConfig(guildId);
    if (!setting?.isLevelingNotificationActive) return;

    const channelId = setting.levelingNotificationChannelId ?? guild.systemChannelId;
    if (!channelId) return;

    const channel = guild.channels.cache.get(channelId);
    if (!channel?.isTextBased()) return;

    const message = setting.levelingNotificaitonTemplate
        .replace("{user}", `<@${userId}>`)
        .replace("{level}", level.toString());

    await (channel as TextChannel).send({ content: message });
}

async function applyChannelModifier(
    guildId: string,
    channelId: string | undefined,
    xp: number
): Promise<number | null> {
    if (!channelId) return xp;

    const channelConfig = await getSpecialLevelingChannel(guildId, channelId);
    if (channelConfig?.blacklisted) return null;
    if (channelConfig) {
        return Math.floor(xp * (channelConfig.modifier / 100));
    }
    return xp;
}
