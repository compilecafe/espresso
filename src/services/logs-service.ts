async function getLogChannelId(guildId: string, logType: string): Promise<string | null> {
    const logChannels = {
        guild123: {
            server: "log-channel-server",
            member: "log-channel-member",
            message: "log-channel-message",
            voice: "log-channel-voice",
            warn: "log-channel-warn",
        },
    };

    return logChannels[guildId]?.[logType] || null;
}

export async function sendLogEmbed(guild: Guild, embed: EmbedBuilder, logType: string) {
    const channelId = await getLogChannelId(guild.id, logType);
    if (!channelId) {
        console.warn(`No log channel configured for type ${logType} in guild ${guild.id}`);
        return;
    }

    const logChannel = guild.channels.cache.get(channelId) as TextChannel | undefined;
    if (!logChannel) {
        console.error(`Log channel ${channelId} not found in guild ${guild.id}`);
        return;
    }

    try {
        await logChannel.send({ embeds: [embed] });
    } catch (error) {
        console.error(`Failed to send log to channel ${channelId}:`, error);
    }
}
