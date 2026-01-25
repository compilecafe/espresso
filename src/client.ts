import { Client, Collection, GatewayIntentBits } from "discord.js";
import type { SlashCommand } from "~/types";

export class BotClient extends Client {
    public commands: Collection<string, SlashCommand> = new Collection();

    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildVoiceStates,
            ],
        });
    }
}
