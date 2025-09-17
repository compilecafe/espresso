import { Events, Message } from "discord.js";
import type { BotClient } from "~/client";
import { awardXP } from "~/services/leveling-services";

export const name = Events.MessageCreate;
export const once = false;

export async function execute(message: Message, client: BotClient) {
    if (message.author.bot || !message.guild) return;

    await awardXP({
        client,
        guildId: message.guild.id,
        userId: message.author.id,
        channelId: message.channel.id,
        isBooster: !!message.member?.premiumSince,
    });
}
