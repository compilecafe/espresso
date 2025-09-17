import { Events } from "discord.js";
import { BotClient } from "~/client";

export const name = Events.ClientReady;
export const once = true;

export async function execute(client: BotClient): Promise<void> {
    console.log(`Logged in as ${client.user?.tag}`);
}
