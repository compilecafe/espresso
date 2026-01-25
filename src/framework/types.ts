import type { Attachment, ChatInputCommandInteraction, Client, ClientEvents, EmbedBuilder, Guild, GuildMember, Role, SlashCommandBuilder, TextChannel, User, VoiceChannel } from "discord.js";

export interface BaristaConfig {
    token: string;
    clientId: string;
    intents: number[];
    debug?: boolean;
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
    info(message: string): Promise<void>;
    warn(message: string): Promise<void>;

    getString(name: string, required?: boolean): string | null;
    getUser(name: string, required?: boolean): User | null;
    getMember(name: string, required?: boolean): GuildMember | null;
    getNumber(name: string, required?: boolean): number | null;
    getInteger(name: string, required?: boolean): number | null;
    getBoolean(name: string, required?: boolean): boolean | null;
    getRole(name: string, required?: boolean): Role | null;
    getChannel(name: string, required?: boolean): TextChannel | VoiceChannel | null;
    getAttachment(name: string, required?: boolean): Attachment | null;
    getSubcommand(): string | null;
    getSubcommandGroup(): string | null;
}

export type CommandHandler = (ctx: CommandContext) => Promise<void>;

export type OptionType = "string" | "user" | "number" | "integer" | "boolean" | "role" | "channel" | "mentionable" | "attachment";

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

export interface AwardXPOptions {
    client: Client;
    guildId: string;
    userId: string;
    channelId?: string;
    type: XPType;
    duration?: number;
}
