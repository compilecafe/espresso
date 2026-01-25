import { Events, type Message } from "discord.js";
import type { BotClient } from "~/client";
import { awardXP } from "~/services/leveling";

export const name = Events.MessageCreate;
export const once = false;

export async function execute(message: Message, client: BotClient): Promise<void> {
    if (message.author.bot || !message.guild || !message.member) return;

    await awardXP(
        {
            client,
            guildId: message.guild.id,
            userId: message.member.id,
            channelId: message.channel.id,
            type: "text",
        },
        !!message.member.premiumSince
    );
}
