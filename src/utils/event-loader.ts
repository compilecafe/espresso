import { BotClient } from "~/client";
import fs from "fs";
import path from "path";
import { type ClientEvents } from "discord.js";

interface EventModule<K extends keyof ClientEvents = keyof ClientEvents> {
    name: K;
    once?: boolean;
    execute: (...args: [...ClientEvents[K], BotClient]) => Promise<void> | void;
}

export async function loadEvents(client: BotClient): Promise<void> {
    const eventsPath = path.join(__dirname, "../events");
    const eventFiles = fs.readdirSync(eventsPath).filter((f) => f.endsWith(".ts"));

    for (const file of eventFiles) {
        const eventModule = (await import(path.join(eventsPath, file))) as EventModule;
        if (eventModule.once) {
            client.once(eventModule.name, (...args) => eventModule.execute(...args, client));
        } else {
            client.on(eventModule.name, (...args) => eventModule.execute(...args, client));
        }
    }

    console.log(`Loaded ${eventFiles.length} events.`);
}
