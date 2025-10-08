import { Events, Message } from "discord.js";
import type { BotClient } from "~/client";
import { awardXP } from "~/services/leveling-service";

export const name = Events.MessageCreate;
export const once = false;

export async function execute(message: Message, client: BotClient) {
    if (message.author.bot || !message.guild) return;

    if (message.member)
        await awardXP({
            client,
            member: message.member,
            guildId: message.guild.id,
            channelId: message.channel.id,
            type: "text",
        });
}
