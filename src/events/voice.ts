import type { Client } from "discord.js";
import { event } from "~/framework";
import {
    addVoiceSession,
    getSpecialLevelingChannel,
    getVoiceSession,
    removeVoiceSession,
} from "~/repositories/leveling";
import { awardXP } from "~/services/leveling";

export default event("voiceStateUpdate")
    .execute(async (oldState, newState, client) => {
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
    });

async function handleVoiceLeave(
    client: Client,
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
