import { calculateXP, canGainXP, updateXP } from "~/utils/level";
import {
    addUserLevel,
    getLevelingConfig,
    getRoleForLevel,
    getSpecialLevelingChannel,
    getUserLevel,
    setUserLevel,
} from "~/repositories/leveling";
import type { BotClient } from "~/client";
import type { GuildMember, TextChannel } from "discord.js";

interface AwardXPTextOptions {
    client: BotClient;
    guildId: string;
    member: GuildMember;
    channelId?: string;
    type: "text";
}

interface AwardXPVoiceOptions {
    client: BotClient;
    guildId: string;
    member: GuildMember;
    channelId?: string;
    type: "voice";
    duration: number;
}

export type AwardXPOptions = AwardXPTextOptions | AwardXPVoiceOptions;

export async function awardXP(options: AwardXPOptions) {
    const { client, guildId, member, channelId, type } = options;

    const userId = member.user.id;
    const isBooster = !!member.premiumSince;

    const setting = await getLevelingConfig(guildId);
    if (!setting) return;

    if (!canGainXP(guildId, userId, setting.levelingCooldownMs)) return;

    let xpGained: number | null = calculateXP(options, setting);

    xpGained = await applyChannelModifier(guildId, channelId, xpGained);
    if (xpGained === null) return; // blacklisted channel

    if (isBooster) xpGained = Math.floor(xpGained * 1.1);

    const userRow = await getUserLevel(guildId, userId);
    const { newTextXp, newVoiceXp, newLevel, leveledUp } = updateXP(userRow, type, xpGained);

    if (userRow) {
        await setUserLevel({ textXp: newTextXp, voiceXp: newVoiceXp, level: newLevel }, userRow.id);
    } else {
        await addUserLevel({ userId, guildId, textXp: newTextXp, voiceXp: newVoiceXp, level: newLevel });
    }

    if (leveledUp) {
        const roleConfig = await getRoleForLevel(guildId, newLevel);
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

    if (!setting?.isLevelingNotificationActive) return;

    const channelId = setting.levelingNotificationChannelId ?? member.guild.systemChannelId;
    if (!channelId) return;

    const channel = guild.channels.cache.get(channelId);
    if (!channel || !channel.isTextBased()) return;

    let message = setting.levelingNotificaitonTemplate;
    message = message.replace("{user}", `<@${userId}>`).replace("{level}", level.toString());

    (channel as TextChannel).send({ content: message });
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
