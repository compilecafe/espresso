import { Events, VoiceState } from "discord.js";
import { BotClient } from "../client";
import {
    addVoiceSession,
    getSpecialLevelingChannel,
    getVoiceSession,
    removeVoiceSession,
} from "~/repositories/leveling";
import { awardXP } from "~/services/leveling-services";

export const name = Events.VoiceStateUpdate;
export const once = false;

export async function execute(oldState: VoiceState, newState: VoiceState, client: BotClient) {
    const member = newState.member;
    if (!member || member.user.bot || !member.guild) return;
    const guildId = member.guild.id;
    const userId = member.id;

    const oldChannelId = oldState.channelId;
    const newChannelId = newState.channelId;

    if (oldChannelId && oldChannelId !== newChannelId) {
        const session = await getVoiceSession(guildId, userId);

        if (session) {
            const durationMs = Date.now() - new Date(session.startTime).getTime();
            const durationMinutes = Math.floor(durationMs / 60000);
            if (durationMinutes > 0) {
                const baseMin = durationMinutes * 1;
                const baseMax = durationMinutes * 5;

                await awardXP({
                    client,
                    guildId,
                    userId,
                    channelId: oldChannelId,
                    isBooster: !!member.premiumSince,
                    cooldownMs: 0,
                    minXP: baseMin,
                    maxXP: baseMax,
                });
            }

            await removeVoiceSession(session.id);
        }
    }

    if (newChannelId) {
        const channelConfig = await getSpecialLevelingChannel(guildId, newChannelId);

        if (channelConfig?.blacklisted) return;

        await addVoiceSession({
            userId,
            guildId,
            channelId: newChannelId,
            startTime: new Date(),
        });
    }
}
