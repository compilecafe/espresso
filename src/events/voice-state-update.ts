import { Events, type VoiceState } from "discord.js";
import type { BotClient } from "~/client";
import {
    addVoiceSession,
    getSpecialLevelingChannel,
    getVoiceSession,
    removeVoiceSession,
} from "~/repositories/leveling";
import { awardXP } from "~/services/leveling";

export const name = Events.VoiceStateUpdate;
export const once = false;

export async function execute(oldState: VoiceState, newState: VoiceState, client: BotClient): Promise<void> {
    const member = newState.member;
    if (!member || member.user.bot || !member.guild) return;

    const guildId = member.guild.id;
    const userId = member.id;
    const oldChannelId = oldState.channelId;
    const newChannelId = newState.channelId;

    if (oldChannelId && oldChannelId !== newChannelId) {
        await handleVoiceLeave(client, guildId, userId, oldChannelId, !!member.premiumSince);
    }

    if (newChannelId) {
        await handleVoiceJoin(guildId, userId, newChannelId);
    }
}

async function handleVoiceLeave(
    client: BotClient,
    guildId: string,
    userId: string,
    channelId: string,
    isBooster: boolean
): Promise<void> {
    const session = await getVoiceSession(guildId, userId);
    if (!session) return;

    const durationMs = Date.now() - new Date(session.startTime).getTime();
    const durationMinutes = Math.floor(durationMs / 60000);

    if (durationMinutes > 0) {
        await awardXP(
            { client, guildId, userId, channelId, type: "voice", duration: durationMinutes },
            isBooster
        );
    }

    await removeVoiceSession(session.id);
}

async function handleVoiceJoin(guildId: string, userId: string, channelId: string): Promise<void> {
    const channelConfig = await getSpecialLevelingChannel(guildId, channelId);
    if (channelConfig?.blacklisted) return;

    await addVoiceSession({ userId, guildId, channelId });
}
