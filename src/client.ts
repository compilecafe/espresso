import {
    Client,
    Collection,
    GatewayIntentBits,
    SlashCommandBuilder,
    ChatInputCommandInteraction,
    type SlashCommandOptionsOnlyBuilder,
    type SlashCommandSubcommandsOnlyBuilder,
    Partials,
} from "discord.js";

export type SlashCommandData =
    | SlashCommandBuilder
    | SlashCommandOptionsOnlyBuilder
    | SlashCommandSubcommandsOnlyBuilder;

export interface SlashCommand {
    data: SlashCommandData;
    execute: (interaction: ChatInputCommandInteraction, client: BotClient) => Promise<void>;
}

export class BotClient extends Client {
    public commands: Collection<string, SlashCommand> = new Collection();

    constructor() {
        super({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMembers,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.GuildVoiceStates,
                GatewayIntentBits.GuildModeration,
                GatewayIntentBits.GuildExpressions,
                GatewayIntentBits.MessageContent,
            ],
            partials: [Partials.Message, Partials.Channel, Partials.Reaction, Partials.GuildMember, Partials.User],
        });
    }
}
