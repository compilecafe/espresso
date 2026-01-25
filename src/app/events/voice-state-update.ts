import { event, Events } from "~/framework";
import { LevelingRepository } from "~/app/repositories/leveling-repository";
import { LevelingService } from "~/app/services/leveling-service";

export default event(Events.VoiceStateUpdate)
    .execute(async (oldState, newState, client) => {
        const member = newState.member;
        if (!member || member.user.bot || !member.guild) return;

        const guildId = member.guild.id;
        const userId = member.id;
        const oldChannelId = oldState.channelId;
        const newChannelId = newState.channelId;

        if (oldChannelId && oldChannelId !== newChannelId) {
            const session = await LevelingRepository.getVoiceSession(guildId, userId);
            if (session) {
                const durationMs = Date.now() - new Date(session.startTime).getTime();
                const durationMinutes = Math.floor(durationMs / 60000);

                if (durationMinutes > 0) {
                    await LevelingService.awardVoiceXP(client, guildId, member, oldChannelId, durationMinutes);
                }

                await LevelingRepository.deleteVoiceSession(session.id);
            }
        }

        if (newChannelId) {
            const channelConfig = await LevelingRepository.getSpecialChannel(guildId, newChannelId);
            if (channelConfig?.blacklisted) return;

            await LevelingRepository.createVoiceSession({
                userId,
                guildId,
                channelId: newChannelId,
            });
        }
    });
