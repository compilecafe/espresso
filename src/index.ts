import "dotenv/config";
import path from "path";
import { Barista } from "~/framework";
import { env } from "~/utils/env";

const bot = Barista.create({
    token: env.DISCORD_TOKEN,
    clientId: env.CLIENT_ID,
    intents: [
        Barista.intents.guilds,
        Barista.intents.messages,
        Barista.intents.members,
        Barista.intents.voice,
    ],
})
    .withCommands(path.join(__dirname, "commands"))
    .withEvents(path.join(__dirname, "events"));

await bot.start();
