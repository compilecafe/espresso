import { event } from "~/framework";
import { awardXP } from "~/services/leveling";

export default event("messageCreate")
    .execute(async (message, client) => {
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
    });
