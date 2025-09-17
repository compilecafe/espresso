import { getLevelFromXP } from "~/utils/level";
import {
    addUserLevel,
    getLevelingConfig,
    getLevelRole,
    getSpecialLevelingChannel,
    getUserLevel,
    setUserLevel,
} from "~/repositories/leveling";
import type { BotClient } from "~/client";
import type { TextChannel } from "discord.js";

interface AwardXPOptions {
    client: BotClient;
    guildId: string;
    userId: string;
    minXP?: number;
    maxXP?: number;
    channelId?: string;
    isBooster?: boolean;
    cooldownMs?: number;
}

const xpCooldowns: Map<string, number> = new Map();

export async function awardXP({
    client,
    guildId,
    userId,
    minXP = 5,
    maxXP = 15,
    channelId,
    isBooster = false,
    cooldownMs = 60_000,
}: AwardXPOptions) {
    const key = `${guildId}:${userId}`;
    const last = xpCooldowns.get(key) ?? 0;
    if (Date.now() - last < cooldownMs) return;
    xpCooldowns.set(key, Date.now());

    let xpGained = Math.floor(Math.random() * (maxXP - minXP + 1)) + minXP;

    if (channelId) {
        const channelConfig = await getSpecialLevelingChannel(guildId, channelId);
        if (channelConfig?.blacklisted) return;
        if (channelConfig) {
            xpGained = Math.floor(xpGained * (channelConfig.modifier / 100));
        }
    }

    if (isBooster) xpGained = Math.floor(xpGained * 1.1);

    const userRow = await getUserLevel(guildId, userId);
    let currentXP = userRow?.xp ?? 0;
    let currentLevel = userRow?.level ?? 0;

    currentXP += xpGained;
    const newLevel = getLevelFromXP(currentXP);

    if (userRow) {
        await setUserLevel({ xp: currentXP, level: newLevel }, userRow.id);
    } else {
        await addUserLevel({ userId, guildId, xp: currentXP, level: newLevel });
    }

    if (newLevel > currentLevel) {
        const roleConfig = await getLevelRole(guildId, newLevel);
        if (roleConfig) {
            const member = await client.guilds.cache.get(guildId)?.members.fetch(userId);
            await member?.roles.add(roleConfig.roleId);
        }
        await sendLevelUpMessage(client, guildId, userId, newLevel);
    }
}

export async function sendLevelUpMessage(client: BotClient, guildId: string, userId: string, level: number) {
    const guild = client.guilds.cache.get(guildId);
    if (!guild) return;

    const member = await guild.members.fetch(userId).catch(() => null);
    if (!member) return;

    const setting = await getLevelingConfig(guildId);

    if (!setting?.levelUpNotifications) return;

    const channelId = setting.levelUpChannelId ?? member.guild.systemChannelId;
    if (!channelId) return;

    const channel = guild.channels.cache.get(channelId);
    if (!channel || !channel.isTextBased()) return;

    let message = setting.levelUpMessageTemplate ?? "{user}, you have reached level {level}!";
    message = message.replace("{user}", `<@${userId}>`).replace("{level}", level.toString());

    (channel as TextChannel).send({ content: message });
}
