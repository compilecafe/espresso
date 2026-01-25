import { event, Events } from "~/framework";
import { initGuildSettings } from "~/repositories/guild-settings";

export default event(Events.ClientReady)
    .runOnce()
    .execute(async (client) => {
        console.log(`☕ Bot ready as ${client.user?.tag}`);

        const initPromises = [...client.guilds.cache.keys()].map(initGuildSettings);
        await Promise.all(initPromises);
        console.log("☕ All guilds initialized");
    });
