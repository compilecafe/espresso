import type { ChatInputCommandInteraction, Client, ClientEvents, SlashCommandBuilder, Guild, GuildMember, User, TextChannel, VoiceChannel, Role, EmbedBuilder } from "discord.js";

export interface BaristaConfig {
    token: string;
    clientId: string;
    intents: number[];
}

export interface CommandContext {
    interaction: ChatInputCommandInteraction;
    client: Client;
    guild: Guild | null;
    member: GuildMember | null;
    user: User;
    channel: TextChannel | null;

    reply(content: string | object): Promise<void>;
    defer(ephemeral?: boolean): Promise<void>;
    followUp(content: string | object): Promise<void>;
    embed(builder: EmbedBuilder | ((embed: EmbedBuilder) => EmbedBuilder)): Promise<void>;
    success(message: string): Promise<void>;
    error(message: string): Promise<void>;

    getString(name: string, required?: boolean): string | null;
    getUser(name: string, required?: boolean): User | null;
    getNumber(name: string, required?: boolean): number | null;
    getBoolean(name: string, required?: boolean): boolean | null;
    getRole(name: string, required?: boolean): Role | null;
    getChannel(name: string, required?: boolean): TextChannel | VoiceChannel | null;
    getSubcommand(): string | null;
}

export type CommandHandler = (ctx: CommandContext) => Promise<void>;

export type OptionType = "string" | "user" | "number" | "boolean" | "role" | "channel";

export interface CommandOption {
    name: string;
    description: string;
    type: OptionType;
    required: boolean;
    choices?: Array<{ name: string; value: string | number }>;
}

export interface CommandDefinition {
    name: string;
    description: string;
    options: CommandOption[];
    guards: Guard[];
    handler: CommandHandler;
    build(): SlashCommandBuilder;
    getHandler(subcommandName?: string): CommandHandler;
}

export type Guard = (ctx: CommandContext) => Promise<boolean | string>;

export type EventName = keyof ClientEvents;
export type EventHandler<K extends EventName> = (...args: [...ClientEvents[K], Client]) => Promise<void> | void;

export interface EventDefinition<K extends EventName = EventName> {
    name: K;
    once: boolean;
    handler: EventHandler<K>;
}

export type XPType = "text" | "voice";

export interface AwardXPBaseOptions {
    client: Client;
    guildId: string;
    userId: string;
    channelId?: string;
}

export interface AwardXPTextOptions extends AwardXPBaseOptions {
    type: "text";
}

export interface AwardXPVoiceOptions extends AwardXPBaseOptions {
    type: "voice";
    duration: number;
}

export type AwardXPOptions = AwardXPTextOptions | AwardXPVoiceOptions;
