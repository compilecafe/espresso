import { event, Events } from "~/framework";
import { initGuildSettings } from "~/repositories/guild-settings";

export default event(Events.GuildCreate)
    .execute(async (guild) => {
        console.log(`☕ Joined guild: ${guild.name} (${guild.id})`);
        await initGuildSettings(guild.id);
    });
