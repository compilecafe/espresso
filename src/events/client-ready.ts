import { Events } from "discord.js";
import { BotClient } from "~/client";
import { initGuildSettings } from "~/repositories/guild-settings";

export const name = Events.ClientReady;
export const once = true;

export async function execute(client: BotClient): Promise<void> {
    console.log(`Logged in as ${client.user?.tag}`);

    try {
        for (const [guildId] of client.guilds.cache) {
            await initGuildSettings(guildId);
        }
        console.log("All guilds initialized");
    } catch (error) {
        console.error("Failed to init guild settings:", error);
    }
}
