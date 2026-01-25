import { event, Events, logger } from "~/framework";
import { GuildRepository } from "~/app/repositories/guild-repository";

export default event(Events.GuildCreate)
    .execute(async (guild) => {
        logger.info(`Joined guild: ${guild.name} (${guild.id})`);
        await GuildRepository.findOrCreate(guild.id);
    });
