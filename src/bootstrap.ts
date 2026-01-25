import { Barista } from "~/framework";
import { config } from "~/config/bot";
import path from "path";

export function createApp(): Barista {
    return Barista.create({
        token: config.DISCORD_TOKEN,
        clientId: config.CLIENT_ID,
        debug: config.DEBUG,
        intents: [
            Barista.intents.guilds,
            Barista.intents.messages,
            Barista.intents.members,
            Barista.intents.voice,
        ],
    })
        .commands(path.join(__dirname, "app/commands"))
        .events(path.join(__dirname, "app/events"));
}
