import { event } from "~/framework";
import { initGuildSettings } from "~/repositories/guild-settings";

export default event("guildCreate")
    .execute(async (guild) => {
        console.log(`☕ Joined guild: ${guild.name} (${guild.id})`);
        await initGuildSettings(guild.id);
    });
