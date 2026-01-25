import { event, Events } from "~/framework";
import { LevelingService } from "~/app/services/leveling-service";

export default event(Events.MessageCreate)
    .execute(async (message, client) => {
        if (message.author.bot || !message.guild || !message.member) return;

        await LevelingService.awardTextXP(
            client,
            message.guild.id,
            message.member,
            message.channel.id
        );
    });
