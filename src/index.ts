import "dotenv/config";
import { BotClient } from "~/client";
import { loadCommands } from "~/utils/command-loader";
import { loadEvents } from "~/utils/event-loader";
import { env } from "~/utils/env";

const client = new BotClient();

await loadCommands(client);
await loadEvents(client);
await client.login(env.DISCORD_TOKEN);
