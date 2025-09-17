import { Events, Guild } from "discord.js";
import { BotClient } from "~/client";
import { initGuildSettings } from "~/repositories/guild-settings";

export const name = Events.GuildCreate;
export const once = false;

export async function execute(guild: Guild, _: BotClient): Promise<void> {
    console.log(`Joined new guild: ${guild.name} (${guild.id})`);

    try {
        await initGuildSettings(guild.id);
        console.log(`Config initialized for guild ${guild.id}`);
    } catch (err) {
        console.error(`Failed to init config for guild ${guild.id}`, err);
    }
}
