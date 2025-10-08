import { ChannelType, Events, type NonThreadGuildBasedChannel } from "discord.js";
import { BotClient } from "~/client";
import { channelCreatedEmbed } from "~/utils/log-embed";

export const name = Events.ChannelCreate;
export const once = true;

export async function execute(channel: NonThreadGuildBasedChannel, _: BotClient): Promise<void> {
    if (!channel.isTextBased() && !channel.isVoiceBased() && channel.type !== ChannelType.GuildCategory) return;

    const embed = await channelCreatedEmbed(channel, channel.guild);
    const logChannel = channel.guild.channels.cache.get("YOUR_LOG_CHANNEL_ID");
    if (logChannel?.isTextBased()) {
        await logChannel.send({ embeds: [embed] });
    }
}
