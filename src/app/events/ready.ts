import { event, Events, logger } from "~/framework";
import { GuildRepository } from "~/app/repositories/guild-repository";

export default event(Events.ClientReady)
    .runOnce()
    .execute(async (client) => {
        logger.database("Initializing guild settings...");

        const guilds = [...client.guilds.cache.keys()];
        await Promise.all(guilds.map((guildId) => GuildRepository.findOrCreate(guildId)));

        logger.success(`Initialized ${guilds.length} guilds`);
    });
